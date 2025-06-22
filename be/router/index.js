const express = require('express');
const { requireAuth, getAuth } = require('@clerk/express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./user');
const followRoutes = require('./follow');
const companyRoutes = require('./company');
const agentRoutes = require('./agent');

// Mount routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/follow', followRoutes);
router.use('/company', companyRoutes);
router.use('/agent', agentRoutes);

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

router.get('/protected', requireAuth(), (req, res) => {
    const { userId } = getAuth(req);
    console.log(userId);
    res.send('Protected route')
})

// Default route
router.get('/', (req, res) => {
    res.json({
        message: 'AutoFollow API',
        version: '1.0.0',
        endpoints: {
            auth: '/auth',
            user: '/user',
            follow: '/follow',
            health: '/health'
        }
    });
});

module.exports = router;
