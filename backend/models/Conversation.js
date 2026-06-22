const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
    lastMessage: {
      content: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: Date,
    },
    unreadEmployer: { type: Number, default: 0 },
    unreadCandidate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

conversationSchema.index({ employer: 1, candidate: 1, job: 1 }, { unique: true });
conversationSchema.index({ employer: 1 });
conversationSchema.index({ candidate: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
