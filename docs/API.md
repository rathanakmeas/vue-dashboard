# API Documentation

Complete reference for all API endpoints in the HRIS Dashboard.

---

## 🔐 Authentication

All API requests (except auth endpoints) require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Base URL

```
Development: http://localhost:5001/api
Production: https://your-domain.com/api
```

---

## 📝 Authentication Endpoints

### Register User

```http
POST /api/auth/register
```

**Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Login

```http
POST /api/auth/login
```

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

---

## 👤 Employee Endpoints

### Get All Employees

```http
GET /api/employees
```

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)
- `search` (string): Search term
- `department` (string): Filter by department
- `status` (string): Filter by status

**Response** (200):
```json
{
  "employees": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "khmerName": "ជន ដូ",
      "gender": "Male",
      "email": "john@example.com",
      "phone": "012345678",
      "department": "IT",
      "position": "Developer",
      "status": "active",
      "photo": "/uploads/employees/john.jpg",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 2
}
```

### Get Single Employee

```http
GET /api/employees/:id
```

**Response** (200):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "firstName": "John",
  "lastName": "Doe",
  "khmerName": "ជន ដូ",
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "email": "john@example.com",
  "phone": "012345678",
  "address": {
    "street": "Street 123",
    "commune": "Commune ABC",
    "district": "District XYZ",
    "province": "Phnom Penh"
  },
  "department": "IT",
  "position": "Senior Developer",
  "civilStatuses": [],
  "rankGrades": [],
  "awards": [],
  "disciplinaryActions": [],
  "documents": []
}
```

### Create Employee

```http
POST /api/employees
```

**Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "khmerName": "ជេន ស្មីត",
  "gender": "Female",
  "dateOfBirth": "1992-05-20",
  "email": "jane@example.com",
  "phone": "012987654",
  "department": "HR",
  "position": "HR Manager"
}
```

**Response** (201):
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "firstName": "Jane",
  "lastName": "Smith",
  ...
}
```

### Update Employee

```http
PUT /api/employees/:id
```

**Request Body** (partial update):
```json
{
  "phone": "012999999",
  "position": "Senior HR Manager"
}
```

**Response** (200):
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "phone": "012999999",
  "position": "Senior HR Manager",
  ...
}
```

### Delete Employee

```http
DELETE /api/employees/:id
```

**Response** (200):
```json
{
  "message": "Employee deleted successfully"
}
```

### Upload Employee Photo

```http
POST /api/employees/:id/photo
Content-Type: multipart/form-data
```

**Request Body** (form-data):
```
photo: <file>
```

**Response** (200):
```json
{
  "photo": "/uploads/employees/507f1f77bcf86cd799439012.jpg",
  "message": "Photo uploaded successfully"
}
```

---

## 🏢 Department Endpoints

### Get All Departments

```http
GET /api/departments
```

**Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "code": "IT",
    "name": "Information Technology",
    "nameKhmer": "បច្ចេកវិទ្យាព័ត៌មាន",
    "parentId": null,
    "level": "central",
    "employeeCount": 25
  }
]
```

### Get Department Tree

```http
GET /api/departments/tree
```

**Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "name": "IT Department",
    "children": [
      {
        "_id": "507f1f77bcf86cd799439021",
        "name": "Development Team",
        "children": []
      }
    ]
  }
]
```

### Create Department

```http
POST /api/departments
```

**Request Body**:
```json
{
  "code": "FIN",
  "name": "Finance",
  "nameKhmer": "ហិរញ្ញវត្ថុ",
  "parentId": null,
  "level": "central"
}
```

### Update Department

```http
PUT /api/departments/:id
```

### Delete Department

```http
DELETE /api/departments/:id
```

---

## 📄 Document Endpoints

### Get All Documents

```http
GET /api/documents
```

**Query Parameters**:
- `category` (string): Filter by category
- `search` (string): Search term
- `startDate` (date): Filter from date
- `endDate` (date): Filter to date

**Response** (200):
```json
{
  "documents": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "documentCode": "DOC-2026-001",
      "documentName": "Annual Report",
      "category": "Report",
      "fileUrl": "/uploads/documents/report.pdf",
      "uploadedBy": "507f1f77bcf86cd799439011",
      "uploadedAt": "2026-01-15T10:00:00.000Z"
    }
  ],
  "total": 50
}
```

### Upload Document

```http
POST /api/documents
Content-Type: multipart/form-data
```

**Request Body** (form-data):
```
file: <file>
documentCode: DOC-2026-002
documentName: Policy Update
category: Policy
```

### Download Document

```http
GET /api/documents/:id/download
```

### Delete Document

```http
DELETE /api/documents/:id
```

---

## 📊 Dashboard Endpoints

### Get Statistics

```http
GET /api/dashboard/stats
```

**Response** (200):
```json
{
  "totalEmployees": 150,
  "activeEmployees": 142,
  "totalDepartments": 12,
  "totalDocuments": 450,
  "recentActivities": [
    {
      "action": "Employee Added",
      "user": "John Doe",
      "timestamp": "2026-01-17T08:30:00.000Z"
    }
  ]
}
```

### Get Department Analytics

```http
GET /api/dashboard/analytics/departments
```

**Response** (200):
```json
{
  "departmentDistribution": [
    { "name": "IT", "count": 25 },
    { "name": "HR", "count": 15 }
  ],
  "genderDistribution": {
    "Male": 85,
    "Female": 65
  }
}
```

---

## 🔍 Search Endpoint

### Global Search

```http
GET /api/search?q=<query>
```

**Query Parameters**:
- `q` (string): Search query
- `type` (string): Filter by type (employees, documents, departments)

**Response** (200):
```json
{
  "employees": [...],
  "documents": [...],
  "departments": [...]
}
```

---

## 📝 Activity Log Endpoints

### Get Activity Logs

```http
GET /api/activities
```

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `action` (string): Filter by action type
- `userId` (string): Filter by user

**Response** (200):
```json
{
  "activities": [
    {
      "_id": "507f1f77bcf86cd799439040",
      "action": "UPDATE_EMPLOYEE",
      "userId": "507f1f77bcf86cd799439011",
      "targetId": "507f1f77bcf86cd799439012",
      "targetType": "Employee",
      "details": {
        "changes": {
          "position": { "old": "Developer", "new": "Senior Developer" }
        }
      },
      "timestamp": "2026-01-17T09:15:00.000Z"
    }
  ],
  "total": 500
}
```

---

## ⚠️ Error Responses

### 400 Bad Request

```json
{
  "error": "Validation error",
  "message": "Email is required",
  "details": {
    "field": "email",
    "code": "REQUIRED_FIELD"
  }
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "You do not have permission to access this resource"
}
```

### 404 Not Found

```json
{
  "error": "Not found",
  "message": "Employee not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## 📡 WebSocket Events (Future)

*WebSocket support coming soon for real-time updates*

---

## 🔄 Rate Limiting

**Current Limits**:
- Authentication endpoints: 5 requests per minute
- General API: 100 requests per 15 minutes
- File uploads: 10 requests per hour

---

## 📚 API Client Examples

### JavaScript (Axios)

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Get employees
const response = await api.get('/employees')
console.log(response.data)

// Create employee
const newEmployee = await api.post('/employees', {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com'
})
```

### cURL

```bash
# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get employees (with token)
curl -X GET http://localhost:5001/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Upload photo
curl -X POST http://localhost:5001/api/employees/123/photo \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "photo=@/path/to/photo.jpg"
```

---

## 🔐 Security Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** (HttpOnly cookies or secure storage)
3. **Validate all inputs** on the server side
4. **Implement rate limiting** to prevent abuse
5. **Keep dependencies updated** for security patches

---

**Last Updated**: January 17, 2026  
**API Version**: v1.0
