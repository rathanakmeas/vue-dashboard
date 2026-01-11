import mongoose from 'mongoose';

const staffAssignmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  department: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['head', 'staff', 'supervisor', 'assistant'],
    default: 'staff'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: [{
    type: String,
    enum: ['view', 'edit', 'delete', 'manage_staff', 'approve_budget']
  }],
  notes: String
}, {
  timestamps: true
});

staffAssignmentSchema.index({ user: 1, department: 1 });
staffAssignmentSchema.index({ department: 1, isActive: 1 });

export default mongoose.model('StaffAssignment', staffAssignmentSchema);
