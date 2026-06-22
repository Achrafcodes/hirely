const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// GET /api/conversations
// Returns all conversations for the current user with last message + unread count
const getConversations = async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  const filter = role === 'employer' ? { employer: userId } : { candidate: userId };

  const conversations = await Conversation.find(filter)
    .populate('employer', 'name companyName')
    .populate('candidate', 'name')
    .populate('job', 'title company')
    .sort({ updatedAt: -1 });

  const result = conversations.map((c) => {
    const participant = role === 'employer' ? c.candidate : c.employer;
    const unreadCount = role === 'employer' ? c.unreadEmployer : c.unreadCandidate;
    return {
      id: c._id,
      job: c.job ? { id: c.job._id, title: c.job.title, company: c.job.company } : null,
      participant: {
        id: participant._id,
        name: participant.name,
      },
      lastMessage: c.lastMessage || null,
      unreadCount,
      updatedAt: c.updatedAt,
    };
  });

  res.json(result);
};

// POST /api/conversations
// Creates a new conversation or returns existing one
const createConversation = async (req, res) => {
  const { recipientId, jobId } = req.body;
  const currentUser = req.user;

  if (!recipientId) return res.status(400).json({ message: 'recipientId is required' });

  const recipient = await User.findById(recipientId);
  if (!recipient) return res.status(404).json({ message: 'Recipient not found' });

  let employerId, candidateId;
  if (currentUser.role === 'employer') {
    if (recipient.role !== 'candidate') return res.status(400).json({ message: 'Can only message candidates' });
    employerId = currentUser._id;
    candidateId = recipient._id;
  } else {
    if (recipient.role !== 'employer') return res.status(400).json({ message: 'Can only message employers' });
    employerId = recipient._id;
    candidateId = currentUser._id;
  }

  const query = { employer: employerId, candidate: candidateId, job: jobId || null };
  let conversation = await Conversation.findOne(query);

  if (!conversation) {
    conversation = await Conversation.create(query);
  }

  res.json({ conversationId: conversation._id });
};

// GET /api/messages?conversationId=xxx
// Returns paginated message history and marks unread messages as read
const getMessages = async (req, res) => {
  const { conversationId } = req.query;
  const userId = req.user._id;
  const role = req.user.role;

  if (!conversationId) return res.status(400).json({ message: 'conversationId is required' });

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

  const isParticipant =
    conversation.employer.equals(userId) || conversation.candidate.equals(userId);
  if (!isParticipant) return res.status(403).json({ message: 'Forbidden' });

  const messages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: 1 })
    .limit(50)
    .populate('sender', 'name');

  // Mark received messages as read
  await Message.updateMany(
    { conversation: conversationId, sender: { $ne: userId }, read: false },
    { read: true }
  );

  // Reset unread counter for this user
  const unreadField = role === 'employer' ? 'unreadEmployer' : 'unreadCandidate';
  await Conversation.findByIdAndUpdate(conversationId, { [unreadField]: 0 });

  res.json(messages);
};

// POST /api/messages
// Sends a new message
const sendMessage = async (req, res) => {
  const { conversationId, content } = req.body;
  const userId = req.user._id;
  const role = req.user.role;

  if (!conversationId || !content?.trim()) {
    return res.status(400).json({ message: 'conversationId and content are required' });
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

  const isParticipant =
    conversation.employer.equals(userId) || conversation.candidate.equals(userId);
  if (!isParticipant) return res.status(403).json({ message: 'Forbidden' });

  const message = await Message.create({
    conversation: conversationId,
    sender: userId,
    content: content.trim(),
  });

  await message.populate('sender', 'name');

  // Update conversation's last message + increment unread for the other party
  const recipientUnreadField = role === 'employer' ? 'unreadCandidate' : 'unreadEmployer';
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: { content: message.content, sender: userId, createdAt: message.createdAt },
    updatedAt: new Date(),
    $inc: { [recipientUnreadField]: 1 },
  });

  // Emit via Socket.io if available
  const io = req.app.get('io');
  if (io) {
    io.to(conversationId.toString()).emit('new_message', message);
  }

  res.status(201).json({ message });
};

// GET /api/conversations/unread
// Returns total unread count for the nav badge
const getUnreadCount = async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  const filter = role === 'employer' ? { employer: userId } : { candidate: userId };
  const unreadField = role === 'employer' ? 'unreadEmployer' : 'unreadCandidate';

  const conversations = await Conversation.find(filter).select(unreadField);
  const total = conversations.reduce((sum, c) => sum + (c[unreadField] || 0), 0);

  res.json({ unread: total });
};

module.exports = { getConversations, createConversation, getMessages, sendMessage, getUnreadCount };
