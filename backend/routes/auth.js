const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const loginRateLimiter = require('../middleware/loginRateLimiter');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const requireRole = require('../middleware/requireRole');
const { register, login, getMe, updateMe, uploadResume, verifyEmail, resendVerification, completeOnboarding } = require('../controllers/authController');

const profileLimits = validate({
  name:        { max: 100,  label: 'Name' },
  email:       { max: 254,  label: 'Email' },
  password:    { max: 128,  label: 'Password' },
  companyName: { max: 200,  label: 'Company name' },
  companyDesc: { max: 2000, label: 'Company description' },
  bio:         { max: 2000, label: 'Bio' },
  website:     { max: 500,  label: 'Website' },
  location:    { max: 200,  label: 'Location' },
});

router.post('/register', profileLimits, asyncHandler(register));
router.post('/login', loginRateLimiter, asyncHandler(login));
router.get('/verify-email/:token', asyncHandler(verifyEmail));
router.post('/resend-verification', verifyToken, asyncHandler(resendVerification));
router.get('/me', verifyToken, asyncHandler(getMe));
router.patch('/me', verifyToken, profileLimits, asyncHandler(updateMe));
router.post('/me/resume', verifyToken, requireRole('candidate'), upload.single('resume'), asyncHandler(uploadResume));
router.post('/onboarding', verifyToken, asyncHandler(completeOnboarding));

module.exports = router;
