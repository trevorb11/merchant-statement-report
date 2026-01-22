# Merchant Statement Report

AI-powered merchant bank statement analysis platform for Today Capital Group.

## Overview
This is a full-stack application with:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS (port 5000)
- **Backend**: Express + TypeScript (port 3001)
- **Database**: SQLite (better-sqlite3)
- **AI**: Anthropic Claude for financial analysis

## Project Structure
```
├── frontend/          # React frontend
│   ├── src/           # Source files
│   │   ├── hooks/     # Custom hooks (useTheme)
│   │   ├── main.tsx   # Entry point with ThemeProvider
│   │   └── App.tsx    # Main app components
│   └── vite.config.ts # Vite configuration
├── backend/           # Express backend
│   └── src/           # Source files
└── package.json       # Root package with workspaces
```

## Recent Changes (Jan 2026)
- Added light/dark theme support with useTheme hook
- Redesigned report UI with business-friendly language
- Improved layout: "Your Business at a Glance" summary cards
- Theme toggle button in report header (Sun/Moon icons)
- Enhanced landing page for business owner appeal:
  - Trust badges (Bank-Level Security, No Sales Calls, 100% Free)
  - Social proof stats section (businesses analyzed, funding secured)
  - Sample insights preview showing funding potential and health score
  - "How It Works" 3-step section
  - Testimonials from business owners
  - Security section with encryption details
  - Clear time estimate ("Takes less than 2 minutes")

## Development
- Run `npm run dev` to start both frontend and backend concurrently
- Frontend runs on http://0.0.0.0:5000
- Backend API runs on http://localhost:3001
- API requests from frontend are proxied to backend via `/api/*`

## Deployment
- Build: `npm run build` (builds both frontend and backend)
- Start: `npm run start` (runs backend which serves static frontend in production)
