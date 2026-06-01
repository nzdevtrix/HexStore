// ====================================
// HEXSTORE BACKEND - ORDERS API
// CRUD operations for order management
// ====================================

const express = require('express');
const router = express.Router();
const { getDb } = require('../config/firebase');

/**
 * GET /api/orders
 * List all orders with filtering
 */
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { status, sellerId, buyerId, limit = 100 } = req.query;
    
    let query = db.collection('orders');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (sellerId) {
      query = query.where('sellerId', '==', sellerId);
    }

    if (buyerId) {
      query = query.where('buyerId', '==', buyerId);
    }

    const snapshot = await query.limit(parseInt(limit)).get();
    const orders = [];
    
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      data: orders,
      total: orders.length
    });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders', message: error.message });
  }
});

/**
 * GET /api/orders/:id
 * Get a single order
 */
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection('orders').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('GET /api/orders/:id error:', error);
    res.status(500).json({ error: 'Failed to fetch order', message: error.message });
  }
});

/**
 * POST /api/orders
 * Create a new order
 */
router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { buyerId, buyerName, sellerId, sellerName, items, total, shippingAddress } = req.body;

    if (!buyerId || !items || !total) {
      return res.status(400).json({ error: 'buyerId, items, and total are required' });
    }

    const order = {
      buyerId,
      buyerName: buyerName || '',
      sellerId: sellerId || '',
      sellerName: sellerName || '',
      items: items || [],
      itemCount: items ? items.length : 0,
      total: Number(total),
      status: 'pending',
      shippingAddress: shippingAddress || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('orders').add(order);
    res.status(201).json({ success: true, data: { id: docRef.id, ...order } });
  } catch (error) {
    console.error('POST /api/orders error:', error);
    res.status(500).json({ error: 'Failed to create order', message: error.message });
  }
});

/**
 * PATCH /api/orders/:id/status
 * Update order status
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const db = getDb();
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    await db.collection('orders').doc(req.params.id).set({
      status,
      updatedAt: new Date().toISOString(),
      statusHistory: {
        [status]: new Date().toISOString()
      }
    }, { merge: true });

    const doc = await db.collection('orders').doc(req.params.id).get();
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('PATCH /api/orders/:id/status error:', error);
    res.status(500).json({ error: 'Failed to update order status', message: error.message });
  }
});

/**
 * PUT /api/orders/:id
 * Update order details
 */
router.put('/:id', async (req, res) => {
  try {
    const db = getDb();
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) delete updates[key];
    });

    await db.collection('orders').doc(req.params.id).set(updates, { merge: true });
    const doc = await db.collection('orders').doc(req.params.id).get();
    
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('PUT /api/orders/:id error:', error);
    res.status(500).json({ error: 'Failed to update order', message: error.message });
  }
});

/**
 * DELETE /api/orders/:id
 * Delete an order
 */
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    await db.collection('orders').doc(req.params.id).delete();
    res.json({ success: true, message: 'Order deleted', id: req.params.id });
  } catch (error) {
    console.error('DELETE /api/orders/:id error:', error);
    res.status(500).json({ error: 'Failed to delete order', message: error.message });
  }
});

module.exports = router;