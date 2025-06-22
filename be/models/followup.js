const mongoose = require('mongoose');

const followupSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    followupDateTime: { type: Date, required: true },
    isAutoMode: { type: Boolean, required: true },
    context: { type: String, required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
    status: { type: String, default: 'pending' },
});

const Followup = mongoose.model('Followup', followupSchema);

module.exports = Followup;