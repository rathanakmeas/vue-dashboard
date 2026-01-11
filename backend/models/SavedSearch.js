import mongoose from 'mongoose';

const savedSearchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['department', 'file', 'folder', 'user'],
    required: true
  },
  criteria: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

savedSearchSchema.index({ user: 1, type: 1 });

export default mongoose.model('SavedSearch', savedSearchSchema);
