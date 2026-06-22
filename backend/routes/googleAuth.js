const router = require('express').Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Step 1 — redirect to Google
// role passed as ?role=candidate|employer, carried through state
router.get('/', (req, res, next) => {
  const role = ['employer', 'candidate'].includes(req.query.role) ? req.query.role : 'candidate';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: role,
  })(req, res, next);
});

// Step 2 — Google redirects back here
router.get('/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google` }),
  async (req, res) => {
    try {
      let user = req.user;
      const role = req.query.state || 'candidate';

      // If this is a brand new Google user with default role, update to the intended role
      if (user.googleId && !user.password && user.role !== role) {
        user = await User.findByIdAndUpdate(user._id, { role }, { new: true });
      }

      const token = signToken(user._id);
      // Redirect to frontend with token — frontend will pick it up
      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    } catch {
      res.redirect(`${process.env.CLIENT_URL}/login?error=google`);
    }
  }
);

module.exports = router;
