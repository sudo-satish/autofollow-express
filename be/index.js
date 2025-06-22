require('dotenv').config();
const express = require('express')
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const mongoose = require('./database/db');
const { clerkMiddleware, requireAuth, getAuth } = require('@clerk/express');
const cors = require('cors');
const redis = require('./redis');
const Company = require('./models/company');

const app = express()
const server = createServer(app);
const port = process.env.PORT || 3000

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

// Import and use router
const router = require('./router');
const MessageLog = require('./models/messageLog');

redis.connect().then(() => {
    console.log('Connected to Redis');
});

// Use the router
app.use('/api', router);

// WhatsApp connection states
const whatsappConnections = new Map();

redis.subscribe('whatsapp.message_create', async (message) => {
    try {
        if (message) {
            console.log('whatsapp-message-created', message);
            const messageData = JSON.parse(message);

            await MessageLog.create({ message: messageData });
            // const messageDoc = await Message.create({ message: messageData });
            // socket.emit('whatsapp-message-created', messageDoc.toObject());

            // await onWhatsappMessage(messageData);
        }
    } catch (error) {
        console.error('whatsapp-message-created', error);
    }
});


// Socket.io connection
io.on('connection', (socket) => {
    console.log('a user connected');

    redis.subscribe('whatsapp:qr', async (data) => {
        console.log('whatsapp:qr', JSON.parse(data));
        const { companyId, qr } = JSON.parse(data);
        const company = await Company.findById(companyId);

        socket.emit('whatsapp:qr', { qr });
    });

    redis.subscribe('whatsapp:ready', async (data) => {
        console.log('whatsapp:ready', JSON.parse(data));
        const { clientId } = JSON.parse(data);
        try {
            const company = await Company.findById(clientId);
            company.isWhatsappEnabled = true;
            await company.save();
        } catch (error) {

        }

        socket.emit('whatsapp:ready', { companyId: clientId });
        socket.emit('whatsapp:status', { status: 'connected' });
    });


    // WhatsApp connect event
    socket.on('whatsapp:connect', async (data) => {
        try {
            const { companyId } = data;

            if (!companyId) {
                socket.emit('whatsapp:error', { message: 'Company ID is required' });
                return;
            }

            // Check if company exists
            const company = await Company.findById(companyId);
            if (!company) {
                socket.emit('whatsapp:error', { message: 'Company not found' });
                return;
            }

            redis.publish(`whatsapp:connect`, JSON.stringify({ companyId }));

        } catch (error) {
            console.error('WhatsApp connect error:', error);
            socket.emit('whatsapp:error', { message: 'Failed to connect to WhatsApp' });
        }
    });

    // WhatsApp disconnect event
    socket.on('whatsapp:disconnect', async (data) => {
        try {
            const { companyId } = data;

            if (companyId) {
                // Update company WhatsApp status
                const company = await Company.findById(companyId);
                if (company) {
                    company.isWhatsappEnabled = false;
                    await company.save();
                }

                // Remove from connections map
                whatsappConnections.delete(companyId);
            }

            socket.emit('whatsapp:status', { status: 'disconnected' });

        } catch (error) {
            console.error('WhatsApp disconnect error:', error);
            socket.emit('whatsapp:error', { message: 'Failed to disconnect from WhatsApp' });
        }
    });

    // Get WhatsApp status
    socket.on('whatsapp:getStatus', async (data) => {
        try {
            const { companyId } = data;

            if (!companyId) {
                socket.emit('whatsapp:error', { message: 'Company ID is required' });
                return;
            }

            const company = await Company.findById(companyId);
            if (!company) {
                socket.emit('whatsapp:error', { message: 'Company not found' });
                return;
            }

            const status = company.isWhatsappEnabled ? 'connected' : 'disconnected';
            socket.emit('whatsapp:status', { status });

        } catch (error) {
            console.error('WhatsApp get status error:', error);
            socket.emit('whatsapp:error', { message: 'Failed to get WhatsApp status' });
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');

        // Clean up WhatsApp connections for this socket
        for (const [companyId, connection] of whatsappConnections.entries()) {
            if (connection.socketId === socket.id) {
                whatsappConnections.delete(companyId);
            }
        }
    });
});

server.listen(port, () => {
    console.log(`AutoFollow API server listening on port ${port}`)
    console.log(`API endpoints available at http://localhost:${port}/api`)
})

process.on('SIGINT', () => {
    redis.disconnect();
    process.exit(0);
});
