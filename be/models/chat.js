const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    followupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Followup', required: true },
    sender: { type: String, enum: ['agent', 'client'], required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel', required: true },
    senderModel: { type: String, enum: ['Agent', 'Client'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
    attachments: [{
        type: { type: String },
        url: { type: String },
        name: { type: String }
    }]
});

// Index for efficient querying
chatMessageSchema.index({ followupId: 1, timestamp: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage; 