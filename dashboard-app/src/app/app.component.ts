import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from './firebase.service';
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

  constructor(private fb: FirebaseService, private router: Router) {}

  async ngOnInit() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (fireUser) => {
      if (fireUser) {
        this.currentUser = fireUser;
        // Check if user is admin
        const userDoc = await this.fb.getUserByUid(fireUser.uid);
        if (userDoc?.role === 'admin' || userDoc?.userType === 'admin') {
          this.isAdmin = true;
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

  async loadAllData() {
    try {
      this.users = await this.fb.listUsers();
      this.metrics.users = this.users.length;
      this.metrics.sellers = this.users.filter((u: any) => u.role === 'seller' || u.userType === 'seller').length;
      this.metrics.buyers = this.users.filter((u: any) => u.role === 'buyer' || u.userType === 'buyer').length;
      
      // Load products
      this.products = await this.fb.listProducts();
      this.metrics.products = this.products.length;
      
      // Load orders
      this.orders = await this.fb.listOrders();
      this.metrics.orders = this.orders.length;
      this.metrics.revenue = this.orders
        .filter((o: any) => o.status === 'completed')
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    } catch (e) {
      console.warn('Load failed', e);
    }
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