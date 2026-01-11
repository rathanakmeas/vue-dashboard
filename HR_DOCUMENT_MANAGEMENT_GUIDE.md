# 📚 HR Document Management Implementation Guide

> **Created:** January 10, 2026  
> **Purpose:** Step-by-step guide to enhance HR Document Management System  
> **Estimated Time:** 2-4 weeks for full implementation

---

## 📋 Table of Contents

1. [Current System Analysis](#current-system-analysis)
2. [Phase 1: Foundation - File Storage Migration](#phase-1-foundation---file-storage-migration)
3. [Phase 2: Enhanced Features](#phase-2-enhanced-features)
4. [Phase 3: Advanced Features](#phase-3-advanced-features)
5. [Phase 4: Cloud Storage (Optional)](#phase-4-cloud-storage-optional)
6. [Testing Checklist](#testing-checklist)
7. [Troubleshooting](#troubleshooting)

---

## 🔍 Current System Analysis

### Strengths
- ✅ Existing File Management system with folders and categories
- ✅ Employee model supports document arrays
- ✅ File model has comprehensive metadata tracking
- ✅ Supports sharing permissions and archiving

### Weaknesses
- ⚠️ Documents stored as base64 in MongoDB (performance issues)
- ⚠️ No document expiry tracking
- ⚠️ No approval workflows
- ⚠️ No version control
- ⚠️ Missing document lifecycle management

---

## 🚀 PHASE 1: Foundation - File Storage Migration

### **Step 1.1: Update Employee Model Schema**

**File:** `backend/models/Employee.js`

**Current Code (Line ~128):**
```javascript
// Documents
documents: [{
  name: { type: String, required: true },
  type: { type: String },
  size: { type: Number },
  data: { type: String },  // ❌ BASE64 - REMOVE THIS
  uploadDate: { type: Date, default: Date.now }
}],
```

**Replace With:**
```javascript
// Enhanced Documents with file URL storage
documents: [{
  // Basic Information
  title: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    enum: [
      'National ID',
      'Passport', 
      'Contract', 
      'Certificate', 
      'Medical Record',
      'Performance Review', 
      'Disciplinary', 
      'Training Certificate', 
      'Leave Request',
      'Resignation Letter',
      'Reference Letter',
      'Other'
    ],
    required: true 
  },
  
  // File Storage (URL instead of base64)
  fileUrl: { 
    type: String, 
    required: true 
  },  // Path to file on disk or cloud
  fileName: { 
    type: String, 
    required: true 
  },
  fileType: { 
    type: String 
  },  // MIME type: application/pdf, image/jpeg, etc.
  fileSize: { 
    type: Number 
  },  // Size in bytes
  
  // Document Lifecycle
  issueDate: { 
    type: Date 
  },  // When document was issued
  expiryDate: { 
    type: Date 
  },  // Important for IDs, contracts, certifications
  renewalRequired: { 
    type: Boolean, 
    default: false 
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: ['Draft', 'Pending Review', 'Approved', 'Rejected', 'Archived', 'Expired'],
    default: 'Approved'
  },
  
  // Approval Workflow
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  approvedAt: { 
    type: Date 
  },
  rejectedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  rejectedAt: { 
    type: Date 
  },
  rejectionReason: { 
    type: String 
  },
  
  // Security & Compliance
  confidentialityLevel: {
    type: String,
    enum: ['Public', 'Internal', 'Confidential', 'Highly Confidential'],
    default: 'Confidential'
  },
  viewPermissions: [{
    type: String,
    enum: ['Admin', 'HR', 'Manager', 'Employee', 'Finance']
  }],
  
  // Additional Metadata
  letterNo: { 
    type: String 
  },  // For official documents
  version: { 
    type: Number, 
    default: 1 
  },
  notes: { 
    type: String 
  },
  tags: [{ 
    type: String 
  }],
  
  // Soft Delete
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  deletedAt: { 
    type: Date 
  },
  deletedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}],

// Document History for Version Control
documentHistory: [{
  documentId: { type: String },
  title: { type: String },
  action: { 
    type: String, 
    enum: ['Created', 'Updated', 'Deleted', 'Approved', 'Rejected', 'Restored'] 
  },
  performedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  performedAt: { 
    type: Date, 
    default: Date.now 
  },
  changes: { type: String },  // Description of what changed
  previousFileUrl: { type: String },  // Link to previous version
  metadata: { type: mongoose.Schema.Types.Mixed }  // Additional data
}],
```

**Why This Change:**
- ✅ Stores file path instead of base64 (better performance)
- ✅ Adds expiry tracking for compliance
- ✅ Supports approval workflows
- ✅ Tracks document lifecycle
- ✅ Maintains audit trail

---

### **Step 1.2: Create File Upload Utility**

**Create New File:** `backend/utils/fileUpload.js`

```javascript
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const employeeId = req.body.employeeId || 'temp';
    const category = req.body.category || 'other';
    
    // Create organized folder structure
    const uploadPath = path.join(
      process.cwd(), 
      'uploads', 
      'employees', 
      employeeId,
      category.toLowerCase().replace(/\s+/g, '-')
    );
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp_originalname
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, PNG, DOC, DOCX, XLS, XLSX allowed.'), false);
  }
};

// Create multer upload instance
export const uploadDocument = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024  // 10MB limit
  }
});

// Helper function to delete file
export const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};

// Helper function to get file size
export const getFileSize = (filePath) => {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    return stats.size;
  }
  return 0;
};

// Helper function to format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
```

---

### **Step 1.3: Update Employee Controller**

**File:** `backend/controllers/employeeController.js`

**Add these new functions:**

```javascript
import { uploadDocument, deleteFile } from '../utils/fileUpload.js';
import path from 'path';

// Upload document for employee
export const uploadEmployeeDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, issueDate, expiryDate, notes, confidentialityLevel } = req.body;
    
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Create document object
    const newDocument = {
      title,
      category,
      fileUrl: `/uploads/employees/${employee.employeeId}/${category.toLowerCase().replace(/\s+/g, '-')}/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      issueDate: issueDate ? new Date(issueDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      renewalRequired: expiryDate ? true : false,
      status: 'Pending Review',
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
      confidentialityLevel: confidentialityLevel || 'Confidential',
      viewPermissions: ['Admin', 'HR'],
      notes,
      version: 1,
      isDeleted: false
    };
    
    // Add to employee documents
    employee.documents.push(newDocument);
    
    // Add to document history
    employee.documentHistory.push({
      documentId: employee.documents[employee.documents.length - 1]._id,
      title,
      action: 'Created',
      performedBy: req.user._id,
      performedAt: new Date(),
      changes: `Document "${title}" uploaded`,
      metadata: { category, fileName: req.file.originalname }
    });
    
    await employee.save();
    
    res.status(201).json({
      message: 'Document uploaded successfully',
      document: employee.documents[employee.documents.length - 1]
    });
    
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Failed to upload document', error: error.message });
  }
};

// Approve document
export const approveDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const document = employee.documents.id(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    document.status = 'Approved';
    document.approvedBy = req.user._id;
    document.approvedAt = new Date();
    
    // Add to history
    employee.documentHistory.push({
      documentId: documentId,
      title: document.title,
      action: 'Approved',
      performedBy: req.user._id,
      performedAt: new Date(),
      changes: `Document approved by ${req.user.firstName} ${req.user.lastName}`
    });
    
    await employee.save();
    
    res.json({ message: 'Document approved', document });
    
  } catch (error) {
    console.error('Approve document error:', error);
    res.status(500).json({ message: 'Failed to approve document', error: error.message });
  }
};

// Reject document
export const rejectDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    const { reason } = req.body;
    
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const document = employee.documents.id(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    document.status = 'Rejected';
    document.rejectedBy = req.user._id;
    document.rejectedAt = new Date();
    document.rejectionReason = reason;
    
    // Add to history
    employee.documentHistory.push({
      documentId: documentId,
      title: document.title,
      action: 'Rejected',
      performedBy: req.user._id,
      performedAt: new Date(),
      changes: `Document rejected: ${reason}`
    });
    
    await employee.save();
    
    res.json({ message: 'Document rejected', document });
    
  } catch (error) {
    console.error('Reject document error:', error);
    res.status(500).json({ message: 'Failed to reject document', error: error.message });
  }
};

// Delete document
export const deleteEmployeeDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const document = employee.documents.id(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Delete physical file
    const filePath = path.join(process.cwd(), document.fileUrl);
    deleteFile(filePath);
    
    // Soft delete
    document.isDeleted = true;
    document.deletedAt = new Date();
    document.deletedBy = req.user._id;
    
    // Add to history
    employee.documentHistory.push({
      documentId: documentId,
      title: document.title,
      action: 'Deleted',
      performedBy: req.user._id,
      performedAt: new Date(),
      changes: `Document deleted`
    });
    
    await employee.save();
    
    res.json({ message: 'Document deleted successfully' });
    
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Failed to delete document', error: error.message });
  }
};

// Get expiring documents
export const getExpiringDocuments = async (req, res) => {
  try {
    const daysAhead = parseInt(req.query.days) || 30;
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);
    
    const employees = await Employee.find({
      'documents.expiryDate': {
        $gte: today,
        $lte: futureDate
      },
      'documents.isDeleted': false
    }).select('employeeId firstName lastName documents');
    
    // Filter and format expiring documents
    const expiringDocs = [];
    employees.forEach(emp => {
      emp.documents.forEach(doc => {
        if (doc.expiryDate && 
            doc.expiryDate >= today && 
            doc.expiryDate <= futureDate &&
            !doc.isDeleted) {
          expiringDocs.push({
            employeeId: emp.employeeId,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            documentTitle: doc.title,
            category: doc.category,
            expiryDate: doc.expiryDate,
            daysUntilExpiry: Math.ceil((doc.expiryDate - today) / (1000 * 60 * 60 * 24))
          });
        }
      });
    });
    
    // Sort by expiry date
    expiringDocs.sort((a, b) => a.expiryDate - b.expiryDate);
    
    res.json({
      total: expiringDocs.length,
      documents: expiringDocs
    });
    
  } catch (error) {
    console.error('Get expiring documents error:', error);
    res.status(500).json({ message: 'Failed to retrieve expiring documents', error: error.message });
  }
};

// Download document
export const downloadDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const document = employee.documents.id(documentId);
    if (!document || document.isDeleted) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    const filePath = path.join(process.cwd(), document.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    res.download(filePath, document.fileName);
    
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ message: 'Failed to download document', error: error.message });
  }
};
```

---

### **Step 1.4: Update Routes**

**File:** `backend/routes/employees.js` (or wherever your employee routes are)

```javascript
import { uploadDocument } from '../utils/fileUpload.js';
import { 
  uploadEmployeeDocument,
  approveDocument,
  rejectDocument,
  deleteEmployeeDocument,
  getExpiringDocuments,
  downloadDocument
} from '../controllers/employeeController.js';

// Document routes
router.post('/:id/documents', uploadDocument.single('file'), uploadEmployeeDocument);
router.patch('/:id/documents/:documentId/approve', approveDocument);
router.patch('/:id/documents/:documentId/reject', rejectDocument);
router.delete('/:id/documents/:documentId', deleteEmployeeDocument);
router.get('/:id/documents/:documentId/download', downloadDocument);
router.get('/documents/expiring', getExpiringDocuments);
```

---

### **Step 1.5: Create Upload Directory Structure**

Run this in PowerShell terminal:

```powershell
# Create directory structure
$basePath = "e:\hris\vue-dashboard\backend\uploads\employees"

# Create category folders
$categories = @(
    "national-id",
    "passport",
    "contract",
    "certificate",
    "medical-record",
    "performance-review",
    "disciplinary",
    "training-certificate",
    "leave-request",
    "resignation-letter",
    "reference-letter",
    "other"
)

foreach ($category in $categories) {
    $path = Join-Path $basePath $category
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force
        Write-Host "Created: $path" -ForegroundColor Green
    }
}

Write-Host "`nDirectory structure created successfully!" -ForegroundColor Cyan
```

---

### **Step 1.6: Update Server.js to Serve Static Files**

**File:** `backend/server.js`

Add this line after other middleware:

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

---

## 🎨 PHASE 2: Enhanced Features

### **Step 2.1: Update Frontend - Document Upload Component**

**File:** `src/views/Employees.vue`

In the documents section, update to use new enhanced structure:

```vue
<!-- Enhanced Documents Section in Step 4 -->
<div class="form-section">
  <h4 class="section-title">
    <i class="pi pi-file"></i> Employee Documents
  </h4>
  
  <!-- Upload Form -->
  <div class="add-position-form">
    <div class="form-row">
      <div class="form-group">
        <label>Document Title *</label>
        <input v-model="newDocument.title" type="text" placeholder="e.g., Work Contract 2026" />
      </div>
      
      <div class="form-group">
        <label>Category *</label>
        <select v-model="newDocument.category">
          <option value="">Select Category</option>
          <option value="National ID">National ID</option>
          <option value="Passport">Passport</option>
          <option value="Contract">Contract</option>
          <option value="Certificate">Certificate</option>
          <option value="Medical Record">Medical Record</option>
          <option value="Performance Review">Performance Review</option>
          <option value="Disciplinary">Disciplinary</option>
          <option value="Training Certificate">Training Certificate</option>
          <option value="Leave Request">Leave Request</option>
          <option value="Resignation Letter">Resignation Letter</option>
          <option value="Reference Letter">Reference Letter</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label>Issue Date</label>
        <Calendar v-model="newDocument.issueDate" dateFormat="yy-mm-dd" showIcon />
      </div>
      
      <div class="form-group">
        <label>Expiry Date</label>
        <Calendar v-model="newDocument.expiryDate" dateFormat="yy-mm-dd" showIcon />
      </div>
      
      <div class="form-group">
        <label>Confidentiality Level</label>
        <select v-model="newDocument.confidentialityLevel">
          <option value="Internal">Internal</option>
          <option value="Confidential">Confidential</option>
          <option value="Highly Confidential">Highly Confidential</option>
        </select>
      </div>
    </div>
    
    <div class="form-group">
      <label>Notes</label>
      <textarea v-model="newDocument.notes" rows="2" placeholder="Additional notes..."></textarea>
    </div>
    
    <div class="form-group">
      <label>Upload File *</label>
      <input 
        ref="documentFileInput"
        type="file" 
        @change="handleDocumentFileUpload"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
      />
      <small>Allowed: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX (Max 10MB)</small>
      <div v-if="newDocument.fileName" class="file-preview">
        <i class="pi pi-file"></i>
        <span>{{ newDocument.fileName }}</span>
        <button type="button" @click="removeDocumentFile" class="btn-remove-file">
          <i class="pi pi-times"></i>
        </button>
      </div>
    </div>
    
    <button type="button" @click="addDocument" class="btn-add">
      <i class="pi pi-plus"></i> Add Document
    </button>
  </div>
  
  <!-- Document List with Enhanced Display -->
  <div v-if="formData.documents.length > 0" class="positions-list">
    <div 
      v-for="(doc, index) in formData.documents.filter(d => !d.isDeleted)" 
      :key="index" 
      class="position-card document-card"
      :class="{
        'expired': doc.expiryDate && new Date(doc.expiryDate) < new Date(),
        'expiring-soon': doc.expiryDate && isExpiringSoon(doc.expiryDate),
        'pending': doc.status === 'Pending Review',
        'rejected': doc.status === 'Rejected'
      }"
    >
      <div class="position-header">
        <div class="doc-title-section">
          <h5>
            <i :class="getDocumentIcon(doc.category)"></i>
            {{ doc.title }}
          </h5>
          <Tag :value="doc.category" :severity="getCategorySeverity(doc.category)" />
          <Tag 
            v-if="doc.status" 
            :value="doc.status" 
            :severity="getStatusSeverity(doc.status)" 
          />
        </div>
        <button type="button" @click="removeDocument(index)" class="btn-remove">
          <i class="pi pi-trash"></i>
        </button>
      </div>
      
      <div class="position-details">
        <div class="detail-row">
          <span class="label"><i class="pi pi-file"></i> File:</span>
          <span class="value">{{ doc.fileName }}</span>
        </div>
        
        <div class="detail-row" v-if="doc.fileSize">
          <span class="label"><i class="pi pi-info-circle"></i> Size:</span>
          <span class="value">{{ formatFileSize(doc.fileSize) }}</span>
        </div>
        
        <div class="detail-row" v-if="doc.issueDate">
          <span class="label"><i class="pi pi-calendar"></i> Issue Date:</span>
          <span class="value">{{ formatDate(doc.issueDate) }}</span>
        </div>
        
        <div class="detail-row" v-if="doc.expiryDate">
          <span class="label">
            <i class="pi pi-clock"></i> Expiry Date:
          </span>
          <span class="value" :class="{ 'text-danger': isExpired(doc.expiryDate), 'text-warning': isExpiringSoon(doc.expiryDate) }">
            {{ formatDate(doc.expiryDate) }}
            <span v-if="isExpired(doc.expiryDate)" class="expired-badge">EXPIRED</span>
            <span v-else-if="isExpiringSoon(doc.expiryDate)" class="expiring-badge">
              Expires in {{ daysUntilExpiry(doc.expiryDate) }} days
            </span>
          </span>
        </div>
        
        <div class="detail-row" v-if="doc.confidentialityLevel">
          <span class="label"><i class="pi pi-lock"></i> Confidentiality:</span>
          <span class="value">{{ doc.confidentialityLevel }}</span>
        </div>
        
        <div class="detail-row" v-if="doc.notes">
          <span class="label"><i class="pi pi-comment"></i> Notes:</span>
          <span class="value">{{ doc.notes }}</span>
        </div>
        
        <div class="detail-row" v-if="doc.rejectionReason">
          <span class="label text-danger"><i class="pi pi-times-circle"></i> Rejection Reason:</span>
          <span class="value text-danger">{{ doc.rejectionReason }}</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Add these helper methods in script:**

```javascript
// Document helper methods
const getDocumentIcon = (category) => {
  const icons = {
    'National ID': 'pi pi-id-card',
    'Passport': 'pi pi-globe',
    'Contract': 'pi pi-file-edit',
    'Certificate': 'pi pi-verified',
    'Medical Record': 'pi pi-heart',
    'Performance Review': 'pi pi-chart-line',
    'Disciplinary': 'pi pi-exclamation-triangle',
    'Training Certificate': 'pi pi-book',
    'Leave Request': 'pi pi-calendar-times',
    'Resignation Letter': 'pi pi-sign-out',
    'Reference Letter': 'pi pi-envelope'
  };
  return icons[category] || 'pi pi-file';
};

const getCategorySeverity = (category) => {
  const severity = {
    'National ID': 'info',
    'Passport': 'info',
    'Contract': 'warning',
    'Certificate': 'success',
    'Medical Record': 'danger',
    'Performance Review': 'info',
    'Disciplinary': 'danger',
    'Training Certificate': 'success',
    'Leave Request': 'warning',
    'Resignation Letter': 'danger',
    'Reference Letter': 'info'
  };
  return severity[category] || 'secondary';
};

const getStatusSeverity = (status) => {
  const severity = {
    'Draft': 'secondary',
    'Pending Review': 'warning',
    'Approved': 'success',
    'Rejected': 'danger',
    'Archived': 'info',
    'Expired': 'danger'
  };
  return severity[status] || 'secondary';
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const isExpired = (expiryDate) => {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
};

const isExpiringSoon = (expiryDate) => {
  if (!expiryDate) return false;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntil = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  return daysUntil > 0 && daysUntil <= 30;
};

const daysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return 0;
  const today = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry - expiry) / (1000 * 60 * 60 * 24));
};

// Update newDocument ref
const newDocument = ref({
  title: '',
  category: '',
  issueDate: null,
  expiryDate: null,
  confidentialityLevel: 'Confidential',
  notes: '',
  fileName: '',
  fileData: null
});

// File upload handler (modified for FormData)
const handleDocumentFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      toast.add({ 
        severity: 'warn', 
        summary: 'File Too Large', 
        detail: 'File must be less than 10MB', 
        life: 3000 
      });
      return;
    }
    
    newDocument.value.fileName = file.name;
    newDocument.value.fileData = file;  // Store actual File object
    newDocument.value.fileSize = file.size;
    newDocument.value.fileType = file.type;
  }
};

// Add document (modified to use FormData)
const addDocument = async () => {
  if (!newDocument.value.title || !newDocument.value.category || !newDocument.value.fileData) {
    toast.add({ 
      severity: 'warn', 
      summary: 'Missing Information', 
      detail: 'Please fill title, category, and upload a file', 
      life: 3000 
    });
    return;
  }
  
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('file', newDocument.value.fileData);
  formData.append('title', newDocument.value.title);
  formData.append('category', newDocument.value.category);
  formData.append('employeeId', selectedEmployee.value.employeeId);
  
  if (newDocument.value.issueDate) {
    formData.append('issueDate', newDocument.value.issueDate.toISOString());
  }
  if (newDocument.value.expiryDate) {
    formData.append('expiryDate', newDocument.value.expiryDate.toISOString());
  }
  if (newDocument.value.notes) {
    formData.append('notes', newDocument.value.notes);
  }
  if (newDocument.value.confidentialityLevel) {
    formData.append('confidentialityLevel', newDocument.value.confidentialityLevel);
  }
  
  try {
    // Upload to backend
    const response = await api.post(
      `/employees/${selectedEmployee.value._id}/documents`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    // Add returned document to local array
    formData.documents.push(response.data.document);
    
    // Reset form
    newDocument.value = {
      title: '',
      category: '',
      issueDate: null,
      expiryDate: null,
      confidentialityLevel: 'Confidential',
      notes: '',
      fileName: '',
      fileData: null
    };
    
    if (documentFileInput.value) {
      documentFileInput.value.value = '';
    }
    
    toast.add({ 
      severity: 'success', 
      summary: 'Success', 
      detail: 'Document uploaded successfully', 
      life: 2000 
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    toast.add({ 
      severity: 'error', 
      summary: 'Upload Failed', 
      detail: error.response?.data?.message || 'Failed to upload document', 
      life: 3000 
    });
  }
};
```

**Add CSS for document cards:**

```css
/* Enhanced Document Cards */
.document-card {
  border-left: 4px solid #0288D1;
}

.document-card.expired {
  border-left-color: #f44336;
  background: #ffebee;
}

.document-card.expiring-soon {
  border-left-color: #ff9800;
  background: #fff3e0;
}

.document-card.pending {
  border-left-color: #ff9800;
}

.document-card.rejected {
  border-left-color: #f44336;
  background: #ffebee;
}

.doc-title-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.doc-title-section h5 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.text-danger {
  color: #f44336 !important;
}

.text-warning {
  color: #ff9800 !important;
}

.expired-badge,
.expiring-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.expired-badge {
  background: #f44336;
  color: white;
}

.expiring-badge {
  background: #ff9800;
  color: white;
}
```

---

## ⚡ PHASE 3: Advanced Features

### **Step 3.1: Document Expiry Notification System**

**Create New File:** `backend/utils/documentExpiryChecker.js`

```javascript
import Employee from '../models/Employee.js';
import nodemailer from 'nodemailer';
import cron from 'node-cron';

// Email configuration
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Check for expiring documents
export const checkExpiringDocuments = async () => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    // Find employees with expiring documents
    const employees = await Employee.find({
      'documents.expiryDate': {
        $gte: today,
        $lte: thirtyDaysFromNow
      },
      'documents.isDeleted': false,
      'documents.status': 'Approved'
    }).populate('uploadedBy');
    
    const expiringDocs = [];
    
    employees.forEach(emp => {
      emp.documents.forEach(doc => {
        if (doc.expiryDate && 
            doc.expiryDate >= today && 
            doc.expiryDate <= thirtyDaysFromNow &&
            !doc.isDeleted &&
            doc.status === 'Approved') {
          
          const daysUntilExpiry = Math.ceil((doc.expiryDate - today) / (1000 * 60 * 60 * 24));
          
          expiringDocs.push({
            employee: emp,
            document: doc,
            daysUntilExpiry
          });
        }
      });
    });
    
    // Send email notifications
    if (expiringDocs.length > 0) {
      await sendExpiryNotifications(expiringDocs);
      console.log(`✅ Sent ${expiringDocs.length} expiry notifications`);
    } else {
      console.log('✅ No expiring documents found');
    }
    
    return expiringDocs;
    
  } catch (error) {
    console.error('❌ Error checking expiring documents:', error);
    throw error;
  }
};

// Send expiry notification emails
const sendExpiryNotifications = async (expiringDocs) => {
  // Group by employee
  const groupedByEmployee = expiringDocs.reduce((acc, item) => {
    const empId = item.employee._id.toString();
    if (!acc[empId]) {
      acc[empId] = {
        employee: item.employee,
        documents: []
      };
    }
    acc[empId].documents.push({
      title: item.document.title,
      category: item.document.category,
      expiryDate: item.document.expiryDate,
      daysUntilExpiry: item.daysUntilExpiry
    });
    return acc;
  }, {});
  
  // Send email to each employee
  for (const empId in groupedByEmployee) {
    const { employee, documents } = groupedByEmployee[empId];
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0288D1;">Document Expiry Notification</h2>
        <p>Dear ${employee.firstName} ${employee.lastName},</p>
        <p>The following documents will expire soon:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Document</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Category</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Expiry Date</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Days Left</th>
            </tr>
          </thead>
          <tbody>
            ${documents.map(doc => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${doc.title}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${doc.category}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${new Date(doc.expiryDate).toLocaleDateString()}</td>
                <td style="padding: 10px; border: 1px solid #ddd; color: ${doc.daysUntilExpiry <= 7 ? '#f44336' : '#ff9800'}; font-weight: bold;">
                  ${doc.daysUntilExpiry} days
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p style="color: #666;">Please ensure these documents are renewed before they expire.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated notification from the HR System.
        </p>
      </div>
    `;
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@company.com',
      to: employee.email,
      subject: `⚠️ Document Expiry Notification - ${documents.length} Document(s) Expiring Soon`,
      html: emailHtml
    });
  }
};

// Schedule daily check at 9:00 AM
export const startExpiryChecker = () => {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('🔔 Running document expiry check...');
    await checkExpiringDocuments();
  });
  
  console.log('✅ Document expiry checker scheduled (9:00 AM daily)');
};

// Manual trigger for testing
export const manualExpiryCheck = async (req, res) => {
  try {
    const expiringDocs = await checkExpiringDocuments();
    res.json({
      message: 'Expiry check completed',
      total: expiringDocs.length,
      documents: expiringDocs.map(item => ({
        employee: `${item.employee.firstName} ${item.employee.lastName}`,
        document: item.document.title,
        daysUntilExpiry: item.daysUntilExpiry
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check expiring documents', error: error.message });
  }
};
```

**Update `backend/server.js`:**

```javascript
import { startExpiryChecker } from './utils/documentExpiryChecker.js';

// Start expiry checker after server starts
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  
  // Start document expiry checker
  startExpiryChecker();
});
```

**Install required packages:**

```bash
cd backend
npm install nodemailer node-cron
```

**Add to `.env` file:**

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=HR System <noreply@company.com>
```

---

### **Step 3.2: Dashboard Widget for Expiring Documents**

**File:** `src/views/Dashboard.vue`

Add this widget:

```vue
<!-- Expiring Documents Widget -->
<div class="dashboard-card expiring-docs-card">
  <div class="card-header">
    <h3>
      <i class="pi pi-clock"></i>
      Expiring Documents
    </h3>
    <span class="badge">{{ expiringDocuments.length }}</span>
  </div>
  
  <div class="card-content">
    <div v-if="expiringDocuments.length === 0" class="empty-state">
      <i class="pi pi-check-circle"></i>
      <p>No documents expiring in the next 30 days</p>
    </div>
    
    <div v-else class="expiring-list">
      <div 
        v-for="doc in expiringDocuments.slice(0, 5)" 
        :key="doc._id"
        class="expiring-item"
        :class="{ 'critical': doc.daysUntilExpiry <= 7 }"
      >
        <div class="doc-info">
          <strong>{{ doc.employeeName }}</strong>
          <span class="doc-title">{{ doc.documentTitle }}</span>
        </div>
        <div class="days-badge" :class="{ 'critical': doc.daysUntilExpiry <= 7 }">
          {{ doc.daysUntilExpiry }} days
        </div>
      </div>
    </div>
    
    <router-link to="/employees" class="view-all-link">
      View All Documents →
    </router-link>
  </div>
</div>
```

**Add in script:**

```javascript
const expiringDocuments = ref([]);

const fetchExpiringDocuments = async () => {
  try {
    const response = await api.get('/employees/documents/expiring?days=30');
    expiringDocuments.value = response.data.documents;
  } catch (error) {
    console.error('Failed to fetch expiring documents:', error);
  }
};

onMounted(() => {
  fetchExpiringDocuments();
});
```

**Add CSS:**

```css
.expiring-docs-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.expiring-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
  transition: background 0.2s;
}

.expiring-item:hover {
  background: #f5f5f5;
}

.expiring-item.critical {
  background: #ffebee;
}

.doc-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.doc-title {
  font-size: 0.875rem;
  color: #666;
}

.days-badge {
  padding: 4px 12px;
  border-radius: 12px;
  background: #ff9800;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
}

.days-badge.critical {
  background: #f44336;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

---

## 🧪 PHASE 4: Testing Checklist

### **Backend Testing**

- [ ] Test file upload with different file types (PDF, JPG, PNG, DOC)
- [ ] Test file size limit (try uploading > 10MB)
- [ ] Test invalid file types
- [ ] Test document approval workflow
- [ ] Test document rejection workflow
- [ ] Test document deletion (soft delete)
- [ ] Test expiring documents API
- [ ] Test download document
- [ ] Test email notifications (check spam folder)

### **Frontend Testing**

- [ ] Upload document form validation
- [ ] File preview before upload
- [ ] Document list display with all metadata
- [ ] Expiry date warnings (red for expired, orange for expiring soon)
- [ ] Status badges (pending, approved, rejected)
- [ ] Document download functionality
- [ ] Dashboard expiring documents widget
- [ ] Responsive design on mobile

### **Database Testing**

- [ ] Check documents are saving with correct structure
- [ ] Verify documentHistory is being created
- [ ] Check file paths are correct
- [ ] Verify soft delete (isDeleted flag)

---

## 🔧 Troubleshooting

### **Issue: File upload fails**

**Solution:**
1. Check upload directory exists and has write permissions
2. Verify multer is properly configured
3. Check file size limit
4. Ensure file type is allowed

### **Issue: Email notifications not sending**

**Solution:**
1. Verify SMTP credentials in `.env`
2. For Gmail, use App Password (not regular password)
3. Check spam folder
4. Test with `nodemailer` test account first

### **Issue: Documents not displaying**

**Solution:**
1. Check static file serving is configured in `server.js`
2. Verify file paths in database match actual files
3. Check console for 404 errors
4. Ensure `/uploads` route is accessible

### **Issue: Expiry checker not running**

**Solution:**
1. Check `node-cron` is installed
2. Verify cron expression is correct
3. Check server console logs
4. Test manual trigger: `/api/employees/documents/check-expiry`

---

## 📊 Performance Optimization Tips

1. **Index frequently queried fields:**
```javascript
employeeSchema.index({ 'documents.expiryDate': 1 });
employeeSchema.index({ 'documents.category': 1 });
employeeSchema.index({ 'documents.status': 1 });
```

2. **Use pagination for document lists:**
```javascript
const limit = 50;
const skip = (page - 1) * limit;
const employees = await Employee.find().limit(limit).skip(skip);
```

3. **Compress images on upload:**
```javascript
import sharp from 'sharp';

if (file.mimetype.startsWith('image/')) {
  await sharp(file.path)
    .resize(1920, 1080, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toFile(outputPath);
}
```

4. **Archive old documents:**
```javascript
// Archive documents older than 5 years
const fiveYearsAgo = new Date();
fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

await Employee.updateMany(
  { 'documents.uploadedAt': { $lt: fiveYearsAgo } },
  { $set: { 'documents.$[].status': 'Archived' } }
);
```

---

## 🚀 Future Enhancements

### **Phase 5: Advanced Features (Optional)**

1. **Document Templates**
   - Pre-defined templates for contracts, letters
   - Mail merge functionality

2. **E-Signature Integration**
   - DocuSign or Adobe Sign integration
   - Digital signature tracking

3. **OCR (Optical Character Recognition)**
   - Extract text from scanned documents
   - Auto-fill employee data from ID cards

4. **Document Comparison**
   - Compare two versions of a document
   - Highlight changes

5. **Advanced Search**
   - Full-text search in document content
   - Filter by multiple criteria
   - Save search queries

6. **Bulk Operations**
   - Upload multiple documents at once
   - Batch approve/reject
   - Export documents to ZIP

7. **Mobile App**
   - Upload documents from mobile device
   - Push notifications for expiring documents

8. **Analytics Dashboard**
   - Document statistics
   - Upload trends
   - Compliance reports

---

## 📝 Implementation Notes

- **Backup database** before making schema changes
- **Test in development** environment first
- **Migrate existing data** if you have base64 documents
- **Set up email** properly for production
- **Use environment variables** for sensitive data
- **Monitor disk space** as files accumulate
- **Implement backup strategy** for uploaded files

---

## 📞 Support & Resources

- MongoDB Documentation: https://docs.mongodb.com/
- Multer Documentation: https://github.com/expressjs/multer
- Nodemailer Documentation: https://nodemailer.com/
- Node-cron Documentation: https://github.com/node-cron/node-cron
- PrimeVue Documentation: https://primevue.org/

---

**Good luck with your implementation! 🎉**

If you have questions during implementation, refer to this guide or check the documentation links above.
