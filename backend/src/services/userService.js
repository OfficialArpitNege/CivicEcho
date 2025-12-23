const { db } = require('../config/firebase');

// Gamification Constants
const POINTS = {
    COMPLAINT_VERIFIED: 50,
};

const BADGES = [
    { name: 'Civic Starter', threshold: 50, icon: '🌱' },
    { name: 'Neighborhood Watch', threshold: 200, icon: '👀' },
    { name: 'Community Hero', threshold: 500, icon: '🦸' },
    { name: 'Legendary Citizen', threshold: 1000, icon: '👑' },
];

/**
 * Get user profile by UID
 */
const getUserProfile = async (uid) => {
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

/**
 * Update user points and check for badges
 */
const awardPoints = async (userId, amount, reason) => {
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) return;

        const userData = userDoc.data();
        const currentPoints = userData.points || 0;
        const newPoints = currentPoints + amount;

        // Calculate new badges
        const currentBadges = userData.badges || [];
        const newBadges = BADGES.filter(b => newPoints >= b.threshold && !currentBadges.includes(b.name))
            .map(b => b.name);

        const allBadges = [...new Set([...currentBadges, ...newBadges])];

        await userRef.update({
            points: newPoints,
            badges: allBadges,
            updatedAt: new Date()
        });

        console.log(`🏆 Awarded ${amount} points to ${userId} for "${reason}". Total: ${newPoints}`);

        return { points: newPoints, badges: allBadges, newBadges };
    } catch (error) {
        console.error('Error awarding points:', error);
        throw error;
    }
};

/**
 * Get global leaderboard
 */
const getLeaderboard = async (limit = 10) => {
    try {
        const snapshot = await db.collection('users')
            .where('role', '==', 'citizen')
            .orderBy('points', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                displayName: data.displayName || data.email.split('@')[0],
                points: data.points || 0,
                badges: data.badges || [],
                profilePicture: data.profilePicture
            };
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
    }
};

module.exports = {
    getUserProfile,
    awardPoints,
    getLeaderboard,
    POINTS
};
