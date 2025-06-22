const express = require('express');
const router = express.Router();
const { requireAuth, getAuth } = require('@clerk/express');

// Get user profile
router.get('/profile', requireAuth(), async (req, res) => {
    try {
        const { userId } = getAuth(req);

        // TODO: Fetch user profile from database
        // const userProfile = await User.findOne({ clerkId: userId });

        res.json({
            success: true,
            userId: userId,
            profile: {
                // Add user profile fields here
                clerkId: userId,
                // Add more fields as needed
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user profile',
            error: error.message
        });
    }
});

// Update user profile
router.put('/profile', requireAuth(), async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const updateData = req.body;

        // TODO: Update user profile in database
        // const updatedProfile = await User.findOneAndUpdate(
        //     { clerkId: userId },
        //     updateData,
        //     { new: true }
        // );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            userId: userId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
});

// Get user settings
router.get('/settings', requireAuth(), (req, res) => {
    try {
        const { userId } = getAuth(req);

        // TODO: Fetch user settings from database

        res.json({
            success: true,
            userId: userId,
            settings: {
                // Add user settings here
                notifications: true,
                autoFollow: false,
                // Add more settings as needed
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user settings',
            error: error.message
        });
    }
});

// Update user settings
router.put('/settings', requireAuth(), async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const settings = req.body;

        // TODO: Update user settings in database

        res.json({
            success: true,
            message: 'Settings updated successfully',
            userId: userId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update settings',
            error: error.message
        });
    }
});

module.exports = router; 