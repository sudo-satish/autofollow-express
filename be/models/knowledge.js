const mongoose = require('mongoose');

const knowledgeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Knowledge = mongoose.model('Knowledge', knowledgeSchema);

module.exports = Knowledge; 