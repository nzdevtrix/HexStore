// ====================================
// HEXSTORE BACKEND - SYSTEM API
// System management, health checks, 
// database operations, code management
// ====================================

const express = require('express');
const router = express.Router();
const { getDb, getAuth, getAdmin } = require('../config/firebase');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * GET /api/system/health
 * System health check
 */
router.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {}
  };

  try {
    const db = getDb();
    // Test Firestore connection
    const testDoc = await db.collection('users').limit(1).get();
    health.services.firestore = { status: 'connected', collections: testDoc.size >= 0 ? 'accessible' : 'error' };
  } catch (e) {
    health.services.firestore = { status: 'error', message: e.message };
    health.status = 'degraded';
  }

  try {
    const auth = getAuth();
    health.services.auth = { status: 'initialized' };
  } catch (e) {
    health.services.auth = { status: 'error', message: e.message };
    health.status = 'degraded';
  }

  res.json(health);
});

/**
 * GET /api/system/collections
 * List all Firestore collections with document counts
 */
router.get('/collections', async (req, res) => {
  try {
    const db = getDb();
    const collections = await db.listCollections();
    const result = [];

    for (const col of collections) {
      const snapshot = await col.get();
      const docCount = snapshot.size;
      
      // Get sample document for schema info
      let sampleSchema = null;
      if (!snapshot.empty) {
        const firstDoc = snapshot.docs[0];
        sampleSchema = Object.keys(firstDoc.data());
      }

      result.push({
        name: col.id,
        documentCount: docCount,
        schema: sampleSchema
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('GET /api/system/collections error:', error);
    res.status(500).json({ error: 'Failed to list collections', message: error.message });
  }
});

/**
 * GET /api/system/collection/:name
 * Get all documents from a specific collection
 */
router.get('/collection/:name', async (req, res) => {
  try {
    const db = getDb();
    const { limit = 100, offset = 0 } = req.query;
    const snapshot = await db.collection(req.params.name)
      .limit(parseInt(limit))
      .get();

    const documents = [];
    snapshot.forEach(doc => {
      documents.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      collection: req.params.name,
      data: documents,
      total: documents.length
    });
  } catch (error) {
    console.error(`GET /api/system/collection/${req.params.name} error:`, error);
    res.status(500).json({ error: 'Failed to fetch collection', message: error.message });
  }
});

/**
 * DELETE /api/system/collection/:name
 * Delete an entire collection
 */
router.delete('/collection/:name', async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection(req.params.name).get();
    
    const batch = db.batch();
    let count = 0;
    
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
      count++;
    });

    if (count > 0) {
      await batch.commit();
    }

    res.json({ 
      success: true, 
      message: `Collection '${req.params.name}' deleted`,
      documentsDeleted: count 
    });
  } catch (error) {
    console.error(`DELETE /api/system/collection/${req.params.name} error:`, error);
    res.status(500).json({ error: 'Failed to delete collection', message: error.message });
  }
});

/**
 * POST /api/system/seed
 * Seed the database with default data
 */
router.post('/seed', async (req, res) => {
  try {
    const db = getDb();
    const results = { users: 0, products: 0, orders: 0 };

    // Seed admin user
    const adminSnap = await db.collection('users').where('email', '==', 'admin@hexstore.io').get();
    if (adminSnap.empty) {
      await db.collection('users').add({
        uid: 'admin-uid-placeholder',
        email: 'admin@hexstore.io',
        username: 'hexadmin',
        fullName: 'HexStore Admin',
        userType: 'admin',
        role: 'admin',
        provider: 'email',
        createdAt: new Date().toISOString()
      });
      results.users++;
    }

    // Seed John Doe (Seller)
    const johnSnap = await db.collection('users').where('email', '==', 'john.doe@email.io').get();
    if (johnSnap.empty) {
      await db.collection('users').add({
        uid: 'john-uid-placeholder',
        email: 'john.doe@email.io',
        username: 'johndoe',
        fullName: 'John Doe',
        userType: 'seller',
        role: 'seller',
        provider: 'email',
        phone: '+1-555-0100',
        createdAt: new Date().toISOString(),
        store: {
          name: 'JD Electronics',
          description: 'Premium electronics and accessories',
          rating: 4.5,
          totalSales: 128,
          revenue: 45280.00
        }
      });
      results.users++;
    }

    // Seed Jane Smith (Buyer)
    const janeSnap = await db.collection('users').where('email', '==', 'jane.smith@email.io').get();
    if (janeSnap.empty) {
      await db.collection('users').add({
        uid: 'jane-uid-placeholder',
        email: 'jane.smith@email.io',
        username: 'janesmith',
        fullName: 'Jane Smith',
        userType: 'buyer',
        role: 'buyer',
        provider: 'email',
        phone: '+1-555-0200',
        createdAt: new Date().toISOString()
      });
      results.users++;
    }

    // Seed sample products
    const productsSnap = await db.collection('products').get();
    if (productsSnap.empty) {
      const sampleProducts = [
        { title: 'Wireless Headphones Pro', price: 79.99, category: 'electronics', brand: 'AudioMax', stock: 45, sellerId: 'john-uid-placeholder', sellerName: 'JD Electronics', rating: 4.3, reviews: 28, description: 'Premium wireless headphones with noise cancellation' },
        { title: 'Smart Watch Ultra', price: 199.99, category: 'electronics', brand: 'TechWear', stock: 23, sellerId: 'john-uid-placeholder', sellerName: 'JD Electronics', rating: 4.7, reviews: 52, description: 'Feature-rich smartwatch with health tracking' },
        { title: 'USB-C Hub 7-in-1', price: 34.99, category: 'accessories', brand: 'ConnectPro', stock: 120, sellerId: 'john-uid-placeholder', sellerName: 'JD Electronics', rating: 4.1, reviews: 15, description: 'Multi-port USB-C hub for laptops' },
        { title: 'Bluetooth Speaker Mini', price: 49.99, category: 'electronics', brand: 'AudioMax', stock: 67, sellerId: 'john-uid-placeholder', sellerName: 'JD Electronics', rating: 4.5, reviews: 33, description: 'Portable Bluetooth speaker with deep bass' },
        { title: 'Laptop Stand Adjustable', price: 29.99, category: 'accessories', brand: 'ErgoTech', stock: 89, sellerId: 'john-uid-placeholder', sellerName: 'JD Electronics', rating: 4.2, reviews: 19, description: 'Adjustable aluminum laptop stand' }
      ];

      for (const product of sampleProducts) {
        await db.collection('products').add({
          ...product,
          deleted: false,
          createdAt: new Date().toISOString()
        });
        results.products++;
      }
    }

    // Seed sample orders
    const ordersSnap = await db.collection('orders').get();
    if (ordersSnap.empty) {
      const sampleOrders = [
        { buyerId: 'jane-uid-placeholder', buyerName: 'Jane Smith', sellerId: 'john-uid-placeholder', sellerName: 'JD Electronics', items: [{ title: 'Wireless Headphones Pro', quantity: 1, price: 79.99 }], total: 79.99, status: 'completed' },
        { buyerId: 'jane-uid-placeholder', buyerName: 'Jane Smith', sellerId: 'john-uid-placeholder', sellerName: 'JD Electronics', items: [{ title: 'Smart Watch Ultra', quantity: 1, price: 199.99 }], total: 199.99, status: 'shipped' },
        { buyerId: 'jane-uid-placeholder', buyerName: 'Jane Smith', sellerId: 'john-uid-placeholder', sellerName: 'JD Electronics', items: [{ title: 'USB-C Hub 7-in-1', quantity: 2, price: 34.99 }], total: 69.98, status: 'pending' }
      ];

      for (const order of sampleOrders) {
        await db.collection('orders').add({
          ...order,
          itemCount: order.items.length,
          createdAt: new Date().toISOString()
        });
        results.orders++;
      }
    }

    res.json({
      success: true,
      message: 'Database seeded successfully',
      data: results
    });
  } catch (error) {
    console.error('POST /api/system/seed error:', error);
    res.status(500).json({ error: 'Failed to seed database', message: error.message });
  }
});

/**
 * GET /api/system/project
 * Get Firebase project info
 */
router.get('/project', (req, res) => {
  res.json({
    success: true,
    data: {
      projectId: 'hexstore-8d6b2',
      authDomain: 'hexstore-8d6b2.firebaseapp.com',
      storageBucket: 'hexstore-8d6b2.firebasestorage.app',
      region: 'us-central1',
      services: {
        auth: 'Email/Password, Google OAuth',
        firestore: 'Native mode',
        hosting: 'Firebase Hosting',
        storage: 'Cloud Storage for Firebase'
      }
    }
  });
});

/**
 * GET /api/system/processes
 * Get system processes info
 */
router.get('/processes', (req, res) => {
  res.json({
    success: true,
    data: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      },
      env: process.env.NODE_ENV || 'development',
      pid: process.pid
    }
  });
});

module.exports = router;