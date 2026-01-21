import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  createReport,
  findReportsByUserId,
  findReportById,
  findLatestReportByUserId,
  updateReport,
  createMonthlySnapshot,
  findMonthlySnapshotsByUserId,
  findStatementById,
  Report,
} from '../models/database';
import { analyzeStatements, mergeAnalysisWithExisting, AnalysisResult, FileInput } from '../services/claudeService';

const router = Router();

// Create a new report from analysis
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { statementIds, analysis } = req.body;

    if (!analysis) {
      res.status(400).json({ error: 'Analysis data is required' });
      return;
    }

    const reportId = uuidv4();
    const statementIdsJson = JSON.stringify(statementIds || []);
    const analysisJson = JSON.stringify(analysis);

    createReport.run(reportId, req.userId, statementIdsJson, analysisJson);

    // Save monthly snapshots
    const analysisData = analysis as AnalysisResult;
    if (analysisData.monthlyData) {
      for (const monthData of analysisData.monthlyData) {
        const snapshotId = uuidv4();
        createMonthlySnapshot.run(
          snapshotId,
          req.userId,
          reportId,
          monthData.month,
          monthData.monthName,
          monthData.beginningBalance,
          monthData.endingBalance,
          monthData.totalDeposits,
          monthData.totalWithdrawals,
          monthData.negativeDays,
          monthData.averageDailyBalance
        );
      }
    }

    res.status(201).json({
      message: 'Report created successfully',
      report: {
        id: reportId,
        statementIds: statementIds || [],
        analysis: analysisData,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// Get all reports for current user
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const reports = findReportsByUserId.all(req.userId);

    res.json({
      reports: reports.map((r) => {
        const analysis = JSON.parse(r.analysis_data) as AnalysisResult;
        return {
          id: r.id,
          businessName: analysis.businessName,
          periodCovered: analysis.periodCovered,
          fundabilityScore: analysis.fundabilityAssessment?.score,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        };
      }),
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

// Get latest report for current user
router.get('/latest', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const report = findLatestReportByUserId.get(req.userId);

    if (!report) {
      res.status(404).json({ error: 'No reports found' });
      return;
    }

    const analysis = JSON.parse(report.analysis_data) as AnalysisResult;
    const statementIds = JSON.parse(report.statement_ids) as string[];

    res.json({
      report: {
        id: report.id,
        statementIds,
        analysis,
        createdAt: report.created_at,
        updatedAt: report.updated_at,
      },
    });
  } catch (error) {
    console.error('Get latest report error:', error);
    res.status(500).json({ error: 'Failed to get latest report' });
  }
});

// Get a specific report
router.get('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const report = findReportById.get(req.params.id);

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    if (report.user_id !== req.userId) {
      res.status(403).json({ error: 'Not authorized to view this report' });
      return;
    }

    const analysis = JSON.parse(report.analysis_data) as AnalysisResult;
    const statementIds = JSON.parse(report.statement_ids) as string[];

    res.json({
      report: {
        id: report.id,
        statementIds,
        analysis,
        createdAt: report.created_at,
        updatedAt: report.updated_at,
      },
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to get report' });
  }
});

// Add new statements to existing report (merge analysis)
router.post('/:id/add-statements', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { statementIds: newStatementIds } = req.body;

    if (!newStatementIds || !Array.isArray(newStatementIds) || newStatementIds.length === 0) {
      res.status(400).json({ error: 'Statement IDs are required' });
      return;
    }

    const report = findReportById.get(req.params.id);

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    if (report.user_id !== req.userId) {
      res.status(403).json({ error: 'Not authorized to modify this report' });
      return;
    }

    const existingAnalysis = JSON.parse(report.analysis_data) as AnalysisResult;
    const existingStatementIds = JSON.parse(report.statement_ids) as string[];

    // Get new statements
    const newFiles: FileInput[] = [];
    for (const id of newStatementIds) {
      const statement = findStatementById.get(id);
      if (statement && statement.user_id === req.userId) {
        newFiles.push({
          filePath: statement.file_path,
          fileName: statement.file_name,
          fileType: statement.file_type,
        });
      }
    }

    if (newFiles.length === 0) {
      res.status(404).json({ error: 'No valid new statements found' });
      return;
    }

    // Merge analysis
    const mergedAnalysis = await mergeAnalysisWithExisting(existingAnalysis, newFiles);

    // Update report
    const allStatementIds = [...new Set([...existingStatementIds, ...newStatementIds])];
    updateReport.run(JSON.stringify(mergedAnalysis), JSON.stringify(allStatementIds), report.id);

    // Add new monthly snapshots
    if (mergedAnalysis.monthlyData) {
      const existingMonths = new Set(existingAnalysis.monthlyData?.map((m) => m.month) || []);
      for (const monthData of mergedAnalysis.monthlyData) {
        if (!existingMonths.has(monthData.month)) {
          const snapshotId = uuidv4();
          createMonthlySnapshot.run(
            snapshotId,
            req.userId,
            report.id,
            monthData.month,
            monthData.monthName,
            monthData.beginningBalance,
            monthData.endingBalance,
            monthData.totalDeposits,
            monthData.totalWithdrawals,
            monthData.negativeDays,
            monthData.averageDailyBalance
          );
        }
      }
    }

    res.json({
      message: 'Report updated with new statements',
      report: {
        id: report.id,
        statementIds: allStatementIds,
        analysis: mergedAnalysis,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Add statements error:', error);
    res.status(500).json({ error: 'Failed to add statements to report' });
  }
});

// Get historical monthly data for a user
router.get('/history/monthly', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const snapshots = findMonthlySnapshotsByUserId.all(req.userId);

    res.json({
      monthlyHistory: snapshots.map((s) => ({
        month: s.month,
        monthName: s.month_name,
        beginningBalance: s.beginning_balance,
        endingBalance: s.ending_balance,
        totalDeposits: s.total_deposits,
        totalWithdrawals: s.total_withdrawals,
        negativeDays: s.negative_days,
        averageDailyBalance: s.average_daily_balance,
        createdAt: s.created_at,
      })),
    });
  } catch (error) {
    console.error('Get monthly history error:', error);
    res.status(500).json({ error: 'Failed to get monthly history' });
  }
});

export default router;
