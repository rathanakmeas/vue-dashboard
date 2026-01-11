import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    default: 0
  },
  fileType: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['Contract', 'Report', 'Invoice', 'Policy', 'Proposal', 'Presentation', 'Letter', 'Memo', 'Other', ''],
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  // Document tracking fields
  letterNo: {
    type: String,
    default: '',
    index: true
  },
  from: {
    type: String,
    default: ''
  },
  dateline: {
    type: Date,
    default: null
  },
  numberInNo: {
    type: String,
    default: '',
    index: true
  },
  // Storage and metadata
  storage: {
    type: String,
    enum: ['Local Disk', 'Cloud Storage', 'Network Drive', 'Archive'],
    default: 'Local Disk'
  },
  metaTags: [{
    type: String,
    trim: true
  }],
  // Sharing and permissions
  sharedWithRoles: [{
    type: String,
    enum: ['Admin', 'Manager', 'Employee', 'HR', 'Finance', 'IT', 'Guest']
  }],
  sharedWithUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Additional metadata
  department: {
    type: String,
    default: '',
    index: true
  },
  departmentCode: {
    type: String,
    default: '',
    index: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent', ''],
    default: ''
  },
  expiryDate: {
    type: Date,
    default: null
  },
  version: {
    type: Number,
    default: 1
  },
  isShared: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  archivedAt: {
    type: Date,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-populate queries to exclude deleted files
fileSchema.pre('find', function() {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

fileSchema.pre('findOne', function() {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

fileSchema.pre('findOneAndUpdate', function() {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

export default mongoose.model('File', fileSchema);
