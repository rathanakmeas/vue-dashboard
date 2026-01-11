// Example API Usage - Add this to your Vue components

import { authAPI, folderAPI, setToken, getToken } from '@/api.js'

// ==================== AUTHENTICATION ====================

// Register a new user
async function registerUser() {
  try {
    const response = await authAPI.register(
      'johndoe',
      'john@example.com',
      'password123',
      'John',
      'Doe'
    )
    
    if (response.token) {
      console.log('User registered successfully!')
      console.log('Token:', response.token)
      console.log('User:', response.user)
      // Token is automatically saved to localStorage
    }
  } catch (error) {
    console.error('Registration failed:', error)
  }
}

// Login user
async function loginUser() {
  try {
    const response = await authAPI.login(
      'john@example.com',
      'password123'
    )
    
    if (response.token) {
      console.log('Login successful!')
      console.log('Token:', response.token)
      // Token is automatically saved to localStorage
    }
  } catch (error) {
    console.error('Login failed:', error)
  }
}

// Get user profile
async function getUserProfile() {
  try {
    const profile = await authAPI.getProfile()
    console.log('User profile:', profile)
    return profile
  } catch (error) {
    console.error('Failed to fetch profile:', error)
  }
}

// Update user profile
async function updateUserProfile() {
  try {
    const response = await authAPI.updateProfile(
      'Jane',
      'Smith',
      'https://example.com/avatar.jpg'
    )
    console.log('Profile updated:', response)
  } catch (error) {
    console.error('Profile update failed:', error)
  }
}

// Get all users
async function getAllUsers() {
  try {
    const users = await authAPI.getAllUsers()
    console.log('All users:', users)
    return users
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }
}

// Logout
function logoutUser() {
  authAPI.logout()
  console.log('Logged out successfully')
  // Token is removed from localStorage
}

// ==================== FOLDER OPERATIONS ====================

// Create a folder
async function createNewFolder() {
  try {
    const response = await folderAPI.createFolder(
      'My Documents',
      'Important documents for work'
    )
    console.log('Folder created:', response)
    return response.folder
  } catch (error) {
    console.error('Folder creation failed:', error)
  }
}

// Get all user folders
async function getUserFolders() {
  try {
    const folders = await folderAPI.getFolders()
    console.log('User folders:', folders)
    return folders
  } catch (error) {
    console.error('Failed to fetch folders:', error)
  }
}

// Get specific folder
async function getSpecificFolder(folderId) {
  try {
    const folder = await folderAPI.getFolder(folderId)
    console.log('Folder details:', folder)
    return folder
  } catch (error) {
    console.error('Failed to fetch folder:', error)
  }
}

// Update folder
async function updateUserFolder(folderId) {
  try {
    const response = await folderAPI.updateFolder(
      folderId,
      'Updated Folder Name',
      'Updated description'
    )
    console.log('Folder updated:', response)
  } catch (error) {
    console.error('Folder update failed:', error)
  }
}

// Delete folder
async function deleteUserFolder(folderId) {
  try {
    const response = await folderAPI.deleteFolder(folderId)
    console.log('Folder deleted:', response)
  } catch (error) {
    console.error('Folder deletion failed:', error)
  }
}

// Share folder with another user
async function shareFolderWithUser(folderId, userId) {
  try {
    const response = await folderAPI.shareFolder(folderId, userId)
    console.log('Folder shared:', response)
  } catch (error) {
    console.error('Share failed:', error)
  }
}

// ==================== EXAMPLE VUE COMPONENT ====================

/*

<template>
  <div class="dashboard">
    <h1>My Folders</h1>
    
    <button @click="loadFolders">Load Folders</button>
    <button @click="createFolder">Create Folder</button>
    
    <ul v-if="folders.length > 0">
      <li v-for="folder in folders" :key="folder._id">
        {{ folder.name }} - {{ folder.description }}
        <button @click="deleteFolder(folder._id)">Delete</button>
        <button @click="shareFolder(folder._id)">Share</button>
      </li>
    </ul>
    
    <p v-else>No folders found</p>
  </div>
</template>

<script>
import { folderAPI, authAPI } from '@/api.js'

export default {
  data() {
    return {
      folders: []
    }
  },
  
  methods: {
    async loadFolders() {
      const data = await folderAPI.getFolders()
      this.folders = data
    },
    
    async createFolder() {
      const name = prompt('Folder name:')
      const description = prompt('Description:')
      
      if (name) {
        const response = await folderAPI.createFolder(name, description)
        this.loadFolders()
      }
    },
    
    async deleteFolder(folderId) {
      if (confirm('Delete this folder?')) {
        await folderAPI.deleteFolder(folderId)
        this.loadFolders()
      }
    },
    
    async shareFolder(folderId) {
      // Get list of users
      const users = await authAPI.getAllUsers()
      const userId = prompt('Enter user ID to share with')
      
      if (userId) {
        await folderAPI.shareFolder(folderId, userId)
        alert('Folder shared!')
      }
    }
  },
  
  mounted() {
    this.loadFolders()
  }
}
</script>

*/

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  logoutUser,
  createNewFolder,
  getUserFolders,
  getSpecificFolder,
  updateUserFolder,
  deleteUserFolder,
  shareFolderWithUser
}

// ==================== EMPLOYEE MANAGEMENT ====================

import api from '@/api.js'

// Get all employees with pagination and filters
async function getEmployees(filters = {}) {
  try {
    const params = {
      page: filters.page || 1,
      pageSize: filters.pageSize || 20,
      search: filters.search || '',
      department: filters.department || '',
      status: filters.status || '',
      employmentType: filters.employmentType || '',
      position: filters.position || ''
    }
    
    const response = await api.get('/employees', { params })
    
    console.log('Employees:', response.data.employees)
    console.log('Total:', response.data.total)
    console.log('Page:', response.data.page)
    console.log('Total Pages:', response.data.totalPages)
    
    return response.data
  } catch (error) {
    console.error('Failed to fetch employees:', error)
    throw error
  }
}

// Get employee statistics
async function getEmployeeStats() {
  try {
    const response = await api.get('/employees/stats')
    
    console.log('Total Employees:', response.data.total)
    console.log('Active Employees:', response.data.active)
    console.log('On Leave:', response.data.onLeave)
    console.log('Terminated:', response.data.terminated)
    console.log('By Department:', response.data.byDepartment)
    console.log('By Type:', response.data.byEmploymentType)
    console.log('By Position:', response.data.byPosition)
    console.log('Recent Hires:', response.data.recentHires)
    
    return response.data
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    throw error
  }
}

// Get single employee by ID or employeeId
async function getEmployee(id) {
  try {
    const response = await api.get(`/employees/${id}`)
    
    console.log('Employee:', response.data)
    console.log('Full Name:', response.data.firstName + ' ' + response.data.lastName)
    console.log('Department:', response.data.department)
    console.log('Position:', response.data.position)
    console.log('Status:', response.data.employmentStatus)
    
    return response.data
  } catch (error) {
    console.error('Failed to fetch employee:', error)
    throw error
  }
}

// Create new employee
async function createEmployee(employeeData) {
  try {
    const payload = {
      employeeId: employeeData.employeeId.toUpperCase(), // Auto uppercase
      firstName: employeeData.firstName,
      lastName: employeeData.lastName,
      khmerName: employeeData.khmerName || '',
      gender: employeeData.gender,
      dateOfBirth: employeeData.dateOfBirth,
      nationalId: employeeData.nationalId || '',
      email: employeeData.email,
      phone: employeeData.phone,
      address: {
        street: employeeData.address?.street || '',
        city: employeeData.address?.city || '',
        province: employeeData.address?.province || '',
        postalCode: employeeData.address?.postalCode || '',
        country: employeeData.address?.country || 'Cambodia'
      },
      emergencyContact: {
        name: employeeData.emergencyContact?.name || '',
        relationship: employeeData.emergencyContact?.relationship || '',
        phone: employeeData.emergencyContact?.phone || ''
      },
      department: employeeData.department, // Department code
      position: employeeData.position,
      employmentType: employeeData.employmentType || 'Full-time',
      employmentStatus: employeeData.employmentStatus || 'Active',
      hireDate: employeeData.hireDate,
      endDate: employeeData.endDate || null,
      salary: {
        amount: employeeData.salary?.amount || 0,
        currency: employeeData.salary?.currency || 'USD',
        paymentFrequency: employeeData.salary?.paymentFrequency || 'Monthly'
      }
    }
    
    const response = await api.post('/employees', payload)
    
    console.log('Employee created successfully!')
    console.log('New Employee:', response.data.employee)
    
    return response.data
  } catch (error) {
    console.error('Failed to create employee:', error.response?.data?.message || error.message)
    throw error
  }
}

// Example: Create employee with minimal data
async function createEmployeeMinimal() {
  const newEmployee = {
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    gender: 'Male',
    email: 'john.doe@hospital.com',
    phone: '+855 12 345 678',
    department: 'D-ADM', // Administrative Office
    position: 'Administrator',
    employmentType: 'Full-time',
    employmentStatus: 'Active',
    hireDate: new Date()
  }
  
  return await createEmployee(newEmployee)
}

// Example: Create employee with full data
async function createEmployeeFull() {
  const newEmployee = {
    employeeId: 'EMP002',
    firstName: 'Jane',
    lastName: 'Smith',
    khmerName: 'ជេន ស្មីត',
    gender: 'Female',
    dateOfBirth: new Date('1990-05-15'),
    nationalId: '123456789',
    email: 'jane.smith@hospital.com',
    phone: '+855 12 987 654',
    address: {
      street: '123 Medical Street',
      city: 'Phnom Penh',
      province: 'Phnom Penh',
      postalCode: '12000',
      country: 'Cambodia'
    },
    emergencyContact: {
      name: 'John Smith',
      relationship: 'Spouse',
      phone: '+855 12 111 222'
    },
    department: 'D-MED', // Medical Department
    position: 'Registered Nurse',
    employmentType: 'Full-time',
    employmentStatus: 'Active',
    hireDate: new Date('2024-01-15'),
    salary: {
      amount: 1500,
      currency: 'USD',
      paymentFrequency: 'Monthly'
    }
  }
  
  return await createEmployee(newEmployee)
}

// Update employee
async function updateEmployee(id, updateData) {
  try {
    const response = await api.put(`/employees/${id}`, updateData)
    
    console.log('Employee updated successfully!')
    console.log('Updated Employee:', response.data.employee)
    
    return response.data
  } catch (error) {
    console.error('Failed to update employee:', error)
    throw error
  }
}

// Example: Update employee position
async function promoteEmployee(employeeId, newPosition, newSalary) {
  const updateData = {
    position: newPosition,
    salary: {
      amount: newSalary,
      currency: 'USD',
      paymentFrequency: 'Monthly'
    }
  }
  
  return await updateEmployee(employeeId, updateData)
}

// Example: Change employee department
async function transferEmployee(employeeId, newDepartmentCode) {
  const updateData = {
    department: newDepartmentCode
  }
  
  return await updateEmployee(employeeId, updateData)
}

// Terminate employee (soft delete)
async function terminateEmployee(id) {
  try {
    const response = await api.delete(`/employees/${id}`)
    
    console.log('Employee terminated successfully!')
    console.log('Terminated Employee:', response.data.employee)
    console.log('Status:', response.data.employee.employmentStatus) // Should be "Terminated"
    console.log('End Date:', response.data.employee.endDate)
    
    return response.data
  } catch (error) {
    console.error('Failed to terminate employee:', error)
    throw error
  }
}

// Bulk update employees
async function bulkUpdateEmployees(employeeIds, updates) {
  try {
    const payload = {
      employeeIds: employeeIds,
      updates: updates
    }
    
    const response = await api.put('/employees/bulk', payload)
    
    console.log('Bulk update successful!')
    console.log('Modified Count:', response.data.modifiedCount)
    
    return response.data
  } catch (error) {
    console.error('Failed to bulk update:', error)
    throw error
  }
}

// Example: Bulk update employment type
async function bulkChangeEmploymentType() {
  const employeeIds = ['EMP001', 'EMP002', 'EMP003']
  const updates = {
    employmentType: 'Contract'
  }
  
  return await bulkUpdateEmployees(employeeIds, updates)
}

// Get employees by department
async function getEmployeesByDepartment(departmentCode) {
  try {
    const response = await api.get(`/employees/department/${departmentCode}`)
    
    console.log('Department Employees:', response.data.employees)
    console.log('Count:', response.data.count)
    
    return response.data
  } catch (error) {
    console.error('Failed to fetch department employees:', error)
    throw error
  }
}

// ==================== EMPLOYEE USAGE IN VUE COMPONENT ====================

/*
<template>
  <div>
    <h1>Employee Management</h1>
    
    <!-- Statistics -->
    <div class="stats">
      <div class="stat-card">
        <h3>Total Employees</h3>
        <p>{{ stats.total }}</p>
      </div>
      <div class="stat-card">
        <h3>Active</h3>
        <p>{{ stats.active }}</p>
      </div>
      <div class="stat-card">
        <h3>On Leave</h3>
        <p>{{ stats.onLeave }}</p>
      </div>
    </div>
    
    <!-- Filters -->
    <div class="filters">
      <input v-model="filters.search" placeholder="Search..." @input="loadEmployees" />
      <select v-model="filters.department" @change="loadEmployees">
        <option value="">All Departments</option>
        <option v-for="dept in departments" :key="dept.code" :value="dept.code">
          {{ dept.name }}
        </option>
      </select>
      <select v-model="filters.status" @change="loadEmployees">
        <option value="">All Status</option>
        <option value="Active">Active</option>
        <option value="On Leave">On Leave</option>
        <option value="Terminated">Terminated</option>
      </select>
    </div>
    
    <!-- Employee List -->
    <table>
      <thead>
        <tr>
          <th>Employee ID</th>
          <th>Name</th>
          <th>Department</th>
          <th>Position</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="emp in employees" :key="emp._id">
          <td>{{ emp.employeeId }}</td>
          <td>{{ emp.firstName }} {{ emp.lastName }}</td>
          <td>{{ emp.department?.name }}</td>
          <td>{{ emp.position }}</td>
          <td>{{ emp.employmentStatus }}</td>
          <td>
            <button @click="editEmployee(emp)">Edit</button>
            <button @click="terminateEmp(emp._id)">Terminate</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Pagination -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/api.js'

const employees = ref([])
const departments = ref([])
const stats = ref({
  total: 0,
  active: 0,
  onLeave: 0,
  terminated: 0
})

const currentPage = ref(1)
const totalPages = ref(1)

const filters = reactive({
  search: '',
  department: '',
  status: ''
})

async function loadEmployees() {
  try {
    const response = await api.get('/employees', {
      params: {
        page: currentPage.value,
        pageSize: 20,
        ...filters
      }
    })
    
    employees.value = response.data.employees
    totalPages.value = response.data.totalPages
  } catch (error) {
    console.error('Failed to load employees:', error)
  }
}

async function loadStats() {
  try {
    const response = await api.get('/employees/stats')
    stats.value = response.data
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

async function loadDepartments() {
  try {
    const response = await api.get('/departments')
    departments.value = response.data.departments
  } catch (error) {
    console.error('Failed to load departments:', error)
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadEmployees()
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    loadEmployees()
  }
}

async function terminateEmp(id) {
  if (confirm('Are you sure?')) {
    try {
      await api.delete(`/employees/${id}`)
      loadEmployees()
      loadStats()
    } catch (error) {
      console.error('Failed to terminate:', error)
    }
  }
}

onMounted(() => {
  loadEmployees()
  loadStats()
  loadDepartments()
})
</script>
*/

export {
  getEmployees,
  getEmployeeStats,
  getEmployee,
  createEmployee,
  createEmployeeMinimal,
  createEmployeeFull,
  updateEmployee,
  promoteEmployee,
  transferEmployee,
  terminateEmployee,
  bulkUpdateEmployees,
  bulkChangeEmploymentType,
  getEmployeesByDepartment
}
