# Merchant Statement Report

AI-powered bank statement analysis platform for Today Capital Group. This application allows business owners to upload their bank statements and receive instant, comprehensive financial analysis with funding recommendations.

## Features

- **PDF & Image Upload**: Support for bank statement PDFs and images (JPG, PNG, etc.)
- **AI-Powered Analysis**: Claude AI extracts and analyzes financial data including:
  - Revenue patterns and growth trends
  - Expense categorization
  - Cash flow health scoring
  - Debt obligation detection (MCA positions, loans)
  - Red flag identification (overdrafts, NSF fees)
- **Fundability Assessment**: Get a score (0-100) with funding capacity estimates
- **Interactive Reports**: Beautiful, responsive reports with multiple views:
  - Executive Summary
  - Cash Flow Analysis
  - Expense Breakdown
  - Actionable Insights
  - Funding Recommendations
- **User Accounts**: Merchants can create accounts to:
  - Save and track statements over time
  - View historical reports
  - Add new statements to update their analysis
- **Quick Analysis Mode**: Try the tool without creating an account

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite (via better-sqlite3)
- **AI**: Claude API (Anthropic)
- **Auth**: JWT-based authentication with bcrypt

## Project Structure

```
merchant-statement-report/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express server entry point
│   │   ├── middleware/
│   │   │   └── auth.ts       # JWT authentication middleware
│   │   ├── models/
│   │   │   └── database.ts   # SQLite database setup & queries
│   │   ├── routes/
│   │   │   ├── auth.ts       # User registration/login
│   │   │   ├── statements.ts # File upload & analysis
│   │   │   └── reports.ts    # Report management
│   │   └── services/
│   │       └── claudeService.ts # Claude AI integration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Main app with all views
│   │   ├── api/
│   │   │   └── client.ts     # API client
│   │   ├── hooks/
│   │   │   └── useAuth.tsx   # Auth context & hook
│   │   └── types/
│   │       └── index.ts      # TypeScript types
│   └── package.json
└── package.json              # Root workspace config
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/trevorb11/merchant-statement-report.git
cd merchant-statement-report
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your-api-key-here
JWT_SECRET=your-secure-secret-here
```

4. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend API server at http://localhost:3001
- Frontend dev server at http://localhost:5173

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Statements
- `POST /api/statements/upload` - Upload statements (authenticated)
- `GET /api/statements` - List user's statements
- `DELETE /api/statements/:id` - Delete a statement
- `POST /api/statements/analyze` - Analyze stored statements
- `POST /api/statements/quick-analyze` - Analyze without account

### Reports
- `POST /api/reports` - Create report from analysis
- `GET /api/reports` - List user's reports
- `GET /api/reports/latest` - Get latest report
- `GET /api/reports/:id` - Get specific report
- `POST /api/reports/:id/add-statements` - Add statements to report
- `GET /api/reports/history/monthly` - Get monthly history

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 3001 |
| `NODE_ENV` | Environment mode | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |
| `ANTHROPIC_API_KEY` | Claude API key | (required) |
| `JWT_SECRET` | JWT signing secret | (required in production) |

## Security Notes

- API keys are stored server-side only (never exposed to frontend)
- Passwords are hashed with bcrypt
- JWT tokens expire after 7 days
- File uploads are validated (PDF/images only, 20MB limit)
- User data is isolated (users can only access their own data)

## License

MIT
