const mongoose = require('mongoose');

// PR Item Schema (Separate Model)
const prItemSchema = new mongoose.Schema({
  prId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PR',
    required: [true, 'PR reference is required']
  },

  itemNumber: {
    type: Number,
    required: [true, 'Item number is required'],
    min: [1, 'Item number must be at least 1']
  },

  description: {
    type: String,
    required: [true, 'Item description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },

  category: {
    type: String,
    required: [true, 'Item category is required'],
    enum: {
      values: ['IT Hardware', 'Software', 'Office Supplies', 'Services', 'Equipment', 'Maintenance'],
      message: 'Please select a valid category'
    }
  },

  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [10000, 'Quantity cannot exceed 10,000']
  },

  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: {
      values: ['Each', 'Piece', 'Set', 'Hour', 'Day', 'Month', 'Year'],
      message: 'Please select a valid unit'
    },
    default: 'Each'
  },

  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative'],
    max: [10000000, 'Unit price cannot exceed 10 million']
  },

  total: {
    type: Number,
    default: function() {
      return this.quantity * this.unitPrice;
    }
  },

  // Additional fields for item tracking
  supplier: {
    type: String,
    trim: true,
    maxlength: [100, 'Supplier name cannot exceed 100 characters']
  },

  deliveryDate: {
    type: Date
  },

  status: {
    type: String,
    enum: {
      values: ['Pending', 'Ordered', 'Delivered', 'Cancelled'],
      message: 'Please select a valid item status'
    },
    default: 'Pending'
  },

  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  },

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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
prItemSchema.index({ prId: 1 });
prItemSchema.index({ category: 1 });
prItemSchema.index({ status: 1 });
prItemSchema.index({ createdDate: -1 });

// Pre-save middleware
prItemSchema.pre('save', function(next) {
  // Recalculate total
  this.total = this.quantity * this.unitPrice;
  this.lastModifiedDate = new Date();
  next();
});

// Static methods
prItemSchema.statics.findByPR = function(prId) {
  return this.find({ prId }).sort({ itemNumber: 1 });
};

prItemSchema.statics.findByCategory = function(category) {
  return this.find({ category });
};

prItemSchema.statics.getTotalByPR = function(prId) {
  return this.aggregate([
    { $match: { prId: mongoose.Types.ObjectId(prId) } },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);
};

// Instance methods
prItemSchema.methods.updateStatus = function(newStatus, updatedBy) {
  this.status = newStatus;
  this.lastModifiedDate = new Date();
  return this.save();
};

module.exports = mongoose.model('PRItem', prItemSchema);
