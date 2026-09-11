# 🛒 Buykart Supermart & Logistics Ecosystem

[![Live Demo](https://img.shields.io/badge/Live_Demo-buykart--supermart.vercel.app-brightgreen?style=for-the-badge&logo=vercel)](https://buykart-supermart.vercel.app)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-5.x-black?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase_Firestore-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_CDN-3448C5?style=for-the-badge&logo=cloudinary)](https://cloudinary.com/)

> **🌐 Live Application URL:** [https://buykart-supermart.vercel.app](https://buykart-supermart.vercel.app)

**Buykart** is an end-to-end, full-stack e-commerce supermarket and hyper-local delivery management platform. It integrates a customer storefront, a real-time back-office operations and inventory management panel, and a dedicated logistics delivery rider portal (**OnTime**).

---

## 📌 Architecture Overview

The system is organized into three synchronized portals powered by a unified API:

```
                            ┌─────────────────────────────────────────┐
                            │        Buykart Unified Platform         │
                            │   https://buykart-supermart.vercel.app   │
                            └────────────────────┬────────────────────┘
                                                 │
         ┌───────────────────────────────────────┼───────────────────────────────────────┐
         │                                       │                                       │
         ▼                                       ▼                                       ▼
┌──────────────────┐                   ┌──────────────────┐                   ┌──────────────────┐
│ Buykart Store    │                   │ Admin & Inventory│                   │  OnTime Rider    │
│ (Customer B2C)   │                   │ Management Panel │                   │  Delivery Portal │
│ - Catalog & Cart │                   │ - Real-time Stats│                   │ - Task Queue     │
│ - OTP Auth       │                   │ - Inventory CRUD │                   │ - Order Pickup   │
│ - Order Tracking │                   │ - Inward Purchases│                   │ - Delivery Status│
│ - Customer Accts │                   │ - Order Dispatch │                   │ - Route Details  │
└────────┬─────────┘                   └────────┬─────────┘                   └────────┬─────────┘
         │                                      │                                      │
         └──────────────────────────────────────┼──────────────────────────────────────┘
                                                │
                                                ▼
                            ┌─────────────────────────────────────────┐
                            │    Node.js / Express 5.x REST API       │
                            │    JWT Auth • Input Validation • Multer │
                            └────────────────────┬────────────────────┘
                                                 │
                                 ┌───────────────┴───────────────┐
                                 ▼                               ▼
                      ┌──────────────────────┐       ┌──────────────────────┐
                      │  Firebase Firestore  │       │    Cloudinary CDN    │
                      │  (Cloud Realtime DB) │       │   (Optimized Media)  │
                      └──────────────────────┘       └──────────────────────┘
```

---

## 🛠️ Tech Stack

### 🎨 Frontend
* **Core Library:** React 19 (`react`, `react-dom`)
* **Build Tool & Dev Server:** Vite 8 (`@vitejs/plugin-react`)
* **Routing:** React Router DOM v7 (`react-router-dom`)
* **Styling & Design System:** Tailwind CSS v4 (`@tailwindcss/vite`, `@tailwindcss/cli`, `tailwindcss`)
* **Icons:** Lucide React (`lucide-react`)
* **Data Visualization & Analytics:** Chart.js (`chart.js`), React-Chartjs-2 (`react-chartjs-2`)
* **HTTP Client:** Axios (`axios`) with request/response interceptors for role-based token authentication
* **State Management:** React Context API (`AuthContext`, `CartContext`, `ToastProvider`)

### ⚙️ Backend
* **Runtime Environment:** Node.js (v18.0.0+)
* **Application Framework:** Express.js v5 (`express`)
* **Authentication & Authorization:** JSON Web Tokens (`jsonwebtoken`), Password Encryption (`bcryptjs`)
* **Security & Network:** CORS (`cors`), Security Headers (XSS protection, Frame-Options, Content-Type Options)
* **File Upload Processing:** Multer (`multer`) with memory storage buffers
* **Input Validation:** Custom declarative validation middleware (`validator.js`)
* **Environment Configuration:** Dotenv (`dotenv`)

### ☁️ Database & Cloud Services
* **Primary Database:** Google Firebase Cloud Firestore (`firebase-admin`)
  * Includes an in-memory Firestore fallback engine for local development resilience
* **Media & Image Storage:** Cloudinary Cloud SDK (`cloudinary`) with dynamic streaming upload
* **Third-Party APIs:** Google APIs (`googleapis`)
* **Deployment & Hosting:** Vercel (`vercel.json` SPA configuration)

---

## ✨ Key Features

### 1. 🛍️ Buykart Supermart (Customer Storefront)
* **Live Product Catalog:** Explore grocery items, fresh produce, beverages, and daily essentials with real-time stock levels.
* **Instant Search & Filter:** Filter items by category, price, or search keyword dynamically.
* **Flexible Unit Ordering:** Supports multiple units (e.g., Kgs, Pcs) with dynamic price and quantity calculations.
* **Smart Shopping Cart:**
  * Persistent cart state saved across browser sessions.
  * Real-time item additions, deletions, and quantity increments.
  * Instant subtotal, delivery fees, and discount computation.
* **OTP-Based Authentication:** Passwordless customer login and profile verification via mobile OTP.
* **Customer Profile Management:** Update personal info, delivery address, and contact preferences.
* **One-Click Checkout:** Easy address selection, delivery notes, and instant order placement.
* **Real-time Order Tracking:** Check live order progress through each fulfillment stage (`Pending` ➔ `Accepted` ➔ `Preparing` ➔ `Assigned` ➔ `Out for Delivery` ➔ `Delivered`).
* **Support & Contact Desk:** Dedicated inquiry submission form.

---

### 2. 📊 Operations & Inventory Management (Admin Panel)
* **Admin Authentication:** Secure role-based staff authentication with encrypted tokens and protected routes.
* **Real-time Analytics Dashboard:**
  * Total revenue metrics, active order count, total products, and inventory valuation.
  * Interactive Chart.js sales trends, stock distribution, and fulfillment rate diagrams.
  * Low-stock and out-of-stock warning badges.
* **Complete Inventory CRUD:**
  * Create, view, modify, and delete inventory items.
  * Image upload with automatic processing and Cloudinary CDN hosting.
  * Stock threshold management and pricing controls.
* **Stock Inward / Purchase Entry (`/admin/purchase-entry`):**
  * Log supplier inward purchases and replenishment batches.
  * Automatically increments product stock balances.
  * Historical purchase audit log.
* **Order Fulfillment Workflow (`/admin/orders`):**
  * Manage orders through multi-step lifecycle transitions.
  * Pack orders and verify line items.
  * Assign orders to available delivery riders.
  * Dispatch orders for immediate delivery.
* **Rider Roster Management (`/admin/riders`):**
  * Register new fleet riders with contact details and vehicle information.
  * Toggle active/inactive duty status.
* **Customer Roster Management (`/admin/users`):**
  * Inspect customer profiles, registered phone numbers, and purchasing histories.

---

### 3. 🛵 OnTime Delivery Rider Portal (`/ontime`)
* **Mobile-First Rider Interface:** Optimized for delivery agents operating on mobile devices.
* **Rider Authentication:** Secure mobile and credential-based rider authentication.
* **Live Delivery Queue:** View assigned orders requiring pickup and delivery.
* **Trip & Address Details:** One-touch access to customer address, phone number, and delivery notes.
* **Status Updates on the Go:** Update delivery states in real-time (`Mark as Picked Up`, `Out for Delivery`, `Delivered`).
* **Instant Admin Sync:** Status changes propagate immediately to customer order tracking and admin management screens.

---

## 📂 Project Directory Structure

```plaintext
Buykart/
├── credentials.json             # Firebase service account credentials (local)
├── index.html                   # HTML entry point for Vite SPA
├── package.json                 # Project dependencies and script definitions
├── vercel.json                  # Vercel deployment and routing rules
├── vite.config.mjs              # Vite build and plugin configurations
├── public/                      # Static assets and media files
└── src/
    ├── api/                     # Backend Express APIs & Services
    │   ├── admin/               # Admin controllers, routes & validators
    │   ├── website/             # Customer storefront controllers & routes
    │   ├── ontime/              # Rider logistics controllers & routes
    │   ├── middleware/          # JWT auth & request validation middleware
    │   ├── utils/               # Cloudinary upload helpers
    │   ├── config.js            # Environment & Firebase credentials loader
    │   ├── firebase.js          # Firestore initialization & fallback engine
    │   ├── index.js             # Route aggregator (/website, /admin, /ontime)
    │   └── routes.js            # Base API router
    ├── client/                  # Frontend React 19 Application
    │   ├── components/          # Reusable UI components, Modals, Navbars, Footers
    │   ├── context/             # AuthContext, CartContext, ToastContext
    │   ├── pages/
    │   │   ├── website/         # Home, Cart, MyOrders, Account, About, Contact
    │   │   ├── admin/           # Dashboard, Inventory, PurchaseEntry, Orders, Riders, Users, Login
    │   │   └── ontime/          # RiderLogin, RiderDashboard
    │   ├── App.jsx              # Application router & route layout wrappers
    │   ├── index.css            # Tailwind CSS 4 directives and styles
    │   └── main.jsx             # React DOM root render
    └── server.js                # Express application entry point
```

---

## 🚦 Getting Started Locally

### 1. Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher
* **Firebase Project** (Firestore Database)
* **Cloudinary Account** (for media hosting)

### 2. Clone the Repository
```bash
git clone https://github.com/muraliofficial/Buykart.git
cd Buykart
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# JWT Secret
JWT_SECRET=your-secure-jwt-secret
```
*(Alternatively, place `credentials.json` from the Firebase Console in the root folder).*

### 5. Start Development Servers
Run both client and backend servers concurrently:
```bash
npm run dev
```
* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:3000`

---

## 🌐 Deployment

The web application is deployed and hosted on **Vercel**:
* **Production URL:** [https://buykart-supermart.vercel.app](https://buykart-supermart.vercel.app)
* Built using `npm run build` (`vite build`)
* Rewrites routed dynamically to `/index.html` for single-page client routing.
