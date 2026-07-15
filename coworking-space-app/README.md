# FlexoSpace — Smart Co-Working Space Management

A full-stack MERN application (MongoDB, Express, React, Node.js) for discovering, comparing, and
booking co-working spaces in real time — built from the project requirements for *Smart Co-Working
Space Management Using Real-Time Monitoring*.

## Features

- **Role-based auth** — Users, Space Owners, and Admins with JWT-secured sessions.
- **Smart search & matching** — Filter by team size, budget, city, workspace type, and amenities;
  each result gets a live match-score based on the searcher's criteria.
- **Workspace listings** — Area size, seating capacity, workspace type, pricing, amenities, and
  real-time availability status (available / limited / fully booked).
- **Booking & inquiry system** — Users send booking requests and direct inquiries; owners
  confirm/reject bookings and reply to inquiries. Availability updates automatically on confirmation.
- **Owner dashboard** — Manage listings (create/edit/delete), review bookings, respond to inquiries.
- **Admin dashboard** — Platform KPIs (registered users, booking completion rate, conversion rate),
  user management (activate/deactivate), and workspace moderation (publish/unpublish).

## Tech stack

| Layer          | Technology                          |
|----------------|--------------------------------------|
| Frontend       | React 18, Vite, React Router, Tailwind CSS, lucide-react |
| Backend        | Node.js, Express                     |
| Database       | SQLite (via Sequelize ORM) — a single local file, no server to install or run |
| Auth           | JWT + bcrypt password hashing        |

## Project structure

```
coworking-space-app/
├── backend/
│   ├── config/database.js   # Sequelize connection to the SQLite file
│   ├── config/db.js          # Connect + sync helper used by server.js
│   ├── models/                # User, Workspace, Booking, Inquiry (Sequelize)
│   ├── data/                  # coworking.sqlite lives here (auto-created, git-ignored)
│   ├── middleware/auth.js
│   ├── controllers/
│   ├── routes/
│   ├── seed.js                # Demo data loader
│   └── server.js
└── frontend/
    └── src/
        ├── api/axios.js
        ├── context/AuthContext.jsx
        ├── components/
        └── pages/
```

## Getting started

### Prerequisites
- Node.js 18+

That's it — no database server to install. SQLite stores everything in a single file at
`backend/data/coworking.sqlite`, created automatically the first time you run the app.

### 1. Backend setup

```bash
cd backend
cp .env.example .env     # defaults work out of the box; only JWT_SECRET is worth customizing
npm install
npm run seed               # creates backend/data/coworking.sqlite with demo users & workspaces
npm run dev                 # starts the API on http://localhost:5000
```

Demo accounts created by `npm run seed`:

| Role         | Email                     | Password  |
|--------------|----------------------------|-----------|
| Admin        | admin@flexospace.com       | admin123  |
| Space owner  | owner1@flexospace.com      | owner123  |
| Space owner  | owner2@flexospace.com      | owner123  |
| User         | user1@flexospace.com       | user123   |

If you ever want a clean slate, just re-run `npm run seed` — it wipes and rebuilds the
database file from scratch. (Running the server itself with `npm run dev` never touches
existing data, only `npm run seed` resets it.)

### 2. Frontend setup

```bash
cd frontend
cp .env.example .env       # points to the backend API, defaults to localhost:5000
npm install
npm run dev                 # starts the app on http://localhost:5173
```

Open `http://localhost:5173` in your browser. Register a new account or use one of the demo logins
above.

### 3. Build for production

```bash
cd frontend
npm run build     # outputs static files to frontend/dist, deploy to Vercel/Netlify/S3 etc.
```

Deploy the backend (e.g. to Render, Railway, or an EC2 instance) and point `VITE_API_URL` in the
frontend's `.env` to that deployed API URL before building.

> **Note on hosting the backend:** some platforms (e.g. Render's free tier) use an ephemeral
> filesystem, meaning the SQLite file can be wiped on redeploy. For anything beyond local
> development or a demo, either mount a persistent disk for `backend/data/`, or point `DB_STORAGE`
> at a path on persistent storage. If you outgrow SQLite entirely, Sequelize also supports
> PostgreSQL/MySQL with only a config change in `backend/config/database.js`.

## API overview

| Method | Endpoint                          | Access               | Description                          |
|--------|------------------------------------|-----------------------|--------------------------------------|
| POST   | `/api/auth/register`               | Public                | Create an account                    |
| POST   | `/api/auth/login`                  | Public                | Log in                               |
| GET    | `/api/auth/me`                     | Authenticated         | Get current profile                  |
| PUT    | `/api/auth/me`                     | Authenticated         | Update profile / matching preferences|
| GET    | `/api/workspaces`                  | Public                | Search & filter workspaces           |
| GET    | `/api/workspaces/:id`              | Public                | Workspace details                    |
| POST   | `/api/workspaces`                  | Space owner           | Create a listing                     |
| PUT    | `/api/workspaces/:id`               | Owner / Admin          | Edit a listing                       |
| DELETE | `/api/workspaces/:id`               | Owner / Admin          | Delete a listing                     |
| GET    | `/api/workspaces/mine/list`         | Space owner            | List your own workspaces             |
| POST   | `/api/bookings`                    | User                   | Request a booking                    |
| GET    | `/api/bookings/mine`                | User                   | Your bookings                        |
| GET    | `/api/bookings/owner`               | Space owner            | Bookings on your listings            |
| PUT    | `/api/bookings/:id/status`          | Owner / Admin          | Confirm / reject / complete a booking|
| PUT    | `/api/bookings/:id/cancel`          | User                   | Cancel your own booking              |
| POST   | `/api/inquiries`                   | User                   | Send an inquiry to a space owner     |
| GET    | `/api/inquiries/mine`               | User                   | Your inquiries                       |
| GET    | `/api/inquiries/owner`              | Space owner            | Inquiries on your listings           |
| PUT    | `/api/inquiries/:id/respond`         | Owner / Admin          | Reply to an inquiry                  |
| GET    | `/api/admin/stats`                  | Admin                  | Platform KPIs                        |
| GET    | `/api/admin/users`                   | Admin                  | List all users                       |
| PUT    | `/api/admin/users/:id/toggle-active` | Admin                  | Activate/deactivate a user           |
| GET    | `/api/admin/workspaces`              | Admin                  | List all workspaces                  |
| PUT    | `/api/admin/workspaces/:id/toggle-active` | Admin             | Publish/unpublish a listing          |

## Notes on scope

This build covers the Phase 1 web platform functional requirements: registration & role-based
access, workspace listings, smart search & matching, amenities, booking & inquiry flows, dashboards,
and admin monitoring. Out-of-scope items from the requirements doc (native mobile apps, AI-driven
pricing, offline bookings, ERP integrations, long-term lease management) are not implemented, in
line with the original scope definition.
