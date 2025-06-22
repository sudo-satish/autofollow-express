const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    systemPrompt: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String }, // Clerk user ID
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
agentSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const Agent = mongoose.model('Agent', agentSchema);

module.exports = Agent; 