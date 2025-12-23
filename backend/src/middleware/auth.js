const { auth, db } = require('../config/firebase');

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    
    // Fetch user role from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (userDoc.exists) {
      req.user.role = userDoc.data().role || 'citizen';
    } else {
      req.user.role = 'citizen';
    }
    
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to check if user is authority
const requireAuthority = async (req, res, next) => {
  if (req.user?.role !== 'authority') {
    return res.status(403).json({ error: 'Access denied. Authority role required.' });
  }
  next();
};

module.exports = { verifyToken, requireAuthority };
