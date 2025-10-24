const mongoose = require('mongoose');

// Attachment Schema (Separate Model)
const attachmentSchema = new mongoose.Schema({
  prId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PR',
    required: [true, 'PR reference is required']
  },

  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true
  },

  originalName: {
    type: String,
    required: [true, 'Original filename is required'],
    trim: true
  },

  mimeType: {
    type: String,
    required: [true, 'File type is required'],
    trim: true
  },

  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative'],
    max: [10485760, 'File size cannot exceed 10MB'] // 10MB limit
  },

  path: {
    type: String,
    required: [true, 'File path is required'],
    trim: true
  },

  uploadDate: {
    type: Date,
    default: Date.now
  },

  uploadedBy: {
    type: String,
    required: [true, 'Uploader information is required'],
    trim: true
  },

  // Additional metadata
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },

  category: {
    type: String,
    enum: {
      values: ['Quote', 'Specification', 'Drawing', 'Contract', 'Other'],
      message: 'Please select a valid attachment category'
    },
    default: 'Other'
  },

  version: {
    type: Number,
    default: 1,
    min: [1, 'Version must be at least 1']
  },

  isActive: {
    type: Boolean,
    default: true
  },

  // Security and access control
  accessLevel: {
    type: String,
    enum: {
      values: ['Public', 'Internal', 'Confidential'],
      message: 'Please select a valid access level'
    },
    default: 'Internal'
  },

  // Audit fields
  lastAccessedDate: {
    type: Date
  },

  lastAccessedBy: {
    type: String,
    trim: true
  },

  downloadCount: {
    type: Number,
    default: 0,
    min: [0, 'Download count cannot be negative']
  },

  createdDate: {
    type: Date,
    default: Date.now
  },

  lastModifiedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
attachmentSchema.index({ prId: 1 });
attachmentSchema.index({ uploadedBy: 1 });
attachmentSchema.index({ category: 1 });
attachmentSchema.index({ isActive: 1 });
attachmentSchema.index({ uploadDate: -1 });
attachmentSchema.index({ filename: 1 });

// Virtual for file size in human readable format
attachmentSchema.virtual('sizeFormatted').get(function() {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (this.size === 0) return '0 Bytes';
  const i = parseInt(Math.floor(Math.log(this.size) / Math.log(1024)));
  return Math.round(this.size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Pre-save middleware
attachmentSchema.pre('save', function(next) {
  this.lastModifiedDate = new Date();
  next();
});

// Static methods
attachmentSchema.statics.findByPR = function(prId) {
  return this.find({ prId, isActive: true }).sort({ uploadDate: -1 });
};

attachmentSchema.statics.findByUploader = function(uploadedBy) {
  return this.find({ uploadedBy, isActive: true }).sort({ uploadDate: -1 });
};

attachmentSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ uploadDate: -1 });
};

attachmentSchema.statics.getStatsByPR = function(prId) {
  return this.aggregate([
    { $match: { prId: mongoose.Types.ObjectId(prId), isActive: true } },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        totalSize: { $sum: '$size' },
        categories: { $addToSet: '$category' }
      }
    }
  ]);
};

// Instance methods
attachmentSchema.methods.recordDownload = function(downloadedBy) {
  this.downloadCount += 1;
  this.lastAccessedDate = new Date();
  this.lastAccessedBy = downloadedBy;
  return this.save();
};

attachmentSchema.methods.deactivate = function(deactivatedBy) {
  this.isActive = false;
  this.lastModifiedDate = new Date();
  return this.save();
};

attachmentSchema.methods.updateVersion = function(newVersion, updatedBy) {
  this.version = newVersion;
  this.lastModifiedDate = new Date();
  return this.save();
};

module.exports = mongoose.model('Attachment', attachmentSchema);
