# 🐝 BuzzBasket - Smart Grocery Platform

A full-stack multi-vendor grocery shopping platform with User, Vendor, and Admin roles.

## Tech Stack
- **Frontend:** React 19 + Tailwind CSS 4 + Vite
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **Charts:** Recharts

## Features

### 👤 User
- Signup/Login (JWT-based)
- Browse & search products by category
- Cart management (add/update/remove)
- Place orders with order tracking
- Spending dashboard (weekly/total)
- Budget-friendly alternatives
- Wishlist, Ratings
- Dark mode support

### 🏪 Vendor
- Vendor signup & registration
- Dashboard with stats & charts
- Product management (CRUD)
- Order management (Accept/Reject/Pack/Ship/Deliver)
- **Competition Engine** - compare prices with competitors
- Pricing insights & optimization suggestions
- Discount management

### 👑 Admin
- Platform analytics dashboard
- User management
- Vendor approval/rejection/suspension
- Product oversight & removal
- Order management
- Revenue charts & status breakdowns

## Setup & Run

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run seed   # Seeds demo data
npm run dev    # Starts on port 5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev    # Starts on port 5173
```

### Demo Accounts
| Role    | Email                    | Password   |
|---------|--------------------------|------------|
| Admin   | admin@buzzbasket.com     | admin123   |
| User    | demo@buzzbasket.com      | demo123    |
| Vendor  | vendor@buzzbasket.com    | vendor123  |

## API Endpoints

| Route               | Description                    |
|----------------------|--------------------------------|
| `/api/auth`          | Authentication (register/login) |
| `/api/products`      | Product browsing & search       |
| `/api/cart`           | Cart management                 |
| `/api/orders`         | Order placement & history       |
| `/api/vendors`        | Vendor dashboard & management   |
| `/api/admin`          | Admin platform control          |
| `/api/pricing-insights` | Competition engine            |
| `/api/notifications`  | User notifications              |

## Folder Structure
```
BuzzBasket/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Auth, Product, Cart, Order, Vendor, Admin, Pricing, Notification
│   ├── data/           # Seed data & seeder script
│   ├── middleware/      # JWT auth + role-based authorization
│   ├── models/         # User, Product, Order, Cart, Vendor, Review, Notification
│   ├── routes/         # REST API routes
│   └── server.js       # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Navbar, Footer, ProductCard, Sidebar, ProtectedRoute, Loader
│   │   ├── context/    # AuthContext, CartContext, ThemeContext
│   │   ├── pages/      # Home, Products, ProductDetail, Cart, Login, Dashboard, VendorDashboard, AdminPanel
│   │   └── services/   # Axios API service
│   └── vite.config.js
└── README.md
```
