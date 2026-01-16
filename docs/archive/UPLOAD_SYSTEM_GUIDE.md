# Enhanced Document Upload System

## Overview
The document upload system has been enhanced with comprehensive metadata fields for professional document management, including letter tracking, role-based sharing, and advanced categorization.

## Upload Form Fields

### Document Identification
1. **Letter No** - Document reference number (e.g., LTR-2026-001)
   - Indexed for fast searches
   - Optional field
   - Use for official correspondence tracking

2. **Number In/No** - Incoming document number
   - Track external/received documents
   - Indexed for quick lookup
   - Optional field

3. **From** - Sender or originating department
   - Track document source
   - Useful for correspondence management
   - Optional field

4. **Dateline** - Document date (not upload date)
   - Date picker field
   - Track official document dates
   - Optional field

### Basic Information
5. **Document Name** - Display name for the file
   - Auto-populated from filename
   - Can be customized
   - **Required field** (if different from filename)

6. **Folder** - Destination folder
   - **Required field**
   - Choose from existing folders
   - Organizes documents hierarchically

7. **Category** - Document type classification
   - Contract
   - Report
   - Invoice
   - Policy
   - Proposal
   - Presentation
   - Letter (NEW)
   - Memo (NEW)
   - Other
   - Optional field

8. **Description** - Detailed document description
   - Multi-line text area
   - Supports detailed notes
   - Searchable content
   - Optional field

### Storage & Management
9. **Storage** - Storage location
   - **Local Disk** (Default)
   - Cloud Storage
   - Network Drive
   - Archive
   - Helps track physical/logical storage

10. **Department** - Associated department
    - Free text field
    - e.g., HR, Finance, IT, Marketing
    - Useful for organizational categorization
    - Optional field

11. **Priority** - Document priority level
    - None (default)
    - Low
    - Medium
    - High
    - Urgent
    - Visual priority badges in UI
    - Optional field

12. **Expiry Date** - Document expiration
    - Date picker
    - Useful for contracts, licenses
    - Can trigger auto-archive in future
    - Optional field

### Metadata & Tags
13. **Meta Tags** - Searchable tags
    - Comma-separated values
    - e.g., "urgent, confidential, policy"
    - Enhances search capabilities
    - Displayed as badges
    - Optional field

### Sharing & Permissions
14. **Share with Roles** - Role-based access
    - Admin
    - Manager
    - Employee
    - HR
    - Finance
    - IT
    - Guest
    - Multi-select checkboxes
    - Optional field

15. **Share with Users** - User-specific sharing
    - Select multiple users
    - Multi-select dropdown
    - Hold Ctrl/Cmd for multiple selection
    - Optional field

### File Upload
16. **Document Upload** - File selection
    - **Required field**
    - Click to browse files
    - Shows file name and size after selection
    - Supports all file types

## Database Schema

```javascript
{
  // Basic fields
  name: String (required),
  folderId: ObjectId (required),
  userId: ObjectId (required),
  fileUrl: String (required),
  fileSize: Number,
  fileType: String,
  
  // New enhanced fields
  category: String (enum),
  description: String,
  letterNo: String (indexed),
  from: String,
  dateline: Date,
  numberInNo: String (indexed),
  storage: String (enum),
  metaTags: [String],
  sharedWithRoles: [String] (enum),
  sharedWithUsers: [ObjectId],
  department: String,
  priority: String (enum),
  expiryDate: Date,
  version: Number (default: 1),
  
  // System fields
  isShared: Boolean,
  isDeleted: Boolean,
  isArchived: Boolean,
  archivedAt: Date,
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## UI Features

### Visual Indicators
- **Priority Badges**: Color-coded priority levels
  - Low: Blue
  - Medium: Yellow
  - High: Orange
  - Urgent: Red

- **Meta Tags**: Displayed as blue badges below document info

- **Letter Numbers**: Shown with 📋 icon for quick identification

- **Sender Info**: "From" field displayed in metadata

### Form Layout
- **Two-column layout** for efficient space usage
- **Grouped related fields** for better UX
- **Scrollable form** for long content
- **Responsive design** adapts to screen size
- **Large modal** (700px wide) for comfortable editing

### Validation
- Required fields marked with red asterisk (*)
- File selection required before upload
- Folder selection required
- Real-time validation feedback

## API Integration

### Upload Endpoint
```javascript
POST /api/files/:folderId/upload
Content-Type: multipart/form-data

FormData includes:
- file: File object (required)
- All metadata fields as string/array values
```

### Response
```javascript
{
  message: "File uploaded",
  file: {
    _id: "...",
    name: "...",
    letterNo: "...",
    // ... all fields
  }
}
```

## Usage Examples

### 1. Official Letter Upload
```
Letter No: LTR-2026-001
From: HR Department
Dateline: 2026-01-10
Category: Letter
Priority: High
Meta Tags: official, response-required
Share with Roles: [Manager, HR]
```

### 2. Contract Document
```
Letter No: CONTRACT-2026-015
From: Legal Department
Dateline: 2026-01-05
Category: Contract
Priority: Urgent
Expiry Date: 2027-01-05
Meta Tags: legal, vendor-contract, review-required
Share with Roles: [Admin, Manager]
Department: Legal
```

### 3. Invoice Tracking
```
Number In/No: INV-2026-0042
From: Acme Supplies Inc.
Dateline: 2026-01-08
Category: Invoice
Storage: Local Disk
Department: Finance
Share with Roles: [Finance]
Meta Tags: pending-payment, monthly
```

## Search & Filter Capabilities

Documents can be searched by:
- Document name
- Letter number
- Number In/No
- Category
- Meta tags
- Department
- Sender (From)
- Priority level

All indexed fields provide fast search results even with large document collections.

## Best Practices

1. **Consistent Numbering**: Use standardized formats for Letter No (e.g., DEPT-YEAR-NUMBER)

2. **Meaningful Tags**: Use descriptive, searchable tags (e.g., "urgent", "confidential", "quarterly-report")

3. **Complete Metadata**: Fill in as many fields as applicable for better organization

4. **Role-Based Sharing**: Use roles for broad access, specific users for targeted sharing

5. **Priority Setting**: Reserve "Urgent" for truly time-sensitive documents

6. **Regular Reviews**: Check expiry dates periodically to archive outdated documents

7. **Department Tagging**: Always specify department for better organizational tracking

## Future Enhancements

- Auto-increment letter numbers per department
- OCR text extraction for searchable PDFs
- Document templates with pre-filled metadata
- Workflow approvals based on priority/category
- Email notifications for shared documents
- Bulk upload with CSV metadata import
- Version history tracking
- Full-text search within documents
- QR code generation for physical filing

## Troubleshooting

**Issue**: Upload fails with large files
- **Solution**: Check file size limits in backend (currently 10MB)

**Issue**: Roles/Users not showing
- **Solution**: Ensure user is logged in and has proper permissions

**Issue**: Tags not saving
- **Solution**: Use commas to separate tags, avoid special characters

**Issue**: Date fields not working
- **Solution**: Use browser's native date picker, format: YYYY-MM-DD
