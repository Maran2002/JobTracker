# CareerTrack — Premium Job Tracking Platform

> 🚧 **This project is currently under active development.**

---

## What We're Building

**CareerTrack** is a premium job application tracking platform designed for serious job seekers. It gives you a centralised, beautiful workspace to manage every stage of your job search — from the first application to the final offer.

### Core Features

- 📊 **Dashboard** — Live overview of total applications, interviews, offers, and rejections with trend indicators and an activity chart.
- 📋 **Applications** — Full list view of all job applications with company details, salary ranges, date applied, and status badges (Interviewing / Applied / Offer / Rejected / Screening).
- 🔀 **Pipeline** — Kanban-style board with 5 stages (Applied → Screening → Interview → Offer → Rejected) for visual pipeline management.
- 📅 **Schedule** — Interview timeline with upcoming interviews, date/time/location details, and a daily preparation tip.
- 📈 **Analytics** — Monthly application bar chart, status distribution donut chart, conversion funnel, and applications-by-role breakdown.
- ⚙️ **Settings** — Profile management, light/dark theme toggle, notification preferences, and account controls.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 6 |
| Routing | React Router v7 |
| State | Zustand 5 (persisted to localStorage) |
| Styling | Tailwind CSS 4 + custom CSS variables |
| UI Library | HeroUI 3 (CSS tokens) |
| Icons | Lucide React |
| Charts | Custom SVG (no external chart library) |
| HTTP | Axios (ready, not yet wired to backend) |

---

## Project Status

| Module | Status |
|---|---|
| Login & Register pages | ✅ Complete (demo auth — no backend) |
| Dashboard | ✅ Complete |
| Applications list | ✅ Complete |
| Pipeline Kanban | ✅ Complete (static — DnD not yet added) |
| Schedule / Interview Timeline | ✅ Complete |
| Analytics | ✅ Complete |
| Settings + Theme Toggle | ✅ Complete |
| Light / Dark theme system | ✅ Complete |
| Mobile responsiveness | ✅ Complete (sidebar overlay on ≤ 900px) |
| Real API integration | 🚧 Planned |
| Drag-and-drop Pipeline | 🚧 Planned |
| Calendar view (Schedule) | 🚧 Planned |
| Unit / E2E tests | 🚧 Planned |
| TypeScript migration | 🚧 Planned |

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

The app runs at **http://localhost:5173** (or next available port).  
Use **any email + any password** on the login screen — no backend required for the demo.

---

## Folder Structure

```
src/
├── store/         # Zustand stores (auth, theme)
├── routes/        # AuthGuard (protected route wrapper)
├── layouts/       # MainLayout (sidebar + header + footer shell)
├── components/    # Sidebar, Header, Footer
└── pages/
    ├── auth/      # Login, Register
    ├── Dashboard.jsx
    ├── Applications.jsx
    ├── Pipeline.jsx
    ├── Schedule.jsx
    ├── Analytics.jsx
    └── Settings.jsx
```

For a full technical reference, see [`CodebaseReference.md`](./CodebaseReference.md).

---

> Built with ❤️ · © 2026 CareerTrack
