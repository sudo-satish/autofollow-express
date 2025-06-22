const express = require('express');
const router = express.Router();
const { requireAuth, getAuth } = require('@clerk/express');

// Get current user info
router.get('/me', requireAuth(), (req, res) => {
    try {
        const { userId } = getAuth(req);
        res.json({
            success: true,
            userId: userId,
            message: 'User authenticated successfully'
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
});

// Verify authentication status
router.get('/verify', requireAuth(), (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        authenticated: true
    });
});

// Logout (client-side logout, this is just for API consistency)
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful (client-side logout required)'
    });
});

module.exports = router; 