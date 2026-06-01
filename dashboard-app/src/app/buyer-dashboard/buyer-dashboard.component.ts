import { Component, OnInit } from '@angular/core';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore/lite';

@Component({
  selector: 'app-buyer-dashboard',
  templateUrl: './buyer-dashboard.component.html',
  styleUrls: ['./buyer-dashboard.component.css']
})
export class BuyerDashboardComponent implements OnInit {
  user: any = null;
  userDoc: any = null;
  selectedTab: 'orders' | 'wishlist' | 'settings' = 'orders';
  
  // Orders
  orders: any[] = [];
  
  // Wishlist
  favorites: any[] = [];

  constructor() {}

  async ngOnInit() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (fireUser) => {
      if (fireUser) {
        this.user = fireUser;
        await this.loadUserData();
        await this.loadOrders();
      } else {
        window.location.href = '/login.html';
      }
    });
  }

  async loadUserData() {
    try {
      const q = query(collection(getFirestore(), 'users'), where('uid', '==', this.user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        this.userDoc = { id: snap.docs[0].id, ...snap.docs[0].data() };
      }
    } catch (e) { console.warn('Load user failed', e); }
  }

  async loadOrders() {
    try {
      const snap = await getDocs(collection(getFirestore(), 'orders'));
      this.orders = [];
      snap.forEach(d => {
        const data: any = d.data();
        if (data.buyerId === this.user?.uid) {
          this.orders.push({ id: d.id, ...data });
        }
      });
    } catch { this.orders = []; }
  }

  async signOut() {
    await signOut(getAuth());
    window.location.href = '/index.html';
  }

  formatPrice(v: any) {
    return '$' + Number(v).toFixed(2);
  }

  getInitials(name: string) {
    if (!name) return '?';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substr(0, 2);
  }
}