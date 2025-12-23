const { auth, db } = require('../config/firebase');

/**
 * Middleware to verify user is an authority
 * Checks user role in Firestore
 */
const authorityCheck = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    // Verify token and get user ID
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Fetch user role from Firestore
    const userSnapshot = await db.collection('users').doc(uid).get();

    if (!userSnapshot.exists) {
      return res.status(403).json({ error: 'Forbidden: User profile not found' });
    }

    const userRole = userSnapshot.data().role;

    // Check if user is authority
    if (userRole !== 'authority') {
      return res.status(403).json({ error: 'Forbidden: Authority access required' });
    }

    // Attach user ID to request for later use
    req.uid = uid;
    next();
  } catch (error) {
    console.error('Authority check error:', error);
    return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
};

module.exports = authorityCheck;
