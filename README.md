# 📦 SomoyExpress Courier Service API 🚚

A secure, modular, and role-based backend API for a parcel delivery system inspired by services like Pathao Courier and Sundarban Courier.

## 📋 Project Overview

SomoyExpress Courier Service API provides a complete backend solution for _Parcel delivery management_ with three distinct user roles (admin, super_admin, sender, receiver). It includes authentication, authorization, parcel management, status tracking, and payment integration.

## ✨ Features

### 🔐 Authentication & Authorization

- JWT-based authentication system
- Role-based access control (admin, sender, receiver)
- Secure password hashing with bcrypt
- Protected routes with middleware validation

### 👤 User Management

- User registration with role specification
- Profile management for all users
- Admin user management (view, block, unblock users)

### 📦 Parcel Management

- Create parcel delivery requests with automatic tracking ID generation
- Comprehensive status tracking with embedded history logs
- Parcel cancellation (with business rule validation)
- Delivery confirmation system
- Public parcel tracking via tracking ID

### 🎯 Role-Specific Features

**Senders Can:**

- Create new parcel delivery requests
- View their parcel history and status
- Cancel parcels (if not yet dispatched)

**Receivers Can:**

- View incoming parcels
- Confirm delivery of parcels
- Access delivery history

**Admins Can:**

- Manage all users and parcels
- Update parcel status throughout delivery lifecycle
- Block/unblock users or parcels
- Access comprehensive system analytics

## 🛠️ Tech Stack

| Category     | Tools                                   |
| ------------ | --------------------------------------- |
| ⚙️ Runtime   | Node.js                                 |
| 🔧 Framework | Express.js                              |
| 🧠 Language  | TypeScript                              |
| 🛢️ Database  | MongoDB + Mongoose                      |
| 🛡️ Security  | JWT, bcrypt, CORS                       |
| 📦 Utilities | Zod (validation), cookie-parser, dotenv |

## 📁 Project Structure

```
src/
├── modules/
│   ├── auth/          # Authentication controllers and routes
│   ├── user/          # User management
│   ├── parcel/        # Parcel management with status tracking
├── middlewares/       # Custom middleware (auth, validation)
├── config/            # Database and app configuration
├── utils/             # Helper functions and utilities
├── routes/            # All collection starting route created in this file
├── types/             # TypeScript type definitions
└── app.ts             # Main application file
```

## 🌐 API Endpoints

### Authentication Endpoints

| Method | Endpoint               | Description         | Access        |
| ------ | ---------------------- | ------------------- | ------------- |
| POST   | /api/v1/users/register | Register a new user | Public        |
| POST   | /api/v1/auth/login     | User login          | Public        |
| POST   | /api/v1/auth/logout    | User logout         | Authenticated |

### User Endpoints

| Method | Endpoint                  | Description                 | Access                     |
| ------ | ------------------------- | --------------------------- | -------------------------- |
| GET    | /api/v1/users/me          | Get current user profile    | Authenticated              |
| PATCH  | /api/v1/users/me          | Update current user profile | Authenticated              |
| GET    | /api/v1/users             | Get all users               | Admin and super_admin only |
| GET    | /api/v1/users/:id         | Get user by ID              | Admin and super_admin only |
| PATCH  | /api/v1/users/:id         | Update user                 | Admin and super_admin only |
| PATCH  | /api/v1/users/:id/block   | Block a user                | Admin and super_admin only |
| PATCH  | /api/v1/users/:id/unblock | Unblock a user              | Admin and super_admin only |

### Parcel Endpoints

| Method | Endpoint                          | Description          | Access                         |
| ------ | --------------------------------- | -------------------- | ------------------------------ |
| POST   | /api/v1/parcels                   | Create a new parcel  | Sender only                    |
| GET    | /api/v1/parcels/my-parcels        | Get user's parcels   | Sender/Receiver                |
| GET    | /api/v1/parcels/:id               | Get parcel details   | Owner or Admin                 |
| PATCH  | /api/v1/parcels/:id/cancel        | Cancel a parcel      | Sender or Admin or Super Admin |
| PATCH  | /api/v1/parcels/:id/confirm       | Confirm delivery     | Receiver only                  |
| PATCH  | /api/v1/parcels/:id/status        | Update parcel status | Admin and super_admin only     |
| GET    | /api/v1/parcels/track/:trackingId | Track a parcel       | Receiver or Admin              |

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

Clone the repository:

```bash
git clone https://github.com/najrulislam38/SomoyXpress-Courier
cd SomoyXpress-Courier
```

Install dependencies:

```bash
npm install
```

Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

Start the development server:

```bash
npm run dev
```

## 📊 Database Models

### User Model

- name, email, password (hashed), role, phone, address, isBlocked

### Parcel Model

- trackingId, sender, receiver, pickupAddress, deliveryAddress
- weight, price, description, currentStatus, statusLogs (embedded)
- isBlocked, expectedDeliveryDate, actualDeliveryDate

## 🔄 Parcel Status Flow

The parcel delivery follows this status progression:

```
REQUESTED → APPROVED → DISPATCH → IN_TRANSIT → DELIVERED → CONFIRMED
```

Additional statuses: `CANCELLED, RETURNED`

## 🧪 Testing the API

You can test the API using tools like Postman, Thunder Client, or curl.

### User Registration:

```bash
curl -X POST http://localhost:5000/api/users/register   -H "Content-Type: application/json"   -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123#",

    "phone": "01777777777",
    "role": "SENDER"
  }'
```

### Create Parcel:

```bash
curl -X POST http://localhost:5000/api/parcels   -H "Content-Type: application/json"   -H "Authorization: Bearer <JWT_TOKEN>"   -d '{
    "receiverEmail": "receiver@gmail.com",
    "pickupAddress": "123 Sender St, City",
    "deliveryAddress": "456 Receiver Rd, City",
    "weight": 2.5,
    "amountCollect": 0,
    "description": "Fragile items"
  }'
```

> Note: Thank You for read this overview and features. This is a backend API only. You'll need a frontend client (web/mobile) to fully utilize the system.
