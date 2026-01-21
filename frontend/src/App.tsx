import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { api } from './api/client';
import { FinancialData, UploadedFile, Statement, Report } from './types';
import {
  Upload,
  FileText,
  X,
  TrendingUp,
  ArrowRight,
  Shield,
  CheckCircle2,
  BarChart3,
  Target,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  Activity,
  Building2,
  Calendar,
  CreditCard,
  PieChart,
  ChevronRight,
  AlertCircle,
  Info,
  Loader2,
  LogOut,
  User,
  History,
  Plus,
  Trash2,
  Eye,
  Mail,
  Sparkles,
  Download,
} from 'lucide-react';

// Lead info stored in session
interface LeadInfo {
  id: string;
  email: string;
  businessName?: string;
}

// Utility functions
const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);

const getScoreColor = (score: number) =>
  score >= 80
    ? 'text-emerald-400'
    : score >= 60
    ? 'text-cyan-400'
    : score >= 40
    ? 'text-amber-400'
    : 'text-red-400';

const getScoreBg = (score: number) =>
  score >= 80
    ? 'bg-emerald-500/20'
    : score >= 60
    ? 'bg-cyan-500/20'
    : score >= 40
    ? 'bg-amber-500/20'
    : 'bg-red-500/20';

const formatCompactCurrency = (n: number) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};

// Trend Chart Component
interface TrendChartProps {
  data: Array<{ label: string; value: number }>;
  color?: string;
  showArea?: boolean;
  height?: number;
  formatValue?: (v: number) => string;
}

function TrendChart({
  data,
  color = '#10b981',
  showArea = true,
  height = 200,
  formatValue = formatCompactCurrency
}: TrendChartProps) {
  if (data.length === 0) return null;

  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  // Calculate points
  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * (100 - padding.left - padding.right);
    const y = padding.top + chartHeight - ((d.value - minValue) / valueRange) * chartHeight;
    return { x, y, ...d };
  });

  // Create SVG path
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  // Y-axis labels
  const yLabels = [maxValue, (maxValue + minValue) / 2, minValue];

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full h-full">
        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={padding.top + chartHeight * ratio}
            x2={100 - padding.right}
            y2={padding.top + chartHeight * ratio}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.5"
          />
        ))}

        {/* Area fill */}
        {showArea && (
          <path
            d={areaPath}
            fill={`${color}20`}
          />
        )}

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="3"
              fill={color}
              vectorEffect="non-scaling-stroke"
            />
            {/* X-axis labels */}
            <text
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              className="fill-slate-500"
              style={{ fontSize: '8px' }}
            >
              {p.label}
            </text>
          </g>
        ))}

        {/* Y-axis labels */}
        {yLabels.map((val, i) => (
          <text
            key={i}
            x={padding.left - 5}
            y={padding.top + (i * chartHeight / 2) + 3}
            textAnchor="end"
            className="fill-slate-500"
            style={{ fontSize: '7px' }}
          >
            {formatValue(val)}
          </text>
        ))}
      </svg>
    </div>
  );
}

// PDF Export Function
function generatePDF(data: FinancialData) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download the PDF');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${data.businessName} - Financial Analysis Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.5; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 28px; margin-bottom: 8px; color: #0f172a; }
        h2 { font-size: 20px; margin: 24px 0 16px; color: #0f172a; border-bottom: 2px solid #10b981; padding-bottom: 8px; }
        h3 { font-size: 16px; margin: 16px 0 8px; color: #334155; }
        p { margin-bottom: 8px; color: #475569; }
        .header { border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
        .meta { display: flex; gap: 24px; color: #64748b; font-size: 14px; margin-top: 8px; }
        .scores { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
        .score-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
        .score-card .label { font-size: 12px; color: #64748b; margin-bottom: 4px; }
        .score-card .value { font-size: 28px; font-weight: bold; }
        .score-card .value.green { color: #10b981; }
        .score-card .value.cyan { color: #06b6d4; }
        .summary { background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .list { padding-left: 24px; }
        .list li { margin-bottom: 8px; color: #475569; }
        .list.strengths li::marker { color: #10b981; }
        .list.concerns li::marker { color: #f59e0b; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f8fafc; font-weight: 600; color: #334155; }
        td.green { color: #10b981; }
        td.red { color: #ef4444; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; }
        .recommendations { background: #f0f9ff; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .recommendations ol { padding-left: 24px; }
        .recommendations li { margin-bottom: 8px; color: #0369a1; }
        @media print { body { padding: 20px; } .scores { grid-template-columns: repeat(2, 1fr); } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${data.businessName}</h1>
        <div class="meta">
          <span>Bank: ${data.bankName}</span>
          <span>Account: ****${data.accountNumber}</span>
          <span>Period: ${data.periodCovered.start} - ${data.periodCovered.end}</span>
        </div>
      </div>

      <div class="scores">
        <div class="score-card">
          <div class="label">Fundability Score</div>
          <div class="value green">${data.fundabilityAssessment.score}/100</div>
          <div class="label">${data.fundabilityAssessment.rating}</div>
        </div>
        <div class="score-card">
          <div class="label">Cash Flow Health</div>
          <div class="value cyan">${data.cashFlowHealth.score}/100</div>
          <div class="label">${data.cashFlowHealth.rating}</div>
        </div>
        <div class="score-card">
          <div class="label">Monthly Revenue</div>
          <div class="value">$${data.revenueAnalysis.estimatedMonthlyRevenue.toLocaleString()}</div>
          <div class="label">${data.revenueAnalysis.revenueGrowthPercent >= 0 ? '+' : ''}${data.revenueAnalysis.revenueGrowthPercent}% growth</div>
        </div>
        <div class="score-card">
          <div class="label">Funding Capacity</div>
          <div class="value green">$${data.fundabilityAssessment.estimatedFundingCapacity.toLocaleString()}</div>
          <div class="label">Based on cash flow</div>
        </div>
      </div>

      <h2>Executive Summary</h2>
      <div class="summary">
        <p>${data.summary}</p>
      </div>

      <div class="grid-2">
        <div>
          <h3>Strengths</h3>
          <ul class="list strengths">
            ${data.fundabilityAssessment.strengths.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
        <div>
          <h3>Concerns</h3>
          <ul class="list concerns">
            ${data.fundabilityAssessment.concerns.map(c => `<li>${c}</li>`).join('')}
          </ul>
        </div>
      </div>

      <h2>Monthly Cash Flow</h2>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Deposits</th>
            <th>Withdrawals</th>
            <th>Ending Balance</th>
            <th>Negative Days</th>
          </tr>
        </thead>
        <tbody>
          ${data.monthlyData.map(m => `
            <tr>
              <td>${m.monthName}</td>
              <td class="green">$${m.totalDeposits.toLocaleString()}</td>
              <td class="red">$${m.totalWithdrawals.toLocaleString()}</td>
              <td${m.endingBalance < 0 ? ' class="red"' : ''}>$${m.endingBalance.toLocaleString()}</td>
              <td${m.negativeDays > 0 ? ' class="red"' : ''}>${m.negativeDays}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>Recommendations</h2>
      <div class="recommendations">
        <ol>
          ${data.fundabilityAssessment.recommendations.map(r => `<li>${r}</li>`).join('')}
        </ol>
      </div>

      <h2>Recommended Funding Products</h2>
      <p>${data.fundabilityAssessment.recommendedProducts.join(' • ')}</p>

      <div class="footer">
        <p>Generated by Today Capital Group</p>
        <p>Report Date: ${new Date().toLocaleDateString()}</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// Comparison Bar Chart
interface ComparisonBarProps {
  deposits: number;
  withdrawals: number;
}

function ComparisonBar({ deposits, withdrawals }: ComparisonBarProps) {
  const total = deposits + withdrawals;
  const depositPct = (deposits / total) * 100;
  const withdrawalPct = (withdrawals / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-emerald-400">Deposits: {formatCurrency(deposits)}</span>
        <span className="text-red-400">Withdrawals: {formatCurrency(withdrawals)}</span>
      </div>
      <div className="h-4 rounded-full overflow-hidden flex bg-slate-800">
        <div
          className="bg-emerald-500 h-full transition-all duration-500"
          style={{ width: `${depositPct}%` }}
        />
        <div
          className="bg-red-500 h-full transition-all duration-500"
          style={{ width: `${withdrawalPct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{depositPct.toFixed(0)}%</span>
        <span>{withdrawalPct.toFixed(0)}%</span>
      </div>
    </div>
  );
}

// Funding Calculator Component
interface FundingCalculatorProps {
  maxCapacity: number;
  monthlyRevenue: number;
}

function FundingCalculator({ maxCapacity, monthlyRevenue }: FundingCalculatorProps) {
  const [amount, setAmount] = useState(Math.min(50000, maxCapacity));
  const [term, setTerm] = useState(12); // months

  // Calculate based on factor rate (typical MCA style)
  const factorRates: Record<number, number> = {
    6: 1.15,
    9: 1.22,
    12: 1.29,
    18: 1.38,
    24: 1.45,
  };

  const factorRate = factorRates[term] || 1.29;
  const totalPayback = amount * factorRate;
  const dailyPayment = totalPayback / (term * 22); // ~22 business days per month
  const weeklyPayment = dailyPayment * 5;
  const monthlyPayment = totalPayback / term;

  // Calculate if payment is sustainable (should be less than 15% of monthly revenue)
  const revenueImpact = (monthlyPayment / monthlyRevenue) * 100;
  const isSustainable = revenueImpact < 15;

  const presetAmounts = [25000, 50000, 75000, 100000].filter(a => a <= maxCapacity);
  if (maxCapacity > 100000) {
    presetAmounts.push(Math.round(maxCapacity / 10000) * 10000);
  }

  return (
    <div className="space-y-6">
      {/* Amount Selector */}
      <div>
        <label className="block text-sm text-slate-400 mb-3">Funding Amount</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {presetAmounts.map((preset) => (
            <button
              key={preset}
              onClick={() => setAmount(preset)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                amount === preset
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {formatCurrency(preset)}
            </button>
          ))}
        </div>
        <input
          type="range"
          min={10000}
          max={maxCapacity}
          step={5000}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{formatCurrency(10000)}</span>
          <span className="text-emerald-400 font-medium">{formatCurrency(amount)}</span>
          <span>{formatCurrency(maxCapacity)}</span>
        </div>
      </div>

      {/* Term Selector */}
      <div>
        <label className="block text-sm text-slate-400 mb-3">Repayment Term</label>
        <div className="flex flex-wrap gap-2">
          {[6, 9, 12, 18, 24].map((t) => (
            <button
              key={t}
              onClick={() => setTerm(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                term === t
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {t} months
            </button>
          ))}
        </div>
      </div>

      {/* Payment Estimates */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-slate-800/50 text-center">
          <p className="text-xs text-slate-400 mb-1">Daily Payment</p>
          <p className="text-xl font-bold text-emerald-400">{formatCurrency(dailyPayment)}</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-800/50 text-center">
          <p className="text-xs text-slate-400 mb-1">Weekly Payment</p>
          <p className="text-xl font-bold text-cyan-400">{formatCurrency(weeklyPayment)}</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-800/50 text-center">
          <p className="text-xs text-slate-400 mb-1">Monthly Payment</p>
          <p className="text-xl font-bold">{formatCurrency(monthlyPayment)}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 rounded-lg bg-slate-800/30 border border-white/5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Funding Amount:</span>
            <span className="font-medium">{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Factor Rate:</span>
            <span className="font-medium">{factorRate.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Payback:</span>
            <span className="font-medium">{formatCurrency(totalPayback)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Cost of Capital:</span>
            <span className="font-medium text-amber-400">{formatCurrency(totalPayback - amount)}</span>
          </div>
        </div>
      </div>

      {/* Sustainability Indicator */}
      <div className={`p-4 rounded-lg ${isSustainable ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
        <div className="flex items-start gap-3">
          {isSustainable ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`font-medium ${isSustainable ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isSustainable ? 'Sustainable Payment Level' : 'High Payment Relative to Revenue'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Monthly payment represents {revenueImpact.toFixed(1)}% of your average monthly revenue.
              {!isSustainable && ' Consider a smaller amount or longer term.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Navigation Component
function Nav() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="relative z-10 border-b border-white/5 px-6 py-4 bg-slate-950/80 backdrop-blur sticky top-0">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-xl font-semibold">
            Today Capital <span className="text-emerald-400 font-light">Group</span>
          </span>
        </button>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm text-slate-400 hover:text-white flex items-center gap-2"
              >
                <History className="w-4 h-4" /> Dashboard
              </button>
              <button
                onClick={() => navigate('/upload')}
                className="text-sm text-slate-400 hover:text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> New Analysis
              </button>
              <div className="text-sm text-slate-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                {user?.businessName || user?.email}
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-sm text-slate-400 hover:text-white flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-slate-400 hover:text-white"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="text-sm bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// Landing Page
function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
      </div>

      <Nav />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-32">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-slate-300">AI-Powered Financial Intelligence</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Know Your
          <br />
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Financial Health
          </span>
          <br />
          In Minutes
        </h1>

        <p className="text-xl text-slate-400 mb-10 max-w-2xl">
          Upload your bank statements and get an instant, comprehensive analysis of your business
          finances with funding recommendations.
        </p>

        <button
          onClick={() => navigate('/get-started')}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-8 py-4 rounded-xl text-lg font-medium shadow-lg shadow-emerald-500/25 transition-all"
        >
          Get Your Free Analysis <ArrowRight className="w-5 h-5" />
        </button>

        <div className="flex flex-wrap gap-6 mt-10 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" /> Secure & Private
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant Results
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" /> PDF & Images
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-20">
          {[
            {
              icon: BarChart3,
              title: 'Cash Flow Analysis',
              desc: 'See how money moves through your business',
            },
            {
              icon: Target,
              title: 'Fundability Score',
              desc: 'Understand your funding potential',
            },
            {
              icon: Lightbulb,
              title: 'Actionable Insights',
              desc: 'Get specific improvement steps',
            },
          ].map((f, i) => (
            <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/5">
              <f.icon className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// Get Started Page - Email capture before upload
function GetStartedPage() {
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, go straight to upload
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/upload');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { lead } = await api.captureLead(email, businessName);

      // Store lead info in session
      const leadInfo: LeadInfo = {
        id: lead.id,
        email: lead.email,
        businessName: lead.businessName,
      };
      sessionStorage.setItem('lead_info', JSON.stringify(leadInfo));

      navigate('/upload');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
      </div>
      <Nav />

      <main className="relative z-10 max-w-md mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Get Your Free Analysis</h1>
          <p className="text-slate-400">
            Enter your email and we'll send you a personalized financial health report.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your Business Name"
              className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.com"
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-8 py-4 rounded-xl text-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue to Upload <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-sm text-slate-500">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <p className="text-center mt-6 text-slate-400">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-emerald-400 hover:underline">
            Sign in
          </button>
        </p>

        <div className="mt-10 p-4 rounded-xl bg-slate-900/30 border border-white/5">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-300">Your data is secure</p>
              <p className="text-xs text-slate-500 mt-1">
                We use bank-level encryption and never share your information with third parties.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Auth Pages
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <Nav />
      <main className="relative z-10 max-w-md mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold mb-2 text-center">Welcome Back</h1>
        <p className="text-slate-400 text-center mb-8">Sign in to access your reports</p>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-8 py-4 rounded-xl text-lg font-medium disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-400">
          Don't have an account?{' '}
          <button onClick={() => navigate('/register')} className="text-emerald-400 hover:underline">
            Sign up
          </button>
        </p>
      </main>
    </div>
  );
}

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(email, password, businessName, phone);
      navigate('/upload');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <Nav />
      <main className="relative z-10 max-w-md mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2 text-center">Create Account</h1>
        <p className="text-slate-400 text-center mb-8">Start analyzing your financial health</p>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 focus:border-emerald-500 focus:outline-none"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-8 py-4 rounded-xl text-lg font-medium disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-400">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-emerald-400 hover:underline">
            Sign in
          </button>
        </p>
      </main>
    </div>
  );
}

// Upload Page
function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [leadInfo, setLeadInfo] = useState<LeadInfo | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Load lead info from session
  useEffect(() => {
    const storedLead = sessionStorage.getItem('lead_info');
    if (storedLead) {
      setLeadInfo(JSON.parse(storedLead));
    }
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        newFiles.push({ name: file.name, file });
      }
    }

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload at least one bank statement');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setError(null);

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => (prev >= 85 ? prev : prev + Math.random() * 12));
    }, 600);

    try {
      const files = uploadedFiles.map((f) => f.file);
      const { analysis, saved } = await api.quickAnalyze(files);

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      // Mark lead as having completed analysis
      if (leadInfo?.id) {
        try {
          await api.markLeadAnalysisCompleted(leadInfo.id);
        } catch (e) {
          // Non-critical, continue anyway
        }
      }

      // If user is authenticated and analysis was saved, create a report
      if (isAuthenticated && saved) {
        // The statements were already saved, now create a report
        const { report } = await api.createReport([], analysis);
        navigate(`/report/${report.id}`);
      } else {
        // Store analysis in session for non-authenticated users
        sessionStorage.setItem('analysis_result', JSON.stringify(analysis));
        navigate('/report/preview');
      }
    } catch (err) {
      clearInterval(progressInterval);
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setIsAnalyzing(false);
    }
  }, [uploadedFiles, isAuthenticated, navigate, leadInfo]);

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 text-center px-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-8 animate-pulse-glow">
            <TrendingUp className="w-10 h-10" />
          </div>

          <h1 className="text-2xl font-bold mb-4">Analyzing Your Statements</h1>
          <p className="text-slate-400 mb-8">This may take 30-60 seconds...</p>

          <div className="w-80 mx-auto bg-slate-800 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
          <p className="text-slate-500">{Math.round(analysisProgress)}%</p>

          <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>AI is reading your documents...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <Nav />

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {leadInfo?.businessName && (
          <p className="text-emerald-400 text-center mb-2">
            Welcome, {leadInfo.businessName}!
          </p>
        )}
        <h1 className="text-3xl font-bold mb-2 text-center">Upload Bank Statements</h1>
        <p className="text-slate-400 text-center mb-8">Upload 1-3 months for the best analysis</p>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        <label className="block border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-2xl p-12 text-center cursor-pointer transition-colors">
          <input
            type="file"
            multiple
            accept=".pdf,image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Drop files or click to browse</p>
          <p className="text-sm text-slate-500">PDF or image files</p>
        </label>

        {uploadedFiles.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Files ({uploadedFiles.length})
            </h3>
            {uploadedFiles.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-white/5"
              >
                <span>{file.name}</span>
                <button
                  onClick={() => setUploadedFiles((f) => f.filter((_, idx) => idx !== i))}
                  className="text-slate-400 hover:text-red-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}

            <button
              onClick={handleAnalyze}
              className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-8 py-4 rounded-xl text-lg font-medium"
            >
              Analyze Statements <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <p className="text-center mt-8 text-slate-500 text-sm">
            <button onClick={() => navigate('/register')} className="text-emerald-400 hover:underline">
              Create an account
            </button>{' '}
            to save your statements and track progress over time
          </p>
        )}
      </main>
    </div>
  );
}

// Report Component (reusable for both preview and saved reports)
function ReportView({ data }: { data: FinancialData }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{data.businessName}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4" /> {data.bankName}
            </span>
            <span className="flex items-center gap-1">
              <CreditCard className="w-4 h-4" /> ****{data.accountNumber}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {data.periodCovered.start} - {data.periodCovered.end}
            </span>
          </div>
        </div>
        <button
          onClick={() => generatePDF(data)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      {/* Score Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
          <p className="text-sm text-slate-400 mb-1">Fundability Score</p>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-4xl font-bold ${getScoreColor(data.fundabilityAssessment.score)}`}
            >
              {data.fundabilityAssessment.score}
            </span>
            <span className="text-slate-500">/100</span>
          </div>
          <span
            className={`inline-block mt-2 px-2 py-1 rounded text-xs ${getScoreBg(
              data.fundabilityAssessment.score
            )} ${getScoreColor(data.fundabilityAssessment.score)}`}
          >
            {data.fundabilityAssessment.rating}
          </span>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
          <p className="text-sm text-slate-400 mb-1">Cash Flow Health</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${getScoreColor(data.cashFlowHealth.score)}`}>
              {data.cashFlowHealth.score}
            </span>
            <span className="text-slate-500">/100</span>
          </div>
          <span
            className={`inline-block mt-2 px-2 py-1 rounded text-xs ${getScoreBg(
              data.cashFlowHealth.score
            )} ${getScoreColor(data.cashFlowHealth.score)}`}
          >
            {data.cashFlowHealth.rating}
          </span>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
          <p className="text-sm text-slate-400 mb-1">Avg Monthly Revenue</p>
          <span className="text-3xl font-bold">
            {formatCurrency(data.revenueAnalysis.estimatedMonthlyRevenue)}
          </span>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <TrendingUp
              className={`w-4 h-4 ${
                data.revenueAnalysis.revenueGrowthPercent >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            />
            <span
              className={
                data.revenueAnalysis.revenueGrowthPercent >= 0 ? 'text-emerald-400' : 'text-red-400'
              }
            >
              {data.revenueAnalysis.revenueGrowthPercent}%
            </span>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
          <p className="text-sm text-slate-400 mb-1">Funding Capacity</p>
          <span className="text-3xl font-bold text-cyan-400">
            {formatCurrency(data.fundabilityAssessment.estimatedFundingCapacity)}
          </span>
          <p className="text-xs text-slate-500 mt-2">Based on cash flow</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['overview', 'cashflow', 'expenses', 'insights', 'fundability'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-400" /> Executive Summary
            </h3>
            <p className="text-slate-300 leading-relaxed">{data.summary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Strengths
              </h3>
              <ul className="space-y-3">
                {data.fundabilityAssessment.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" /> Concerns
              </h3>
              <ul className="space-y-3">
                {data.fundabilityAssessment.concerns.map((c, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {data.redFlags.length > 0 && (
            <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Red Flags
              </h3>
              <div className="space-y-3">
                {data.redFlags.map((flag, i) => (
                  <div key={i} className="p-4 rounded-lg bg-slate-800/50">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          flag.severity === 'high'
                            ? 'bg-red-500/20 text-red-400'
                            : flag.severity === 'medium'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {flag.severity}
                      </span>
                      <span className="font-medium">{flag.type}</span>
                    </div>
                    <p className="text-sm text-slate-400">{flag.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'cashflow' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
              <p className="text-sm text-slate-400 mb-1">Cash Flow Timing</p>
              <p className="text-2xl font-bold capitalize">{data.cashFlowHealth.cashFlowTiming}</p>
            </div>
            <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
              <p className="text-sm text-slate-400 mb-1">Overdraft Frequency</p>
              <p className="text-2xl font-bold capitalize">
                {data.cashFlowHealth.overdraftFrequency}
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
              <p className="text-sm text-slate-400 mb-1">Total Overdraft Fees</p>
              <p className="text-2xl font-bold text-red-400">
                {formatCurrency(data.cashFlowHealth.totalOverdraftFees)}
              </p>
            </div>
          </div>

          {/* Trend Charts */}
          {data.monthlyData.length > 1 && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" /> Deposits Trend
                </h3>
                <TrendChart
                  data={data.monthlyData.map(m => ({
                    label: m.monthName.split(' ')[0].slice(0, 3),
                    value: m.totalDeposits
                  }))}
                  color="#10b981"
                />
              </div>
              <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" /> Ending Balance Trend
                </h3>
                <TrendChart
                  data={data.monthlyData.map(m => ({
                    label: m.monthName.split(' ')[0].slice(0, 3),
                    value: m.endingBalance
                  }))}
                  color="#06b6d4"
                />
              </div>
            </div>
          )}

          {/* Cash Flow Comparison */}
          <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
            <h3 className="font-semibold mb-4">Total Cash Flow</h3>
            <ComparisonBar
              deposits={data.monthlyData.reduce((sum, m) => sum + m.totalDeposits, 0)}
              withdrawals={data.monthlyData.reduce((sum, m) => sum + m.totalWithdrawals, 0)}
            />
          </div>

          <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
            <h3 className="font-semibold mb-4">Monthly Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-white/5">
                    <th className="text-left pb-3">Month</th>
                    <th className="text-right pb-3">Deposits</th>
                    <th className="text-right pb-3">Withdrawals</th>
                    <th className="text-right pb-3">Ending Balance</th>
                    <th className="text-right pb-3">Negative Days</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthlyData.map((m, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3">{m.monthName}</td>
                      <td className="py-3 text-right text-emerald-400">
                        {formatCurrency(m.totalDeposits)}
                      </td>
                      <td className="py-3 text-right text-red-400">
                        {formatCurrency(m.totalWithdrawals)}
                      </td>
                      <td
                        className={`py-3 text-right ${m.endingBalance < 0 ? 'text-red-400' : ''}`}
                      >
                        {formatCurrency(m.endingBalance)}
                      </td>
                      <td
                        className={`py-3 text-right ${
                          m.negativeDays > 0 ? 'text-red-400' : 'text-slate-400'
                        }`}
                      >
                        {m.negativeDays}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-cyan-400" /> Expense Categories
            </h3>
            <div className="space-y-4">
              {Object.entries(data.expenseAnalysis.categories)
                .filter(([_, v]) => v > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount], i) => {
                  const pct = (amount / data.expenseAnalysis.totalMonthlyExpenses) * 100;
                  const colors = [
                    'bg-emerald-500',
                    'bg-cyan-500',
                    'bg-amber-500',
                    'bg-purple-500',
                    'bg-pink-500',
                    'bg-blue-500',
                  ];
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400 capitalize">
                          {cat.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span>
                          {formatCurrency(amount)} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full">
                        <div
                          className={`h-2 rounded-full ${colors[i % colors.length]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
            <h3 className="font-semibold mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-800/50">
                <p className="text-sm text-slate-400">Total Monthly Expenses</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data.expenseAnalysis.totalMonthlyExpenses)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50">
                <p className="text-sm text-slate-400">Largest Category</p>
                <p className="text-xl font-bold capitalize">
                  {data.expenseAnalysis.largestExpenseCategory.replace(/([A-Z])/g, ' $1')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-4">
          {data.insights.map((insight, i) => (
            <div
              key={i}
              className={`p-6 rounded-xl bg-slate-900/50 border border-white/5 border-l-4 ${
                insight.priority === 'high'
                  ? 'border-l-red-500'
                  : insight.priority === 'medium'
                  ? 'border-l-amber-500'
                  : 'border-l-slate-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-300">
                  {insight.category}
                </span>
                {insight.actionable && (
                  <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400">
                    Actionable
                  </span>
                )}
              </div>
              <h4 className="font-semibold mb-2">{insight.title}</h4>
              <p className="text-slate-400">{insight.description}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'fundability' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div
                className={`w-36 h-36 rounded-full ${getScoreBg(
                  data.fundabilityAssessment.score
                )} flex items-center justify-center`}
              >
                <div className="text-center">
                  <span
                    className={`text-5xl font-bold ${getScoreColor(
                      data.fundabilityAssessment.score
                    )}`}
                  >
                    {data.fundabilityAssessment.score}
                  </span>
                  <p className="text-slate-400 text-sm">/100</p>
                </div>
              </div>
              <div className="flex-1">
                <span
                  className={`inline-block px-3 py-1 rounded-lg text-sm ${getScoreBg(
                    data.fundabilityAssessment.score
                  )} ${getScoreColor(data.fundabilityAssessment.score)} mb-3`}
                >
                  {data.fundabilityAssessment.rating}
                </span>
                <p className="text-slate-300 mb-4">
                  {data.fundabilityAssessment.score >= 80
                    ? 'Excellent financial health. You qualify for the best rates.'
                    : data.fundabilityAssessment.score >= 60
                    ? 'Good standing with solid fundamentals.'
                    : data.fundabilityAssessment.score >= 40
                    ? 'Potential shown but some areas need attention.'
                    : 'Signs of financial stress. Focus on improvements.'}
                </p>
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm text-slate-400">Estimated Funding Capacity</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(data.fundabilityAssessment.estimatedFundingCapacity)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
            <h3 className="font-semibold mb-4">Recommended Products</h3>
            <div className="flex flex-wrap gap-3">
              {data.fundabilityAssessment.recommendedProducts.map((p, i) => (
                <div
                  key={i}
                  className="px-4 py-2 rounded-lg bg-slate-800/50 border border-white/5 flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/50 border border-white/5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-cyan-400" /> Improvement Roadmap
            </h3>
            <div className="space-y-3">
              {data.fundabilityAssessment.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-slate-300 pt-1">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Funding Calculator */}
          <FundingCalculator
            maxCapacity={data.fundabilityAssessment.estimatedFundingCapacity}
            monthlyRevenue={data.revenueAnalysis.estimatedMonthlyRevenue}
          />

          <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-900/50 to-cyan-900/50 border border-emerald-500/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Ready to Get Funded?</h3>
                <p className="text-slate-300">
                  Our team can help find the best options for your business.
                </p>
              </div>
              <button className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap">
                Contact Today Capital Group <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Report Page (for preview and saved reports)
function ReportPage() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const storedAnalysis = sessionStorage.getItem('analysis_result');
    if (storedAnalysis) {
      setData(JSON.parse(storedAnalysis));
      setIsLoading(false);
    } else {
      navigate('/upload');
    }
  }, [navigate]);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <Nav />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {!isAuthenticated && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-emerald-400">
              <button
                onClick={() => navigate('/register')}
                className="font-semibold hover:underline"
              >
                Create an account
              </button>{' '}
              to save this report and track your financial progress over time.
            </p>
          </div>
        )}

        <ReportView data={data} />
      </main>
    </div>
  );
}

// Saved Report Page
function SavedReportPage({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadReport = async () => {
      try {
        const { report } = await api.getReport(reportId);
        setReport(report);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setIsLoading(false);
      }
    };
    loadReport();
  }, [reportId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Nav />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            {error || 'Report not found'}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-emerald-400 hover:underline"
          >
            Back to Dashboard
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <Nav />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <ReportView data={report.analysis} />
      </main>
    </div>
  );
}

// Dashboard Page
function DashboardPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const [reportsRes, statementsRes] = await Promise.all([
          api.getReports(),
          api.getStatements(),
        ]);
        setReports(reportsRes.reports);
        setStatements(statementsRes.statements);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, navigate]);

  const handleDeleteStatement = async (id: string) => {
    try {
      await api.deleteStatement(id);
      setStatements((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete statement:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <Nav />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-slate-400">Welcome back, {user?.businessName || user?.email}</p>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 px-6 py-3 rounded-lg font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> New Analysis
          </button>
        </div>

        {/* Reports Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" /> Your Reports
          </h2>

          {reports.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-900/50 border border-white/5 text-center">
              <p className="text-slate-400 mb-4">No reports yet. Upload some statements to get started!</p>
              <button
                onClick={() => navigate('/upload')}
                className="text-emerald-400 hover:underline"
              >
                Upload Statements
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-6 rounded-xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{report.businessName}</h3>
                      <p className="text-sm text-slate-400">
                        {report.periodCovered?.start} - {report.periodCovered?.end}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-sm ${getScoreBg(
                        report.fundabilityScore || 0
                      )} ${getScoreColor(report.fundabilityScore || 0)}`}
                    >
                      {report.fundabilityScore || 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Created: {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => navigate(`/report/${report.id}`)}
                    className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> View Report
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statements Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" /> Uploaded Statements
          </h2>

          {statements.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-900/50 border border-white/5 text-center">
              <p className="text-slate-400">No statements uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {statements.map((statement) => (
                <div
                  key={statement.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="font-medium">{statement.fileName}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(statement.uploadedAt).toLocaleDateString()} -{' '}
                        {(statement.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteStatement(statement.id)}
                    className="text-slate-400 hover:text-red-400 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Main App with Routes
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/get-started" element={<GetStartedPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/report/preview" element={<ReportPage />} />
      <Route
        path="/report/:id"
        element={<ReportRouteWrapper />}
      />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ReportRouteWrapper() {
  const params = new URL(window.location.href).pathname.split('/');
  const id = params[params.length - 1];

  if (id === 'preview') {
    return <ReportPage />;
  }

  return <SavedReportPage reportId={id} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
