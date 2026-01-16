# 🎯 Department Management System - User Guide

## 🚀 Getting Started

### Access the Application
1. **Start Backend**: `docker-compose up` (runs on port 5000)
2. **Start Frontend**: `npm run dev` (runs on port 5174)
3. **Open Browser**: http://localhost:5174

### Login
- Navigate to `/auth/login`
- Use your credentials
- System will redirect to Dashboard

---

## 📋 Main Features

### 1. Department Management (`/departments`)

#### View Departments
- **Tree View** (default): Hierarchical structure with expand/collapse
- **List View**: Flat table with pagination

#### Search & Filter
- **Search box**: Type department name or code
- **Category filter**: Filter by department category
- **Status filter**: Filter by active/inactive/closed
- **Saved searches**: Save frequently used filters

#### Create Department
1. Click **"Add Department"** button
2. Fill in required fields:
   - Code (unique, e.g., `ADM-HR`)
   - Name (e.g., `Human Resources`)
   - Category (dropdown)
   - Status (active/inactive/closed)
3. Optional fields:
   - Parent department (for hierarchy)
   - Contact info (email, phone, extension)
   - Location (building, floor, location)
   - Description
4. Click **"Save"**

#### Edit Department
1. Click **Edit icon** (pencil) on any row
2. Modify fields (code cannot be changed)
3. Click **"Save"**

#### Delete Department
1. Click **Delete icon** (trash) on any row
2. Confirm deletion
3. Note: Cannot delete departments with children

#### View Details
1. Click **Eye icon** on any row
2. View full details in modal:
   - All department information
   - Child departments list
   - Staff count
   - Budget information

---

### 2. Bulk Operations

#### Select Departments
- **Individual**: Check boxes next to departments
- **Select All**: Check box in table header
- **Count**: Shows number selected in yellow badge

#### Available Actions
1. **Activate All**: Set status to `active`
2. **Deactivate All**: Set status to `inactive`
3. **Close All**: Set status to `closed`
4. **Delete All**: Permanently delete (validates no children first)

#### Execute Bulk Action
1. Select departments with checkboxes
2. Click **"Bulk Actions (X)"** button
3. Choose action from dropdown
4. Click **"Execute"**
5. Confirm action
6. View results

#### Clear Selection
- Click **"Clear Selection"** to deselect all

---

### 3. Import/Export

#### Export to Excel
1. Click **"Export"** button in header
2. File downloads as `departments.xlsx`
3. Contains all 16 fields:
   - Code, Name, Category, Status
   - Parent, Description
   - Email, Phone, Extension
   - Location, Floor, Building
   - Staff Count, Order
   - Created/Updated dates

**Excel Format**:
- Blue header row with white text
- Auto-width columns
- All departments in one sheet

#### Import from Excel
1. Prepare Excel file with columns:
   - **Required**: code, name, category
   - **Optional**: all other fields
2. Click **"Import"** button
3. Select `.xlsx` file
4. View import results:
   - Number imported successfully
   - Number of errors
   - Error details per row

**Import Rules**:
- Skips duplicates (by code)
- Validates required fields
- Reports errors with row numbers
- Continues on error (doesn't stop)

**Example Excel Template**:
| code | name | category | status | parent | email |
|------|------|----------|--------|--------|-------|
| ADM | Administration | Administration | active | | admin@hospital.com |
| ADM-HR | Human Resources | Administration | active | ADM | hr@hospital.com |

---

### 4. Saved Searches

#### Save Current Search
1. Set search criteria:
   - Enter search text
   - Select category
   - Select status
2. Click **Bookmark icon** in search box
3. Enter search name (e.g., "Active Admin Depts")
4. Search is saved

#### View Saved Searches
1. Click **Bookmark icon** in search box
2. Saved searches panel appears below
3. Shows:
   - Search name
   - "Default" badge (if applicable)
   - Delete button

#### Apply Saved Search
1. Open saved searches panel
2. Click on search name
3. Criteria applied automatically
4. Results refresh

#### Delete Saved Search
1. Open saved searches panel
2. Click **Delete icon** (trash) next to search
3. Confirm deletion

---

### 5. Analytics Dashboard (`/departments/analytics`)

#### Navigate to Analytics
1. Expand **Departments** in sidebar
2. Click **"Analytics Dashboard"**
3. Or navigate to `/departments/analytics`

#### Select Year
- Use dropdown to select year (2024, 2025, 2026)
- Charts update automatically

#### View Charts

**Staff Distribution** (Bar Chart):
- X-axis: Department categories
- Y-axis: Total staff count
- Shows which categories have most employees

**Budget Distribution** (Pie Chart):
- Shows budget allocation by category
- Percentage and amount per slice
- Click slice to highlight

**Status Breakdown** (Doughnut Chart):
- Shows active vs inactive vs closed
- Center shows total count
- Hover for percentages

**Monthly Budget Trend** (Line Chart):
- Blue line: Budget allocations
- Red line: Expenses
- X-axis: Months (Jan-Dec)
- Y-axis: Amount in currency

#### View Tables

**Top 10 Departments by Staff**:
- Department name
- Staff count
- Sorted descending

**Top 10 Departments by Budget**:
- Department name
- Budget amount
- Sorted descending

**Budget Utilization**:
- Department name
- Allocated budget
- Expenses
- Remaining
- Utilization % with progress bar
- Color coding:
  - 🟢 **Green** (< 70%): Under budget, good
  - 🟡 **Yellow** (70-90%): On track, monitor
  - 🔴 **Red** (> 90%): Near/over limit, action needed

---

### 6. Org Chart (`/departments/orgchart`)

#### Navigate to Org Chart
1. Expand **Departments** in sidebar
2. Click **"Org Chart"**
3. Or navigate to `/departments/orgchart`

#### View Hierarchy
- Top-level departments shown first
- Child departments nested underneath
- Visual indentation shows levels

#### Expand/Collapse Nodes
- **Individual**: Click node to toggle
- **Expand All**: Button at top
- **Collapse All**: Button at top

#### Node Information
Each card shows:
- Department code (monospace)
- Department name (bold)
- Category badge (gradient)
- Department head (if assigned)
- Children count

#### View Department Details
1. Click any department card
2. Side panel slides in from right
3. Shows:
   - All department info
   - Contact details
   - Sub-departments list
   - Staff count
   - Budget summary
   - Status

#### Export Org Chart
1. Click **"Export PDF"** button
2. Generates PDF with tree structure
3. Downloads as `org-chart.pdf`
4. Includes all departments in hierarchy

---

## 🎨 UI Features

### Tree View Features
- **Expand/Collapse**: Smooth animations
- **Visual Indentation**: 2rem per level
- **Parent-Child Connectors**: Visual lines (optional)
- **Hover Effects**: Row highlighting
- **Click to View**: Eye icon for details

### Color Coding

**Status Badges**:
- 🟢 **Active**: Green background
- 🔴 **Inactive**: Red background
- ⚫ **Closed**: Gray background

**Category Badges** (gradients):
- **Administration**: Purple gradient
- **Clinical**: Pink gradient
- **Diagnostic**: Blue gradient
- **Support**: Green gradient
- **Medical**: Orange gradient
- **Surgical**: Teal gradient
- **Emergency**: Red gradient
- **Specialty**: Pastel gradient
- **Rehabilitation**: Peach gradient
- **Ancillary**: Purple-blue gradient

---

## 📊 Analytics Insights

### Staff Distribution
**Use Case**: Identify departments with staffing gaps
- Look for categories with low staff counts
- Compare against expected ratios
- Plan recruitment

### Budget Distribution
**Use Case**: Track budget allocation
- See where money is allocated
- Identify high-spend categories
- Adjust future budgets

### Budget Utilization
**Use Case**: Monitor spending
- **Green**: Under budget, safe to spend
- **Yellow**: Monitor closely, on track
- **Red**: Over budget or near limit, investigate

**Actions**:
- **Green**: Continue normal operations
- **Yellow**: Review upcoming expenses, prioritize
- **Red**: Freeze non-essential spending, escalate

### Monthly Trends
**Use Case**: Predict future spending
- Identify seasonal patterns
- Compare allocation vs actual
- Forecast year-end totals

---

## 🔍 Advanced Features

### Initialize Departments
- Click **"Initialize"** button
- Adds default departments from config
- Only works if database is empty
- Creates predefined hierarchy

### Pagination (List View)
- 20, 50, 100, or 200 per page
- Navigate with Previous/Next
- Jump to specific page
- Shows current page and total

### Real-time Search
- Debounced (500ms delay)
- Searches name and code
- Updates as you type
- Preserves filters

---

## 🛠️ Tips & Tricks

### Keyboard Shortcuts
- **Enter** in search: Apply search
- **Escape** in modal: Close modal
- **Tab**: Navigate form fields

### Best Practices

**Creating Departments**:
1. Use clear, consistent codes (e.g., `DEPT-SUBDEPT`)
2. Set parent correctly for hierarchy
3. Fill in contact info for communication
4. Set realistic staff counts

**Bulk Operations**:
1. Review selection before executing
2. Use "Select All" carefully
3. Cannot undo bulk delete
4. Bulk update is reversible

**Import/Export**:
1. Export first as template
2. Modify exported file
3. Keep backups before import
4. Review error details

**Saved Searches**:
1. Name searches descriptively
2. Use for common filters
3. Set default for daily use
4. Delete unused searches

**Analytics**:
1. Review monthly for trends
2. Act on red utilization early
3. Compare year-over-year
4. Export charts for reports

---

## 🚨 Troubleshooting

### Cannot Delete Department
**Issue**: Error when deleting
**Cause**: Department has children
**Solution**: Delete or reassign children first

### Import Errors
**Issue**: Rows not importing
**Cause**: Missing required fields or invalid data
**Solution**: Check error details, fix Excel file, re-import

### Charts Not Loading
**Issue**: Analytics dashboard blank
**Cause**: No data for selected year
**Solution**: Select different year or add data

### Org Chart Empty
**Issue**: Org chart shows nothing
**Cause**: No departments or all are children
**Solution**: Ensure top-level departments exist (parent is null)

### Bulk Action Failed
**Issue**: Bulk operation errors
**Cause**: One or more departments cannot be updated
**Solution**: Check error message, fix individually

---

## 📞 Support

### Documentation
- [ALL_10_ENHANCEMENTS.md](ALL_10_ENHANCEMENTS.md) - Complete feature list
- [FRONTEND_IMPLEMENTATION.md](FRONTEND_IMPLEMENTATION.md) - Frontend details
- [DEPARTMENTS_TREEVIEW.md](DEPARTMENTS_TREEVIEW.md) - Original spec

### API Reference
All endpoints documented in backend code

### Common Issues
See troubleshooting section above

---

## ✅ Quick Reference

### Main Actions

| Action | Location | Button/Icon |
|--------|----------|-------------|
| Add Department | Header | + Add Department |
| Edit Department | Row | ✏️ Edit icon |
| Delete Department | Row | 🗑️ Trash icon |
| View Details | Row | 👁️ Eye icon |
| Export Excel | Header | Export |
| Import Excel | Header | Import |
| Bulk Actions | Header | Bulk Actions (X) |
| Save Search | Search bar | 💾 Save icon |
| View Analytics | Sidebar | Analytics Dashboard |
| View Org Chart | Sidebar | Org Chart |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Escape | Close modal |
| Enter | Submit form |
| Tab | Next field |

### Color Codes

| Color | Meaning |
|-------|---------|
| 🟢 Green | Active, Under budget |
| 🟡 Yellow | Warning, On track |
| 🔴 Red | Inactive, Over budget |
| ⚫ Gray | Closed, Neutral |

---

**Happy Department Managing!** 🎉
