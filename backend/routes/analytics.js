// ====================================
// HEXSTORE BACKEND - ANALYTICS API
// Platform analytics and metrics
// ====================================

const express = require('express');
const router = express.Router();
const { getDb } = require('../config/firebase');

/**
 * GET /api/analytics/overview
 * Get platform-wide overview metrics
 */
router.get('/overview', async (req, res) => {
  try {
    const db = getDb();
    
    // Fetch all collections in parallel
    const [usersSnap, productsSnap, ordersSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('products').get(),
      db.collection('orders').get()
    ]);

    // Process users
    const users = [];
    usersSnap.forEach(doc => users.push(doc.data()));
    
    const totalUsers = users.length;
    const totalSellers = users.filter(u => u.role === 'seller' || u.userType === 'seller').length;
    const totalBuyers = users.filter(u => u.role === 'buyer' || u.userType === 'buyer').length;
    const totalAdmins = users.filter(u => u.role === 'admin' || u.userType === 'admin').length;
    const activeUsers = users.filter(u => !u.disabled).length;
    const disabledUsers = users.filter(u => u.disabled).length;

    // Process products
    const products = [];
    productsSnap.forEach(doc => products.push(doc.data()));
    
    const totalProducts = products.filter(p => !p.deleted).length;
    const deletedProducts = products.filter(p => p.deleted).length;
    const categories = [...new Set(products.filter(p => !p.deleted).map(p => p.category))];
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);

    // Process orders
    const orders = [];
    ordersSnap.forEach(doc => orders.push(doc.data()));
    
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    const shippedOrders = orders.filter(o => o.status === 'shipped').length;
    
    const totalRevenue = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    
    const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

    // Revenue by seller
    const revenueBySeller = {};
    orders.filter(o => o.status === 'completed').forEach(o => {
      const seller = o.sellerName || o.sellerId || 'Unknown';
      revenueBySeller[seller] = (revenueBySeller[seller] || 0) + (o.total || 0);
    });

    // Orders by status
    const ordersByStatus = {
      pending: pendingOrders,
      shipped: shippedOrders,
      completed: completedOrders,
      cancelled: cancelledOrders
    };

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const recentOrders = orders.filter(o => (o.createdAt || '') > thirtyDaysAgo);
    const recentUsers = users.filter(u => (u.createdAt || '') > thirtyDaysAgo);

    // User registration trend (last 7 days)
    const registrationTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = users.filter(u => (u.createdAt || '').startsWith(dateStr)).length;
      registrationTrend.push({ date: dateStr, count });
    }

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          sellers: totalSellers,
          buyers: totalBuyers,
          admins: totalAdmins,
          active: activeUsers,
          disabled: disabledUsers,
          recentRegistrations: recentUsers.length
        },
        products: {
          total: totalProducts,
          deleted: deletedProducts,
          categories: categories.length,
          totalStock,
          categoryList: categories
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
          shipped: shippedOrders,
          recentOrders: recentOrders.length
        },
        revenue: {
          total: totalRevenue,
          average: avgOrderValue,
          bySeller: revenueBySeller
        },
        ordersByStatus,
        registrationTrend,
        systemHealth: {
          firebaseProject: 'hexstore-8d6b2',
          firestoreStatus: 'active',
          authStatus: 'active',
          lastUpdated: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('GET /api/analytics/overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics', message: error.message });
  }
});

/**
 * GET /api/analytics/revenue
 * Get revenue analytics over time
 */
router.get('/revenue', async (req, res) => {
  try {
    const db = getDb();
    const { period = '30d' } = req.query;
    
    const snapshot = await db.collection('orders').get();
    const orders = [];
    snapshot.forEach(doc => orders.push(doc.data()));

    const completedOrders = orders.filter(o => o.status === 'completed');
    
    // Group by date
    const revenueByDate = {};
    completedOrders.forEach(o => {
      const date = (o.createdAt || '').split('T')[0];
      if (date) {
        revenueByDate[date] = (revenueByDate[date] || 0) + (o.total || 0);
      }
    });

    // Sort by date
    const timeline = Object.entries(revenueByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date, revenue }));

    res.json({
      success: true,
      data: {
        totalRevenue: completedOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        totalCompletedOrders: completedOrders.length,
        timeline
      }
    });
  } catch (error) {
    console.error('GET /api/analytics/revenue error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics', message: error.message });
  }
});

/**
 * GET /api/analytics/users
 * Get user analytics
 */
router.get('/users', async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('users').get();
    const users = [];
    snapshot.forEach(doc => users.push(doc.data()));

    // Registration by provider
    const byProvider = {};
    users.forEach(u => {
      const provider = u.provider || 'email';
      byProvider[provider] = (byProvider[provider] || 0) + 1;
    });

    // Registration by day (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const recentUsers = users.filter(u => (u.createdAt || '') > thirtyDaysAgo);

    res.json({
      success: true,
      data: {
        total: users.length,
        byProvider,
        recentCount: recentUsers.length,
        byRole: {
          admin: users.filter(u => u.role === 'admin').length,
          seller: users.filter(u => u.role === 'seller').length,
          buyer: users.filter(u => u.role === 'buyer').length
        }
      }
    });
  } catch (error) {
    console.error('GET /api/analytics/users error:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics', message: error.message });
  }
});

module.exports = router;