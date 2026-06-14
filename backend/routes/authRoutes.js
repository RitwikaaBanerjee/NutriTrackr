const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { registerOrUpdate, getProfile, updateProfile } = require('../controllers/authController');

/**
 * Auth Routes
 * All routes require a valid Firebase ID token in the Authorization header.
 */

// POST /api/auth/register — Create or update user record
router.post('/register', authMiddleware, registerOrUpdate);

// GET /api/auth/profile — Get current user's profile
router.get('/profile', authMiddleware, getProfile);

// PUT /api/auth/profile — Update profile fields
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
