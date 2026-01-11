# Document Management System

## Overview
This document management system provides comprehensive functionality for managing, categorizing, tracking, and archiving documents within the HRIS Vue Dashboard application.

## Features Implemented

### 1. **Dashboard** (Already Existing)
- Path: `/`
- Main dashboard with statistics and quick access to features
- Shows recent activity and folder summaries

### 2. **All Documents**
- **Path**: `/documents`
- **Features**:
  - View all documents across all folders
  - Search documents by name or category
  - Upload new documents with category assignment
  - Download documents
  - Archive documents
  - Delete documents
  - Category-based filtering
  - Document metadata display (size, type, date)

### 3. **Document Categories**
- **Path**: `/documents/categories`
- **Features**:
  - Pre-defined categories: Contracts, Reports, Invoices, Policies, Proposals, Presentations
  - Custom category creation
  - Category management (create, edit, delete)
  - Document count per category
  - Category icons and descriptions
  - Click to filter documents by category

### 4. **Documents Audit Trail**
- **Path**: `/documents/audit`
- **Features**:
  - Complete audit log of all document activities
  - Track uploads, updates, deletions, and archives
  - Filter by action type (Upload, Update, Delete)
  - Filter by date
  - User attribution for each action
  - IP address tracking
  - Timestamp for all activities
  - Pagination support

### 5. **Archived Documents**
- **Path**: `/documents/archived`
- **Features**:
  - View all archived and deleted documents
  - Restore archived documents
  - Download archived documents
  - Permanent deletion
  - Empty entire archive
  - Visual distinction for archived items

## Navigation

### Sidebar Menu Structure
```
📁 Folders
  ├── My Folders
  ├── Recent
  └── Shared

📄 Documents (NEW)
  ├── All Documents
  ├── Categories
  ├── Audit Trail
  └── Archived

🔐 Authentication
  ├── Login
  ├── Sign Up
  ├── Logout
  ├── Profile
  ├── Users
  ├── Security
  └── Privacy Policy
```

## Backend Implementation

### Database Schema Updates

#### File Model Enhancements
```javascript
{
  name: String,
  folderId: ObjectId,
  userId: ObjectId,
  fileUrl: String,
  fileSize: Number,
  fileType: String,
  category: String, // NEW: Contract, Report, Invoice, Policy, Proposal, Presentation, Other
  isShared: Boolean,
  isDeleted: Boolean,
  isArchived: Boolean, // NEW
  archivedAt: Date, // NEW
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### New API Endpoints

#### File Management
- `PUT /api/files/:fileId/archive` - Archive a file
- `PUT /api/files/:fileId/restore` - Restore archived/deleted file
- `GET /api/files/archived/all` - Get all archived files for user

### Activity Logging
New activity types tracked:
- `FILE_ARCHIVE` - When a file is archived
- `FILE_RESTORE` - When a file is restored from archive

## Frontend Components

### New Views Created
1. **AllDocuments.vue** - Main document listing with search and filters
2. **Categories.vue** - Category management interface
3. **AuditTrail.vue** - Audit log viewer with filters
4. **Archived.vue** - Archived documents management

### Shared Styles
Common CSS components in `src/assets/common.css`:
- `.title` - Page headers
- `.btn-create` - Primary action buttons
- `.btn-save` - Save buttons
- `.btn-cancel` - Cancel buttons
- `.btn-icon` - Icon buttons
- `.modal-overlay` - Modal backgrounds
- `.modal-content` - Modal containers
- `.form-group` - Form field containers
- `.loading` - Loading states
- `.empty-state` - Empty state messages

## Usage Instructions

### Uploading Documents
1. Navigate to "All Documents"
2. Click "+ Upload Document"
3. Select folder destination
4. Choose category (optional)
5. Select file from computer
6. Click "Upload"

### Archiving Documents
1. Find document in "All Documents"
2. Click archive icon (📦)
3. Document moves to "Archived" section
4. Can be restored or permanently deleted later

### Viewing Audit Trail
1. Navigate to "Documents Audit Trail"
2. Use filters to narrow results:
   - Filter by action type
   - Filter by date
3. View complete history with timestamps and user info

### Managing Categories
1. Navigate to "Document Categories"
2. Click "+ New Category" to create custom category
3. Click on category to view associated documents
4. Edit or delete existing categories

### Restoring Documents
1. Navigate to "Archived Documents"
2. Find document to restore
3. Click restore icon (♻️)
4. Document returns to active status

## Testing the Features

### Test Data
Use the seeded database with:
- 3 test users (admin@example.com, john@example.com, jane@example.com)
- 5 folders
- 5 files across folders
- Demo credentials: admin@example.com / password123

### Test Scenarios
1. **Upload Test**: Upload a file to different folders with various categories
2. **Archive Test**: Archive a file, verify it appears in archived section
3. **Restore Test**: Restore an archived file, verify it's active again
4. **Audit Test**: Perform various actions, check audit trail updates
5. **Category Test**: Create custom category, assign to documents
6. **Search Test**: Use search to find documents by name

## Technical Notes

### Category Enum Values
- Contract
- Report
- Invoice
- Policy
- Proposal
- Presentation
- Other

### File Icons by Type
- PDF: 📕
- Document: 📘
- Spreadsheet: 📊
- Presentation: 📽️
- Image: 🖼️
- Video: 🎥
- Generic: 📄

### Permission Model
- Users can only manage their own documents
- Shared folder access provides view/download permissions
- Archive/restore restricted to document owner
- Audit trail shows all user's document activities

## Docker Deployment

All features are containerized and running in Docker:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **MongoDB**: localhost:27017

To rebuild and deploy:
```bash
docker compose build
docker compose up -d
```

## Future Enhancements (Suggestions)

1. **Version Control**: Track document versions
2. **Bulk Operations**: Archive/restore multiple files
3. **Advanced Search**: Full-text search in document content
4. **Document Preview**: In-browser preview for PDFs/images
5. **Tags**: Additional metadata tags beyond categories
6. **Sharing**: Direct document sharing with specific users
7. **Expiry Dates**: Auto-archive documents after expiry
8. **Storage Analytics**: Storage usage by category/user
9. **Export**: Export audit trail to CSV/PDF
10. **Notifications**: Email notifications for document activities

## Support

For issues or questions:
- Check browser console for errors
- Verify Docker containers are running: `docker compose ps`
- Check backend logs: `docker compose logs backend`
- Check frontend logs: `docker compose logs frontend`
