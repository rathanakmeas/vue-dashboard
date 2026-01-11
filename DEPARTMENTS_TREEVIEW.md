# Department TreeView Management System

## Overview
Advanced hierarchical department management system with TreeView table interface, full CRUD operations, and pagination support for hospital organizational structure.

## Features Implemented

### 1. **TreeView Table Display**
- Hierarchical parent-child relationship visualization
- Expandable/collapsible tree nodes
- Recursive component rendering for unlimited depth
- Visual indentation based on hierarchy level
- Toggle between Tree View and List View

### 2. **Full CRUD Operations**
- **Create**: Add new departments with complete metadata
- **Read**: View department details with children count
- **Update**: Edit department information inline
- **Delete**: Remove departments (with child validation)
- **Initialize**: Bulk import from configuration file

### 3. **Advanced Search & Filtering**
- Real-time search by name, code, or description (500ms debounce)
- Filter by category (10 categories)
- Filter by status (active/inactive/closed)
- Combined filters work together

### 4. **Pagination**
- Page sizes: 20, 50, 100, 200 items
- Smart page navigation with ellipsis
- Total count display
- First/Previous/Next/Last controls
- Disabled in Tree View (shows all)

### 5. **Statistics Dashboard**
- Total departments count
- Active departments
- Parent departments count
- Categories count
- Category distribution breakdown

### 6. **Department Fields**
- **Identity**: Code (unique, indexed), Name, Category
- **Hierarchy**: Parent Department (self-reference)
- **Status**: Active, Inactive, Closed
- **Contact**: Email, Phone, Extension
- **Location**: Building, Floor, Room
- **Management**: Department Head (User ref), Staff Count, Budget
- **System**: Description, Display Order, Timestamps

## Database Schema

```javascript
{
  code: String (unique, indexed, uppercase)
  name: String (required)
  category: String (enum: 10 categories)
  parent: String (ref: Department)
  status: String (enum: active/inactive/closed)
  description: String
  head: ObjectId (ref: User)
  email: String
  phone: String
  extension: String
  location: String
  floor: String
  building: String
  staffCount: Number (default: 0)
  budget: Number (default: 0)
  order: Number (default: 0)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

## API Endpoints

### Department CRUD
```
POST   /api/departments/initialize     - Initialize from config
GET    /api/departments/stats          - Get statistics
GET    /api/departments                - Get all (paginated/tree)
GET    /api/departments/:code          - Get single department
POST   /api/departments                - Create department
PUT    /api/departments/:code          - Update department
DELETE /api/departments/:code          - Delete department
```

### Query Parameters
```
?page=1               - Page number (default: 1)
?pageSize=50          - Items per page (default: 50)
?search=query         - Search term
?category=Clinical    - Filter by category
?status=active        - Filter by status
?tree=true            - Return tree structure
```

## Component Architecture

### Main Components

**Departments.vue** (Parent View)
- Stats dashboard
- Search & filter controls
- View mode toggle (Tree/List)
- Modals for create/edit/details
- Pagination controls

**DepartmentRow.vue** (Recursive Child)
- Single row rendering
- Expand/collapse button
- Recursive children rendering
- Action buttons (view/edit/delete)
- Visual indentation

## Usage Guide

### Initialize Departments
1. Click "Initialize" button
2. Imports 40 departments from config file
3. Creates parent-child relationships automatically
4. Only runs if database is empty

### Create Department
1. Click "+ Add Department" button
2. Fill required fields: Code, Name, Category
3. Optional: Parent, Status, Contact info, Location
4. Code is auto-uppercased and validated for uniqueness
5. Parent validation prevents circular references

### Edit Department
1. Click edit icon on any row
2. Code field is locked (cannot change primary key)
3. Update any fields
4. Parent can be changed (with validation)

### Delete Department
1. Click delete icon
2. Confirms action (irreversible)
3. Checks for children - prevents delete if has children
4. Returns list of blocking children if applicable

### View Details
1. Click eye icon to view full details
2. Shows all fields including empty ones
3. Lists child departments (if any)
4. Modal display with category colors

### Search & Filter
1. Type in search box (auto-search after 500ms)
2. Searches: Name, Code, Description
3. Combine with category and status filters
4. Results update in real-time

### Tree View
1. Default view shows hierarchical structure
2. Parent departments have expand/collapse buttons
3. Children are indented (2rem per level)
4. Expand/collapse state persists during session
5. Shows all departments (no pagination)

### List View
1. Toggle to flat list
2. Shows parent code for children
3. Enables pagination
4. Better for large datasets

## Technical Implementation

### Backend Controller
- **getDepartments**: Query with pagination, search, filters, tree builder
- **getDepartment**: Single fetch with children lookup
- **createDepartment**: Validation, uniqueness check, parent verification
- **updateDepartment**: Prevents code change, validates parent
- **deleteDepartment**: Child check before deletion
- **getDepartmentStats**: Aggregation for dashboard
- **initializeDepartments**: Bulk import from config

### Tree Building Algorithm
```javascript
const buildTree = (departments) => {
  const lookup = {};
  const tree = [];
  
  // Create lookup table
  departments.forEach(dept => {
    lookup[dept.code] = { ...dept.toObject(), children: [] };
  });
  
  // Build tree structure
  departments.forEach(dept => {
    if (dept.parent) {
      lookup[dept.parent].children.push(lookup[dept.code]);
    } else {
      tree.push(lookup[dept.code]);
    }
  });
  
  return tree;
};
```

### Recursive Component Pattern
```vue
<template>
  <tr>...</tr>
  <template v-if="expanded && hasChildren">
    <DepartmentRow
      v-for="child in department.children"
      :department="child"
      :level="level + 1"
    />
  </template>
</template>
```

## Styling Features

### Category Colors
- 10 unique gradient backgrounds
- High contrast for readability
- Consistent across all views

### Status Badges
- **Active**: Green (#c6f6d5)
- **Inactive**: Red (#fed7d7)
- **Closed**: Gray (#e2e8f0)

### Responsive Design
- Grid layouts adapt to mobile
- Forms switch to single column
- Tables scroll horizontally
- Modals resize appropriately

## Hospital Department Structure

### Categories (10)
1. **Administration** - BOD, ADM, ADM-HR, ADM-GA, ADM-ENG, ADM-SEC, ADM-IT, ACCT
2. **Clinical** - NURSING, PHARMACY
3. **Diagnostic** - RADIOL, LAB, LAB-TISSUE
4. **Support** - DIETARY, LAUNDRY, TRANSPORT, HOUSEKEEP, TECH
5. **Medical** - CARDIO, NEPHRO, DIALYSIS, PULMO, GASTRO, ENDO
6. **Surgical** - SURGERY, ANESTH, ANESTH-UNIT, OR, PACU, CSSD
7. **Emergency** - ER, ICU, TRAUMA, AMBULANCE
8. **Specialty** - ONCO, PEDIA, OB-GYN, ORTHO, NEURO, ENT, OPHTHAL, DENTAL
9. **Rehabilitation** - PT, OT, REHAB
10. **Ancillary** - SOCIAL, CHAPLAIN, QUALITY, SAFETY, BIOMEDIC

### Parent-Child Relationships
- **ADM** → ADM-HR, ADM-GA, ADM-ENG, ADM-SEC, ADM-IT
- **LAB** → LAB-TISSUE
- **ANESTH** → ANESTH-UNIT
- **NEPHRO** → DIALYSIS

## Performance Optimizations

1. **Database Indexing**: Code field indexed for fast lookups
2. **Lazy Loading**: Children loaded only when expanded
3. **Debounced Search**: 500ms delay prevents excessive queries
4. **Pagination**: Limits data transfer and rendering
5. **Aggregate Queries**: Stats use MongoDB aggregation pipeline
6. **Population**: Only populate head user when needed

## Validation Rules

1. **Code**: Required, unique, auto-uppercase, no spaces
2. **Name**: Required, minimum 2 characters
3. **Category**: Required, must be one of 10 valid categories
4. **Parent**: Optional, must exist, cannot be self
5. **Status**: Default "active", must be valid enum
6. **Email**: Optional, must be valid email format
7. **Staff Count**: Optional, must be non-negative integer

## Activity Logging
All CRUD operations logged to activity trail:
- `DEPARTMENT_CREATE` - New department added
- `DEPARTMENT_UPDATE` - Department modified
- `DEPARTMENT_DELETE` - Department removed

Logs include:
- User ID
- Timestamp
- IP address
- User agent
- Department code and name

## Error Handling

### Client-Side
- Form validation before submission
- Confirmation dialogs for destructive actions
- User-friendly error messages
- Loading states during operations

### Server-Side
- Mongoose schema validation
- Unique constraint enforcement
- Parent existence verification
- Child dependency checking
- Try-catch blocks with detailed errors

## Future Enhancements (Recommendations)

1. **Drag & Drop Reordering**
   - Use sortable.js for visual reorganization
   - Update display order on drop
   - Persist new structure

2. **Bulk Operations**
   - Multi-select rows
   - Bulk status change
   - Bulk delete with validation
   - Export selected

3. **Department Analytics**
   - Staff distribution charts
   - Budget visualization
   - Category pie charts
   - Growth trends

4. **Advanced Search**
   - Search by head name
   - Search by location
   - Date range filters
   - Saved searches

5. **Import/Export**
   - Excel import with validation
   - CSV export with hierarchy
   - PDF org chart generation
   - Template download

6. **Staff Assignment**
   - Assign users to departments
   - View department roster
   - Transfer between departments
   - Role-based permissions per department

7. **Budget Tracking**
   - Budget vs actual spending
   - Monthly breakdown
   - Approval workflows
   - Budget alerts

8. **Audit Trail Enhancement**
   - Field-level change tracking
   - Compare versions
   - Rollback capability
   - Change notifications

9. **Organizational Chart**
   - Visual org chart view
   - Print-friendly format
   - Zoom and pan
   - Export as image

10. **Department Dashboard**
    - Quick stats per department
    - Document count
    - Staff count
    - Recent activities
    - Upcoming deadlines

## Testing Checklist

- [x] Initialize departments from config
- [x] Create new department
- [x] Edit existing department
- [x] Delete department (no children)
- [x] Prevent delete (has children)
- [x] Search departments
- [x] Filter by category
- [x] Filter by status
- [x] Toggle tree/list view
- [x] Expand/collapse nodes
- [x] Pagination navigation
- [x] View department details
- [x] Parent validation on create
- [x] Parent validation on edit
- [x] Stats dashboard update
- [x] Activity logging

## Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

## Deployment Notes

1. MongoDB indexes created automatically on first run
2. Initialize departments after first deployment
3. Ensure User model exists before assigning heads
4. Default departments can be modified in `backend/config/departments.js`
5. Activity logging requires Activity model and logger utility

## Files Modified/Created

### Backend
- `backend/models/Department.js` - Department schema
- `backend/controllers/departmentController.js` - CRUD operations
- `backend/routes/departments.js` - API endpoints
- `backend/config/departments.js` - Default department data (enhanced)

### Frontend
- `src/views/Departments.vue` - Main TreeView interface
- `src/components/DepartmentRow.vue` - Recursive row component
- `src/api.js` - Department API methods (enhanced)

### Dependencies
No additional packages required. Uses existing:
- Express for routing
- Mongoose for MongoDB
- Vue 3 Composition API
- Font Awesome icons
