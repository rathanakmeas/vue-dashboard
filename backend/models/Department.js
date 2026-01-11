import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Leadership', 'Administrative', 'Clinical Support', 'Emergency & Critical Care', 
           'Medical', 'Surgical', 'Surgical Support', 'Outpatient', 'Rehabilitation', 'Dental'],
    required: true
  },
  parent: {
    type: String,
    default: null,
    ref: 'Department'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'closed'],
    default: 'active'
  },
  description: {
    type: String,
    default: ''
  },
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  extension: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  floor: {
    type: String,
    default: ''
  },
  building: {
    type: String,
    default: ''
  },
  staffCount: {
    type: Number,
    default: 0
  },
  budget: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
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

// Update timestamp on save
departmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Department = mongoose.model('Department', departmentSchema);

export default Department;
