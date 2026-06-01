import { Injectable } from '@angular/core';

// Firebase modular SDK
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, setDoc, Firestore } from 'firebase/firestore/lite';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, User, updatePassword } from 'firebase/auth';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  app: FirebaseApp | null = null;
  db: Firestore | null = null;
  auth: any = null;

  constructor() {
    try {
      if (environment.firebase && environment.firebase.apiKey) {
        this.app = initializeApp(environment.firebase);
        this.db = getFirestore(this.app);
        this.auth = getAuth(this.app);
      }
    } catch (e) {
      console.warn('Firebase init failed', e);
    }
  }

  // AUTH
  async signIn(email: string, password: string) {
    if (!this.auth) throw new Error('Firebase Auth not configured');
    const res = await signInWithEmailAndPassword(this.auth, email, password);
    return res.user;
  }

  async register(email: string, password: string, displayName?: string, extra: any = {}) {
    if (!this.auth) throw new Error('Firebase Auth not configured');
    const res = await createUserWithEmailAndPassword(this.auth, email, password);
    if (displayName) {
      await updateProfile(res.user, { displayName });
    }
    // Create user doc in Firestore
    if (this.db) {
      await addDoc(collection(this.db, 'users'), { uid: res.user.uid, email, name: displayName || '', ...extra, createdAt: new Date().toISOString() });
    }
    return res.user;
  }

  async signOutUser() {
    if (!this.auth) return;
    await signOut(this.auth);
  }

  onAuthState(callback: (user: any) => void) {
    if (!this.auth) return () => {};
    return onAuthStateChanged(this.auth, callback);
  }

  getCurrentUser(): User | null {
    if (!this.auth) return null;
    return this.auth.currentUser;
  }

  async updatePassword(newPassword: string) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('No authenticated user');
    return updatePassword(user, newPassword);
  }

  async updateProfileData(updates: { displayName?: string; phone?: string; avatar?: string }) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('No authenticated user');
    if (updates.displayName) await updateProfile(user, { displayName: updates.displayName });
    // write back to Firestore user doc (best-effort)
    if (this.db) {
      // find a matching user document by uid
      const col = collection(this.db, 'users');
      const snap = await getDocs(col);
      let foundId: string | null = null;
      snap.forEach(d => { const data: any = d.data(); if (data.uid === user.uid) foundId = d.id; });
      if (foundId) {
        await setDoc(doc(this.db, 'users', foundId), { name: updates.displayName || '', phone: updates.phone || '', avatar: updates.avatar || '' }, { merge: true } as any);
      }
    }
    return { success: true };
  }

  // Firestore helpers
  async listUsers() {
    if (!this.db) throw new Error('Firestore not configured');
    const col = collection(this.db, 'users');
    const snap = await getDocs(col);
    const out: any[] = [];
    snap.forEach(d => out.push({ id: d.id, ...d.data() }));
    return out;
  }

  async createUserDoc(data: any) {
    if (!this.db) throw new Error('Firestore not configured');
    return addDoc(collection(this.db, 'users'), data);
  }

  async getUserByUid(uid: string) {
    if (!this.db) return null;
    const col = collection(this.db, 'users');
    const snap = await getDocs(col);
    let found: any = null;
    snap.forEach(d => { const data: any = d.data(); if (data.uid === uid) found = { id: d.id, ...data }; });
    return found;
  }

  async deleteUserDoc(docId: string) {
    if (!this.db) throw new Error('Firestore not configured');
    const { deleteDoc } = await import('firebase/firestore/lite');
    await deleteDoc(doc(this.db, 'users', docId));
  }

  async listProducts() {
    if (!this.db) return [];
    try {
      const col = collection(this.db, 'products');
      const snap = await getDocs(col);
      const out: any[] = [];
      snap.forEach(d => out.push({ id: d.id, ...d.data() }));
      return out;
    } catch { return []; }
  }

  async listOrders() {
    if (!this.db) return [];
    try {
      const col = collection(this.db, 'orders');
      const snap = await getDocs(col);
      const out: any[] = [];
      snap.forEach(d => out.push({ id: d.id, ...d.data() }));
      return out;
    } catch { return []; }
  }

  async softDeleteProduct(productId: string) {
    if (!this.db) return;
    await setDoc(doc(this.db, 'products', productId), { deleted: true }, { merge: true } as any);
  }
}
