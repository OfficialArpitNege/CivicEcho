import {
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Gamification Constants
export const POINTS = {
    COMPLAINT_VERIFIED: 50,
};

export const BADGES = [
    { name: 'Civic Starter', threshold: 50, icon: '🌱' },
    { name: 'Neighborhood Watch', threshold: 200, icon: '👀' },
    { name: 'Community Hero', threshold: 500, icon: '🦸' },
    { name: 'Legendary Citizen', threshold: 1000, icon: '👑' },
];

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

/**
 * Award points to a user
 */
export const awardPoints = async (userId, amount, reason) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return;

        const userData = userSnap.data();
        const currentPoints = userData.points || 0;
        const newPoints = currentPoints + amount;

        // Calculate new badges
        const currentBadges = userData.badges || [];
        const newBadges = BADGES.filter(b => newPoints >= b.threshold && !currentBadges.includes(b.name))
            .map(b => b.name);

        const allBadges = [...new Set([...currentBadges, ...newBadges])];

        await updateDoc(userRef, {
            points: newPoints,
            badges: allBadges,
            updatedAt: serverTimestamp()
        });

        console.log(`🏆 Awarded ${amount} points to ${userId} for "${reason}". Total: ${newPoints}`);
        return { points: newPoints, badges: allBadges };
    } catch (error) {
        console.error('Error awarding points:', error);
        // Don't throw, just log. Gamification shouldn't break core flow.
    }
};

/**
 * Get Leaderboard
 */
export const getLeaderboard = async (limitCount = 10) => {
    try {
        const usersRef = collection(db, 'users');

        // Simpler query to avoid needing a manual composite index (role + points)
        // We fetch more users, then filter client-side
        const q = query(
            usersRef,
            orderBy('points', 'desc'),
            limit(limitCount * 2) // Fetch extra to account for filtering
        );

        const snapshot = await getDocs(q);

        const allUsers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            displayName: doc.data().displayName || doc.data().email?.split('@')[0] || 'Anonymous',
            points: doc.data().points || 0,
        }));

        // Client-side filter for citizens only
        const citizens = allUsers.filter(user => user.role === 'citizen');

        return citizens.slice(0, limitCount);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
};
