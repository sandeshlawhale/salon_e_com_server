# Salon E-Commerce API Documentation

Base URL: `http://localhost:5000/api/v1`

## Authentication

### 1. Register User
**Endpoint:** `POST /auth/register`

**Body (JSON) - Customer:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "role": "CUSTOMER"
}
```

**Body (JSON) - Agent:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "0987654321",
  "role": "AGENT",
  "agentProfile": {
      "referralCode": "JANE10",
      "bankDetails": {
          "bankName": "Bank of America",
          "accountNumber": "123456789"
      }
  }
}
```

**Response:**
```json
{
    "_id": "65b...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "token": "eyJhbGcV..."
}
```

### 2. Register Admin (Dev Only)
**Endpoint:** `POST /auth/register`
**Body (JSON):**
```json
{
  "firstName": "Super",
  "lastName": "Admin",
  "email": "admin@salon.com",
  "password": "password123",
  "role": "ADMIN"
}
```
*Note: In production, this route should be protected or disabled.*

### 3. Login
**Endpoint:** `POST /auth/login`

**Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as Register (User object + Token).

### 3. Get Current User
**Endpoint:** `GET /auth/me`
**Headers:** `Authorization: Bearer <your_token>`

---

## Products

### 1. List Products
**Endpoint:** `GET /products`
**Query Params (Optional):**
*   `category=Hair`
*   `status=ACTIVE`

### 2. Create Product (Admin Only)
**Endpoint:** `POST /products`
**Headers:** `Authorization: Bearer <admin_token>`

**Body (JSON):**
```json
{
  "name": "Luxury Shampoo",
  "slug": "luxury-shampoo",
  "description": "Best shampoo ever",
  "price": 25.00,
  "category": "Hair Care",
  "status": "ACTIVE",
  "inventoryCount": 100
}
```

### 3. Update Product (Admin Only)
**Endpoint:** `PATCH /products/:id`
**Headers:** `Authorization: Bearer <admin_token>`
**Body:** JSON object with fields to update.

---

## Orders

### 1. Create Order
**Endpoint:** `POST /orders`
**Headers:** `Authorization: Bearer <user_token>`

**Body (JSON):**
```json
{
  "items": [
    {
      "productId": "65b...", 
      "quantity": 2
    }
  ],
  "referralCode": "JANE10", 
  "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001"
  }
}
```
*Note: `referralCode` is optional. If valid, commissions are tracked.*

### 2. Get My Orders
**Endpoint:** `GET /orders/me`
**Headers:** `Authorization: Bearer <user_token>`

### 3. Get All Orders (Admin Only)
**Endpoint:** `GET /orders`
**Headers:** `Authorization: Bearer <admin_token>`

### 4. Update Order Status (Admin Only)
**Endpoint:** `PATCH /orders/:id/status`
**Headers:** `Authorization: Bearer <admin_token>`

**Body (JSON):**
```json
{
  "status": "SHIPPED"
}
```
*Note: Setting status to `COMPLETED` or `DELIVERED` triggers commission calculation if an agent was involved.*

---

## Commissions

### 1. Get My Commissions (Agent Only)
**Endpoint:** `GET /commissions/me`
**Headers:** `Authorization: Bearer <agent_token>`

### 2. Get All Commissions (Admin Only)
**Endpoint:** `GET /commissions`
**Headers:** `Authorization: Bearer <admin_token>`
