// ====================================
// HEXSTORE BACKEND - AUTH MIDDLEWARE
// Admin authentication & authorization
// ====================================

const { getAuth, getDb } = require('../config/firebase');

/**
 * Verify Firebase ID token from Authorization header
 * This validates tokens issued by Firebase Auth on the client side
 */
async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Missing or invalid Authorization header' 
    });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid or expired token' 
    });
  }
}

/**
 * Verify admin role from Firestore user document
 * Must be used after verifyFirebaseToken
 */
async function requireAdmin(req, res, next) {
  try {
    const db = getDb();
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('uid', '==', req.user.uid).get();

    if (snapshot.empty) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'User document not found' 
      });
    }

    const userData = snapshot.docs[0].data();
    
    if (userData.role !== 'admin' && userData.userType !== 'admin') {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Admin access required' 
      });
    }

    req.userDoc = { id: snapshot.docs[0].id, ...userData };
    next();
  } catch (error) {
    console.error('Admin check failed:', error.message);
    return res.status(500).json({ 
      error: 'Server Error', 
      message: 'Failed to verify admin status' 
    });
  }
}

/**
 * Optional auth - attaches user if token is present, but doesn't require it
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
  } catch (error) {
    // Token invalid, continue without auth
  }
  
  next();
}

/**
 * Simple API key authentication for internal services
 */
function requireApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey || apiKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid API key' 
    });
  }

  next();
}

module.exports = {
  verifyFirebaseToken,
  requireAdmin,
  optionalAuth,
  requireApiKey
};