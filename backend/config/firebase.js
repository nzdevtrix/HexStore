// ====================================
// HEXSTORE BACKEND - FIREBASE ADMIN SDK
// Server-side Firebase administration
// ====================================

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let db = null;
let auth = null;
let isInitialized = false;

/**
 * Initialize Firebase Admin SDK
 * Uses service account key for server-side authentication
 */
function initializeFirebase() {
  if (isInitialized) return { db, auth };

  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
    const fullPath = path.resolve(__dirname, '..', serviceAccountPath);

    if (fs.existsSync(fullPath)) {
      const serviceAccount = require(fullPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
      });
      console.log('✅ Firebase Admin SDK initialized with service account');
    } else {
      // Fallback: initialize without credentials (limited functionality)
      console.warn('⚠️  Service account key not found. Using limited mode.');
      console.warn(`   Expected at: ${fullPath}`);
      console.warn('   Download from: Firebase Console > Project Settings > Service Accounts');
      admin.initializeApp({
        projectId: 'hexstore-8d6b2'
      });
    }

    db = admin.firestore();
    auth = admin.auth();
    
    // Configure Firestore settings
    db.settings({
      ignoreUndefinedProperties: true
    });

    isInitialized = true;
    console.log('🔥 Firebase Admin SDK ready');
    
    return { db, auth };
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    throw error;
  }
}

/**
 * Get Firestore instance
 */
function getDb() {
  if (!db) initializeFirebase();
  return db;
}

/**
 * Get Auth instance
 */
function getAuth() {
  if (!auth) initializeFirebase();
  return auth;
}

/**
 * Get Firebase Admin instance
 */
function getAdmin() {
  return admin;
}

module.exports = {
  initializeFirebase,
  getDb,
  getAuth,
  getAdmin
};