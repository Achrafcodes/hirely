const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const loginRateLimiter = require('../middleware/loginRateLimiter');
const { register, login, getMe, updateMe } = require('../controllers/authController');

router.post('/register', asyncHandler(register));
router.post('/login', loginRateLimiter, asyncHandler(login));
router.get('/me', verifyToken, asyncHandler(getMe));
router.patch('/me', verifyToken, asyncHandler(updateMe));

module.exports = router;
