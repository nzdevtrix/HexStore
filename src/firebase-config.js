// ====================================
// HEXSTORE - FIREBASE CONFIGURATION
// Shared across main site and dashboard
// ====================================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyACtpVKGa85P3c62th7u3GJpmk88Fk7tWM",
  authDomain: "hexstore-8d6b2.firebaseapp.com",
  projectId: "hexstore-8d6b2",
  storageBucket: "hexstore-8d6b2.firebasestorage.app",
  messagingSenderId: "968717146641",
  appId: "1:968717146641:web:44ebf1bb1bc2453f5eafb0",
  measurementId: "G-HEFK09SM1C"
};

// Admin credentials (hardcoded for dev, admin can change after login)
const ADMIN_CREDENTIALS = {
  code: "hx2984293a239",
  password: "password",
  email: "admin@hexstore.io",
  name: "HexStore Admin"
};

// Initialize Firebase (if not already initialized)
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;

function initHexFirebase() {
  if (firebaseApp) return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    // Dynamic import of firebase modules
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
      import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
      import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
      import { getFirestore, collection, getDocs, addDoc, doc, setDoc, query, where, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

      window.__HEX_FIREBASE = {
        app: null,
        auth: null,
        db: null,
        initialize: (config) => {
          if (window.__HEX_FIREBASE.app) return;
          window.__HEX_FIREBASE.app = initializeApp(config);
          window.__HEX_FIREBASE.auth = getAuth(window.__HEX_FIREBASE.app);
          window.__HEX_FIREBASE.db = getFirestore(window.__HEX_FIREBASE.app);
        }
      };
      window.__HEX_FIREBASE.initialize(${JSON.stringify(FIREBASE_CONFIG)});
      window.__HEX_FIREBASE_INIT = true;
    `;
    document.body.appendChild(script);
    
    // Wait for initialization
    const check = setInterval(() => {
      if (window.__HEX_FIREBASE_INIT && window.__HEX_FIREBASE?.auth) {
        clearInterval(check);
        resolve();
      }
    }, 50);
    setTimeout(() => { clearInterval(check); reject(new Error('Firebase init timeout')); }, 10000);
  });
}

// Export for use in auth.js
window.__HEX_FIREBASE_CONFIG = FIREBASE_CONFIG;
window.__HEX_ADMIN_CREDENTIALS = ADMIN_CREDENTIALS;
window.initHexFirebase = initHexFirebase;