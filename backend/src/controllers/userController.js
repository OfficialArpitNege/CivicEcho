const { db } = require('../config/firebase');
const userService = require('../services/userService');

// Authority email whitelist (comma-separated in env, or empty array)
const AUTHORITY_EMAIL_WHITELIST = process.env.AUTHORITY_EMAIL_WHITELIST
  ? process.env.AUTHORITY_EMAIL_WHITELIST.split(',').map((email) => email.trim().toLowerCase())
  : [];

/**
 * Determine user role based on email whitelist
 */
const determineUserRole = (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  if (AUTHORITY_EMAIL_WHITELIST.includes(normalizedEmail)) {
    return 'authority';
  }

  return 'citizen';
};

/**
 * Create or update user profile
 * POST /api/users/profile
 * Role is assigned server-side based on email whitelist
 */
const handleCreateUserProfile = async (req, res) => {
  try {
    const { uid, email } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ error: 'uid and email are required' });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').doc(uid).get();

    let role = 'citizen';

    if (existingUser.exists) {
      // Preserve existing role (prevent downgrade)
      role = existingUser.data().role || 'citizen';
      console.log(`✏️  Updating existing user: ${email} (${uid}) - Existing role: ${role}`);
    } else {
      // New user: assign role based on email whitelist
      role = determineUserRole(email);
      console.log(`✨ New user created: ${email} (${uid}) - Assigned role: ${role}`);
    }

    const userProfile = {
      uid,
      email: email.toLowerCase().trim(),
      role,
      createdAt: existingUser.exists ? existingUser.data().createdAt : new Date(),
      updatedAt: new Date(),
    };

    await db.collection('users').doc(uid).set(userProfile, { merge: true });

    res.status(200).json({
      success: true,
      data: userProfile,
      message: 'User profile created successfully',
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    res.status(500).json({
      error: 'Failed to create user profile',
      details: error.message,
    });
  }
};

/**
 * Get user profile
 * GET /api/users/profile/:uid
 */
const handleGetUserProfile = async (req, res) => {
  try {
    const { uid } = req.params;

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.status(200).json({
      success: true,
      data: { id: userDoc.id, ...userDoc.data() },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      error: 'Failed to fetch user profile',
      details: error.message,
    });
  }
};

/**
 * Get leaderboard
 * GET /api/users/leaderboard
 */
const handleGetLeaderboard = async (req, res) => {
  try {
    const { limit } = req.query;
    const leaderboard = await userService.getLeaderboard(limit ? parseInt(limit) : 10);

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

module.exports = {
  handleCreateUserProfile,
  handleGetUserProfile,
  handleGetLeaderboard,
};

