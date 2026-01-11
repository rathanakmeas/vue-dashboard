import mongoose from 'mongoose';

const budgetTransactionSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['allocation', 'expense', 'transfer', 'adjustment'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['salary', 'supplies', 'equipment', 'utilities', 'maintenance', 'training', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: Date
  }],
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

budgetTransactionSchema.index({ department: 1, date: -1 });
budgetTransactionSchema.index({ status: 1 });

export default mongoose.model('BudgetTransaction', budgetTransactionSchema);
