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
} from 'lucide-react';

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
          onClick={() => navigate('/upload')}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-8 py-4 rounded-xl text-lg font-medium shadow-lg shadow-emerald-500/25 transition-all"
        >
          Analyze My Statements <ArrowRight className="w-5 h-5" />
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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
  }, [uploadedFiles, isAuthenticated, navigate]);

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
      <div className="mb-8">
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
