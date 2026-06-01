import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../firebase.service';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc, doc, setDoc, query, where, orderBy } from 'firebase/firestore/lite';

@Component({
  selector: 'app-seller-dashboard',
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.css']
})
export class SellerDashboardComponent implements OnInit {
  Math = Math;
  user: any = null;
  userDoc: any = null;
  store: any = { name: 'My Store', description: '', rating: 0, totalSales: 0, revenue: 0 };
  
  // Products
  products: any[] = [];
  showAddProduct = false;
  editProduct: any = null;
  productForm: any = { title: '', price: 0, category: 'electronics', brand: '', stock: 0, img: '', description: '' };
  
  // Orders
  orders: any[] = [];
  selectedTab: 'products' | 'orders' | 'analytics' | 'settings' = 'products';

  // Analytics
  analytics = { totalProducts: 0, totalOrders: 0, revenue: 0, avgRating: 0 };

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (fireUser) => {
      if (fireUser) {
        this.user = fireUser;
        await this.loadUserData();
        await this.loadProducts();
        await this.loadOrders();
      } else {
        window.location.href = '/login.html';
      }
    });
  }

  async loadUserData() {
    if (!this.user) return;
    try {
      const q = query(collection(getFirestore(), 'users'), where('uid', '==', this.user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        this.userDoc = { id: snap.docs[0].id, ...snap.docs[0].data() };
        if (this.userDoc.store) {
          this.store = { ...this.store, ...this.userDoc.store };
        }
      }
    } catch (e) { console.warn('Load user failed', e); }
  }

  async loadProducts() {
    try {
      const snap = await getDocs(collection(getFirestore(), 'products'));
      this.products = [];
      snap.forEach(d => {
        const data: any = d.data();
        if (!data.deleted && data.sellerId === this.user?.uid) {
          this.products.push({ id: d.id, ...data });
        }
      });
      this.analytics.totalProducts = this.products.length;
    } catch { this.products = []; }
  }

  async loadOrders() {
    try {
      const snap = await getDocs(collection(getFirestore(), 'orders'));
      this.orders = [];
      snap.forEach(d => {
        const data: any = d.data();
        if (data.sellerId === this.user?.uid) {
          this.orders.push({ id: d.id, ...data });
        }
      });
      this.analytics.totalOrders = this.orders.length;
      this.analytics.revenue = this.orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (o.total || 0), 0);
    } catch { this.orders = []; }
  }

  openAddProduct() {
    this.editProduct = null;
    this.productForm = { title: '', price: 0, category: 'electronics', brand: '', stock: 0, img: '', description: '' };
    this.showAddProduct = true;
  }

  openEditProduct(product: any) {
    this.editProduct = product;
    this.productForm = { 
      title: product.title || '', 
      price: product.price || 0, 
      category: product.category || 'electronics', 
      brand: product.brand || '', 
      stock: product.stock || 0, 
      img: product.img || '', 
      description: product.description || '' 
    };
    this.showAddProduct = true;
  }

  async saveProduct() {
    if (!this.productForm.title || !this.productForm.price) return;
    
    try {
      const db = getFirestore();
      if (this.editProduct) {
        // Update existing
        await setDoc(doc(db, 'products', this.editProduct.id), this.productForm, { merge: true });
      } else {
        // Add new
        await addDoc(collection(db, 'products'), {
          ...this.productForm,
          price: Number(this.productForm.price),
          stock: Number(this.productForm.stock),
          sellerId: this.user.uid,
          sellerName: this.store.name,
          rating: 0,
          reviews: 0,
          createdAt: new Date().toISOString()
        });
      }
      this.showAddProduct = false;
      this.editProduct = null;
      await this.loadProducts();
    } catch (e: any) { alert('Failed to save product: ' + e.message); }
  }

  async deleteProduct(productId: string) {
    if (!confirm('Delete this product?')) return;
    try {
      await setDoc(doc(getFirestore(), 'products', productId), { deleted: true }, { merge: true });
      await this.loadProducts();
    } catch (e: any) { alert('Delete failed: ' + e.message); }
  }

  async updateOrderStatus(orderId: string, status: string) {
    try {
      await setDoc(doc(getFirestore(), 'orders', orderId), { status }, { merge: true });
      await this.loadOrders();
    } catch (e: any) { alert('Update failed: ' + e.message); }
  }

  async saveStore() {
    try {
      const db = getFirestore();
      const q = query(collection(db, 'users'), where('uid', '==', this.user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await setDoc(doc(db, 'users', snap.docs[0].id), { store: this.store }, { merge: true });
        alert('Store settings saved!');
      }
    } catch (e: any) { alert('Save failed: ' + e.message); }
  }

  async signOut() {
    await signOut(getAuth());
    window.location.href = '/index.html';
  }

  formatPrice(v: any) {
    return '$' + Number(v).toFixed(2);
  }

  cancelEdit() {
    this.showAddProduct = false;
    this.editProduct = null;
  }
}