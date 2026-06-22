const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  getUnreadCount,
} = require('../controllers/messagingController');

router.use(verifyToken);

router.get('/conversations', asyncHandler(getConversations));
router.post('/conversations', asyncHandler(createConversation));
router.get('/conversations/unread', asyncHandler(getUnreadCount));
router.get('/messages', asyncHandler(getMessages));
router.post('/messages', asyncHandler(sendMessage));

module.exports = router;
