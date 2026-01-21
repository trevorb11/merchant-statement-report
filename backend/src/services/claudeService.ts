import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AnalysisResult {
  businessName: string;
  accountNumber: string;
  bankName: string;
  periodCovered: { start: string; end: string };
  monthlyData: Array<{
    month: string;
    monthName: string;
    beginningBalance: number;
    endingBalance: number;
    totalDeposits: number;
    totalWithdrawals: number;
    negativeDays: number;
    averageDailyBalance: number;
  }>;
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

export interface FileInput {
  filePath: string;
  fileName: string;
  fileType: string;
}

export async function analyzeStatements(files: FileInput[]): Promise<AnalysisResult> {
  const content: Anthropic.MessageCreateParams['messages'][0]['content'] = [];

  // Add each file to the content
  for (const file of files) {
    const fileData = fs.readFileSync(file.filePath);
    const base64Data = fileData.toString('base64');

    if (file.fileType === 'application/pdf') {
      content.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: base64Data,
        },
      } as any);
    } else if (file.fileType.startsWith('image/')) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: file.fileType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: base64Data,
        },
      });
    }
  }

  // Add the analysis prompt
  content.push({
    type: 'text',
    text: `You are a financial analyst for Today Capital Group, a business financing company. Analyze these bank statements thoroughly to assess the business's financial health and funding eligibility.

IMPORTANT: Return ONLY valid JSON with NO markdown formatting, NO backticks, and NO additional text. The response must be pure JSON that can be parsed directly.

Analyze the statements and extract:
1. Business identification (name, bank, account)
2. Monthly financial data (deposits, withdrawals, balances, negative days)
3. Revenue patterns and growth trends
4. Expense categories and spending patterns
5. Existing debt obligations (look for MCA/loan payments - daily ACH debits to lenders)
6. Cash flow health indicators
7. Red flags (NSF fees, overdrafts, returned items, irregular patterns)
8. Overall fundability assessment

Return this exact JSON structure:
{
  "businessName": "extracted business name or 'Business Name Not Found'",
  "accountNumber": "last 4 digits only",
  "bankName": "bank name",
  "periodCovered": {"start": "YYYY-MM-DD", "end": "YYYY-MM-DD"},
  "monthlyData": [
    {
      "month": "YYYY-MM",
      "monthName": "Month Year",
      "beginningBalance": 0,
      "endingBalance": 0,
      "totalDeposits": 0,
      "totalWithdrawals": 0,
      "negativeDays": 0,
      "averageDailyBalance": 0
    }
  ],
  "revenueAnalysis": {
    "estimatedMonthlyRevenue": 0,
    "revenueGrowthPercent": 0,
    "primaryRevenueSources": ["credit card processing", "ACH deposits", "wire transfers"],
    "revenueConsistency": "high/medium/low"
  },
  "expenseAnalysis": {
    "categories": {
      "payroll": 0,
      "rent": 0,
      "utilities": 0,
      "mcaPayments": 0,
      "loanPayments": 0,
      "merchantFees": 0,
      "bankFees": 0,
      "vendors": 0,
      "other": 0
    },
    "totalMonthlyExpenses": 0,
    "largestExpenseCategory": "category name"
  },
  "debtObligations": {
    "identifiedMCAPositions": [
      {"lender": "lender name", "estimatedDailyPayment": 0, "status": "active/suspected"}
    ],
    "totalDailyDebtPayments": 0,
    "estimatedMonthlyDebtService": 0
  },
  "cashFlowHealth": {
    "score": 0-100,
    "rating": "Excellent/Good/Fair/Poor/Critical",
    "overdraftFrequency": "none/rare/occasional/frequent",
    "totalOverdraftFees": 0,
    "cashFlowTiming": "healthy/tight/strained"
  },
  "fundabilityAssessment": {
    "score": 0-100,
    "rating": "Excellent/Good/Fair/Poor/Not Recommended",
    "estimatedFundingCapacity": 0,
    "recommendedProducts": ["Revenue Based Financing", "Term Loan", "Line of Credit", "Equipment Financing"],
    "strengths": ["list of positive factors"],
    "concerns": ["list of concerns or risks"],
    "recommendations": ["actionable recommendations to improve fundability"]
  },
  "redFlags": [
    {"type": "type of flag", "description": "detailed description", "severity": "high/medium/low", "amount": null or number}
  ],
  "insights": [
    {"category": "Revenue/Expenses/CashFlow/Debt/Operations", "title": "short title", "description": "detailed insight", "actionable": true/false, "priority": "high/medium/low"}
  ],
  "summary": "A comprehensive 2-3 paragraph executive summary of the business's financial health, key observations, and funding recommendation."
}

Be thorough and accurate. If data is unclear or missing, make reasonable estimates based on available information and note any assumptions. Focus on providing actionable insights that help both the business owner understand their finances and Today Capital Group assess funding eligibility.`,
  });

  let response;
  try {
    response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{ role: 'user', content }],
    });
  } catch (apiError: any) {
    console.error('Anthropic API error:', apiError?.message || apiError);
    throw new Error(`AI service error: ${apiError?.message || 'Failed to connect to AI service'}`);
  }

  // Extract text response
  const textContent = response.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  // Parse JSON response
  let jsonText = textContent.text.trim();

  // Remove markdown code blocks if present
  jsonText = jsonText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  jsonText = jsonText.replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    const analysis: AnalysisResult = JSON.parse(jsonText);
    return analysis;
  } catch (parseError) {
    console.error('Failed to parse Claude response:', jsonText);
    throw new Error('Failed to parse analysis results. Please try again.');
  }
}

export async function mergeAnalysisWithExisting(
  existingAnalysis: AnalysisResult,
  newFiles: FileInput[]
): Promise<AnalysisResult> {
  // First, analyze the new files
  const newAnalysis = await analyzeStatements(newFiles);

  // Merge monthly data (avoiding duplicates)
  const existingMonths = new Set(existingAnalysis.monthlyData.map((m) => m.month));
  const mergedMonthlyData = [
    ...existingAnalysis.monthlyData,
    ...newAnalysis.monthlyData.filter((m) => !existingMonths.has(m.month)),
  ].sort((a, b) => a.month.localeCompare(b.month));

  // Recalculate aggregates based on merged data
  const totalDeposits = mergedMonthlyData.reduce((sum, m) => sum + m.totalDeposits, 0);
  const monthCount = mergedMonthlyData.length;
  const avgMonthlyRevenue = monthCount > 0 ? totalDeposits / monthCount : 0;

  // Merge and update the analysis
  const mergedAnalysis: AnalysisResult = {
    ...newAnalysis,
    businessName: existingAnalysis.businessName || newAnalysis.businessName,
    accountNumber: existingAnalysis.accountNumber || newAnalysis.accountNumber,
    bankName: existingAnalysis.bankName || newAnalysis.bankName,
    periodCovered: {
      start: mergedMonthlyData[0]?.month || existingAnalysis.periodCovered.start,
      end: mergedMonthlyData[mergedMonthlyData.length - 1]?.month || newAnalysis.periodCovered.end,
    },
    monthlyData: mergedMonthlyData,
    revenueAnalysis: {
      ...newAnalysis.revenueAnalysis,
      estimatedMonthlyRevenue: avgMonthlyRevenue,
    },
    redFlags: [...existingAnalysis.redFlags, ...newAnalysis.redFlags].filter(
      (flag, index, self) =>
        index === self.findIndex((f) => f.type === flag.type && f.description === flag.description)
    ),
    insights: [...existingAnalysis.insights, ...newAnalysis.insights].filter(
      (insight, index, self) =>
        index === self.findIndex((i) => i.title === insight.title)
    ),
  };

  return mergedAnalysis;
}
