import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  khmerName: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  
  // Personal Information - Khmer Fields
  bloodType: { type: String, default: '' },
  civilServantId: { type: String, default: '' },
  birthCertificate: { type: String, default: '' },
  nationalId: { type: String, default: '' },
  idCardValidity: { type: String, default: '' },
  idCardExpiryDate: { type: Date, default: null },
  passportNumber: { type: String, default: '' },
  ethnicity: { type: String, default: 'ខ្មែរ' },
  phone2: { type: String, default: '' },
  otherInfo: { type: String, default: '' },
  maritalStatus: { type: String, default: '' },
  physicalCharacteristics: { type: String, default: '' },
  
  birthPlace: {
    province: { type: String, default: '' },
    district: { type: String, default: '' },
    commune: { type: String, default: '' },
    village: { type: String, default: '' }
  },
  
  photo: {
    type: String,
    default: ''
  },
  
  // Contact Information
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  phone: {
    type: String,
    required: true
  },
  alternatePhone: {
    type: String,
    default: ''
  },
  address: {
    province: { type: String, default: '' },
    district: { type: String, default: '' },
    commune: { type: String, default: '' },
    village: { type: String, default: '' },
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: 'Cambodia' }
  },
  
  // Emergency Contact
  emergencyContact: {
    name: { type: String, default: '' },
    gender: { type: String, default: '' },
    relationship: { type: String, default: '' },
    occupation: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  
  // Parent Information
  fatherInfo: {
    name: { type: String, default: '' },
    latinName: { type: String, default: '' },
    dateOfBirth: { type: Date, default: null },
    ethnicity: { type: String, default: 'ខ្មែរ' },
    nationality: { type: String, default: 'ខ្មែរ' },
    occupation: { type: String, default: '' },
    status: { type: String, default: '' },
    birthPlace: {
      province: { type: String, default: '' },
      district: { type: String, default: '' },
      commune: { type: String, default: '' },
      village: { type: String, default: '' }
    }
  },
  
  motherInfo: {
    name: { type: String, default: '' },
    latinName: { type: String, default: '' },
    dateOfBirth: { type: Date, default: null },
    ethnicity: { type: String, default: 'ខ្មែរ' },
    nationality: { type: String, default: 'ខ្មែរ' },
    occupation: { type: String, default: '' },
    status: { type: String, default: '' },
    birthPlace: {
      province: { type: String, default: '' },
      district: { type: String, default: '' },
      commune: { type: String, default: '' },
      village: { type: String, default: '' }
    }
  },
  
  // Spouse Information
  spouseInfo: {
    marriageCertificate: { type: String, default: '' },
    nationalId: { type: String, default: '' },
    name: { type: String, default: '' },
    latinName: { type: String, default: '' },
    dateOfBirth: { type: Date, default: null },
    status: { type: String, default: '' },
    occupation: { type: String, default: '' },
    ethnicity: { type: String, default: 'ខ្មែរ' },
    nationality: { type: String, default: 'ខ្មែរ' },
    workplace: { type: String, default: '' },
    birthPlace: {
      province: { type: String, default: '' },
      district: { type: String, default: '' },
      commune: { type: String, default: '' },
      village: { type: String, default: '' },
      houseNumber: { type: String, default: '' },
      streetNumber: { type: String, default: '' },
      phone: { type: String, default: '' }
    },
    currentResidence: {
      province: { type: String, default: '' },
      district: { type: String, default: '' },
      commune: { type: String, default: '' },
      village: { type: String, default: '' },
      houseNumber: { type: String, default: '' },
      streetNumber: { type: String, default: '' },
      phone: { type: String, default: '' }
    }
  },
  
  // Children
  children: [{
    birthCertificate: { type: String },
    name: { type: String },
    latinName: { type: String },
    gender: { type: String },
    dateOfBirth: { type: Date },
    occupation: { type: String },
    other: { type: String }
  }],
  
  // Employment Information
  department: {
    type: String,
    ref: 'Department',
    required: true
  },
  position: {
    type: String,
    required: true
  },
  additionalPositions: [{
    type: String
  }],
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Intern'],
    default: 'Full-time'
  },
  employmentStatus: {
    type: String,
    enum: ['Active', 'On Leave', 'Suspended', 'Terminated', 'Retired'],
    default: 'Active'
  },
  hireDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    default: null
  },
  probationEndDate: {
    type: Date,
    default: null
  },
  
  // Work Experience
  experience: [{
    company: { type: String, required: true },
    position: { type: String, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    description: { type: String }
  }],
  
  // Family Information
  family: [{
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    dateOfBirth: { type: Date },
    occupation: { type: String },
    phone: { type: String }
  }],
  
  // Documents
  documents: [{
    name: { type: String, required: true },
    type: { type: String },
    size: { type: Number },
    data: { type: String },
    uploadDate: { type: Date, default: Date.now }
  }],
  
  // Compensation
  salary: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    paymentFrequency: { 
      type: String, 
      enum: ['Monthly', 'Bi-weekly', 'Weekly', 'Hourly'],
      default: 'Monthly'
    }
  },
  
  // Work Schedule
  workSchedule: {
    type: {
      type: String,
      enum: ['Day Shift', 'Night Shift', 'Rotating', 'Flexible'],
      default: 'Day Shift'
    },
    hoursPerWeek: { type: Number, default: 40 }
  },
  
  // Qualifications
  education: [{
    course: String,
    trainingCourse: String,
    level: String,
    certificateType: String,
    institution: String,
    startDate: Date,
    endDate: Date,
    other: String,
    fileName: String,
    fileData: String,
    // Legacy fields
    degree: String,
    fieldOfStudy: String,
    graduationYear: Number
  }],
  
  // Languages
  languages: [{
    language: String,
    reading: String,
    speaking: String,
    writing: String,
    other: String,
    // Legacy field
    proficiency: {
      type: String,
      enum: ['Basic', 'Intermediate', 'Fluent', 'Native']
    }
  }],
  
  // Civil Servant Status
  startWorkDate: { type: Date, default: null },
  appointmentDate: { type: Date, default: null },
  civilServantNotes: { type: String, default: '' },
  
  civilStatuses: [{
    letterNo: String,
    letterType: String,
    employeeType: String,
    status: String,
    endDate: Date,
    other: String
  }],
  
  // Rank and Grade
  ranks: [{
    referenceNo: String,
    regulationType: String,
    framework: String,
    rankAndGrade: String,
    payScale: String,
    endDate: Date,
    other: String,
    // Legacy fields
    rankTitle: String,
    level: String,
    effectiveDate: Date,
    letterNo: String,
    fileName: String,
    fileData: String
  }],
  
  // Positions
  positions: [{
    letterNo: String,
    position: String,
    equivalentRank: String,
    signatureDate: Date,
    endDate: Date,
    ministry: String,
    other: String
  }],
  
  // Private Sector Experience
  privateSectors: [{
    organization: String,
    role: String,
    skills: String,
    startDate: Date,
    endDate: Date,
    other: String
  }],
  
  // Recognition/Awards
  recognitions: [{
    referenceNo: String,
    recognitionType: String,
    imageFile: String,
    imageData: String,
    date: Date,
    ministry: String,
    other: String
  }],
  
  // Disciplinary Actions
  disciplinaryActions: [{
    referenceNo: String,
    disciplinaryType: String,
    imageFile: String,
    imageData: String,
    date: Date,
    ministry: String,
    other: String
  }],
  
  certifications: [{
    name: String,
    issuingOrganization: String,
    issueDate: Date,
    expiryDate: Date
  }],
  
  // Skills and Languages
  skills: [String],
  
  // System Fields
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  supervisor: {
    type: String,
    ref: 'Employee',
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  tags: [String],
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
employeeSchema.index({ department: 1, employmentStatus: 1 });
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ firstName: 1, lastName: 1 });

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
employeeSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for years of service
employeeSchema.virtual('yearsOfService').get(function() {
  if (!this.hireDate) return 0;
  const today = new Date();
  const hire = new Date(this.hireDate);
  return ((today - hire) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1);
});

// Ensure virtuals are included in JSON
employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
