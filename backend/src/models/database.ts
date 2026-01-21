import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'merchant_statements.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  -- Users table for merchant accounts
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    business_name TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Statements table for uploaded bank statements
  CREATE TABLE IF NOT EXISTS statements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Analysis reports table
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    statement_ids TEXT NOT NULL,
    analysis_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Monthly data snapshots for tracking changes over time
  CREATE TABLE IF NOT EXISTS monthly_snapshots (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    report_id TEXT NOT NULL,
    month TEXT NOT NULL,
    month_name TEXT NOT NULL,
    beginning_balance REAL,
    ending_balance REAL,
    total_deposits REAL,
    total_withdrawals REAL,
    negative_days INTEGER DEFAULT 0,
    average_daily_balance REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
  );

  -- Create indexes for faster queries
  CREATE INDEX IF NOT EXISTS idx_statements_user_id ON statements(user_id);
  CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
  CREATE INDEX IF NOT EXISTS idx_monthly_snapshots_user_id ON monthly_snapshots(user_id);
  CREATE INDEX IF NOT EXISTS idx_monthly_snapshots_month ON monthly_snapshots(month);
`);

export default db;

// User functions
export interface User {
  id: string;
  email: string;
  password_hash: string;
  business_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export const createUser = db.prepare(`
  INSERT INTO users (id, email, password_hash, business_name, phone)
  VALUES (?, ?, ?, ?, ?)
`);

export const findUserByEmail = db.prepare<[string], User>(`
  SELECT * FROM users WHERE email = ?
`);

export const findUserById = db.prepare<[string], User>(`
  SELECT * FROM users WHERE id = ?
`);

export const updateUser = db.prepare(`
  UPDATE users SET business_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
`);

// Statement functions
export interface Statement {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export const createStatement = db.prepare(`
  INSERT INTO statements (id, user_id, file_name, file_path, file_type, file_size)
  VALUES (?, ?, ?, ?, ?, ?)
`);

export const findStatementsByUserId = db.prepare<[string], Statement>(`
  SELECT * FROM statements WHERE user_id = ? ORDER BY uploaded_at DESC
`);

export const findStatementById = db.prepare<[string], Statement>(`
  SELECT * FROM statements WHERE id = ?
`);

export const deleteStatement = db.prepare(`
  DELETE FROM statements WHERE id = ?
`);

// Report functions
export interface Report {
  id: string;
  user_id: string;
  statement_ids: string;
  analysis_data: string;
  created_at: string;
  updated_at: string;
}

export const createReport = db.prepare(`
  INSERT INTO reports (id, user_id, statement_ids, analysis_data)
  VALUES (?, ?, ?, ?)
`);

export const findReportsByUserId = db.prepare<[string], Report>(`
  SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC
`);

export const findLatestReportByUserId = db.prepare<[string], Report>(`
  SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
`);

export const findReportById = db.prepare<[string], Report>(`
  SELECT * FROM reports WHERE id = ?
`);

export const updateReport = db.prepare(`
  UPDATE reports SET analysis_data = ?, statement_ids = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
`);

// Monthly snapshot functions
export interface MonthlySnapshot {
  id: string;
  user_id: string;
  report_id: string;
  month: string;
  month_name: string;
  beginning_balance: number;
  ending_balance: number;
  total_deposits: number;
  total_withdrawals: number;
  negative_days: number;
  average_daily_balance: number;
  created_at: string;
}

export const createMonthlySnapshot = db.prepare(`
  INSERT INTO monthly_snapshots (id, user_id, report_id, month, month_name, beginning_balance, ending_balance, total_deposits, total_withdrawals, negative_days, average_daily_balance)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

export const findMonthlySnapshotsByUserId = db.prepare<[string], MonthlySnapshot>(`
  SELECT * FROM monthly_snapshots WHERE user_id = ? ORDER BY month DESC
`);
