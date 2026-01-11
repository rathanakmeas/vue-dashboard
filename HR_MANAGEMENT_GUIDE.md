# HR Management Module - Implementation Guide

## Overview
Complete HR Management system implementation for hospital HRIS with employee management, department integration, and comprehensive employee data tracking.

---

## 🎯 Features Implemented

### ✅ Employee Management
- **Full CRUD Operations**: Create, Read, Update, Delete employees
- **Smart Search**: Search by name, employee ID, email, or phone
- **Advanced Filtering**: Filter by department, status, and employment type
- **Pagination**: Efficient data loading with 20 employees per page
- **Employee Statistics**: Real-time dashboard with total, active, on leave, and terminated counts

### ✅ Employee Data Model
Comprehensive employee information tracking:

#### Personal Information
- Employee ID (unique identifier)
- First Name, Last Name, Khmer Name
- Gender, Date of Birth, National ID
- Photo support (future enhancement)

#### Contact Information
- Email, Phone
- Full Address (street, city, province, postal code, country)
- Emergency Contact (name, relationship, phone)

#### Employment Details
- Department (linked to existing departments)
- Position/Job Title
- Employment Type (Full-time, Part-time, Contract, Temporary, Intern)
- Employment Status (Active, On Leave, Terminated)
- Hire Date, End Date

#### Compensation
- Salary Amount
- Currency (USD, KHR)
- Payment Frequency (Monthly, Bi-weekly, Weekly)

#### Additional Fields (Future)
- Education history array
- Certifications array
- Skills and proficiency levels
- Languages and proficiency
- Work schedule details
- Supervisor assignment

---

## 📁 File Structure

### Backend Files

```
backend/
├── models/
│   └── Employee.js              # Employee mongoose model (201 lines)
├── controllers/
│   └── employeeController.js    # Employee API controllers (237 lines)
├── routes/
│   └── employees.js             # Employee routes (25 lines)
└── server.js                    # Updated with employee routes
```

### Frontend Files

```
src/
├── views/
│   └── Employees.vue            # Main employee management UI (1050 lines)
├── components/
│   └── Sidebar.vue              # Updated with HR menu
└── router/
    └── index.js                 # Updated with employee route
```

---

## 🔌 API Endpoints

### Employee Routes
All routes require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | Get all employees (paginated, filtered) |
| GET | `/api/employees/stats` | Get employee statistics |
| GET | `/api/employees/:id` | Get single employee by ID or employeeId |
| POST | `/api/employees` | Create new employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Terminate employee (soft delete) |
| PUT | `/api/employees/bulk` | Bulk update employees |
| GET | `/api/employees/department/:code` | Get employees by department |

### Query Parameters (GET /api/employees)
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 20)
- `search` - Search term (name, email, phone, employeeId)
- `department` - Filter by department code
- `status` - Filter by employment status
- `employmentType` - Filter by employment type
- `position` - Filter by job position

---

## 🎨 UI Components

### Main Features

#### 1. **Header Section**
- Hospital-themed gradient background (#0288D1 → #00BCD4)
- Employee Management title with user icon
- "Add Employee" button with hover effects

#### 2. **Statistics Cards**
Four cards displaying:
- **Total Employees** - All employees in system
- **Active** - Currently employed (green accent)
- **On Leave** - Temporarily away (orange accent)
- **Terminated** - Past employees (red accent)

Each card:
- Icon indicator
- Large number display
- Color-coded left border
- Hover elevation effect

#### 3. **Filters Section**
- **Search Input**: Real-time search with 500ms debounce
- **Department Dropdown**: Filter by department
- **Status Dropdown**: Active, On Leave, Terminated
- **Type Dropdown**: Full-time, Part-time, Contract, etc.

All dropdowns use PrimeVue PT attributes for consistent styling:
```javascript
:pt="{
  panel: { style: 'background: #f8fafc; border: 2px solid #0288D1;' },
  item: { style: 'background: #e0f2fe !important; color: #0f172a !important;' }
}"
```

#### 4. **Employee Table**
Columns:
- **Employee ID** - Unique identifier (blue, bold)
- **Name** - English name + Khmer name (if available)
- **Department** - Code badge + department name
- **Position** - Job title
- **Type** - Colored tag badge
- **Status** - Colored tag (green/orange/red)
- **Email** - Contact email
- **Phone** - Contact number
- **Actions** - Edit, View, Delete buttons

Features:
- Sortable columns
- Pagination (20 per page)
- Responsive scroll
- Striped rows
- Loading state

#### 5. **Add/Edit Dialog**
Modal with three tabs:

**Tab 1: Personal Information**
- Employee ID*, First Name*, Last Name*
- Khmer Name, Gender*, Date of Birth
- National ID

**Tab 2: Contact Information**
- Email*, Phone*
- Street Address, City, Province, Postal Code, Country
- Emergency Contact section (name, relationship, phone)

**Tab 3: Employment Details**
- Department*, Position*, Employment Type*, Status*
- Hire Date*, End Date
- Compensation section (salary, currency, frequency)

Dialog Features:
- Header with medical blue gradient
- TabView for organized data entry
- Form validation (required fields marked with *)
- Calendar date pickers
- Dropdown with PT styling
- Cancel (gray) and Save (blue gradient) buttons
- Auto-scrolling content area

#### 6. **Delete Confirmation**
- Warning icon (amber)
- Confirmation message with employee name
- Cancel and Terminate buttons

---

## 🎨 Color Scheme

Medical/Hospital Theme:
- **Primary Blue**: #0288D1
- **Accent Cyan**: #00BCD4
- **Light Blue**: #4FC3F7, #81D4FA
- **Light Backgrounds**: #e0f2fe, #f8fafc
- **Text Dark**: #0f172a, #1e293b
- **Text Gray**: #475569, #64748b

Status Colors:
- **Success/Active**: #10b981 (green)
- **Warning/Leave**: #f59e0b (amber)
- **Danger/Terminated**: #ef4444 (red)
- **Info**: #3b82f6 (blue)

---

## 🔧 Technical Implementation

### Backend

#### Employee Model (`backend/models/Employee.js`)
```javascript
const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true, uppercase: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  khmerName: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  dateOfBirth: { type: Date },
  nationalId: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: {
    street: String,
    city: String,
    province: String,
    postalCode: String,
    country: { type: String, default: 'Cambodia' }
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  department: { type: String, ref: 'Department' },
  position: { type: String, required: true },
  employmentType: { 
    type: String, 
    enum: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Intern'],
    default: 'Full-time'
  },
  employmentStatus: { 
    type: String, 
    enum: ['Active', 'On Leave', 'Terminated'],
    default: 'Active'
  },
  hireDate: { type: Date, required: true },
  endDate: { type: Date },
  salary: {
    amount: { type: Number, default: 0 },
    currency: { type: String, enum: ['USD', 'KHR'], default: 'USD' },
    paymentFrequency: { 
      type: String, 
      enum: ['Monthly', 'Bi-weekly', 'Weekly'],
      default: 'Monthly'
    }
  }
}, { timestamps: true });

// Virtuals
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes for performance
employeeSchema.index({ department: 1, employmentStatus: 1 });
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ email: 1 });
```

#### Employee Controller (`backend/controllers/employeeController.js`)

**Key Functions:**
1. `getEmployees` - Paginated list with search and filters
2. `getEmployee` - Single employee by ID or employeeId
3. `createEmployee` - Create with validation and activity logging
4. `updateEmployee` - Update with activity logging
5. `deleteEmployee` - Soft delete (status → Terminated)
6. `getEmployeeStats` - Statistics for dashboard
7. `bulkUpdateEmployees` - Batch operations
8. `getEmployeesByDepartment` - Department-specific listing

**Search Implementation:**
```javascript
if (search) {
  filter.$or = [
    { firstName: { $regex: search, $options: 'i' } },
    { lastName: { $regex: search, $options: 'i' } },
    { employeeId: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
    { phone: { $regex: search, $options: 'i' } }
  ];
}
```

**Population:**
```javascript
.populate('department', 'code name category')
.populate('supervisor', 'employeeId firstName lastName position')
.populate('userId', 'username email')
```

### Frontend

#### Employee View (`src/views/Employees.vue`)

**Reactive State:**
```javascript
const employees = ref([]);
const departments = ref([]);
const stats = ref(null);
const loading = ref(false);
const dialogVisible = ref(false);
const totalRecords = ref(0);
const currentPage = ref(1);

const filters = reactive({
  search: '',
  department: '',
  status: '',
  employmentType: ''
});
```

**Debounced Search:**
```javascript
let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchEmployees();
  }, 500);
};
```

**Form Data Management:**
```javascript
const formData = reactive({
  employeeId: '',
  firstName: '',
  lastName: '',
  // ... all employee fields
  address: {
    street: '', city: '', province: '',
    postalCode: '', country: 'Cambodia'
  },
  emergencyContact: {
    name: '', relationship: '', phone: ''
  },
  salary: {
    amount: 0, currency: 'USD',
    paymentFrequency: 'Monthly'
  }
});
```

**Validation:**
```javascript
if (!formData.employeeId || !formData.firstName || !formData.lastName || 
    !formData.email || !formData.phone || !formData.department || 
    !formData.position || !formData.employmentType || !formData.employmentStatus) {
  toast.add({ 
    severity: 'warn', 
    summary: 'Validation Error', 
    detail: 'Please fill in all required fields'
  });
  return;
}
```

---

## 📋 Usage Guide

### Adding a New Employee

1. Click "Add Employee" button in header
2. Fill in required fields (marked with red asterisk):
   - **Personal**: Employee ID, First Name, Last Name, Gender
   - **Contact**: Email, Phone
   - **Employment**: Department, Position, Type, Status, Hire Date
3. Optional fields:
   - Khmer Name, Date of Birth, National ID
   - Full address, Emergency contact
   - Salary details
4. Click "Save" to create employee

### Editing an Employee

1. Click pencil icon in Actions column
2. Modify fields in the dialog
3. Click "Save" to update

### Searching/Filtering

1. **Search**: Type in search box (searches name, ID, email, phone)
2. **Department**: Select department from dropdown
3. **Status**: Filter by Active/On Leave/Terminated
4. **Type**: Filter by employment type

Filters work together (AND logic).

### Terminating an Employee

1. Click trash icon in Actions column
2. Confirm termination in dialog
3. Employee status changed to "Terminated"
4. End date set to current date

Note: This is a soft delete - employee data is preserved.

---

## 🔐 Security

### Authentication
- All employee routes require JWT token
- Token validated via `authenticate` middleware

### Authorization
- Users must be logged in to access employee data
- Activity logging tracks who creates/updates employees

### Data Validation
- Required fields enforced at model level
- Unique constraints on employeeId and email
- Enum validation for status, type, gender

### Activity Logging
All operations logged:
- `EMPLOYEE_CREATE` - Employee created
- `EMPLOYEE_UPDATE` - Employee updated
- `EMPLOYEE_DELETE` - Employee terminated
- `EMPLOYEE_BULK_UPDATE` - Bulk operations

Logged data:
- User ID (who performed action)
- Action type
- Target employee ID and name
- IP address
- User agent
- Timestamp

---

## 🚀 Next Steps / Future Enhancements

### Phase 2: Employee Details
- [ ] Photo upload capability
- [ ] Document attachments (contracts, certificates)
- [ ] Employee detail view page
- [ ] Employment history tracking
- [ ] Education records management
- [ ] Skills and certifications tracking

### Phase 3: Leave Management
- [ ] Leave types (Annual, Sick, Personal, etc.)
- [ ] Leave balance tracking
- [ ] Leave request submission
- [ ] Leave approval workflow
- [ ] Leave calendar view
- [ ] Leave reports

### Phase 4: Attendance
- [ ] Clock in/out system
- [ ] Timesheet management
- [ ] Shift scheduling
- [ ] Overtime tracking
- [ ] Attendance reports
- [ ] Integration with biometric devices

### Phase 5: Payroll
- [ ] Salary calculations
- [ ] Deductions (taxes, insurance, etc.)
- [ ] Allowances and bonuses
- [ ] Payslip generation
- [ ] Payroll reports
- [ ] Bank file export

### Phase 6: Performance
- [ ] Performance review cycles
- [ ] KPI tracking
- [ ] Goal setting and monitoring
- [ ] 360-degree feedback
- [ ] Performance improvement plans
- [ ] Performance reports

### Phase 7: Training
- [ ] Training courses catalog
- [ ] Training enrollment
- [ ] Training calendar
- [ ] Certification tracking
- [ ] Training effectiveness reports
- [ ] Budget tracking

### Phase 8: Advanced Features
- [ ] Organizational chart visualization
- [ ] Employee self-service portal
- [ ] Manager dashboard
- [ ] Mobile app
- [ ] Email notifications
- [ ] WhatsApp integration
- [ ] Reports and analytics
- [ ] Export to Excel/PDF
- [ ] Bulk import from Excel

---

## 🧪 Testing

### Manual Testing Checklist

#### Employee CRUD
- [ ] Create employee with all required fields
- [ ] Create employee with optional fields
- [ ] Validation: Try creating without required fields
- [ ] Validation: Try duplicate employee ID
- [ ] Validation: Try duplicate email
- [ ] Edit employee - update personal info
- [ ] Edit employee - update employment details
- [ ] Delete (terminate) employee
- [ ] Verify soft delete (data still in DB)

#### Search & Filter
- [ ] Search by first name
- [ ] Search by last name
- [ ] Search by employee ID
- [ ] Search by email
- [ ] Search by phone
- [ ] Filter by department
- [ ] Filter by status
- [ ] Filter by employment type
- [ ] Combine search + filters

#### UI/UX
- [ ] Statistics cards update correctly
- [ ] Pagination works
- [ ] Table sorting works
- [ ] Dialog opens/closes properly
- [ ] Form validation messages show
- [ ] Success/error toasts display
- [ ] Dropdown styling correct (no white text)
- [ ] Responsive on mobile
- [ ] Loading states show

#### Integration
- [ ] Department dropdown shows active departments
- [ ] Department data displays in table
- [ ] Activity logging works
- [ ] Navigation menu works
- [ ] Authentication required

---

## 📊 Database Schema

```javascript
employees Collection:
{
  _id: ObjectId,
  employeeId: "EMP001",              // Unique, uppercase
  firstName: "John",                  // Required
  lastName: "Doe",                    // Required
  khmerName: "ជន ដូ",                // Optional
  gender: "Male",                     // Enum
  dateOfBirth: ISODate,              // Optional
  nationalId: "123456789",           // Optional
  photo: "uploads/emp001.jpg",       // Future
  email: "john.doe@hospital.com",    // Required, unique
  phone: "+855 12 345 678",          // Required
  address: {
    street: "123 Main St",
    city: "Phnom Penh",
    province: "Phnom Penh",
    postalCode: "12000",
    country: "Cambodia"
  },
  emergencyContact: {
    name: "Jane Doe",
    relationship: "Spouse",
    phone: "+855 12 987 654"
  },
  department: "D-ADM",               // Ref to departments.code
  position: "Registered Nurse",      // Required
  employmentType: "Full-time",       // Enum
  employmentStatus: "Active",        // Enum
  hireDate: ISODate,                 // Required
  endDate: null,                     // Set on termination
  salary: {
    amount: 1500,
    currency: "USD",
    paymentFrequency: "Monthly"
  },
  workSchedule: {
    type: "Standard",
    hoursPerWeek: 40
  },
  education: [],                     // Future array
  certifications: [],                // Future array
  skills: [],                        // Future array
  languages: [],                     // Future array
  userId: ObjectId,                  // Ref to users
  supervisor: ObjectId,              // Ref to employees (self)
  createdBy: ObjectId,               // Ref to users
  updatedBy: ObjectId,               // Ref to users
  createdAt: ISODate,                // Auto
  updatedAt: ISODate                 // Auto
}

Indexes:
- { employeeId: 1 } - Unique
- { email: 1 } - Unique
- { department: 1, employmentStatus: 1 } - Compound
- { firstName: 1, lastName: 1 } - Compound
```

---

## 🎓 Key Learnings

### PrimeVue PT (Passthrough) Attributes
Critical for dropdown styling:
```javascript
:pt="{
  panel: { style: 'background: #f8fafc; border: 2px solid #0288D1;' },
  list: { style: 'padding: 0.25rem; background: #f8fafc;' },
  item: { style: 'background: #e0f2fe !important; color: #0f172a !important; padding: 0.75rem 1rem; font-weight: 600;' }
}"
```

This ensures dropdowns have:
- Visible text (dark on light background)
- Consistent medical blue theme
- Professional appearance
- Works across all dropdown components

### Option Templates
Custom templates for clean display:
```javascript
<template #option="slotProps">
  <div>{{ slotProps.option.label }}</div>
</template>
```

Prevents "undefined" or "[object Object]" display issues.

### Reactive Forms with Nested Objects
When working with nested data (address, emergencyContact, salary):
```javascript
const formData = reactive({
  // Flat fields work normally
  firstName: '',
  // Nested objects need full initialization
  address: {
    street: '', city: '', province: '',
    postalCode: '', country: 'Cambodia'
  }
});

// When populating from API:
Object.assign(formData, {
  ...employee,
  address: employee.address || { 
    street: '', city: '', province: '', 
    postalCode: '', country: 'Cambodia' 
  }
});
```

### Debounced Search
Prevents excessive API calls:
```javascript
let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchEmployees();
  }, 500); // Wait 500ms after user stops typing
};
```

### Soft Delete Pattern
Preserve data by changing status instead of deleting:
```javascript
// Instead of: Employee.findByIdAndDelete(id)
// Use:
Employee.findByIdAndUpdate(id, {
  employmentStatus: 'Terminated',
  endDate: new Date()
});
```

Benefits:
- Maintains employment history
- Allows data recovery
- Supports audit trails
- Enables analytics on past employees

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review ARCHITECTURE.md for system overview
3. Check API_EXAMPLES.js for API usage patterns
4. Review activity logs for debugging

---

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Complete employee CRUD operations
- ✅ Search and filtering
- ✅ Statistics dashboard
- ✅ Department integration
- ✅ Medical blue theme
- ✅ Activity logging
- ✅ Responsive design
- ✅ Form validation
- ✅ Pagination

### Planned for Version 1.1.0
- Photo upload
- Employee detail view
- Document attachments
- Export to Excel
- Advanced reporting

---

## 🏥 Hospital-Specific Features

### Compliance
- Track medical licenses
- Certification expiration alerts
- Continuing education requirements
- Background check tracking

### Scheduling
- Shift management
- On-call rotations
- Department coverage
- Holiday scheduling

### Credentials
- Medical degree verification
- Board certifications
- Hospital privileges
- DEA numbers (if applicable)

### Integration Points
- Electronic Health Records (EHR)
- Patient management systems
- Billing systems
- Training platforms

---

**End of HR Management Documentation**

*Last Updated: 2025*
*Version: 1.0.0*
*Status: Production Ready*
