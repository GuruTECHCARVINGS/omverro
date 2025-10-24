const mongoose = require('mongoose');

// Main PR Schema (References separate models)
const prSchema = new mongoose.Schema({
  // PR Identification
  prNumber: {
    type: String,
    required: [true, 'PR number is required'],
    unique: true,
    trim: true,
    match: [/^PR-\d{4}-\d{6}$/, 'PR number must follow format PR-YYYY-NNNNNN']
  },

  // PR Header Information
  title: {
    type: String,
    required: [true, 'PR title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },

  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: {
      values: ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Facilities', 'Legal'],
      message: 'Please select a valid department'
    }
  },

  requestor: {
    type: String,
    required: [true, 'Requestor name is required'],
    trim: true,
    maxlength: [50, 'Requestor name cannot exceed 50 characters']
  },

  costCenter: {
    type: String,
    required: [true, 'Cost center is required'],
    trim: true,
    match: [/^CC-\d{4}-\d{3}$/, 'Cost center must follow format CC-YYYY-NNN']
  },

  priority: {
    type: String,
    required: [true, 'Priority is required'],
    enum: {
      values: ['Low', 'Medium', 'High', 'Urgent'],
      message: 'Please select a valid priority level'
    },
    default: 'Medium'
  },

  requiredDate: {
    type: Date,
    required: [true, 'Required date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date();
      },
      message: 'Required date cannot be in the past'
    }
  },

  estimatedBudget: {
    type: Number,
    required: [true, 'Estimated budget is required'],
    min: [0, 'Budget cannot be negative'],
    max: [50000000, 'Budget cannot exceed 5 crore'] // 50 million INR
  },

  currency: {
    type: String,
    enum: {
      values: ['INR', 'USD', 'EUR', 'GBP'],
      message: 'Please select a valid currency'
    },
    default: 'INR'
  },

  businessJustification: {
    type: String,
    required: [true, 'Business justification is required'],
    trim: true,
    maxlength: [500, 'Business justification cannot exceed 500 characters']
  },

  // Vendor Information (Optional)
  preferredVendor: {
    type: String,
    trim: true,
    maxlength: [100, 'Vendor name cannot exceed 100 characters']
  },

  vendorContact: {
    type: String,
    trim: true,
    maxlength: [50, 'Vendor contact name cannot exceed 50 characters']
  },

  vendorEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid vendor email']
  },

  vendorPhone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },

  vendorNotes: {
    type: String,
    trim: true,
    maxlength: [300, 'Vendor notes cannot exceed 300 characters']
  },

  // Approval Information
  directManager: {
    type: String,
    trim: true,
    maxlength: [50, 'Manager name cannot exceed 50 characters']
  },

  financeApprover: {
    type: String,
    trim: true,
    maxlength: [50, 'Finance approver name cannot exceed 50 characters']
  },

  approverInstructions: {
    type: String,
    trim: true,
    maxlength: [300, 'Approver instructions cannot exceed 300 characters']
  },

  // References to separate models (instead of embedded arrays)
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PRItem'
  }],

  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachment'
  }],

  approvals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Approval'
  }],

  // Status and Tracking
  status: {
    type: String,
    enum: {
      values: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Cancelled'],
      message: 'Please select a valid status'
    },
    default: 'Draft'
  },

  // Dates
  createdDate: {
    type: Date,
    default: Date.now
  },

  submittedDate: {
    type: Date
  },

  lastModifiedDate: {
    type: Date,
    default: Date.now
  },

  approvedDate: {
    type: Date
  },

  // Additional Metadata
  createdBy: {
    type: String,
    required: [true, 'Creator information is required'],
    trim: true
  },

  lastModifiedBy: {
    type: String,
    trim: true
  },

  version: {
    type: Number,
    default: 1
  },

  // Comments/Notes
  internalNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Internal notes cannot exceed 1000 characters']
  },

  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },

  // Financial Tracking
  actualSpend: {
    type: Number,
    default: 0,
    min: [0, 'Actual spend cannot be negative']
  },

  budgetVariance: {
    type: Number,
    default: function() {
      return this.estimatedBudget - this.actualSpend;
    }
  },

  // Workflow Tracking
  currentApprovalLevel: {
    type: Number,
    default: 0,
    min: [0, 'Approval level cannot be negative']
  },

  totalApprovalLevels: {
    type: Number,
    default: 0,
    min: [0, 'Total approval levels cannot be negative']
  },

  // Audit Trail
  auditLog: [{
    action: {
      type: String,
      required: true,
      enum: ['Created', 'Updated', 'Submitted', 'Approved', 'Rejected', 'Cancelled', 'Attachment Added', 'Attachment Removed', 'Item Added', 'Item Updated']
    },
    performedBy: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: String,
      trim: true
    },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],

  // Soft Delete
  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedDate: {
    type: Date
  },

  deletedBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
prSchema.index({ prNumber: 1 }, { unique: true });
prSchema.index({ status: 1 });
prSchema.index({ department: 1 });
prSchema.index({ requestor: 1 });
prSchema.index({ createdBy: 1 });
prSchema.index({ createdDate: -1 });
prSchema.index({ requiredDate: 1 });
prSchema.index({ priority: 1 });
prSchema.index({ isDeleted: 1 });

// Virtual for calculated total (populated from items)
prSchema.virtual('calculatedTotal').get(async function() {
  if (!this.items || this.items.length === 0) return 0;

  const PRItem = mongoose.model('PRItem');
  const items = await PRItem.find({ _id: { $in: this.items } });

  return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
});

// Virtual for approval progress
prSchema.virtual('approvalProgress').get(async function() {
  if (!this.approvals || this.approvals.length === 0) return 0;

  const Approval = mongoose.model('Approval');
  const approvals = await Approval.find({ _id: { $in: this.approvals } });

  const approvedCount = approvals.filter(approval => approval.status === 'Approved').length;
  return Math.round((approvedCount / approvals.length) * 100);
});

// Pre-save middleware to update calculated fields
prSchema.pre('save', function(next) {
  // Update last modified date
  this.lastModifiedDate = new Date();

  // Update budget variance
  this.budgetVariance = this.estimatedBudget - this.actualSpend;

  // Add audit log entry for updates
  if (!this.isNew && this.isModified()) {
    const changes = this.getChanges();
    if (Object.keys(changes).length > 0) {
      this.auditLog.push({
        action: 'Updated',
        performedBy: this.lastModifiedBy || 'System',
        timestamp: new Date(),
        details: 'PR updated',
        oldValue: changes.$set,
        newValue: this.toObject()
      });
    }
  }

  next();
});

// Static methods
prSchema.statics.findActive = function() {
  return this.find({ isDeleted: false });
};

prSchema.statics.findByDepartment = function(department) {
  return this.find({ department, isDeleted: false });
};

prSchema.statics.findPendingApprovals = function(userEmail) {
  return this.find({
    'approvals.approverEmail': userEmail,
    'approvals.status': 'Pending',
    isDeleted: false
  });
};

// Instance methods
prSchema.methods.submit = function(submittedBy) {
  if (this.status !== 'Draft') {
    throw new Error('Only draft PRs can be submitted');
  }

  this.status = 'Submitted';
  this.submittedDate = new Date();
  this.lastModifiedBy = submittedBy;

  this.auditLog.push({
    action: 'Submitted',
    performedBy: submittedBy,
    timestamp: new Date(),
    details: 'PR submitted for approval'
  });

  return this.save();
};

prSchema.methods.approve = async function(approvalLevel, approver, comments) {
  const Approval = mongoose.model('Approval');
  const approval = await Approval.findOne({
    prId: this._id,
    level: approvalLevel
  });

  if (!approval) {
    throw new Error('Invalid approval level');
  }

  if (approval.status !== 'Pending') {
    throw new Error('Approval already processed');
  }

  await approval.approve(comments, approver);

  // Check if all approvals are complete
  const allApprovals = await Approval.find({ prId: this._id });
  const allApproved = allApprovals.every(app => app.status === 'Approved');

  if (allApproved) {
    this.status = 'Approved';
    this.approvedDate = new Date();
  }

  this.auditLog.push({
    action: 'Approved',
    performedBy: approver,
    timestamp: new Date(),
    details: `Approval level ${approvalLevel} approved`
  });

  return this.save();
};

prSchema.methods.reject = async function(rejectionReason, rejectedBy) {
  this.status = 'Rejected';
  this.rejectionReason = rejectionReason;
  this.lastModifiedBy = rejectedBy;

  // Mark all pending approvals as skipped
  const Approval = mongoose.model('Approval');
  await Approval.updateMany(
    { prId: this._id, status: 'Pending' },
    { status: 'Skipped', lastModifiedBy: rejectedBy }
  );

  this.auditLog.push({
    action: 'Rejected',
    performedBy: rejectedBy,
    timestamp: new Date(),
    details: `PR rejected: ${rejectionReason}`
  });

  return this.save();
};

prSchema.methods.addAttachment = async function(attachmentData, addedBy) {
  const Attachment = mongoose.model('Attachment');
  const attachment = new Attachment({
    ...attachmentData,
    prId: this._id,
    uploadedBy: addedBy
  });

  await attachment.save();

  this.attachments.push(attachment._id);

  this.auditLog.push({
    action: 'Attachment Added',
    performedBy: addedBy,
    timestamp: new Date(),
    details: `Attachment added: ${attachmentData.originalName}`
  });

  return this.save();
};

prSchema.methods.removeAttachment = async function(attachmentId, removedBy) {
  const attachmentIndex = this.attachments.indexOf(attachmentId);
  if (attachmentIndex === -1) {
    throw new Error('Attachment not found in PR');
  }

  const Attachment = mongoose.model('Attachment');
  const attachment = await Attachment.findById(attachmentId);
  if (!attachment) {
    throw new Error('Attachment not found');
  }

  await attachment.deactivate(removedBy);
  this.attachments.splice(attachmentIndex, 1);

  this.auditLog.push({
    action: 'Attachment Removed',
    performedBy: removedBy,
    timestamp: new Date(),
    details: `Attachment removed: ${attachment.originalName}`
  });

  return this.save();
};

prSchema.methods.addItem = async function(itemData, addedBy) {
  const PRItem = mongoose.model('PRItem');

  // Get next item number
  const existingItems = await PRItem.find({ prId: this._id }).sort({ itemNumber: -1 });
  const nextItemNumber = existingItems.length > 0 ? existingItems[0].itemNumber + 1 : 1;

  const item = new PRItem({
    ...itemData,
    prId: this._id,
    itemNumber: nextItemNumber,
    createdBy: addedBy
  });

  await item.save();

  this.items.push(item._id);

  this.auditLog.push({
    action: 'Item Added',
    performedBy: addedBy,
    timestamp: new Date(),
    details: `Item added: ${itemData.description}`
  });

  return this.save();
};

prSchema.methods.updateItem = async function(itemId, itemData, updatedBy) {
  const PRItem = mongoose.model('PRItem');
  const item = await PRItem.findById(itemId);

  if (!item || !this.items.includes(itemId)) {
    throw new Error('Item not found in PR');
  }

  Object.assign(item, itemData);
  item.lastModifiedDate = new Date();
  await item.save();

  this.auditLog.push({
    action: 'Item Updated',
    performedBy: updatedBy,
    timestamp: new Date(),
    details: `Item updated: ${item.description}`
  });

  return this.save();
};

prSchema.methods.removeItem = async function(itemId, removedBy) {
  const itemIndex = this.items.indexOf(itemId);
  if (itemIndex === -1) {
    throw new Error('Item not found in PR');
  }

  const PRItem = mongoose.model('PRItem');
  await PRItem.findByIdAndDelete(itemId);

  this.items.splice(itemIndex, 1);

  this.auditLog.push({
    action: 'Item Removed',
    performedBy: removedBy,
    timestamp: new Date(),
    details: `Item removed from PR`
  });

  return this.save();
};

prSchema.methods.getFullDetails = function() {
  return this.populate([
    { path: 'items', model: 'PRItem' },
    { path: 'attachments', model: 'Attachment' },
    { path: 'approvals', model: 'Approval' }
  ]);
};

// Export the model
module.exports = mongoose.model('PR', prSchema);
