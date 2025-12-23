const express = require('express');
const {
  handleCreateUserProfile,
  handleGetUserProfile,
  handleGetLeaderboard,
} = require('../controllers/userController');

const router = express.Router();

/**
 * POST /api/users/profile - Create user profile
 * Body: { uid, email, role }
 */
router.post('/profile', handleCreateUserProfile);

/**
 * GET /api/users/leaderboard - Get leaderboard
 */
router.get('/leaderboard', handleGetLeaderboard);

/**
 * GET /api/users/profile/:uid - Get user profile
 */
router.get('/profile/:uid', handleGetUserProfile);

module.exports = router;

