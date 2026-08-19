# 🎥 GearRental API

<p align="center">
  A secure, scalable, and production-ready REST API for an Outdoor & Camera Equipment Rental Platform.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-5.x-000000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-success" />
</p>

---

## 📖 Overview

GearRental API is a backend service that powers an online equipment rental platform where customers can rent outdoor and camera equipment, providers can manage inventory, and administrators can oversee the entire system.

The application follows a modular architecture with secure authentication, role-based authorization, payment processing, inventory management, and verified customer reviews.

---

# 📑 Table of Contents

- Features
- Tech Stack
- System Architecture
- Getting Started
- Environment Variables
- Database Setup
- Available Scripts
- API Modules
- User Roles
- Folder Structure
- Security
- API Response Example
- Deployment
- Future Improvements
- Author
- License

---

# ✨ Features

## 🔐 Authentication & Authorization

- JWT Authentication
- Secure password hashing
- Role-Based Access Control (RBAC)
- Protected API routes
- Refresh token support (if implemented)

Supported Roles:

- CUSTOMER
- PROVIDER
- ADMIN

---

## 🎒 Gear Management

Providers can:

- Create gear listings
- Update gear information
- Delete gear
- Manage equipment inventory
- Track available stock

---

## 📦 Rental Management

Customers can:

- Rent multiple equipment items
- View rental history
- Track rental status

The system automatically:

- Calculates rental cost
- Reserves stock
- Restores stock after cancellation or return
- Prevents overselling

---

## 💳 Payment Processing

Integrated with Stripe Checkout.

Features include:

- Secure Checkout Session
- Stripe Webhooks
- Automatic payment confirmation
- Order status synchronization
- Payment history

---

## ⭐ Review System

Only verified renters can submit reviews.

Features:

- Verified purchase validation
- Ratings
- Reviews
- Average rating calculation
- Total review aggregation

---

## 🛡 Validation & Error Handling

- Zod Validation
- Global Error Handler
- Request Validation
- Authentication Middleware
- Authorization Middleware

---

# 🛠 Tech Stack

| Category | Technology |
|-----------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma ORM |
| Authentication | JWT |
| Validation | Zod |
| Payment | Stripe |
| API Style | REST |

---

# 🏗 System Architecture

```text
                 Client Application
                        │
                        ▼
               Express REST API
                        │
      ┌─────────────────┼─────────────────┐
      │                 │                 │
      ▼                 ▼                 ▼
 Authentication   Business Logic   Validation
      │                 │                 │
      └─────────────────┼─────────────────┘
                        ▼
                  Prisma ORM
                        │
                        ▼
                  PostgreSQL
```

---

# 🚀 Getting Started

## Prerequisites

Before running the project, install:

- Node.js (v18 or later)
- PostgreSQL
- npm / pnpm / yarn

---

## Clone Repository

```bash
git clone https://github.com/your-username/gear-rental-api.git

cd gear-rental-api
```

---

## Install Dependencies

```bash
npm install
```

---

# ⚙ Environment Variables

Create a `.env` file.

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gear_rental_db?schema=public"

# Authentication
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="7d"

# Stripe
STRIPE_SECRET_KEY="sk_test_xxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxx"

# Client URLs
CLIENT_URL=http://localhost:3000
CLIENT_SUCCESS_URL=http://localhost:3000/payment/success
CLIENT_CANCEL_URL=http://localhost:3000/payment/cancel

# Seed Admin
SEED_ADMIN_NAME="Admin"
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="your-secure-password"
```

---

# 🗄 Database Setup

Generate Prisma Client.

```bash
npx prisma generate
```

Run migrations.

```bash
npx prisma migrate dev
```

(Optional)

Seed the database.

```bash
npm run seed
```

---

# ▶ Running the Project

Development

```bash
npm run dev
```

Production

```bash
npm run build

npm start
```

---

# 📜 Available Scripts

| Script | Description |
|----------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Compile TypeScript |
| `npm start` | Start production server |
| `npm run seed` | Seed database *(optional)* |
| `prisma generate` | Generate Prisma Client |
| `prisma migrate dev` | Run migrations |

---

# 📚 API Modules

Instead of documenting every endpoint here, the API is organized into the following modules:

| Module | Description |
|---------|-------------|
| Authentication | User registration & login |
| Users | User management |
| Gear | Equipment management |
| Rentals | Rental workflow |
| Payments | Stripe Checkout & Webhooks |
| Reviews | Equipment reviews |

---

# 👤 User Roles

| Role | Permissions |
|------|-------------|
| CUSTOMER | Rent equipment, make payments, leave reviews |
| PROVIDER | Manage gear and rental orders |
| ADMIN | Full platform management |

---

# 📂 Folder Structure

```text
src
│
├── app
│   ├── config
│   ├── middleware
│   ├── modules
│   │   ├── auth
│   │   ├── user
│   │   ├── gear
│   │   ├── rental
│   │   ├── payment
│   │   └── review
│   ├── routes
│   ├── utils
│   └── errors
│
├── prisma
│
├── app.ts
└── server.ts
```

---

# 🔒 Security

The API includes multiple layers of security:

- JWT Authentication
- Password Hashing
- Role-Based Authorization
- Zod Validation
- Stripe Webhook Signature Verification
- Protected Routes
- Global Error Handling

---

# 📦 Example API Response

```json
{
  "success": true,
  "message": "Rental created successfully.",
  "data": {
    "id": "clr93ba2e0000mjoq1m8m0x8",
    "status": "PENDING",
    "totalPrice": 2400
  }
}
```

---

# 🚀 Deployment

This project can be deployed on:

- Vercel
- Render
- Railway

Deployment checklist:

- Configure all environment variables
- Set the production database URL
- Generate Prisma Client during build
- Configure Stripe Webhook endpoint
- Apply database migrations

---

# 🛣 Future Improvements

- Equipment Wishlist
- Rental Extension Requests
- Email Notifications
- Provider Analytics
- Admin Dashboard Analytics
- Equipment Availability Calendar
- Search & Filtering Enhancements

---

# 👩‍💻 Author

**Sanjida Akter Rimi**

- 💼 LinkedIn: https://linkedin.com/in/your-profile
- 🌐 Portfolio: https://your-portfolio.com
- 📂 GitHub: https://github.com/your-username

---

# 📄 License

This project is licensed under the **MIT License**.

Feel free to use, modify, and distribute it under the terms of the license.