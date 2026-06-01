# HexStore Dashboard (Angular)

This folder contains a lightweight Angular dashboard skeleton for HexStore.

Overview:
- Simple Angular app scaffolded for a dashboard UI.
- Integrates Firebase (client SDK) to connect to Firestore and Auth.
- Includes a `scripts/seedFirestore.js` file to seed initial data using the Firebase Admin SDK (requires a service account).

Quick start (after providing your Firebase config and service account):

1. Install dependencies

```bash
cd dashboard-app
npm install
```

2. Provide Firebase config in `src/environments/environment.ts`.

3. Run dev server

```bash
npm run start
```

4. To seed Firestore (requires service account JSON):

```bash
# set env var pointing to your service account key JSON
set GOOGLE_APPLICATION_CREDENTIALS=path\\to\\serviceAccount.json
npm run seed
```

Notes:
- You must create a Firebase project and enable Firestore before seeding.
- Replace environment placeholders with your Firebase project's config.
