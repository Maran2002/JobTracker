# ApplyLog — Premium Job Tracking Platform

> 🚧 **This project is currently under active development.**

---

## What We're Building

**ApplyLog** is a premium job application tracking platform designed for serious job seekers. It gives you a centralised, beautiful workspace to manage every stage of your job search — from the first application to the final offer.

### Core Features

- 📊 **Dashboard** — Live overview of total applications, interviews, offers, and rejections with trend indicators and an activity chart.
- 📋 **Applications** — Full list view of job pursuits. Features status-based filtering and a velocity chart.
- ➕ **Add Application** — A rich, **multi-step wizard** to log job details including company brand colors, job URLs, salary, currency, priority, and recruiter contact info.
- 🔀 **Pipeline** — Interactive **Kanban board** with native drag-and-drop. Move applications between 5 stages (Applied → Screening → Interview → Offer → Rejected) with instant API persistence.
- 📅 **Schedule** — Interview timeline with upcoming interviews, prep tips, and automated scheduling reminders.
- 📈 **Analytics** — Data-driven insights including conversion funnels, monthly volume charts, and job-type distributions.
- ⚙️ **Settings** — Profile management, sleek **Light/Dark mode** toggles, and notification controls.

---

## Tech Stack (MERN)

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite 6 |
| **Backend** | Node.js + Express |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (JSON Web Tokens) |
| **State** | Zustand 5 (with cross-tab persistence) |
| **Styling** | Tailwind CSS 4 + custom CSS-in-JS tokens |
| **UI Library** | HeroUI 3 + Lucide Icons |
| **Toast** | Vibe-Toast |

---

## Project Status

| Module | Status |
|---|---|
| Dashboard | ✅ Complete |
| Applications list | ✅ Complete |
| **Add Application Form (Multi-step)** | ✅ Complete |
| **Pipeline Kanban (Drag-and-Drop)** | ✅ Complete |
| Schedule / Interview Timeline | ✅ Complete |
| Analytics | ✅ Complete |
| **Backend API Integration** | ✅ Complete |
| **JWT Authentication** | ✅ Complete |
| Light / Dark theme system | ✅ Complete |
| Mobile responsiveness | 🚧 Planned |
| Calendar view | 🚧 Planned |
| TypeScript migration | 🚧 Planned |

---

## Getting Started

### 1. Prerequisite
Ensure you have a MongoDB instance running (Local or MongoDB Atlas).

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Create .env file
# PORT=5000
# MONGO_URI=your_mongodb_uri
# JWT_SECRET=your_secret

# Install & Run
npm install
npm dev
```

### 3. Frontend Setup
```bash
# Navigate to root
cd ..

# Install & Run
npm install
npm run dev
```

The app runs at **http://localhost:5173**.

---

## Folder Structure

```
├── backend/           # Express Server + MongoDB Models
│   ├── models/        # Application, Interview, User schemas
│   ├── routes/        # API Endpoints
│   └── server.js      # Entry point
├── src/
│   ├── api/           # Axios gateway & interceptors
│   ├── store/         # Zustand stores (Auth, Theme)
│   ├── layouts/       # App shell & Navigation
│   ├── components/    # Reusable UI (Sidebar, Header)
│   └── pages/
│       ├── auth/      # Login, Register
│       ├── Pipeline.jsx
│       ├── AddApplication.jsx
│       └── ...
```

---

> Built with ❤️ · © 2026 ApplyLog
