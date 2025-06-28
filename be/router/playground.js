const express = require('express');
const router = express.Router();
const { requireAuth, getAuth } = require('@clerk/express');
const { generate } = require('../services/agent');
const Agent = require('../models/agent');
const { successResponse } = require('../utils/response');

// Chat with AI agent
router.post('/chat', requireAuth(), async (req, res) => {
    try {
        const { messages, agentId, context } = req.body;

        // Validate required fields
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                success: false,
                message: 'Messages array is required'
            });
        }

        // Get agent details
        const agent = await Agent.findById(agentId);
        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        // Prepare messages with context if provided
        let processedMessages = [...messages];

        if (context && context.trim()) {
            // Add context as a system message at the beginning
            const contextMessage = {
                role: 'system',
                content: `${agent.systemPrompt.replace('{context}', context)}`
            };
            processedMessages = [contextMessage, ...messages];
        } else {
            // Add system prompt as the first message
            const systemMessage = {
                role: 'system',
                content: agent.systemPrompt
            };
            processedMessages = [systemMessage, ...messages];
        }

        // Generate AI response
        const aiResponse = await generate(processedMessages);
        // Create response message
        const responseMessage = {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString()
        };

        // Return the conversation without the system message for display
        const displayMessages = aiResponse ? [...messages, responseMessage] : [...messages];

        res.status(200).json(successResponse({
            message: 'AI response generated successfully',
            data: {
                response: responseMessage,
                conversation: displayMessages
            }
        }));
    } catch (error) {
        console.error('Playground chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate AI response',
            error: error.message
        });
    }
});

// Get available agents for playground
router.get('/agents', requireAuth(), async (req, res) => {
    try {
        const agents = await Agent.find({ isActive: true }).select('name description systemPrompt');

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

module.exports = router; 