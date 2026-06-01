# HexStore Backend API

Express.js backend with Firebase Admin SDK for the HexStore admin dashboard.

## Setup Instructions

### 1. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project **hexstore-8d6b2**
3. Go to **Project Settings** (gear icon)
4. Click **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the JSON file as `backend/serviceAccountKey.json`

### 2. Start the Backend

```bash
cd backend
npm start
```

The server will run on `http://localhost:3000`.

### 3. Seed the Database

```bash
# Via API (with API key)
curl -X POST http://localhost:3000/api/system/seed -H "X-API-Key: hexstore-admin-secret-2024"

# Or use the Seed Data button in the admin dashboard System tab
```

### 4. Access the Admin Dashboard

- **Backend-served**: `http://localhost:3000/dashboard-app/`
- **Direct access**: Open `access/db/only-hexadmin/admin/dev/main/access.html`

## API Endpoints

### Authentication
All protected endpoints require a Firebase ID token in the `Authorization: Bearer <token>` header.

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/system/health` | Firebase health check |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| PATCH | `/api/users/:id/role` | Change user role |
| DELETE | `/api/users/:id` | Delete user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Soft-delete product |
| POST | `/api/products/:id/restore` | Restore deleted product |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders |
| GET | `/api/orders/:id` | Get order by ID |
| POST | `/api/orders` | Create order |
| PATCH | `/api/orders/:id/status` | Update order status |
| DELETE | `/api/orders/:id` | Delete order |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview` | Full platform analytics |
| GET | `/api/analytics/revenue` | Revenue analytics |
| GET | `/api/analytics/users` | User analytics |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/system/collections` | List Firestore collections |
| GET | `/api/system/project` | Firebase project info |
| GET | `/api/system/processes` | Server process info |
| POST | `/api/system/seed` | Seed database (API key required) |

## Architecture

```
Backend (Express.js + Firebase Admin SDK)
├── config/firebase.js      # Firebase Admin SDK initialization
├── middleware/auth.js       # Authentication & authorization
├── routes/
│   ├── users.js            # User CRUD API
│   ├── products.js         # Product CRUD API
│   ├── orders.js           # Order CRUD API
│   ├── analytics.js        # Analytics & metrics
│   └── system.js           # System management
└── server.js               # Main entry point
```

## How It Works

1. **Firebase Auth** handles user authentication (client-side)
2. **Firebase Admin SDK** provides server-side Firestore access
3. **Express.js** exposes REST API endpoints
4. **Angular Dashboard** consumes the API for admin management
5. **Data flows both ways**: Dashboard → API → Firestore (and vice versa)

The admin can manage users, products, orders, and view analytics without needing direct Firebase Console access.