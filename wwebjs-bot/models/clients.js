const mongoose = require('mongoose');

const whatsappClientSchema = new mongoose.Schema({
    clientId: { type: String, required: true },
    authStrategy: { type: String, required: true, default: 'remote' },
    connected: { type: Boolean, default: false },
    sessionSaved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const WhatsappClient = mongoose.model('WhatsappClient', whatsappClientSchema);

module.exports = WhatsappClient;