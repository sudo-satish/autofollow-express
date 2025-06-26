const express = require('express');
const router = express.Router();
const { requireAuth, getAuth } = require('@clerk/express');
const Company = require('../models/company');
const User = require('../models/user');
const { createOrganisation, createUser } = require('../services/clerk');
const { successResponse } = require('../utils/response');
const Client = require('../models/client');
const Followup = require('../models/followup');
const ChatMessage = require('../models/chat');
const Agent = require('../models/agent');
const FollowupMessage = require('../models/followupMessage');
const { publish } = require('../redis');

router.post('/create', async (req, res) => {
    const { name, location } = req.body;
    console.log(name, location);

    const organisation = await createOrganisation({ name });
    const company = await Company.create({ name, location, clerkId: organisation.id });
    res.status(200).json(successResponse({ message: 'Company created successfully', company }));
});

router.get('/', async (req, res) => {
    const companies = await Company.find().populate('agents', 'name description isActive');
    res.status(200).json(successResponse({ message: 'Companies fetched successfully', data: companies }));
});

// Get users by company ID
router.get('/:companyId/users', async (req, res) => {
    try {
        const { companyId } = req.params;

        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        const users = await User.find({ companyId }).select('-password');
        res.status(200).json(successResponse({
            message: 'Users fetched successfully',
            data: users
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
});

// Create user for a company
router.post('/:companyId/users', async (req, res) => {
    try {
        const { companyId } = req.params;
        const { email, password, firstName, lastName } = req.body;

        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, firstName, and lastName are required'
            });
        }

        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create user in Clerk
        const clerkUser = await createUser({
            email,
            password,
            firstName,
            lastName,
            organizationId: company.clerkId
        });

        // Create user in database
        const user = await User.create({
            email,
            password, // Note: In production, you should hash the password
            firstName,
            lastName,
            companyId,
            clerkId: clerkUser.id,
        });

        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json(successResponse({
            message: 'User created successfully',
            data: userResponse
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: error.message
        });
    }
});

router.get('/:companyId', async (req, res) => {
    const { companyId } = req.params;
    const company = await Company.findById(companyId).populate('agents', 'name description isActive');
    res.status(200).json(successResponse({ message: 'Company fetched successfully', data: company }));
});

// Get company by orgId (clerkId)
router.get('/org/:orgId', async (req, res) => {
    try {
        const { orgId } = req.params;
        const company = await Company.findOne({ clerkId: orgId }).populate('agents', 'name description isActive');

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found for this organization'
            });
        }

        res.status(200).json(successResponse({
            message: 'Company fetched successfully',
            data: company
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch company',
            error: error.message
        });
    }
});

// Get all clients for a company
router.get('/:companyId/clients', async (req, res) => {
    try {
        const { companyId } = req.params;

        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // For now, return empty array - you'll need to create a Client model
        const clients = await Client.find({ companyId });

        res.status(200).json(successResponse({
            message: 'Clients fetched successfully',
            data: clients
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch clients',
            error: error.message
        });
    }
});

// Create a new client for a company
router.post('/:companyId/clients', async (req, res) => {
    try {
        const { companyId } = req.params;
        const { name, countryCode, phone } = req.body;

        // Validate required fields
        if (!name || !countryCode || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name, countryCode, and phone are required'
            });
        }

        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // For now, return mock data - you'll need to create a Client model
        const client = {
            id: Date.now(),
            name,
            countryCode,
            phone,
            companyId,
            status: 'active',
            createdAt: new Date().toISOString()
        };

        await Client.create(client);

        res.status(201).json(successResponse({
            message: 'Client created successfully',
            data: client
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create client',
            error: error.message
        });
    }
});

// Update a client
router.put('/:companyId/clients/:clientId', async (req, res) => {
    try {
        const { companyId, clientId } = req.params;
        const { name, countryCode, phone, status } = req.body;

        // Validate required fields
        if (!name || !countryCode || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name, countryCode, and phone are required'
            });
        }

        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // For now, return mock data - you'll need to create a Client model
        const client = {
            id: clientId,
            name,
            countryCode,
            phone,
            companyId,
            status: status || 'active',
            updatedAt: new Date().toISOString()
        };

        res.status(200).json(successResponse({
            message: 'Client updated successfully',
            data: client
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update client',
            error: error.message
        });
    }
});

// Delete a client
router.delete('/:companyId/clients/:clientId', async (req, res) => {
    try {
        const { companyId, clientId } = req.params;

        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        await Client.findByIdAndDelete(clientId);

        // For now, return success - you'll need to create a Client model
        res.status(200).json(successResponse({
            message: 'Client deleted successfully'
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete client',
            error: error.message
        });
    }
});

// Update company
router.put('/:companyId', requireAuth(), async (req, res) => {
    try {
        const { companyId } = req.params;
        const { name, location, agents } = req.body;

        // Validate required fields
        if (!name || !location) {
            return res.status(400).json({
                success: false,
                message: 'Name and location are required'
            });
        }

        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Update company
        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            { name, location, agents: agents || [] },
            { new: true }
        );

        res.status(200).json(successResponse({
            message: 'Company updated successfully',
            data: updatedCompany
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update company',
            error: error.message
        });
    }
});

// Create a new followup for a company
router.post('/:companyId/followups', requireAuth(), async (req, res) => {
    try {
        const { companyId } = req.params;
        const { clientId, followupDateTime, isAutoMode, context, agentId, status } = req.body;

        // Validate required fields
        if (!clientId || !followupDateTime || !context) {
            return res.status(400).json({
                success: false,
                message: 'Client ID, followup date and time, and context are required'
            });
        }

        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Create followup
        const followup = await Followup.create({
            clientId,
            companyId,
            followupDateTime,
            isAutoMode,
            context,
            agentId: agentId,
            status: status || 'pending'
        });

        const agent = await Agent.findById(agentId);
        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        await FollowupMessage.create({
            followupId: followup._id,
            clientId: clientId,
            role: 'system',
            content: `${agent.systemPrompt.replace('{context}', context)}

            ===
            Metadata: 
            ===
            Followup ID: ${followup._id}
            Client ID: ${clientId}
            Company ID: ${companyId}
            Agent ID: ${agentId}
            Followup Date: ${followupDateTime}
            Followup Status: ${status}
            ===
            `,
        });

        res.status(201).json(successResponse({
            message: 'Followup created successfully',
            data: followup
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create followup',
            error: error.message
        });
    }
});

router.get('/:companyId/followups', requireAuth(), async (req, res) => {
    try {
        const { companyId } = req.params;
        const followups = await Followup.find({ companyId }).populate('clientId agentId companyId');
        res.status(200).json(successResponse({
            message: 'Followups fetched successfully',
            data: followups
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch followups',
            error: error.message
        });
    }
});

// Get a single followup by ID
router.get('/:companyId/followups/:followupId', requireAuth(), async (req, res) => {
    try {
        const { companyId, followupId } = req.params;

        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        const followup = await Followup.findById(followupId)
            .populate('clientId agentId companyId');

        if (!followup) {
            return res.status(404).json({
                success: false,
                message: 'Followup not found'
            });
        }

        res.status(200).json(successResponse({
            message: 'Followup fetched successfully',
            data: followup
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch followup',
            error: error.message
        });
    }
});

router.put('/:companyId/followups/:followupId', requireAuth(), async (req, res) => {
    try {
        const { companyId, followupId } = req.params;
        const { clientId, followupDateTime, isAutoMode, context, agentId } = req.body;
        const followup = await Followup.findByIdAndUpdate(followupId, { clientId, followupDateTime, isAutoMode, context, agentId }, { new: true });
        res.status(200).json(successResponse({
            message: 'Followup updated successfully',
            data: followup
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update followup',
            error: error.message
        });
    }
});

router.delete('/:companyId/followups/:followupId', requireAuth(), async (req, res) => {
    try {
        const { companyId, followupId } = req.params;
        await Followup.findByIdAndDelete(followupId);
        res.status(200).json(successResponse({
            message: 'Followup deleted successfully'
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete followup',
            error: error.message
        });
    }
});

// Get chat messages for a followup
router.get('/:companyId/followups/:followupId/messages', requireAuth(), async (req, res) => {
    try {
        const { companyId, followupId } = req.params;

        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Verify followup exists
        const followup = await Followup.findById(followupId);
        if (!followup) {
            return res.status(404).json({
                success: false,
                message: 'Followup not found'
            });
        }

        const messages = await FollowupMessage.find({ followupId, role: { $in: ['assistant', 'user'] } })
            .populate('clientId')
            .sort({ createdAt: 1 });

        res.status(200).json(successResponse({
            message: 'Chat messages fetched successfully',
            data: messages
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch chat messages',
            error: error.message
        });
    }
});

// Send a new chat message
router.post('/:companyId/followups/:followupId/messages', requireAuth(), async (req, res) => {
    try {
        const { companyId, followupId } = req.params;
        const { sender, senderId, senderModel, message } = req.body;

        // Validate required fields
        if (!sender || !senderId || !senderModel || !message) {
            return res.status(400).json({
                success: false,
                message: 'Sender, senderId, senderModel, and message are required'
            });
        }

        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Verify followup exists
        const followup = await Followup.findById(followupId);
        if (!followup) {
            return res.status(404).json({
                success: false,
                message: 'Followup not found'
            });
        }

        // Create chat message
        const chatMessage = await ChatMessage.create({
            followupId,
            sender,
            senderId,
            senderModel,
            message
        });

        // Populate sender information
        await chatMessage.populate('senderId');

        res.status(201).json(successResponse({
            message: 'Message sent successfully',
            data: chatMessage
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
});

// Mark messages as read
router.put('/:companyId/followups/:followupId/messages/read', requireAuth(), async (req, res) => {
    try {
        const { companyId, followupId } = req.params;
        const { messageIds } = req.body;

        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Mark messages as read
        await ChatMessage.updateMany(
            { _id: { $in: messageIds }, followupId },
            { isRead: true }
        );

        res.status(200).json(successResponse({
            message: 'Messages marked as read successfully'
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read',
            error: error.message
        });
    }
});

// Start conversation for a followup
router.post('/:companyId/followups/:followupId/start-conversation', requireAuth(), async (req, res) => {
    try {
        const { followupId } = req.params;
        const followup = await Followup.findById(followupId);
        if (!followup) {
            return res.status(404).json({
                success: false,
                message: 'Followup not found'
            });
        }

        if (followup.status === 'in_progress') {
            return res.status(400).json({
                success: false,
                message: 'Followup is already in progress'
            });
        }

        followup.status = 'in_progress';
        await followup.save();

        const client = await Client.findById(followup.clientId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        const initialMessage = `Hello ${client.name}, How are you today?`;

        publish(
            'whatsapp.send-message',
            JSON.stringify({
                companyId: client.companyId,
                message: initialMessage,
                to: `${client.countryCode.replace('+', '')}${client.phone}@c.us`,
            })
        );

        await FollowupMessage.create({
            followupId: followup._id,
            clientId: client._id,
            role: 'assistant',
            content: initialMessage,
        });

        res.status(200).json(successResponse({
            message: 'Followup started successfully',
            data: followup
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to start followup',
            error: error.message
        });
    }
});

router.post('/:companyId/followups/:followupId/restart-conversation', requireAuth(), async (req, res) => {
    try {
        const { followupId } = req.params;
        const followup = await Followup.findById(followupId);
        if (!followup) {
            return res.status(404).json({
                success: false,
                message: 'Followup not found'
            });
        }

        const client = await Client.findById(followup.clientId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        followup.status = 'in_progress';
        await followup.save();

        await FollowupMessage.deleteMany({
            followupId: followup._id,
            role: { $in: ['assistant', 'user'] }
        });

        const initialMessage = `Hello ${client.name}, How are you today?`;
        await FollowupMessage.create({
            followupId: followup._id,
            clientId: followup.clientId,
            role: 'assistant',
            content: initialMessage,
        });

        publish(
            'whatsapp.send-message',
            JSON.stringify({
                companyId: followup.companyId,
                message: initialMessage,
                to: `${client.countryCode.replace('+', '')}${client.phone}@c.us`,
            })
        );

        res.status(200).json(successResponse({
            message: 'Followup restarted successfully',
            data: followup
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to restart followup',
            error: error.message
        });
    }
});
module.exports = router;