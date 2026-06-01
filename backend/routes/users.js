// ====================================
// HEXSTORE BACKEND - USERS API
// CRUD operations for user management
// ====================================

const express = require('express');
const router = express.Router();
const { getDb, getAuth } = require('../config/firebase');

/**
 * GET /api/users
 * List all users with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { role, search, limit = 100, offset = 0 } = req.query;
    
    let query = db.collection('users');
    
    // Filter by role
    if (role) {
      query = query.where('role', '==', role);
    }
    
    const snapshot = await query.limit(parseInt(limit)).get();
    let users = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      // Remove sensitive fields
      delete data.settings;
      users.push({ id: doc.id, ...data });
    });

    // Search filter (client-side since Firestore doesn't support full-text search)
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(u => 
        (u.email || '').toLowerCase().includes(searchLower) ||
        (u.fullName || '').toLowerCase().includes(searchLower) ||
        (u.username || '').toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    console.error('GET /api/users error:', error);
    res.status(500).json({ error: 'Failed to fetch users', message: error.message });
  }
});

/**
 * GET /api/users/:id
 * Get a single user by document ID
 */
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection('users').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('GET /api/users/:id error:', error);
    res.status(500).json({ error: 'Failed to fetch user', message: error.message });
  }
});

/**
 * GET /api/users/:id/firebase
 * Get Firebase Auth user details
 */
router.get('/:id/firebase', async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection('users').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = doc.data();
    const auth = getAuth();
    
    try {
      const firebaseUser = await auth.getUser(userData.uid);
      res.json({
        success: true,
        data: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
          disabled: firebaseUser.disabled,
          metadata: firebaseUser.metadata,
          providerData: firebaseUser.providerData
        }
      });
    } catch (authError) {
      res.json({
        success: true,
        data: { uid: userData.uid, email: userData.email, note: 'Firebase Auth user not found' }
      });
    }
  } catch (error) {
    console.error('GET /api/users/:id/firebase error:', error);
    res.status(500).json({ error: 'Failed to fetch Firebase user', message: error.message });
  }
});

/**
 * PUT /api/users/:id
 * Update user document
 */
router.put('/:id', async (req, res) => {
  try {
    const db = getDb();
    const { role, userType, fullName, phone, store } = req.body;
    
    const updates = {};
    if (role !== undefined) updates.role = role;
    if (userType !== undefined) updates.userType = userType;
    if (fullName !== undefined) updates.fullName = fullName;
    if (phone !== undefined) updates.phone = phone;
    if (store !== undefined) updates.store = store;
    
    updates.updatedAt = new Date().toISOString();

    await db.collection('users').doc(req.params.id).set(updates, { merge: true });

    const doc = await db.collection('users').doc(req.params.id).get();
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('PUT /api/users/:id error:', error);
    res.status(500).json({ error: 'Failed to update user', message: error.message });
  }
});

/**
 * PATCH /api/users/:id/role
 * Change user role
 */
router.patch('/:id/role', async (req, res) => {
  try {
    const db = getDb();
    const { role } = req.body;
    
    if (!['admin', 'seller', 'buyer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be: admin, seller, or buyer' });
    }

    await db.collection('users').doc(req.params.id).set({
      role,
      userType: role,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    const doc = await db.collection('users').doc(req.params.id).get();
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('PATCH /api/users/:id/role error:', error);
    res.status(500).json({ error: 'Failed to update role', message: error.message });
  }
});

/**
 * DELETE /api/users/:id
 * Delete user document and optionally disable Firebase Auth
 */
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection('users').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = doc.data();
    
    // Delete Firestore document
    await db.collection('users').doc(req.params.id).delete();

    // Optionally disable Firebase Auth user (don't delete to preserve data integrity)
    if (req.query.disableAuth === 'true' && userData.uid) {
      try {
        const auth = getAuth();
        await auth.updateUser(userData.uid, { disabled: true });
      } catch (e) {
        console.warn('Could not disable Firebase Auth user:', e.message);
      }
    }

    res.json({ success: true, message: 'User deleted', id: req.params.id });
  } catch (error) {
    console.error('DELETE /api/users/:id error:', error);
    res.status(500).json({ error: 'Failed to delete user', message: error.message });
  }
});

/**
 * POST /api/users/:id/disable
 * Disable/enable Firebase Auth user
 */
router.post('/:id/disable', async (req, res) => {
  try {
    const db = getDb();
    const { disabled } = req.body;
    
    const doc = await db.collection('users').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = doc.data();
    const auth = getAuth();
    
    await auth.updateUser(userData.uid, { disabled: !!disabled });
    await db.collection('users').doc(req.params.id).set({
      disabled: !!disabled,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    res.json({ success: true, message: disabled ? 'User disabled' : 'User enabled' });
  } catch (error) {
    console.error('POST /api/users/:id/disable error:', error);
    res.status(500).json({ error: 'Failed to update user status', message: error.message });
  }
});

module.exports = router;