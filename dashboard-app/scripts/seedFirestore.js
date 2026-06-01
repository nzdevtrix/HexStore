/*
  Seed Firestore with initial data using Firebase Admin SDK.

  Usage:
    - Create a Firebase project and enable Firestore
    - Generate a service account JSON from Firebase Console > Project Settings > Service accounts
    - Set env var: GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json
    - npm install firebase-admin
    - node scripts/seedFirestore.js
*/

const admin = require('firebase-admin');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('ERROR: Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path');
  process.exit(1);
}

admin.initializeApp();
const db = admin.firestore();

async function seed() {
  const users = [
    { role: 'seller', name: 'Alice Seller', email: 'alice.seller@example.com', phone: '+15551230001', avatar: '', createdAt: admin.firestore.FieldValue.serverTimestamp() },
    { role: 'buyer', name: 'Bob Buyer', email: 'bob.buyer@example.com', phone: '+15551230002', avatar: '', createdAt: admin.firestore.FieldValue.serverTimestamp() },
    { role: 'seller', name: 'Carol Merchant', email: 'carol.merchant@example.com', phone: '+15551230003', avatar: '', createdAt: admin.firestore.FieldValue.serverTimestamp() }
  ];

  const products = [
    { title: 'Wireless Headphones', price: 79.99, category: 'electronics' },
    { title: 'Mechanical Keyboard', price: 129.0, category: 'electronics' }
  ];

  console.log('Seeding users...');
  for (const u of users) {
    await db.collection('users').add(u);
  }

  console.log('Seeding products...');
  for (const p of products) {
    await db.collection('products').add(p);
  }

  console.log('Done seeding.');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
