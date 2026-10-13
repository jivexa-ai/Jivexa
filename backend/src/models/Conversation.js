const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    sender: {
      type: String,
      enum: ['user', 'ai', 'model', 'assistant'],
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    provider: {
      type: String,
      default: ''
    },
    isEmergency: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    },
    userId: {
      type: String,
      required: [true, 'User ID is required for conversation persistence'],
      index: true
    },
    title: {
      type: String,
      default: 'New Conversation',
      trim: true
    },
    messages: [messageSchema],
    lastUpdated: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

conversationSchema.virtual('id').get(function () {
  return this._id;
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
