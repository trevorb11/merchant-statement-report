import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  createLead,
  findLeadByEmail,
  findLeadById,
  updateLeadStatus,
  updateLeadAnalysisCompleted,
  findAllLeads,
  Lead,
} from '../models/database';

const router = Router();

// Create a new lead (email capture)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, businessName, phone, source } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Check if lead already exists
    const existingLead = findLeadByEmail.get(email);
    if (existingLead) {
      // Return existing lead
      res.json({
        message: 'Welcome back!',
        lead: {
          id: existingLead.id,
          email: existingLead.email,
          businessName: existingLead.business_name,
          phone: existingLead.phone,
        },
        isReturning: true,
      });
      return;
    }

    // Create new lead
    const leadId = uuidv4();
    createLead.run(leadId, email, businessName || null, phone || null, source || 'organic');

    res.status(201).json({
      message: 'Lead captured successfully',
      lead: {
        id: leadId,
        email,
        businessName: businessName || null,
        phone: phone || null,
      },
      isReturning: false,
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ error: 'Failed to capture lead' });
  }
});

// Get lead by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const lead = findLeadById.get(id);

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    res.json({
      lead: {
        id: lead.id,
        email: lead.email,
        businessName: lead.business_name,
        phone: lead.phone,
        analysisCompleted: lead.analysis_completed === 1,
      },
    });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Failed to get lead' });
  }
});

// Mark lead as having completed analysis
router.post('/:id/analysis-completed', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const lead = findLeadById.get(id);

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    updateLeadAnalysisCompleted.run(lead.id);

    res.json({ message: 'Lead updated successfully' });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Update lead status
router.patch('/:id/status', (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const lead = findLeadById.get(id);

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    updateLeadStatus.run(status, lead.id);

    res.json({ message: 'Lead status updated successfully' });
  } catch (error) {
    console.error('Update lead status error:', error);
    res.status(500).json({ error: 'Failed to update lead status' });
  }
});

export default router;
