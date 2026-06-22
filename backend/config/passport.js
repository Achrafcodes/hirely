const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) return done(new Error('No email from Google'));

        // Find existing user by googleId or email
        let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

        if (user) {
          // Link Google account if they registered with email before
          if (!user.googleId) {
            user.googleId = profile.id;
            user.isVerified = true;
            if (!user.avatar) user.avatar = profile.photos?.[0]?.value;
            await user.save();
          }
          return done(null, user);
        }

        // New user — role will be set via state param
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email,
          role: 'candidate', // default; overridden by state param below
          avatar: profile.photos?.[0]?.value,
          isVerified: true,
        });

        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

module.exports = passport;
