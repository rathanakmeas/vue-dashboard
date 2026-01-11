import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isShared: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
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

// Auto-populate queries to exclude deleted folders
folderSchema.pre('find', function() {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

folderSchema.pre('findOne', function() {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

folderSchema.pre('findOneAndUpdate', function() {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

export default mongoose.model('Folder', folderSchema);
