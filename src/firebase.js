// ====================================
// HEXSTORE - FIREBASE MODULE
// Real Firebase Auth + Firestore integration
// ====================================

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  setDoc, 
  query, 
  where, 
  getDoc 
} from 'firebase/firestore/lite';

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyACtpVKGa85P3c62th7u3GJpmk88Fk7tWM",
  authDomain: "hexstore-8d6b2.firebaseapp.com",
  projectId: "hexstore-8d6b2",
  storageBucket: "hexstore-8d6b2.firebasestorage.app",
  messagingSenderId: "968717146641",
  appId: "1:968717146641:web:44ebf1bb1bc2453f5eafb0",
  measurementId: "G-HEFK09SM1C"
};

// Admin default credentials (changeable after first login)
export const ADMIN_DEFAULTS = {
  code: 'hx2984293a239',
  password: 'password',
  email: 'admin@hexstore.io',
  name: 'HexStore Admin'
};

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

// ====================================
// AUTH FUNCTIONS
// ====================================

/**
 * Sign in with email & password
 */
export async function signInUser(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Register a new user and create Firestore document
 */
export async function registerUserFirebase(email, password, userData) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;

  // Update display name
  if (userData.username || userData.fullName) {
    await updateProfile(user, { 
      displayName: userData.fullName || userData.username 
    });
  }

  // Create user document in Firestore
  const userDoc = {
    uid: user.uid,
    email: email,
    username: userData.username || '',
    fullName: userData.fullName || userData.username || '',
    userType: userData.userType || 'buyer',
    provider: 'email',
    createdAt: new Date().toISOString(),
    avatar: userData.avatar || null,
    phone: userData.phone || '',
    verified: false,
    settings: {
      notifications: true,
      newsletter: false,
      twoFactor: false
    }
  };

  await addDoc(collection(db, 'users'), userDoc);

  return { user, userDoc };
}

/**
 * Get the current authenticated user
 */
export function getCurrentFirebaseUser() {
  return auth.currentUser;
}

/**
 * Listen for auth state changes
 */
export function onFirebaseAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Sign out
 */
export async function signOutFirebaseUser() {
  await signOut(auth);
}

/**
 * Get user document from Firestore by UID
 */
export async function getUserDoc(uid) {
  const q = query(collection(db, 'users'), where('uid', '==', uid));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

/**
 * Get all users from Firestore
 */
export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'));
  const out = [];
  snap.forEach(d => out.push({ id: d.id, ...d.data() }));
  return out;
}

/**
 * Update user document
 */
export async function updateUserDoc(uid, updates) {
  const q = query(collection(db, 'users'), where('uid', '==', uid));
  const snap = await getDocs(q);
  if (!snap.empty) {
    await setDoc(doc(db, 'users', snap.docs[0].id), updates, { merge: true });
  }
}

/**
 * Get all products from Firestore
 */
export async function getAllProducts() {
  try {
    const snap = await getDocs(collection(db, 'products'));
    const out = [];
    snap.forEach(d => out.push({ id: d.id, ...d.data() }));
    return out;
  } catch {
    return [];
  }
}

/**
 * Get all orders from Firestore
 */
export async function getAllOrders() {
  try {
    const snap = await getDocs(collection(db, 'orders'));
    const out = [];
    snap.forEach(d => out.push({ id: d.id, ...d.data() }));
    return out;
  } catch {
    return [];
  }
}

/**
 * Add a product to Firestore
 */
export async function addProduct(productData) {
  return addDoc(collection(db, 'products'), {
    ...productData,
    createdAt: new Date().toISOString()
  });
}

/**
 * Update a product
 */
export async function updateProduct(productId, updates) {
  await setDoc(doc(db, 'products', productId), updates, { merge: true });
}

/**
 * Delete a product
 */
export async function deleteProduct(productId) {
  await setDoc(doc(db, 'products', productId), { deleted: true }, { merge: true });
}

/**
 * Initialize default seed data (John Doe seller)
 */
export async function seedDefaultUser() {
  // Check if admin user exists
  const adminQ = query(collection(db, 'users'), where('email', '==', ADMIN_DEFAULTS.email));
  const adminSnap = await getDocs(adminQ);
  
  if (adminSnap.empty) {
    try {
      const adminResult = await createUserWithEmailAndPassword(auth, ADMIN_DEFAULTS.email, ADMIN_DEFAULTS.password);
      await updateProfile(adminResult.user, { displayName: ADMIN_DEFAULTS.name });
      await addDoc(collection(db, 'users'), {
        uid: adminResult.user.uid,
        email: ADMIN_DEFAULTS.email,
        username: 'hexadmin',
        fullName: ADMIN_DEFAULTS.name,
        userType: 'admin',
        role: 'admin',
        provider: 'email',
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      if (e.code !== 'auth/email-already-in-use') throw e;
    }
  }

  // Check if John Doe exists
  const johnQ = query(collection(db, 'users'), where('email', '==', 'john.doe@email.io'));
  const johnSnap = await getDocs(johnQ);
  
  if (johnSnap.empty) {
    try {
      const johnResult = await createUserWithEmailAndPassword(auth, 'john.doe@email.io', 'TestPass123!');
      await updateProfile(johnResult.user, { displayName: 'John Doe' });
      await addDoc(collection(db, 'users'), {
        uid: johnResult.user.uid,
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
      console.log('Default test user created: John Doe (Seller)');
    } catch (e) {
      if (e.code !== 'auth/email-already-in-use') throw e;
    }
  }
}