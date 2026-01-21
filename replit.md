# Merchant Statement Report

AI-powered merchant bank statement analysis platform for Today Capital Group.

## Overview
This is a full-stack application with:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS (port 5000)
- **Backend**: Express + TypeScript (port 3001)
- **Database**: SQLite (better-sqlite3)

## Project Structure
```
├── frontend/          # React frontend
│   ├── src/           # Source files
│   └── vite.config.ts # Vite configuration
├── backend/           # Express backend
│   └── src/           # Source files
└── package.json       # Root package with workspaces
```

## Development
- Run `npm run dev` to start both frontend and backend concurrently
- Frontend runs on http://0.0.0.0:5000
- Backend API runs on http://localhost:3001
- API requests from frontend are proxied to backend via `/api/*`

## Deployment
- Build: `npm run build` (builds both frontend and backend)
- Start: `npm run start` (runs backend which serves static frontend in production)
