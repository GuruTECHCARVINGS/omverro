const mongoose = require('mongoose');
const PR = require('../models/prmodel');
const PRItem = require('../models/pritem');
const Attachment = require('../models/attachment');
const Approval = require('../models/approval');

// PR Controller for handling Purchase Request operations
class PRController {

  // Create a new PR
  async createPR(req, res) {
    try {
      const {
        title,
        department,
        requestor,
        costCenter,
        priority,
        requiredDate,
        estimatedBudget,
        currency,
        businessJustification,
        preferredVendor,
        vendorContact,
        vendorEmail,
        vendorPhone,
        vendorNotes,
        directManager,
        financeApprover,
        approverInstructions,
        items,
        attachments,
        approvals
      } = req.body;

      // Validate required fields
      if (!title || !department || !requestor || !costCenter || !businessJustification) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Generate PR number
      const prCount = await PR.countDocuments();
      const prNumber = `PR-${new Date().getFullYear()}-${String(prCount + 1).padStart(6, '0')}`;

      // Create PR document
      const pr = new PR({
        prNumber,
        title,
        department,
        requestor,
        costCenter,
        priority,
        requiredDate,
        estimatedBudget,
        currency,
        businessJustification,
        preferredVendor,
        vendorContact,
        vendorEmail,
        vendorPhone,
        vendorNotes,
        directManager,
        financeApprover,
        approverInstructions,
        createdBy: req.user?.email || 'system',
        items: [],
        attachments: [],
        approvals: []
      });

      // Save PR first to get the ID
      await pr.save();

      // Create items if provided
      if (items && Array.isArray(items) && items.length > 0) {
        const prItems = [];
        for (let i = 0; i < items.length; i++) {
          const itemData = items[i];
          const item = new PRItem({
            ...itemData,
            prId: pr._id,
            itemNumber: i + 1,
            createdBy: req.user?.email || 'system'
          });
          await item.save();
          prItems.push(item._id);
        }
        pr.items = prItems;
      }

      // Create attachments if provided
      if (attachments && Array.isArray(attachments) && attachments.length > 0) {
        const prAttachments = [];
        for (const attachmentData of attachments) {
          const attachment = new Attachment({
            ...attachmentData,
            prId: pr._id,
            uploadedBy: req.user?.email || 'system'
          });
          await attachment.save();
          prAttachments.push(attachment._id);
        }
        pr.attachments = prAttachments;
      }

      // Create approvals if provided
      if (approvals && Array.isArray(approvals) && approvals.length > 0) {
        const prApprovals = [];
        for (let i = 0; i < approvals.length; i++) {
          const approvalData = approvals[i];
          const approval = new Approval({
            ...approvalData,
            prId: pr._id,
            level: i + 1,
            createdBy: req.user?.email || 'system'
          });
          await approval.save();
          prApprovals.push(approval._id);
        }
        pr.approvals = prApprovals;
        pr.totalApprovalLevels = prApprovals.length;
      }

      // Save PR with references
      await pr.save();

      // Return populated PR
      const populatedPR = await pr.getFullDetails();

      res.status(201).json({
        success: true,
        message: 'PR created successfully',
        data: populatedPR
      });

    } catch (error) {
      console.error('Error creating PR:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating PR',
        error: error.message
      });
    }
  }

  // Get all PRs with filtering and pagination
  async getPRs(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        department,
        requestor,
        priority,
        search,
        sortBy = 'createdDate',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter = { isDeleted: false };

      if (status) filter.status = status;
      if (department) filter.department = department;
      if (requestor) filter.requestor = requestor;
      if (priority) filter.priority = priority;

      // Search functionality
      if (search) {
        filter.$or = [
          { prNumber: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { businessJustification: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get PRs with populated data
      const prs = await PR.find(filter)
        .populate('items', 'description category quantity unit unitPrice total status')
        .populate('attachments', 'filename originalName size category uploadDate')
        .populate('approvals', 'level levelName approver status dueDate')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Get total count for pagination
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
      console.error('Error fetching PRs:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching PRs',
        error: error.message
      });
    }
  }

  // Get single PR by ID
  async getPRById(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PR ID'
        });
      }

      const pr = await PR.findById(id).getFullDetails();

      if (!pr || pr.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'PR not found'
        });
      }

      res.json({
        success: true,
        data: pr
      });

    } catch (error) {
      console.error('Error fetching PR:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching PR',
        error: error.message
      });
    }
  }

  // Update PR
  async updatePR(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PR ID'
        });
      }

      const pr = await PR.findById(id);

      if (!pr || pr.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'PR not found'
        });
      }

      // Prevent updates if PR is approved or rejected
      if (['Approved', 'Rejected'].includes(pr.status)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update approved or rejected PR'
        });
      }

      // Update PR fields (exclude arrays which are handled separately)
      const {
        items,
        attachments,
        approvals,
        prNumber,
        createdDate,
        submittedDate,
        approvedDate,
        ...prFields
      } = updateData;

      Object.assign(pr, prFields);
      pr.lastModifiedBy = req.user?.email || 'system';

      // Handle items update if provided
      if (items && Array.isArray(items)) {
        // Remove existing items
        await PRItem.deleteMany({ prId: pr._id });

        // Create new items
        const newItems = [];
        for (let i = 0; i < items.length; i++) {
          const itemData = items[i];
          const item = new PRItem({
            ...itemData,
            prId: pr._id,
            itemNumber: i + 1,
            createdBy: req.user?.email || 'system'
          });
          await item.save();
          newItems.push(item._id);
        }
        pr.items = newItems;
      }

      // Handle attachments update if provided
      if (attachments && Array.isArray(attachments)) {
        // Deactivate existing attachments
        await Attachment.updateMany(
          { prId: pr._id },
          { isActive: false, lastModifiedBy: req.user?.email || 'system' }
        );

        // Create new attachments
        const newAttachments = [];
        for (const attachmentData of attachments) {
          const attachment = new Attachment({
            ...attachmentData,
            prId: pr._id,
            uploadedBy: req.user?.email || 'system'
          });
          await attachment.save();
          newAttachments.push(attachment._id);
        }
        pr.attachments = newAttachments;
      }

      // Handle approvals update if provided
      if (approvals && Array.isArray(approvals)) {
        // Remove existing approvals
        await Approval.deleteMany({ prId: pr._id });

        // Create new approvals
        const newApprovals = [];
        for (let i = 0; i < approvals.length; i++) {
          const approvalData = approvals[i];
          const approval = new Approval({
            ...approvalData,
            prId: pr._id,
            level: i + 1,
            createdBy: req.user?.email || 'system'
          });
          await approval.save();
          newApprovals.push(approval._id);
        }
        pr.approvals = newApprovals;
        pr.totalApprovalLevels = newApprovals.length;
      }

      await pr.save();

      const updatedPR = await pr.getFullDetails();

      res.json({
        success: true,
        message: 'PR updated successfully',
        data: updatedPR
      });

    } catch (error) {
      console.error('Error updating PR:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating PR',
        error: error.message
      });
    }
  }

  // Delete PR (soft delete)
  async deletePR(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PR ID'
        });
      }

      const pr = await PR.findById(id);

      if (!pr || pr.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'PR not found'
        });
      }

      // Prevent deletion if PR is approved
      if (pr.status === 'Approved') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete approved PR'
        });
      }

      // Soft delete
      pr.isDeleted = true;
      pr.deletedDate = new Date();
      pr.deletedBy = req.user?.email || 'system';

      await pr.save();

      res.json({
        success: true,
        message: 'PR deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting PR:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting PR',
        error: error.message
      });
    }
  }

  // Submit PR for approval
  async submitPR(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PR ID'
        });
      }

      const pr = await PR.findById(id).getFullDetails();

      if (!pr || pr.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'PR not found'
        });
      }

      if (pr.status !== 'Draft') {
        return res.status(400).json({
          success: false,
          message: 'Only draft PRs can be submitted'
        });
      }

      // Validate PR has required data
      if (!pr.items || pr.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'PR must have at least one item'
        });
      }

      await pr.submit(req.user?.email || 'system');

      const updatedPR = await pr.getFullDetails();

      res.json({
        success: true,
        message: 'PR submitted for approval successfully',
        data: updatedPR
      });

    } catch (error) {
      console.error('Error submitting PR:', error);
      res.status(500).json({
        success: false,
        message: 'Error submitting PR',
        error: error.message
      });
    }
  }

  // Approve PR
  async approvePR(req, res) {
    try {
      const { id } = req.params;
      const { level, comments } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PR ID'
        });
      }

      const pr = await PR.findById(id);

      if (!pr || pr.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'PR not found'
        });
      }

      await pr.approve(level, req.user?.email || 'system', comments);

      const updatedPR = await pr.getFullDetails();

      res.json({
        success: true,
        message: 'PR approved successfully',
        data: updatedPR
      });

    } catch (error) {
      console.error('Error approving PR:', error);
      res.status(500).json({
        success: false,
        message: 'Error approving PR',
        error: error.message
      });
    }
  }

  // Reject PR
  async rejectPR(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PR ID'
        });
      }

      const pr = await PR.findById(id);

      if (!pr || pr.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'PR not found'
        });
      }

      await pr.reject(reason, req.user?.email || 'system');

      const updatedPR = await pr.getFullDetails();

      res.json({
        success: true,
        message: 'PR rejected successfully',
        data: updatedPR
      });

    } catch (error) {
      console.error('Error rejecting PR:', error);
      res.status(500).json({
        success: false,
        message: 'Error rejecting PR',
        error: error.message
      });
    }
  }

  // Get PR statistics
  async getPRStats(req, res) {
    try {
      const stats = await PR.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: null,
            totalPRs: { $sum: 1 },
            draftPRs: { $sum: { $cond: [{ $eq: ['$status', 'Draft'] }, 1, 0] } },
            submittedPRs: { $sum: { $cond: [{ $eq: ['$status', 'Submitted'] }, 1, 0] } },
            approvedPRs: { $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] } },
            rejectedPRs: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } },
            totalValue: { $sum: '$estimatedBudget' },
            avgValue: { $avg: '$estimatedBudget' }
          }
        }
      ]);

      const departmentStats = await PR.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
            totalValue: { $sum: '$estimatedBudget' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        data: {
          overview: stats[0] || {},
          byDepartment: departmentStats
        }
      });

    } catch (error) {
      console.error('Error fetching PR stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching PR statistics',
        error: error.message
      });
    }
  }

  // Add item to PR
  async addItemToPR(req, res) {
    try {
      const { id } = req.params;
      const itemData = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PR ID'
        });
      }

      const pr = await PR.findById(id);

      if (!pr || pr.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'PR not found'
        });
      }

      if (pr.status === 'Approved') {
        return res.status(400).json({
          success: false,
          message: 'Cannot add items to approved PR'
        });
      }

      await pr.addItem(itemData, req.user?.email || 'system');

      const updatedPR = await pr.getFullDetails();

      res.json({
        success: true,
        message: 'Item added to PR successfully',
        data: updatedPR
      });

    } catch (error) {
      console.error('Error adding item to PR:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding item to PR',
        error: error.message
      });
    }
  }

  // Update PR item
  async updatePRItem(req, res) {
    try {
      const { id, itemId } = req.params;
      const itemData = req.body;

      if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PR ID or Item ID'
        });
      }

      const pr = await PR.findById(id);

      if (!pr || pr.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'PR not found'
        });
      }

      if (pr.status === 'Approved') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update items in approved PR'
        });
      }

      await pr.updateItem(itemId, itemData, req.user?.email || 'system');

      const updatedPR = await pr.getFullDetails();

      res.json({
        success: true,
        message: 'PR item updated successfully',
        data: updatedPR
      });

    } catch (error) {
      console.error('Error updating PR item:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating PR item',
        error: error.message
      });
    }
  }

  // Remove item from PR
  async removePRItem(req, res) {
    try {
      const { id, itemId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PR ID or Item ID'
        });
      }

      const pr = await PR.findById(id);

      if (!pr || pr.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'PR not found'
        });
      }

      if (pr.status === 'Approved') {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove items from approved PR'
        });
      }

      await pr.removeItem(itemId, req.user?.email || 'system');

      const updatedPR = await pr.getFullDetails();

      res.json({
        success: true,
        message: 'Item removed from PR successfully',
        data: updatedPR
      });

    } catch (error) {
      console.error('Error removing PR item:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing PR item',
        error: error.message
      });
    }
  }

  // Add attachment to PR
  async addAttachmentToPR(req, res) {
    try {
      const { id } = req.params;
      const attachmentData = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PR ID'
        });
      }

      const pr = await PR.findById(id);

      if (!pr || pr.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'PR not found'
        });
      }

      await pr.addAttachment(attachmentData, req.user?.email || 'system');

      const updatedPR = await pr.getFullDetails();

      res.json({
        success: true,
        message: 'Attachment added to PR successfully',
        data: updatedPR
      });

    } catch (error) {
      console.error('Error adding attachment to PR:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding attachment to PR',
        error: error.message
      });
    }
  }

  // Remove attachment from PR
  async removeAttachmentFromPR(req, res) {
    try {
      const { id, attachmentId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(attachmentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PR ID or Attachment ID'
        });
      }

      const pr = await PR.findById(id);

      if (!pr || pr.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'PR not found'
        });
      }

      await pr.removeAttachment(attachmentId, req.user?.email || 'system');

      const updatedPR = await pr.getFullDetails();

      res.json({
        success: true,
        message: 'Attachment removed from PR successfully',
        data: updatedPR
      });

    } catch (error) {
      console.error('Error removing attachment from PR:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing attachment from PR',
        error: error.message
      });
    }
  }
}

module.exports = new PRController();
