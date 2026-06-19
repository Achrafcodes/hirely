const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const { register, login, getMe, updateMe } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.patch('/me', verifyToken, updateMe);

module.exports = router;
