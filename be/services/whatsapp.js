const Client = require("../models/client");
const Followup = require("../models/followup");
const FollowupMessage = require("../models/followupMessage");
const { publish } = require("../redis");
const { generateNextFollowupMessage } = require("./followup");

const onWhatsappMessage = async (msgLog, io) => {
    const message = msgLog.message;
    const { type, body, fromMe, from } = message;
    if (type !== 'chat' || !body || fromMe || !from) {
        return;
    }

    const number = from.substring(2).replace('@c.us', '');
    const client = await Client.findOne({ phone: number });
    if (!client) {
        console.error('No client found for number', number);
        return;
    }

    const followup = await Followup.findOne({ clientId: client._id });

    if (!followup) {
        console.error('No followup found for client', client._id);
        return;
    }

    // Create followup message
    const followupMessage = await FollowupMessage.create({
        followupId: followup._id,
        clientId: client._id,
        role: 'user',
        content: body,
    });

    // Emit WebSocket event for new message
    if (io) {
        io.emit('whatsapp-message', {
            followupId: followup._id,
            message: followupMessage,
            type: 'user'
        });
    }

    if (!followup.isAutoMode) {
        console.log('Followup is not in auto mode');
        return;
    }

    const nextMessage = await generateNextFollowupMessage(followup._id);

    const nextFollowupMessage = await FollowupMessage.create({
        followupId: followup._id,
        clientId: client._id,
        role: 'assistant',
        content: nextMessage,
    });


    // Emit WebSocket event for assistant response
    if (io) {
        io.emit('whatsapp-message', {
            followupId: followup._id,
            message: nextFollowupMessage,
            type: 'assistant'
        });
    }

    publish(
        'whatsapp.send-message',
        JSON.stringify({
            companyId: followup.companyId,
            message: nextMessage,
            to: `${client.countryCode.replace('+', '')}${client.phone}@c.us`,
        })
    );

}

module.exports = { onWhatsappMessage };