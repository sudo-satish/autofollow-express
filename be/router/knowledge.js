const express = require('express');
const router = express.Router();
const { requireAuth, getAuth } = require('@clerk/express');
const Knowledge = require('../models/knowledge');
const Company = require('../models/company');
const { successResponse } = require('../utils/response');

// Create a new knowledge entry
router.post('/:companyId/knowledge', requireAuth(), async (req, res) => {
    try {
        const { companyId } = req.params;
        const { title, content } = req.body;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
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

        // Create knowledge entry
        const knowledge = await Knowledge.create({
            title,
            content,
            companyId
        });

        res.status(201).json(successResponse({
            message: 'Knowledge entry created successfully',
            data: knowledge
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create knowledge entry',
            error: error.message
        });
    }
});

// Get all knowledge entries for a company
router.get('/:companyId/knowledge', requireAuth(), async (req, res) => {
    try {
        const { companyId } = req.params;
        const knowledge = await Knowledge.find({ companyId }).populate('companyId');
        res.status(200).json(successResponse({
            message: 'Knowledge entries fetched successfully',
            data: knowledge
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch knowledge entries',
            error: error.message
        });
    }
});

// Get a single knowledge entry by ID
router.get('/:companyId/knowledge/:knowledgeId', requireAuth(), async (req, res) => {
    try {
        const { companyId, knowledgeId } = req.params;

        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        const knowledge = await Knowledge.findById(knowledgeId)
            .populate('companyId');

        if (!knowledge) {
            return res.status(404).json({
                success: false,
                message: 'Knowledge entry not found'
            });
        }

        res.status(200).json(successResponse({
            message: 'Knowledge entry fetched successfully',
            data: knowledge
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch knowledge entry',
            error: error.message
        });
    }
});

// Update a knowledge entry
router.put('/:companyId/knowledge/:knowledgeId', requireAuth(), async (req, res) => {
    try {
        const { companyId, knowledgeId } = req.params;
        const { title, content } = req.body;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        const knowledge = await Knowledge.findByIdAndUpdate(
            knowledgeId,
            { title, content, updatedAt: Date.now() },
            { new: true }
        );

        if (!knowledge) {
            return res.status(404).json({
                success: false,
                message: 'Knowledge entry not found'
            });
        }

        res.status(200).json(successResponse({
            message: 'Knowledge entry updated successfully',
            data: knowledge
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update knowledge entry',
            error: error.message
        });
    }
});

// Delete a knowledge entry
router.delete('/:companyId/knowledge/:knowledgeId', requireAuth(), async (req, res) => {
    try {
        const { companyId, knowledgeId } = req.params;
        const knowledge = await Knowledge.findByIdAndDelete(knowledgeId);

        if (!knowledge) {
            return res.status(404).json({
                success: false,
                message: 'Knowledge entry not found'
            });
        }

        res.status(200).json(successResponse({
            message: 'Knowledge entry deleted successfully'
        }));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete knowledge entry',
            error: error.message
        });
    }
});

module.exports = router;