export interface User {
  id: string;
  email: string;
  businessName: string | null;
  phone: string | null;
  createdAt?: string;
}

export interface MonthlyData {
  month: string;
  monthName: string;
  beginningBalance: number;
  endingBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  negativeDays: number;
  averageDailyBalance: number;
}

export interface FinancialData {
  businessName: string;
  accountNumber: string;
  bankName: string;
  periodCovered: { start: string; end: string };
  monthlyData: MonthlyData[];
  revenueAnalysis: {
    estimatedMonthlyRevenue: number;
    revenueGrowthPercent: number;
    primaryRevenueSources: string[];
    revenueConsistency: string;
  };
  expenseAnalysis: {
    categories: Record<string, number>;
    totalMonthlyExpenses: number;
    largestExpenseCategory: string;
  };
  debtObligations: {
    identifiedMCAPositions: Array<{ lender: string; estimatedDailyPayment: number; status: string }>;
    totalDailyDebtPayments: number;
    estimatedMonthlyDebtService: number;
  };
  cashFlowHealth: {
    score: number;
    rating: string;
    overdraftFrequency: string;
    totalOverdraftFees: number;
    cashFlowTiming: string;
  };
  fundabilityAssessment: {
    score: number;
    rating: string;
    estimatedFundingCapacity: number;
    recommendedProducts: string[];
    strengths: string[];
    concerns: string[];
    recommendations: string[];
  };
  redFlags: Array<{ type: string; description: string; severity: string; amount: number | null }>;
  insights: Array<{ category: string; title: string; description: string; actionable: boolean; priority: string }>;
  summary: string;
}

export interface Statement {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface Report {
  id: string;
  statementIds: string[];
  analysis: FinancialData;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedFile {
  name: string;
  file: File;
}

export type AppView = 'landing' | 'upload' | 'analyzing' | 'report' | 'dashboard' | 'login' | 'register';
