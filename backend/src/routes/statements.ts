import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../middleware/auth';
import {
  createStatement,
  findStatementsByUserId,
  findStatementById,
  deleteStatement,
  Statement,
} from '../models/database';
import { analyzeStatements, FileInput } from '../services/claudeService';

const router = Router();

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
    files: 10, // Max 10 files at once
  },
});

// Upload statements (authenticated)
router.post(
  '/upload',
  authMiddleware,
  upload.array('files', 10),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      const uploadedStatements: Statement[] = [];

      for (const file of files) {
        const statementId = uuidv4();
        createStatement.run(
          statementId,
          req.userId,
          file.originalname,
          file.path,
          file.mimetype,
          file.size
        );

        uploadedStatements.push({
          id: statementId,
          user_id: req.userId,
          file_name: file.originalname,
          file_path: file.path,
          file_type: file.mimetype,
          file_size: file.size,
          uploaded_at: new Date().toISOString(),
        });
      }

      res.status(201).json({
        message: 'Files uploaded successfully',
        statements: uploadedStatements.map((s) => ({
          id: s.id,
          fileName: s.file_name,
          fileType: s.file_type,
          fileSize: s.file_size,
          uploadedAt: s.uploaded_at,
        })),
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload files' });
    }
  }
);

// Get all statements for current user
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const statements = findStatementsByUserId.all(req.userId);

    res.json({
      statements: statements.map((s) => ({
        id: s.id,
        fileName: s.file_name,
        fileType: s.file_type,
        fileSize: s.file_size,
        uploadedAt: s.uploaded_at,
      })),
    });
  } catch (error) {
    console.error('Get statements error:', error);
    res.status(500).json({ error: 'Failed to get statements' });
  }
});

// Delete a statement
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const statement = findStatementById.get(req.params.id);

    if (!statement) {
      res.status(404).json({ error: 'Statement not found' });
      return;
    }

    if (statement.user_id !== req.userId) {
      res.status(403).json({ error: 'Not authorized to delete this statement' });
      return;
    }

    // Delete file from disk
    if (fs.existsSync(statement.file_path)) {
      fs.unlinkSync(statement.file_path);
    }

    // Delete from database
    deleteStatement.run(statement.id);

    res.json({ message: 'Statement deleted successfully' });
  } catch (error) {
    console.error('Delete statement error:', error);
    res.status(500).json({ error: 'Failed to delete statement' });
  }
});

// Analyze statements (authenticated - uses stored files)
router.post('/analyze', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { statementIds } = req.body;

    if (!statementIds || !Array.isArray(statementIds) || statementIds.length === 0) {
      res.status(400).json({ error: 'Statement IDs are required' });
      return;
    }

    // Get statements
    const statements: Statement[] = [];
    for (const id of statementIds) {
      const statement = findStatementById.get(id);
      if (statement && statement.user_id === req.userId) {
        statements.push(statement);
      }
    }

    if (statements.length === 0) {
      res.status(404).json({ error: 'No valid statements found' });
      return;
    }

    // Prepare files for analysis
    const files: FileInput[] = statements.map((s) => ({
      filePath: s.file_path,
      fileName: s.file_name,
      fileType: s.file_type,
    }));

    // Run analysis
    const analysis = await analyzeStatements(files);

    res.json({
      message: 'Analysis completed successfully',
      analysis,
      analyzedStatements: statements.map((s) => s.id),
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze statements' });
  }
});

// Quick analyze (no auth required - for demo/landing page)
// Files are uploaded temporarily and deleted after analysis
router.post(
  '/quick-analyze',
  optionalAuthMiddleware,
  upload.array('files', 10),
  async (req: AuthRequest, res: Response) => {
    const files = req.files as Express.Multer.File[];

    try {
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      // Prepare files for analysis
      const fileInputs: FileInput[] = files.map((f) => ({
        filePath: f.path,
        fileName: f.originalname,
        fileType: f.mimetype,
      }));

      // Run analysis
      const analysis = await analyzeStatements(fileInputs);

      // If user is authenticated, save the statements
      if (req.userId) {
        for (const file of files) {
          const statementId = uuidv4();
          createStatement.run(
            statementId,
            req.userId,
            file.originalname,
            file.path,
            file.mimetype,
            file.size
          );
        }
      } else {
        // Delete temporary files if not authenticated
        for (const file of files) {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }

      res.json({
        message: 'Analysis completed successfully',
        analysis,
        saved: !!req.userId,
      });
    } catch (error) {
      // Clean up files on error
      if (files) {
        for (const file of files) {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }

      console.error('Quick analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze statements' });
    }
  }
);

export default router;
