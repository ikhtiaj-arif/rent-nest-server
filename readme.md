ERD_URL=https://drawsql.app/teams/ikhtiaj-arif/diagrams/rent-nest

# RentNest 🏠

### Find & List Rental Properties with Ease

RentNest is a backend REST API for a rental property marketplace. Landlords list and manage properties, tenants browse listings and submit rental requests, and admins moderate the platform. The full rental lifecycle — request, approval, payment, and review — is enforced through a defined status workflow.

---

## 🔗 Live Links

| Resource                        | Link                                                  |
| ------------------------------- | ----------------------------------------------------- |
| **Live API**                    | `https://<your-app>.vercel.app`                       |
| **API Documentation (Postman)** | `https://documenter.getpostman.com/view/<your-id>`    |
| **Demo Video**                  | `https://drive.google.com/file/d/<your-id>/view`      |
| **GitHub Repository**           | `https://github.com/<your-username>/rentnest-backend` |

---

## 🔑 Admin Credentials

```
Email:    admin@rentnest.com
Password: <set-a-real-password-here>
```

> ⚠️ These are seeded credentials for evaluation purposes only. Change them before any real deployment.

---

## 🛠️ Tech Stack

| Layer          | Technology          |
| -------------- | ------------------- |
| Runtime        | Node.js             |
| Framework      | Express             |
| Language       | TypeScript          |
| Database       | PostgreSQL          |
| ORM            | Prisma              |
| Authentication | JWT                 |
| Payments       | Stripe / SSLCommerz |
| Deployment     | Vercel / Render     |

---

## 👥 Roles & Permissions

| Role         | Description                         | Key Permissions                                                                           |
| ------------ | ----------------------------------- | ----------------------------------------------------------------------------------------- |
| **Tenant**   | Users looking for rental properties | Browse listings, submit rental requests, make payments, leave reviews, manage own profile |
| **Landlord** | Property owners listing rentals     | Create/manage own listings, approve/reject rental requests, view tenant history           |
| **Admin**    | Platform moderator                  | Manage all users (ban/unban), oversee all listings & requests, manage categories          |

Role is selected at registration and cannot be changed afterward.

---

## 🔄 Rental Request Lifecycle

```
PENDING → APPROVED → PAYMENT → ACTIVE → COMPLETED
        ↘ REJECTED
```

- A rental request starts as **PENDING** when a tenant submits it.
- The landlord who owns the property **approves** or **rejects** it.
- Once **APPROVED**, the tenant can pay via Stripe or SSLCommerz.
- A successful payment moves the request to **ACTIVE**, and eventually **COMPLETED**.
- Reviews can only be submitted after a request reaches **COMPLETED**.

---

## 📦 Business logic
Property Listed
        │
        ▼
Tenant submits rental request
        │
        ▼
Status = PENDING
        │
        ▼
Landlord reviews request
        │
 ┌──────┴─────────┐
 │                │
Reject         Approve
 │                │
 ▼                ▼
REJECTED      APPROVED
                    │
          Tenant makes payment
                    │
      ┌─────────────┴──────────────┐
      │                            │
Payment Failed              Payment Successful
      │                            │
      ▼                            ▼
Still APPROVED             ACTIVE RENTAL
                             Property unavailable



## 📦 Project Structure

```
generated/
prisma/
├── migrations
├── schema
src/
├── config/           # Environment & third-party client setup (DB, JWT, payment provider)
├── middleware/       # Auth, role guards, validation, error handling
├── modules/
│   ├── auth/
│   ├── properties/
│   ├── categories/
│   ├── rentals/
│   ├── payments/
│   ├── reviews/
│   └── admin/
├── utils/            # Shared helpers (ApiError, response formatter, etc.)
│   ├── catchAsync.ts
│   └── jwt.ts
│   └── sendResponse.ts
└── app.ts
└── server.ts
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL database (local or hosted)
- Stripe or SSLCommerz sandbox account and API keys

### 1. Clone the repository

```bash
git clone https://github.com/ikhtiaj-arif/rent-nest-server.git

```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable                    | Description                               |
| --------------------------- | ----------------------------------------- |
| `DATABASE_URL`              | PostgreSQL connection string              |
| `JWT_SECRET`                | Secret used to sign JWTs                  |
| `JWT_EXPIRES_IN`            | Token expiry (e.g. `7d`)                  |
| `PORT`                      | Port the server runs on                   |
| `STRIPE_SECRET_KEY`         | Stripe secret key (if using Stripe)       |
| `STRIPE_WEBHOOK_SECRET`     | Stripe webhook signing secret             |
| `SSLCOMMERZ_STORE_ID`       | SSLCommerz store ID (if using SSLCommerz) |
| `SSLCOMMERZ_STORE_PASSWORD` | SSLCommerz store password                 |

### 4. Run database migrations

```bash
npx prisma migrate deploy
```

### 5. Seed the database

```bash
npx prisma db seed
```

This creates:

- 1 admin account
- 2 landlord accounts with sample properties
- 2 tenant accounts
- Sample categories
- One full rental lifecycle (request → approved → paid → completed → reviewed)

### 6. Start the server

```bash
npm run dev
```

The API will be available at `http://localhost:<PORT>`.

---

## 📖 API Documentation

Full endpoint documentation, including request/response examples and required roles, is available in the Postman collection linked above. Below is a high-level summary.

### Auth

| Method | Endpoint             | Access        |
| ------ | -------------------- | ------------- |
| POST   | `/api/auth/register` | Public        |
| POST   | `/api/auth/login`    | Public        |
| GET    | `/api/auth/me`       | Authenticated |

### Properties

| Method | Endpoint                       | Access           |
| ------ | ------------------------------ | ---------------- |
| GET    | `/api/properties`              | Public           |
| GET    | `/api/properties/:id`          | Public           |
| GET    | `/api/categories`              | Public           |
| POST   | `/api/landlord/properties`     | Landlord         |
| PUT    | `/api/landlord/properties/:id` | Landlord (owner) |
| DELETE | `/api/landlord/properties/:id` | Landlord (owner) |

### Rental Requests

| Method | Endpoint                     | Access                   |
| ------ | ---------------------------- | ------------------------ |
| POST   | `/api/rentals`               | Tenant                   |
| GET    | `/api/rentals`               | Authenticated            |
| GET    | `/api/rentals/:id`           | Owner / Landlord / Admin |
| GET    | `/api/landlord/requests`     | Landlord                 |
| PATCH  | `/api/landlord/requests/:id` | Landlord (owner)         |

### Payments

| Method | Endpoint                | Access             |
| ------ | ----------------------- | ------------------ |
| POST   | `/api/payments/create`  | Tenant             |
| POST   | `/api/payments/confirm` | Webhook / Callback |
| GET    | `/api/payments`         | Authenticated      |
| GET    | `/api/payments/:id`     | Owner / Admin      |

### Reviews

| Method | Endpoint                      | Access |
| ------ | ----------------------------- | ------ |
| POST   | `/api/reviews`                | Tenant |
| GET    | `/api/properties/:id/reviews` | Public |

### Admin

| Method | Endpoint                | Access |
| ------ | ----------------------- | ------ |
| GET    | `/api/admin/users`      | Admin  |
| PATCH  | `/api/admin/users/:id`  | Admin  |
| GET    | `/api/admin/properties` | Admin  |
| GET    | `/api/admin/rentals`    | Admin  |

---

## 🧪 Testing the API

Import the Postman collection linked above, or use Thunder Client / cURL. A suggested manual test flow:

1. Register a tenant and a landlord
2. Log in as landlord → create a property
3. Log in as tenant → submit a rental request
4. Log in as landlord → approve the request
5. Log in as tenant → create and confirm a payment
6. Log in as tenant → leave a review
7. Log in as admin → view all users and ban the tenant to confirm access is revoked

---

## 🎥 Demo Video

The demo video (linked above) covers:

- Project overview and API architecture
- All three roles demonstrated via Postman
- CRUD operations on key endpoints
- Error handling and validation in action
- A brief walkthrough of one technical challenge solved during development

---

## 📄 License

This project was built as part of a backend development assignment and is intended for evaluation purposes.
