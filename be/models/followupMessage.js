const mongoose = require('mongoose');

const followupMessageSchema = new mongoose.Schema({
    followupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Followup', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    channel: { type: String, default: 'WHATSAPP' },
    contentType: { type: String, default: 'TEXT' },
    role: { type: String, default: 'user' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const FollowupMessage = mongoose.model('FollowupMessage', followupMessageSchema);

module.exports = FollowupMessage;