const mongoose = require('mongoose');

// Approval Schema (Separate Model)
const approvalSchema = new mongoose.Schema({
  prId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PR',
    required: [true, 'PR reference is required']
  },

  level: {
    type: Number,
    required: [true, 'Approval level is required'],
    min: [1, 'Approval level must be at least 1'],
    max: [10, 'Approval level cannot exceed 10']
  },

  levelName: {
    type: String,
    required: [true, 'Approval level name is required'],
    enum: {
      values: ['Manager', 'Finance', 'Director', 'CEO', 'Department Head', 'Budget Owner', 'Legal', 'Compliance', 'Procurement', 'Executive'],
      message: 'Please select a valid approval level name'
    }
  },

  approver: {
    type: String,
    required: [true, 'Approver name is required'],
    trim: true,
    maxlength: [50, 'Approver name cannot exceed 50 characters']
  },

  approverEmail: {
    type: String,
    required: [true, 'Approver email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },

  approverDepartment: {
    type: String,
    trim: true,
    maxlength: [50, 'Department name cannot exceed 50 characters']
  },

  status: {
    type: String,
    enum: {
      values: ['Pending', 'Approved', 'Rejected', 'Skipped', 'Delegated'],
      message: 'Please select a valid approval status'
    },
    default: 'Pending'
  },

  comments: {
    type: String,
    trim: true,
    maxlength: [500, 'Comments cannot exceed 500 characters']
  },

  approvedDate: {
    type: Date
  },

  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },

  // Delegation support
  delegatedFrom: {
    type: String,
    trim: true
  },

  delegatedTo: {
    type: String,
    trim: true
  },

  delegationReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Delegation reason cannot exceed 200 characters']
  },

  // Escalation tracking
  isEscalated: {
    type: Boolean,
    default: false
  },

  escalatedDate: {
    type: Date
  },

  escalatedBy: {
    type: String,
    trim: true
  },

  escalationReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Escalation reason cannot exceed 200 characters']
  },

  // Reminder system
  reminderSent: {
    type: Boolean,
    default: false
  },

  reminderCount: {
    type: Number,
    default: 0,
    min: [0, 'Reminder count cannot be negative']
  },

  lastReminderDate: {
    type: Date
  },

  // Approval conditions
  approvalConditions: [{
    condition: {
      type: String,
      trim: true,
      maxlength: [100, 'Condition cannot exceed 100 characters']
    },
    isMet: {
      type: Boolean,
      default: false
    },
    metDate: {
      type: Date
    }
  }],

  // Audit fields
  createdBy: {
    type: String,
    required: [true, 'Creator information is required'],
    trim: true
  },

  createdDate: {
    type: Date,
    default: Date.now
  },

  lastModifiedDate: {
    type: Date,
    default: Date.now
  },

  lastModifiedBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
approvalSchema.index({ prId: 1 });
approvalSchema.index({ approverEmail: 1 });
approvalSchema.index({ status: 1 });
approvalSchema.index({ level: 1 });
approvalSchema.index({ dueDate: 1 });
approvalSchema.index({ createdDate: -1 });
approvalSchema.index({ prId: 1, level: 1 }, { unique: true });

// Virtual for days overdue
approvalSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'Pending' && this.dueDate < new Date()) {
    return Math.floor((new Date() - this.dueDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for approval duration
approvalSchema.virtual('approvalDuration').get(function() {
  if (this.approvedDate && this.createdDate) {
    return Math.floor((this.approvedDate - this.createdDate) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Pre-save middleware
approvalSchema.pre('save', function(next) {
  this.lastModifiedDate = new Date();
  next();
});

// Static methods
approvalSchema.statics.findByPR = function(prId) {
  return this.find({ prId }).sort({ level: 1 });
};

approvalSchema.statics.findPendingApprovals = function(approverEmail) {
  return this.find({
    approverEmail,
    status: 'Pending',
    dueDate: { $gte: new Date() }
  }).populate('prId', 'prNumber title department estimatedBudget').sort({ dueDate: 1 });
};

approvalSchema.statics.findOverdueApprovals = function() {
  return this.find({
    status: 'Pending',
    dueDate: { $lt: new Date() }
  }).populate('prId', 'prNumber title department requestor').sort({ dueDate: 1 });
};

approvalSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('prId', 'prNumber title').sort({ createdDate: -1 });
};

approvalSchema.statics.getApprovalStats = function(prId) {
  return this.aggregate([
    { $match: { prId: mongoose.Types.ObjectId(prId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
        approved: { $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } },
        overdue: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$status', 'Pending'] }, { $lt: ['$dueDate', new Date()] }] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

// Instance methods
approvalSchema.methods.approve = function(comments, approvedBy) {
  if (this.status !== 'Pending') {
    throw new Error('Approval already processed');
  }

  this.status = 'Approved';
  this.comments = comments;
  this.approvedDate = new Date();
  this.lastModifiedBy = approvedBy;

  return this.save();
};

approvalSchema.methods.reject = function(comments, rejectedBy) {
  if (this.status !== 'Pending') {
    throw new Error('Approval already processed');
  }

  this.status = 'Rejected';
  this.comments = comments;
  this.approvedDate = new Date();
  this.lastModifiedBy = rejectedBy;

  return this.save();
};

approvalSchema.methods.delegate = function(delegateTo, reason, delegatedBy) {
  if (this.status !== 'Pending') {
    throw new Error('Cannot delegate processed approval');
  }

  this.delegatedFrom = this.approver;
  this.delegatedTo = delegateTo;
  this.delegationReason = reason;
  this.status = 'Delegated';
  this.lastModifiedBy = delegatedBy;

  return this.save();
};

approvalSchema.methods.escalate = function(reason, escalatedBy) {
  this.isEscalated = true;
  this.escalatedDate = new Date();
  this.escalatedBy = escalatedBy;
  this.escalationReason = reason;
  this.lastModifiedBy = escalatedBy;

  return this.save();
};

approvalSchema.methods.sendReminder = function() {
  this.reminderCount += 1;
  this.lastReminderDate = new Date();
  this.reminderSent = true;

  return this.save();
};

module.exports = mongoose.model('Approval', approvalSchema);
