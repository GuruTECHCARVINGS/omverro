const express = require('express');
const router = express.Router();
const prController = require('../controllers/prController');

// PR CRUD Routes

// Create a new PR
router.post('/', prController.createPR);

// Get all PRs with filtering and pagination
router.get('/', prController.getPRs);

// Get single PR by ID
router.get('/:id', prController.getPRById);

// Update PR
router.put('/:id', prController.updatePR);

// Delete PR (soft delete)
router.delete('/:id', prController.deletePR);

// PR Workflow Routes

// Submit PR for approval
router.post('/:id/submit', prController.submitPR);

// Approve PR (can be done by approvers)
router.post('/:id/approve', prController.approvePR);

// Reject PR (can be done by approvers)
router.post('/:id/reject', prController.rejectPR);

// PR Item Management Routes

// Add item to PR
router.post('/:id/items', prController.addItemToPR);

// Update PR item
router.put('/:id/items/:itemId', prController.updatePRItem);

// Remove item from PR
router.delete('/:id/items/:itemId', prController.removePRItem);

// PR Attachment Management Routes

// Add attachment to PR
router.post('/:id/attachments', prController.addAttachmentToPR);

// Remove attachment from PR
router.delete('/:id/attachments/:attachmentId', prController.removeAttachmentFromPR);

// PR Analytics Routes

// Get PR statistics
router.get('/stats/overview', prController.getPRStats);

// Bulk Operations Routes

// Bulk update PR status
router.post('/bulk/status', async (req, res) => {
  try {
    const { prIds, status, reason } = req.body;

    if (!prIds || !Array.isArray(prIds) || prIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'PR IDs array is required'
      });
    }

    const mongoose = require('mongoose');
    const PR = require('../models/prmodel');

    const results = [];
    for (const prId of prIds) {
      if (!mongoose.Types.ObjectId.isValid(prId)) {
        results.push({ prId, success: false, message: 'Invalid PR ID' });
        continue;
      }

      try {
        const pr = await PR.findById(prId);
        if (!pr || pr.isDeleted) {
          results.push({ prId, success: false, message: 'PR not found' });
          continue;
        }

        // Update status based on the requested action
        if (status === 'submit' && pr.status === 'Draft') {
          await pr.submit('system@omverro.com');
          results.push({ prId, success: true, message: 'PR submitted successfully' });
        } else if (status === 'reject' && pr.status === 'Submitted') {
          await pr.reject(reason || 'Bulk rejection', 'system@omverro.com');
          results.push({ prId, success: true, message: 'PR rejected successfully' });
        } else {
          results.push({ prId, success: false, message: `Invalid status transition from ${pr.status} to ${status}` });
        }
      } catch (error) {
        results.push({ prId, success: false, message: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Bulk operation completed',
      data: results
    });

  } catch (error) {
    console.error('Error in bulk status update:', error);
    res.status(500).json({
      success: false,
      message: 'Error in bulk operation',
      error: error.message
    });
  }
});

// Bulk delete PRs
router.post('/bulk/delete', async (req, res) => {
  try {
    const { prIds } = req.body;

    if (!prIds || !Array.isArray(prIds) || prIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'PR IDs array is required'
      });
    }

    const mongoose = require('mongoose');
    const PR = require('../models/prmodel');

    const results = [];
    for (const prId of prIds) {
      if (!mongoose.Types.ObjectId.isValid(prId)) {
        results.push({ prId, success: false, message: 'Invalid PR ID' });
        continue;
      }

      try {
        const pr = await PR.findById(prId);
        if (!pr || pr.isDeleted) {
          results.push({ prId, success: false, message: 'PR not found' });
          continue;
        }

        if (pr.status === 'Approved') {
          results.push({ prId, success: false, message: 'Cannot delete approved PR' });
          continue;
        }

        pr.isDeleted = true;
        pr.deletedDate = new Date();
        pr.deletedBy = 'system@omverro.com';
        await pr.save();

        results.push({ prId, success: true, message: 'PR deleted successfully' });
      } catch (error) {
        results.push({ prId, success: false, message: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Bulk delete operation completed',
      data: results
    });

  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({
      success: false,
      message: 'Error in bulk delete operation',
      error: error.message
    });
  }
});

// Search and Filter Routes

// Advanced search
router.get('/search/advanced', async (req, res) => {
  try {
    const {
      query,
      department,
      status,
      priority,
      dateFrom,
      dateTo,
      budgetMin,
      budgetMax,
      requestor,
      page = 1,
      limit = 10
    } = req.query;

    const mongoose = require('mongoose');
    const PR = require('../models/prmodel');

    // Build search filter
    const filter = { isDeleted: false };

    if (query) {
      filter.$or = [
        { prNumber: { $regex: query, $options: 'i' } },
        { title: { $regex: query, $options: 'i' } },
        { businessJustification: { $regex: query, $options: 'i' } }
      ];
    }

    if (department) filter.department = department;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (requestor) filter.requestor = requestor;

    if (budgetMin || budgetMax) {
      filter.estimatedBudget = {};
      if (budgetMin) filter.estimatedBudget.$gte = parseFloat(budgetMin);
      if (budgetMax) filter.estimatedBudget.$lte = parseFloat(budgetMax);
    }

    if (dateFrom || dateTo) {
      filter.createdDate = {};
      if (dateFrom) filter.createdDate.$gte = new Date(dateFrom);
      if (dateTo) filter.createdDate.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const prs = await PR.find(filter)
      .populate('items', 'description category quantity unit unitPrice total')
      .populate('attachments', 'filename originalName size category')
      .populate('approvals', 'level levelName approver status')
      .sort({ createdDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await PR.countDocuments(filter);

    res.json({
      success: true,
      data: prs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error in advanced search:', error);
    res.status(500).json({
      success: false,
      message: 'Error in advanced search',
      error: error.message
    });
  }
});

// Export Routes

// Export PRs to CSV
router.get('/export/csv', async (req, res) => {
  try {
    const {
      status,
      department,
      dateFrom,
      dateTo
    } = req.query;

    const mongoose = require('mongoose');
    const PR = require('../models/prmodel');

    // Build filter
    const filter = { isDeleted: false };
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (dateFrom || dateTo) {
      filter.createdDate = {};
      if (dateFrom) filter.createdDate.$gte = new Date(dateFrom);
      if (dateTo) filter.createdDate.$lte = new Date(dateTo);
    }

    const prs = await PR.find(filter)
      .populate('items')
      .populate('approvals')
      .lean();

    // Generate CSV content
    let csv = 'PR Number,Title,Department,Requestor,Status,Priority,Estimated Budget,Currency,Created Date\n';

    prs.forEach(pr => {
      csv += `"${pr.prNumber}","${pr.title}","${pr.department}","${pr.requestor}","${pr.status}","${pr.priority}","${pr.estimatedBudget}","${pr.currency}","${pr.createdDate.toISOString().split('T')[0]}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="prs_export.csv"');
    res.send(csv);

  } catch (error) {
    console.error('Error exporting PRs:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting PRs',
      error: error.message
    });
  }
});

// Dashboard Routes

// Get PRs for dashboard
router.get('/dashboard/summary', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const PR = require('../models/prmodel');

    // Get counts by status
    const statusCounts = await PR.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get recent PRs
    const recentPRs = await PR.find({ isDeleted: false })
      .sort({ createdDate: -1 })
      .limit(5)
      .populate('items', 'description total')
      .lean();

    // Get pending approvals for current user (simplified for no auth)
    const pendingApprovals = await PR.find({
      'approvals.status': 'Pending',
      isDeleted: false
    })
    .populate('approvals', 'level levelName status dueDate')
    .limit(10)
    .lean();

    res.json({
      success: true,
      data: {
        statusCounts,
        recentPRs,
        pendingApprovals
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

module.exports = router;
