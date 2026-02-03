# Salon E-Commerce Platform - Project Overview

This document provides a comprehensive summary of the current state of the Salon E-Commerce backend, including implemented APIs, technology stack, and development progress.

---

## 🚀 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens) & Bcryptjs
- **Payment Gateway**: Razorpay
- **Environment Management**: Dotenv
- **Dev Tools**: Nodemon for automatic restarts

---

## 🛠️ API Endpoints Summary

All APIs are versioned under `/api/v1`.

### 1. Authentication (`/auth`)
| Endpoint | Method | Description | Status |
| :--- | :--- | :--- | :--- |
| `/register` | POST | Register a new User (Customer, Agent, or Admin) | ✅ Implemented |
| `/login` | POST | Login and receive JWT token | ✅ Implemented |
| `/me` | GET | Get current authenticated user details | ✅ Implemented |

### 2. Products (`/products`)
| Endpoint | Method | Description | Status |
| :--- | :--- | :--- | :--- |
| `/` | GET | List all active products (can filter by category) | ✅ Implemented |
| `/` | POST | Create a new product (Admin Only) | ✅ Implemented |
| `/:id` | PATCH | Update product details (Admin Only) | ✅ Implemented |
| `/:id` | DELETE | Delete/Deactivate product (Admin Only) | ⏳ Planned |

### 3. Shopping Cart (`/cart`)
| Endpoint | Method | Description | Status |
| :--- | :--- | :--- | :--- |
| `/` | GET | Get current user's cart | ✅ Implemented |
| `/add` | POST | Add product to cart | ✅ Implemented |
| `/:productId` | PATCH | Update quantity in cart | ✅ Implemented |
| `/:productId` | DELETE | Remove item from cart | ✅ Implemented |
| `/` | DELETE | Clear entire cart | ✅ Implemented |
| `/total` | GET | Get cart total price | ✅ Implemented |

### 4. Orders (`/orders`)
| Endpoint | Method | Description | Status |
| :--- | :--- | :--- | :--- |
| `/` | POST | Place a new order | ✅ Implemented |
| `/me` | GET | List orders for the logged-in user | ✅ Implemented |
| `/` | GET | List all orders (Admin Only) | ✅ Implemented |
| `/:id/status` | PATCH | Update order status (Admin Only) | ✅ Implemented |

### 5. Payments (`/payments` - Razorpay)
| Endpoint | Method | Description | Status |
| :--- | :--- | :--- | :--- |
| `/create-order` | POST | Create a Razorpay order id | ✅ Implemented |
| `/verify` | POST | Verify final payment signature | ✅ Implemented |

### 6. Commissions (`/commissions`)
| Endpoint | Method | Description | Status |
| :--- | :--- | :--- | :--- |
| `/me` | GET | List commissions for the logged-in Agent | ✅ Implemented |
| `/` | GET | List all commissions (Admin Only) | ✅ Implemented |

---

## 📈 Development Progress

### ✅ Completed
1. **Core Architecture**: Base Express server with environment config.
2. **Database Integration**: MongoDB connection and Mongoose models for Users, Products, Orders, Carts, and Commissions.
3. **Authentication Layer**: JWT-based auth with Role-Based Access Control (RBAC).
4. **Product Management**: CRUD functionality for products.
5. **Cart System**: Fully functional item-based cart.
6. **Order Processing**: Order creation and status tracking.
7. **Payment Integration**: Razorpay API setup and signature verification.
8. **Referral/Commission System**: Logic for agents to earn commissions on referred orders.

### ⏳ In Progress / Upcoming
1. **Enhanced Filtering**: Better search and categorization for products.
2. **Email Notifications**: Sending order confirmation and status updates.
3. **Admin Dashboard**: Frontend interface for managing the platform.
4. **User Profile Management**: Allowing users to update their details and addresses.

---

## 🏃 How to Run the Project

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup Environment**:
   - Create a `.env` file based on `.env.example`.
   - Add your `MONGODB_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET`.
3. **Start Development Server**:
   ```bash
   npm run dev
   ```
4. **Access API**:
   - Base URL: `http://localhost:5000/api/v1`
