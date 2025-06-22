const express = require('express');
const router = express.Router();
const { requireAuth, getAuth } = require('@clerk/express');
const Agent = require('../models/agent');
const { successResponse } = require('../utils/response');

// Get all agents
router.get('/', requireAuth(), async (req, res) => {
    try {
        const agents = await Agent.find().sort({ createdAt: -1 });
        res.status(200).json(successResponse({
            message: 'Agents fetched successfully',
            data: agents
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch agents',
            error: error.message
        });
    }
});

// Create new agent
router.post('/', requireAuth(), async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const { name, systemPrompt, description } = req.body;

        // Validate required fields
        if (!name || !systemPrompt) {
            return res.status(400).json({
                success: false,
                message: 'Name and systemPrompt are required'
            });
        }

        // Check if agent with same name already exists
        const existingAgent = await Agent.findOne({ name });
        if (existingAgent) {
            return res.status(400).json({
                success: false,
                message: 'Agent with this name already exists'
            });
        }

        // Create agent
        const agent = await Agent.create({
            name,
            systemPrompt,
            description,
            createdBy: userId
        });

        res.status(201).json(successResponse({
            message: 'Agent created successfully',
            data: agent
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create agent',
            error: error.message
        });
    }
});

// Get agent by ID
router.get('/:id', requireAuth(), async (req, res) => {
    try {
        const { id } = req.params;
        const agent = await Agent.findById(id);

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        res.status(200).json(successResponse({
            message: 'Agent fetched successfully',
            data: agent
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch agent',
            error: error.message
        });
    }
});

// Update agent
router.put('/:id', requireAuth(), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, systemPrompt, description, isActive } = req.body;

        const agent = await Agent.findById(id);
        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        // Update agent
        const updatedAgent = await Agent.findByIdAndUpdate(
            id,
            { name, systemPrompt, description, isActive },
            { new: true }
        );

        res.status(200).json(successResponse({
            message: 'Agent updated successfully',
            data: updatedAgent
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update agent',
            error: error.message
        });
    }
});

// Delete agent
router.delete('/:id', requireAuth(), async (req, res) => {
    try {
        const { id } = req.params;
        const agent = await Agent.findById(id);

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        await Agent.findByIdAndDelete(id);

        res.status(200).json(successResponse({
            message: 'Agent deleted successfully'
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete agent',
            error: error.message
        });
    }
});

module.exports = router; 