import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from './firebase.service';
import { ApiService } from './api.service';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'HexStore Dashboard';
  users: any[] = [];
  metrics: any = { users: 0, sellers: 0, buyers: 0, products: 0, orders: 0, revenue: 0 };
  isAdmin = false;
  currentUser: any = null;
  products: any[] = [];
  orders: any[] = [];
  selectedTab: 'overview' | 'users' | 'products' | 'orders' | 'system' = 'overview';
  
  // Backend connection status
  backendConnected = false;
  backendError = '';
  systemHealth: any = null;
  collections: any[] = [];
  projectInfo: any = null;

  constructor(private fb: FirebaseService, private api: ApiService, private router: Router) {}

  async ngOnInit() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (fireUser) => {
      if (fireUser) {
        this.currentUser = fireUser;
        // Check if user is admin
        const userDoc = await this.fb.getUserByUid(fireUser.uid);
        if (userDoc?.role === 'admin' || userDoc?.userType === 'admin') {
          this.isAdmin = true;
          await this.connectBackend();
          await this.loadAllData();
        } else {
          // Not admin — redirect to role-specific dashboard
          const role = userDoc?.userType || userDoc?.role || 'buyer';
          if (role === 'seller') {
            this.router.navigate(['/seller']);
          } else {
            this.router.navigate(['/buyer']);
          }
        }
      } else {
        // Not logged in — check for role query param (from login redirect)
        const params = new URLSearchParams(window.location.search);
        const role = params.get('role');
        if (role === 'seller') {
          this.router.navigate(['/seller']);
        } else if (role === 'buyer') {
          this.router.navigate(['/buyer']);
        } else {
          // Redirect to main site
          window.location.href = '/login.html';
        }
      }
    });
  }

  /**
   * Connect to backend API and verify health
   */
  async connectBackend() {
    try {
      // Use public health check first (no auth needed)
      const health = await this.api.healthCheck();
      this.backendConnected = true;
      this.systemHealth = health;
      this.backendError = '';
      console.log('✅ Backend connected:', health.status);
    } catch (e: any) {
      this.backendConnected = false;
      this.backendError = e.message || 'Backend not available';
      console.warn('⚠️ Backend not connected:', e.message);
    }
  }

  async loadAllData() {
    try {
      // Try backend API first, fall back to direct Firestore
      if (this.backendConnected) {
        await this.loadFromBackend();
      } else {
        await this.loadFromFirestore();
      }
    } catch (e) {
      console.warn('Load failed, trying fallback:', e);
      await this.loadFromFirestore();
    }
  }

  /**
   * Load data from backend API
   */
  async loadFromBackend() {
    try {
      const [usersRes, productsRes, ordersRes, overviewRes] = await Promise.all([
        this.api.listUsers(),
        this.api.listProducts(),
        this.api.listOrders(),
        this.api.getAnalyticsOverview()
      ]);

      this.users = usersRes.data || [];
      this.products = productsRes.data || [];
      this.orders = ordersRes.data || [];

      // Use analytics overview for metrics
      if (overviewRes?.data) {
        const d = overviewRes.data;
        this.metrics = {
          users: d.users?.total || 0,
          sellers: d.users?.sellers || 0,
          buyers: d.users?.buyers || 0,
          products: d.products?.total || 0,
          orders: d.orders?.total || 0,
          revenue: d.revenue?.total || 0
        };
      } else {
        this.calculateMetrics();
      }

      // Load system info
      try {
        const [health, collections, project] = await Promise.all([
          this.api.getSystemHealth(),
          this.api.getCollections(),
          this.api.getProjectInfo()
        ]);
        this.systemHealth = health;
        this.collections = collections.data || [];
        this.projectInfo = project.data || null;
      } catch (e) {
        console.warn('System info load failed:', e);
      }
    } catch (e) {
      console.warn('Backend load failed, falling back to Firestore:', e);
      await this.loadFromFirestore();
    }
  }

  /**
   * Load data directly from Firestore (fallback)
   */
  async loadFromFirestore() {
    try {
      this.users = await this.fb.listUsers();
      this.products = await this.fb.listProducts();
      this.orders = await this.fb.listOrders();
      this.calculateMetrics();
    } catch (e) {
      console.warn('Firestore load failed:', e);
    }
  }

  calculateMetrics() {
    this.metrics.users = this.users.length;
    this.metrics.sellers = this.users.filter((u: any) => u.role === 'seller' || u.userType === 'seller').length;
    this.metrics.buyers = this.users.filter((u: any) => u.role === 'buyer' || u.userType === 'buyer').length;
    this.metrics.products = this.products.length;
    this.metrics.orders = this.orders.length;
    this.metrics.revenue = this.orders
      .filter((o: any) => o.status === 'completed')
      .reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  }

  /**
   * Seed database with sample data
   */
  async seedDatabase() {
    if (!confirm('Seed the database with sample data?')) return;
    try {
      if (this.backendConnected) {
        const result = await this.api.seedDatabase();
        alert(`Database seeded! Users: ${result.data?.users || 0}, Products: ${result.data?.products || 0}, Orders: ${result.data?.orders || 0}`);
      } else {
        alert('Backend not connected. Seed from Firestore directly.');
      }
      await this.loadAllData();
    } catch (e: any) {
      alert('Seed failed: ' + e.message);
    }
  }

  /**
   * Refresh all data
   */
  async refreshData() {
    await this.connectBackend();
    await this.loadAllData();
  }

  async deleteUser(userId: string) {
    if (!confirm('Delete this user document? (Firebase Auth user remains)')) return;
    try {
      await this.fb.deleteUserDoc(userId);
      await this.loadAllData();
    } catch (e: any) { alert('Delete failed: ' + e.message); }
  }

  async deleteProduct(productId: string) {
    if (!confirm('Soft-delete this product?')) return;
    try {
      await this.fb.softDeleteProduct(productId);
      await this.loadAllData();
    } catch (e: any) { alert('Delete failed: ' + e.message); }
  }

  async signOut() {
    await signOut(getAuth());
    window.location.href = '/index.html';
  }

  formatPrice(v: any) {
    return '$' + Number(v).toFixed(2);
  }
}