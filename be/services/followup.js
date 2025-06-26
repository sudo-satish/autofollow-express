const Followup = require('../models/followup');
const FollowupMessage = require('../models/followupMessage');
const { generate } = require('./agent');

const generateNextFollowupMessage = async (followupId) => {
    const followup = await Followup.findById(followupId);
    if (!followup) {
        throw new Error('Followup not found');
    }

    const followupMessagesForAgent = await FollowupMessage.find({
        followupId: followup._id,
    }).sort({ createdAt: 1 }).select('content role');

    const messages = followupMessagesForAgent.map(message => ({
        role: message.role,
        content: message.content,
    }));

    const response = await generate(messages);
    return response;
}

module.exports = {
    generateNextFollowupMessage
}