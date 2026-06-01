// ====================================
// HEXSTORE BACKEND - PRODUCTS API
// CRUD operations for product management
// ====================================

const express = require('express');
const router = express.Router();
const { getDb } = require('../config/firebase');

/**
 * GET /api/products
 * List all products with filtering
 */
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { category, sellerId, search, includeDeleted = false, limit = 100 } = req.query;
    
    let query = db.collection('products');
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    if (sellerId) {
      query = query.where('sellerId', '==', sellerId);
    }

    const snapshot = await query.limit(parseInt(limit)).get();
    let products = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (includeDeleted === 'true' || !data.deleted) {
        products.push({ id: doc.id, ...data });
      }
    });

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p => 
        (p.title || '').toLowerCase().includes(searchLower) ||
        (p.brand || '').toLowerCase().includes(searchLower) ||
        (p.category || '').toLowerCase().includes(searchLower) ||
        (p.description || '').toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: products,
      total: products.length
    });
  } catch (error) {
    console.error('GET /api/products error:', error);
    res.status(500).json({ error: 'Failed to fetch products', message: error.message });
  }
});

/**
 * GET /api/products/:id
 * Get a single product
 */
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection('products').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('GET /api/products/:id error:', error);
    res.status(500).json({ error: 'Failed to fetch product', message: error.message });
  }
});

/**
 * POST /api/products
 * Create a new product
 */
router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { title, price, category, brand, stock, img, description, sellerId, sellerName } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({ error: 'Title and price are required' });
    }

    const product = {
      title,
      price: Number(price),
      category: category || 'general',
      brand: brand || '',
      stock: Number(stock || 0),
      img: img || '',
      description: description || '',
      sellerId: sellerId || '',
      sellerName: sellerName || '',
      rating: 0,
      reviews: 0,
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('products').add(product);
    res.status(201).json({ success: true, data: { id: docRef.id, ...product } });
  } catch (error) {
    console.error('POST /api/products error:', error);
    res.status(500).json({ error: 'Failed to create product', message: error.message });
  }
});

/**
 * PUT /api/products/:id
 * Update a product
 */
router.put('/:id', async (req, res) => {
  try {
    const db = getDb();
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    
    // Remove undefined fields
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) delete updates[key];
    });

    await db.collection('products').doc(req.params.id).set(updates, { merge: true });
    const doc = await db.collection('products').doc(req.params.id).get();
    
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('PUT /api/products/:id error:', error);
    res.status(500).json({ error: 'Failed to update product', message: error.message });
  }
});

/**
 * PATCH /api/products/:id/stock
 * Update product stock
 */
router.patch('/:id/stock', async (req, res) => {
  try {
    const db = getDb();
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ error: 'Valid stock value required' });
    }

    await db.collection('products').doc(req.params.id).set({
      stock: Number(stock),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    const doc = await db.collection('products').doc(req.params.id).get();
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('PATCH /api/products/:id/stock error:', error);
    res.status(500).json({ error: 'Failed to update stock', message: error.message });
  }
});

/**
 * DELETE /api/products/:id
 * Soft-delete a product
 */
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    
    if (req.query.hard === 'true') {
      await db.collection('products').doc(req.params.id).delete();
      res.json({ success: true, message: 'Product permanently deleted' });
    } else {
      await db.collection('products').doc(req.params.id).set({
        deleted: true,
        deletedAt: new Date().toISOString()
      }, { merge: true });
      res.json({ success: true, message: 'Product soft-deleted' });
    }
  } catch (error) {
    console.error('DELETE /api/products/:id error:', error);
    res.status(500).json({ error: 'Failed to delete product', message: error.message });
  }
});

/**
 * POST /api/products/:id/restore
 * Restore a soft-deleted product
 */
router.post('/:id/restore', async (req, res) => {
  try {
    const db = getDb();
    await db.collection('products').doc(req.params.id).set({
      deleted: false,
      deletedAt: null,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    const doc = await db.collection('products').doc(req.params.id).get();
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('POST /api/products/:id/restore error:', error);
    res.status(500).json({ error: 'Failed to restore product', message: error.message });
  }
});

module.exports = router;