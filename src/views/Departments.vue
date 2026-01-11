<template>
  <div class="departments-container">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Departments Management</h1>
        <p class="page-subtitle">Manage organizational hierarchy and department structure</p>
      </div>
      <div class="header-actions">
        <button @click="initializeDepartments" class="btn btn-outline" title="Initialize from config">
          <i class="fas fa-database"></i> Initialize
        </button>
        <button @click="exportToExcel" class="btn btn-outline" title="Export to Excel">
          <i class="fas fa-file-excel"></i> Export
        </button>
        <button @click="$refs.importFile.click()" class="btn btn-outline" title="Import from Excel">
          <i class="fas fa-file-upload"></i> Import
        </button>
        <input 
          ref="importFile" 
          type="file" 
          accept=".xlsx,.xls" 
          @change="handleImport" 
          style="display: none;"
        />
        <button @click="openCreateModal" class="btn btn-primary">
          <i class="fas fa-plus"></i> Add Department
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <i class="fas fa-building"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Total Departments</div>
          <div class="stat-value">{{ stats.total || 0 }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Active</div>
          <div class="stat-value">{{ stats.active || 0 }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <i class="fas fa-sitemap"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Parent Departments</div>
          <div class="stat-value">{{ stats.withChildren || 0 }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
          <i class="fas fa-layer-group"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Categories</div>
          <div class="stat-value">{{ stats.byCategory?.length || 0 }}</div>
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="filters-bar">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          v-model="searchQuery" 
          @input="handleSearch"
          type="text" 
          placeholder="Search departments by name or code..."
        />
        <button 
          v-if="savedSearches.length > 0"
          @click="showSavedSearches = !showSavedSearches"
          class="btn-icon"
          title="Saved Searches"
        >
          <i class="fas fa-bookmark"></i>
        </button>
        <button 
          v-if="searchQuery || filterCategory || filterStatus"
          @click="saveCurrentSearch"
          class="btn-icon"
          title="Save Search"
        >
          <i class="fas fa-save"></i>
        </button>
      </div>
      
      <div class="filter-group">
        <select v-model="filterCategory" @change="loadDepartments" class="filter-select">
          <option value="">All Categories</option>
          <option value="Administration">Administration</option>
          <option value="Clinical">Clinical</option>
          <option value="Diagnostic">Diagnostic</option>
          <option value="Support">Support</option>
          <option value="Medical">Medical</option>
          <option value="Surgical">Surgical</option>
          <option value="Emergency">Emergency</option>
          <option value="Specialty">Specialty</option>
          <option value="Rehabilitation">Rehabilitation</option>
          <option value="Ancillary">Ancillary</option>
        </select>

        <select v-model="filterStatus" @change="loadDepartments" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="closed">Closed</option>
        </select>

        <select v-model="pageSize" @change="changePageSize" class="filter-select">
          <option :value="20">20 per page</option>
          <option :value="50">50 per page</option>
          <option :value="100">100 per page</option>
          <option :value="200">200 per page</option>
        </select>

        <button @click="toggleView" class="btn btn-outline">
          <i :class="viewMode === 'tree' ? 'fas fa-list' : 'fas fa-sitemap'"></i>
          {{ viewMode === 'tree' ? 'List View' : 'Tree View' }}
        </button>

        <button @click="loadDepartments" class="btn btn-outline" title="Refresh">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
        </button>

        <!-- Bulk Actions -->
        <button 
          v-if="selectedDepts.length > 0"
          @click="showBulkActions = !showBulkActions"
          class="btn btn-warning"
        >
          <i class="fas fa-tasks"></i> Bulk Actions ({{ selectedDepts.length }})
        </button>
      </div>
    </div>

    <!-- Saved Searches Dropdown -->
    <div v-if="showSavedSearches && savedSearches.length > 0" class="saved-searches-panel">
      <h4>Saved Searches</h4>
      <div class="saved-search-list">
        <div 
          v-for="search in savedSearches" 
          :key="search._id"
          class="saved-search-item"
        >
          <div @click="applySavedSearch(search)" style="cursor: pointer; flex: 1;">
            <strong>{{ search.name }}</strong>
            <small v-if="search.isDefault" class="badge-default">Default</small>
          </div>
          <button @click="deleteSavedSearch(search._id)" class="btn-icon btn-danger">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Actions Panel -->
    <div v-if="showBulkActions && selectedDepts.length > 0" class="bulk-actions-panel">
      <h4>Bulk Actions for {{ selectedDepts.length }} departments</h4>
      <div class="bulk-actions-buttons">
        <select v-model="bulkAction" class="filter-select">
          <option value="">Select Action...</option>
          <option value="activate">Activate All</option>
          <option value="deactivate">Deactivate All</option>
          <option value="close">Close All</option>
          <option value="delete">Delete All</option>
        </select>
        <button 
          @click="executeBulkAction" 
          :disabled="!bulkAction"
          class="btn btn-primary"
        >
          <i class="fas fa-bolt"></i> Execute
        </button>
        <button @click="clearSelection" class="btn btn-outline">
          <i class="fas fa-times"></i> Clear Selection
        </button>
      </div>
    </div>

    <!-- Tree Table -->
    <div class="table-container">
      <table class="tree-table">
        <thead>
          <tr>
            <th style="width: 40px;">
              <input 
                type="checkbox" 
                @change="toggleSelectAll"
                :checked="selectedDepts.length === departments.length && departments.length > 0"
                title="Select All"
              />
            </th>
            <th style="width: 40px;"></th>
            <th style="width: 120px;">Code</th>
            <th>Department Name</th>
            <th style="width: 150px;">Category</th>
            <th style="width: 100px;">Status</th>
            <th style="width: 80px;">Staff</th>
            <th style="width: 120px;">Head</th>
            <th style="width: 150px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="loading && departments.length === 0">
            <tr>
              <td colspan="9" class="text-center">
                <i class="fas fa-spinner fa-spin"></i> Loading departments...
              </td>
            </tr>
          </template>
          <template v-else-if="viewMode === 'tree'">
            <template v-for="dept in departments" :key="dept.code">
              <DepartmentRow 
                :department="dept" 
                :level="0"
                :selected="selectedDepts.includes(dept.code)"
                @edit="openEditModal"
                @delete="confirmDelete"
                @view="viewDetails"
                @toggle-select="toggleSelect"
              />
            </template>
          </template>
          <template v-else>
            <tr v-for="dept in departments" :key="dept._id">
              <td>
                <input 
                  type="checkbox" 
                  :checked="selectedDepts.includes(dept.code)"
                  @change="toggleSelect(dept.code)"
                />
              </td>
              <td></td>
              <td>
                <code class="dept-code">{{ dept.code }}</code>
              </td>
              <td>
                <div class="dept-name-cell">
                  {{ dept.name }}
                  <span v-if="dept.parent" class="parent-badge">Child of {{ dept.parent }}</span>
                </div>
              </td>
              <td>
                <span class="category-badge" :style="getCategoryColor(dept.category)">
                  {{ dept.category }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', `status-${dept.status}`]">
                  {{ dept.status }}
                </span>
              </td>
              <td class="text-center">{{ dept.staffCount || 0 }}</td>
              <td>
                <div v-if="dept.head" class="head-info">
                  {{ dept.head.username }}
                </div>
                <span v-else class="text-muted">Not assigned</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="viewDetails(dept)" class="btn-icon" title="View Details">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button @click="openEditModal(dept)" class="btn-icon" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="confirmDelete(dept)" class="btn-icon btn-danger" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </template>
          <template v-if="!loading && departments.length === 0">
            <tr>
              <td colspan="9" class="text-center">
                <div class="empty-state">
                  <i class="fas fa-inbox"></i>
                  <p>No departments found</p>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1 && viewMode === 'list'">
      <button @click="prevPage" :disabled="currentPage === 1" class="btn btn-outline">
        <i class="fas fa-chevron-left"></i> Previous
      </button>
      
      <div class="page-numbers">
        <button 
          v-for="page in visiblePages" 
          :key="page"
          @click="goToPage(page)"
          :class="['page-btn', { active: page === currentPage }]"
        >
          {{ page }}
        </button>
      </div>
      
      <button @click="nextPage" :disabled="currentPage === totalPages" class="btn btn-outline">
        Next <i class="fas fa-chevron-right"></i>
      </button>
      
      <span class="page-info">
        Page {{ currentPage }} of {{ totalPages }} ({{ total }} total)
      </span>
    </div>

    <!-- Create/Edit Modal -->
    <transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-dialog" style="max-width: 900px;">
          <div class="modal-header">
            <h3>{{ modalMode === 'create' ? 'Create Department' : 'Edit Department' }}</h3>
            <button @click="closeModal" class="btn-close">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveDepartment">
              <div class="form-grid">
                <!-- Left Column -->
                <div>
                  <div class="form-group">
                    <label>Code <span class="required">*</span></label>
                    <input 
                      v-model="formData.code" 
                      type="text" 
                      required
                      :disabled="modalMode === 'edit'"
                      placeholder="e.g., ADM-HR"
                      class="form-control"
                    />
                  </div>

                  <div class="form-group">
                    <label>Department Name <span class="required">*</span></label>
                    <input 
                      v-model="formData.name" 
                      type="text" 
                      required
                      placeholder="e.g., Human Resources"
                      class="form-control"
                    />
                  </div>

                  <div class="form-group">
                    <label>Category <span class="required">*</span></label>
                    <select v-model="formData.category" required class="form-control">
                      <option value="">Select category</option>
                      <option value="Administration">Administration</option>
                      <option value="Clinical">Clinical</option>
                      <option value="Diagnostic">Diagnostic</option>
                      <option value="Support">Support</option>
                      <option value="Medical">Medical</option>
                      <option value="Surgical">Surgical</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Specialty">Specialty</option>
                      <option value="Rehabilitation">Rehabilitation</option>
                      <option value="Ancillary">Ancillary</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Parent Department</label>
                    <select v-model="formData.parent" class="form-control">
                      <option value="">None (Top Level)</option>
                      <option v-for="dept in parentDepartments" :key="dept.code" :value="dept.code">
                        {{ dept.code }} - {{ dept.name }}
                      </option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Status</label>
                    <select v-model="formData.status" class="form-control">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Description</label>
                    <textarea 
                      v-model="formData.description" 
                      rows="3"
                      placeholder="Department description"
                      class="form-control"
                    ></textarea>
                  </div>
                </div>

                <!-- Right Column -->
                <div>
                  <div class="form-group">
                    <label>Email</label>
                    <input 
                      v-model="formData.email" 
                      type="email"
                      placeholder="department@hospital.com"
                      class="form-control"
                    />
                  </div>

                  <div class="form-group">
                    <label>Phone</label>
                    <input 
                      v-model="formData.phone" 
                      type="tel"
                      placeholder="555-1234"
                      class="form-control"
                    />
                  </div>

                  <div class="form-group">
                    <label>Extension</label>
                    <input 
                      v-model="formData.extension" 
                      type="text"
                      placeholder="1234"
                      class="form-control"
                    />
                  </div>

                  <div class="form-group">
                    <label>Location</label>
                    <input 
                      v-model="formData.location" 
                      type="text"
                      placeholder="Building/Room"
                      class="form-control"
                    />
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Floor</label>
                      <input 
                        v-model="formData.floor" 
                        type="text"
                        placeholder="2nd"
                        class="form-control"
                      />
                    </div>
                    <div class="form-group">
                      <label>Building</label>
                      <input 
                        v-model="formData.building" 
                        type="text"
                        placeholder="Main"
                        class="form-control"
                      />
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Staff Count</label>
                      <input 
                        v-model.number="formData.staffCount" 
                        type="number"
                        min="0"
                        class="form-control"
                      />
                    </div>
                    <div class="form-group">
                      <label>Display Order</label>
                      <input 
                        v-model.number="formData.order" 
                        type="number"
                        min="0"
                        class="form-control"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" @click="closeModal" class="btn btn-outline">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  <i class="fas fa-spinner fa-spin" v-if="saving"></i>
                  {{ saving ? 'Saving...' : (modalMode === 'create' ? 'Create' : 'Update') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- View Details Modal -->
    <transition name="modal">
      <div v-if="showDetailsModal" class="modal-overlay" @click.self="showDetailsModal = false">
        <div class="modal-dialog" style="max-width: 800px;">
          <div class="modal-header">
            <h3>Department Details</h3>
            <button @click="showDetailsModal = false" class="btn-close">&times;</button>
          </div>
          <div class="modal-body" v-if="selectedDepartment">
            <div class="details-grid">
              <div class="detail-item">
                <label>Code:</label>
                <span><code>{{ selectedDepartment.code }}</code></span>
              </div>
              <div class="detail-item">
                <label>Name:</label>
                <span>{{ selectedDepartment.name }}</span>
              </div>
              <div class="detail-item">
                <label>Category:</label>
                <span class="category-badge" :style="getCategoryColor(selectedDepartment.category)">
                  {{ selectedDepartment.category }}
                </span>
              </div>
              <div class="detail-item">
                <label>Status:</label>
                <span :class="['status-badge', `status-${selectedDepartment.status}`]">
                  {{ selectedDepartment.status }}
                </span>
              </div>
              <div class="detail-item" v-if="selectedDepartment.parent">
                <label>Parent Department:</label>
                <span><code>{{ selectedDepartment.parent }}</code></span>
              </div>
              <div class="detail-item" v-if="selectedDepartment.description">
                <label>Description:</label>
                <span>{{ selectedDepartment.description }}</span>
              </div>
              <div class="detail-item" v-if="selectedDepartment.email">
                <label>Email:</label>
                <span>{{ selectedDepartment.email }}</span>
              </div>
              <div class="detail-item" v-if="selectedDepartment.phone">
                <label>Phone:</label>
                <span>{{ selectedDepartment.phone }}</span>
              </div>
              <div class="detail-item" v-if="selectedDepartment.extension">
                <label>Extension:</label>
                <span>{{ selectedDepartment.extension }}</span>
              </div>
              <div class="detail-item" v-if="selectedDepartment.location">
                <label>Location:</label>
                <span>{{ selectedDepartment.location }}</span>
              </div>
              <div class="detail-item">
                <label>Staff Count:</label>
                <span>{{ selectedDepartment.staffCount || 0 }}</span>
              </div>
              <div class="detail-item" v-if="selectedDepartment.head">
                <label>Department Head:</label>
                <span>{{ selectedDepartment.head.username }}</span>
              </div>
            </div>

            <div v-if="childrenDepts.length > 0" class="children-section">
              <h4>Child Departments ({{ childrenDepts.length }})</h4>
              <div class="children-list">
                <div v-for="child in childrenDepts" :key="child.code" class="child-item">
                  <code>{{ child.code }}</code> - {{ child.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { departmentAPI } from '../api';
import DepartmentRow from '../components/DepartmentRow.vue';

// State
const departments = ref([]);
const stats = ref({});
const loading = ref(false);
const saving = ref(false);
const searchQuery = ref('');
const filterCategory = ref('');
const filterStatus = ref('');
const viewMode = ref('tree');
const currentPage = ref(1);
const pageSize = ref(50);
const total = ref(0);
const totalPages = ref(0);

// Bulk operations
const selectedDepts = ref([]);
const showBulkActions = ref(false);
const bulkAction = ref('');

// Saved searches
const savedSearches = ref([]);
const showSavedSearches = ref(false);

// Modal
const showModal = ref(false);
const showDetailsModal = ref(false);
const modalMode = ref('create');
const selectedDepartment = ref(null);
const childrenDepts = ref([]);
const formData = ref({
  code: '',
  name: '',
  category: '',
  parent: '',
  status: 'active',
  description: '',
  email: '',
  phone: '',
  extension: '',
  location: '',
  floor: '',
  building: '',
  staffCount: 0,
  order: 0
});

// Parent departments for dropdown (exclude current when editing)
const parentDepartments = ref([]);

// Computed
const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - 2);
  let end = Math.min(totalPages.value, start + maxVisible - 1);
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// Methods
const loadDepartments = async () => {
  try {
    loading.value = true;
    const params = {
      page: viewMode.value === 'list' ? currentPage.value : 1,
      pageSize: viewMode.value === 'list' ? pageSize.value : 1000,
      search: searchQuery.value,
      category: filterCategory.value,
      status: filterStatus.value,
      tree: viewMode.value === 'tree'
    };
    
    const response = await departmentAPI.getDepartments(params);
    departments.value = response.departments || [];
    total.value = response.total || 0;
    totalPages.value = response.totalPages || 1;
    
    // Load parent departments for dropdown
    if (!parentDepartments.value.length) {
      const allDepts = await departmentAPI.getDepartments({ pageSize: 1000 });
      parentDepartments.value = allDepts.departments || [];
    }
  } catch (error) {
    console.error('Error loading departments:', error);
    alert('Failed to load departments');
  } finally {
    loading.value = false;
  }
};

const loadStats = async () => {
  try {
    const response = await departmentAPI.getStats();
    stats.value = response;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
};

const handleSearch = (() => {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      currentPage.value = 1;
      loadDepartments();
    }, 500);
  };
})();

const toggleView = () => {
  viewMode.value = viewMode.value === 'tree' ? 'list' : 'tree';
  currentPage.value = 1;
  loadDepartments();
};

const changePageSize = () => {
  currentPage.value = 1;
  loadDepartments();
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadDepartments();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    loadDepartments();
  }
};

const goToPage = (page) => {
  currentPage.value = page;
  loadDepartments();
};

const openCreateModal = () => {
  modalMode.value = 'create';
  formData.value = {
    code: '',
    name: '',
    category: '',
    parent: '',
    status: 'active',
    description: '',
    email: '',
    phone: '',
    extension: '',
    location: '',
    floor: '',
    building: '',
    staffCount: 0,
    order: 0
  };
  showModal.value = true;
};

const openEditModal = (dept) => {
  modalMode.value = 'edit';
  formData.value = {
    code: dept.code,
    name: dept.name,
    category: dept.category,
    parent: dept.parent || '',
    status: dept.status,
    description: dept.description || '',
    email: dept.email || '',
    phone: dept.phone || '',
    extension: dept.extension || '',
    location: dept.location || '',
    floor: dept.floor || '',
    building: dept.building || '',
    staffCount: dept.staffCount || 0,
    order: dept.order || 0
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveDepartment = async () => {
  try {
    saving.value = true;
    
    if (modalMode.value === 'create') {
      await departmentAPI.createDepartment(formData.value);
    } else {
      await departmentAPI.updateDepartment(formData.value.code, formData.value);
    }
    
    closeModal();
    await loadDepartments();
    await loadStats();
  } catch (error) {
    console.error('Error saving department:', error);
    alert(error.message || 'Failed to save department');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (dept) => {
  if (!confirm(`Delete department "${dept.name}"?\n\nThis action cannot be undone.`)) {
    return;
  }
  
  try {
    await departmentAPI.deleteDepartment(dept.code);
    await loadDepartments();
    await loadStats();
  } catch (error) {
    console.error('Error deleting department:', error);
    alert(error.message || 'Failed to delete department');
  }
};

const viewDetails = async (dept) => {
  try {
    const response = await departmentAPI.getDepartment(dept.code);
    selectedDepartment.value = response.department;
    childrenDepts.value = response.children || [];
    showDetailsModal.value = true;
  } catch (error) {
    console.error('Error loading department details:', error);
    alert('Failed to load department details');
  }
};

const initializeDepartments = async () => {
  if (!confirm('Initialize departments from configuration?\n\nThis will add default departments if none exist.')) {
    return;
  }
  
  try {
    loading.value = true;
    const response = await departmentAPI.initializeDepartments();
    alert(response.message);
    await loadDepartments();
    await loadStats();
  } catch (error) {
    console.error('Error initializing departments:', error);
    alert('Failed to initialize departments');
  } finally {
    loading.value = false;
  }
};

const getCategoryColor = (category) => {
  const colors = {
    'Administration': 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;',
    'Clinical': 'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;',
    'Diagnostic': 'background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;',
    'Support': 'background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white;',
    'Medical': 'background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white;',
    'Surgical': 'background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); color: white;',
    'Emergency': 'background: linear-gradient(135deg, #ff0844 0%, #ffb199 100%); color: white;',
    'Specialty': 'background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333;',
    'Rehabilitation': 'background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); color: #333;',
    'Ancillary': 'background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%); color: #333;'
  };
  return colors[category] || 'background: #e0e0e0; color: #333;';
};

// Bulk Operations
const toggleSelect = (code) => {
  const index = selectedDepts.value.indexOf(code);
  if (index > -1) {
    selectedDepts.value.splice(index, 1);
  } else {
    selectedDepts.value.push(code);
  }
};

const toggleSelectAll = () => {
  if (selectedDepts.value.length === departments.value.length) {
    selectedDepts.value = [];
  } else {
    selectedDepts.value = departments.value.map(d => d.code);
  }
};

const clearSelection = () => {
  selectedDepts.value = [];
  showBulkActions.value = false;
  bulkAction.value = '';
};

const executeBulkAction = async () => {
  if (!bulkAction.value || selectedDepts.value.length === 0) return;
  
  const actionText = {
    activate: 'activate',
    deactivate: 'deactivate',
    close: 'close',
    delete: 'DELETE'
  }[bulkAction.value];
  
  if (!confirm(`Are you sure you want to ${actionText} ${selectedDepts.value.length} departments?`)) {
    return;
  }
  
  try {
    loading.value = true;
    
    if (bulkAction.value === 'delete') {
      await departmentAPI.bulkDelete(selectedDepts.value);
    } else {
      const statusMap = {
        activate: 'active',
        deactivate: 'inactive',
        close: 'closed'
      };
      await departmentAPI.bulkUpdate(selectedDepts.value, { status: statusMap[bulkAction.value] });
    }
    
    clearSelection();
    await loadDepartments();
    await loadStats();
    alert('Bulk operation completed successfully!');
  } catch (error) {
    console.error('Bulk operation failed:', error);
    alert(error.message || 'Bulk operation failed');
  } finally {
    loading.value = false;
  }
};

// Import/Export
const exportToExcel = async () => {
  try {
    loading.value = true;
    await departmentAPI.exportExcel();
    alert('Departments exported to Excel successfully!');
  } catch (error) {
    console.error('Export failed:', error);
    alert('Failed to export departments');
  } finally {
    loading.value = false;
  }
};

const handleImport = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!confirm('Import departments from Excel?\n\nThis will add new departments and skip duplicates.')) {
    event.target.value = '';
    return;
  }
  
  try {
    loading.value = true;
    const result = await departmentAPI.importExcel(file);
    
    let message = `Import complete!\n\n`;
    message += `✓ Imported: ${result.imported}\n`;
    message += `✗ Errors: ${result.errors}\n`;
    
    if (result.errorDetails && result.errorDetails.length > 0) {
      message += `\nError details:\n`;
      result.errorDetails.slice(0, 5).forEach(err => {
        message += `Row ${err.row}: ${err.error}\n`;
      });
      if (result.errorDetails.length > 5) {
        message += `... and ${result.errorDetails.length - 5} more errors\n`;
      }
    }
    
    alert(message);
    await loadDepartments();
    await loadStats();
  } catch (error) {
    console.error('Import failed:', error);
    alert('Failed to import departments: ' + error.message);
  } finally {
    loading.value = false;
    event.target.value = '';
  }
};

// Saved Searches
const loadSavedSearches = async () => {
  try {
    const searches = await departmentAPI.getSavedSearches();
    savedSearches.value = searches;
  } catch (error) {
    console.error('Failed to load saved searches:', error);
  }
};

const saveCurrentSearch = async () => {
  const name = prompt('Enter a name for this search:');
  if (!name) return;
  
  try {
    const criteria = {
      search: searchQuery.value,
      category: filterCategory.value,
      status: filterStatus.value
    };
    
    await departmentAPI.saveSearch(name, criteria);
    await loadSavedSearches();
    alert('Search saved successfully!');
  } catch (error) {
    console.error('Failed to save search:', error);
    alert('Failed to save search');
  }
};

const applySavedSearch = (search) => {
  searchQuery.value = search.criteria.search || '';
  filterCategory.value = search.criteria.category || '';
  filterStatus.value = search.criteria.status || '';
  showSavedSearches.value = false;
  loadDepartments();
};

const deleteSavedSearch = async (id) => {
  if (!confirm('Delete this saved search?')) return;
  
  try {
    await departmentAPI.deleteSavedSearch(id);
    await loadSavedSearches();
  } catch (error) {
    console.error('Failed to delete search:', error);
    alert('Failed to delete search');
  }
};

onMounted(() => {
  loadDepartments();
  loadStats();
  loadSavedSearches();
});
</script>

<style scoped>
.departments-container {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #1a202c;
}

.page-subtitle {
  color: #718096;
  margin: 0.5rem 0 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
}

.filters-bar {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.search-box {
  position: relative;
  margin-bottom: 1rem;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
}

.filter-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.tree-table {
  width: 100%;
  border-collapse: collapse;
}

.tree-table thead {
  background: #f7fafc;
  border-bottom: 2px solid #e2e8f0;
}

.tree-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tree-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.dept-code {
  background: #edf2f7;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  font-weight: 600;
}

.dept-name-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.parent-badge {
  font-size: 0.75rem;
  color: #718096;
  font-style: italic;
}

.category-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-active {
  background: #c6f6d5;
  color: #22543d;
}

.status-inactive {
  background: #fed7d7;
  color: #742a2a;
}

.status-closed {
  background: #e2e8f0;
  color: #4a5568;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  padding: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  color: #4a5568;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #edf2f7;
  color: #2d3748;
}

.btn-icon.btn-danger:hover {
  background: #fed7d7;
  color: #c53030;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.page-btn.active {
  background: #4299e1;
  color: white;
  border-color: #4299e1;
}

.page-info {
  color: #718096;
  font-size: 0.875rem;
  margin-left: 1rem;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: #a0aec0;
  font-style: italic;
}

.empty-state {
  padding: 3rem;
  color: #a0aec0;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #1a202c;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #a0aec0;
  line-height: 1;
}

.modal-body {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
}

.required {
  color: #e53e3e;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
}

.form-control:focus {
  outline: none;
  border-color: #4299e1;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 2px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
}

.detail-item span {
  color: #1a202c;
}

.children-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e2e8f0;
}

.children-section h4 {
  margin-bottom: 1rem;
  color: #1a202c;
}

.children-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.75rem;
}

.child-item {
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 6px;
  border-left: 3px solid #4299e1;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-outline {
  background: white;
  border: 2px solid #e2e8f0;
  color: #4a5568;
}

.btn-outline:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.btn-warning {
  background: #fbbf24;
  color: white;
  border: none;
}

.btn-warning:hover {
  background: #f59e0b;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Bulk Actions Panel */
.bulk-actions-panel {
  background: #fffbeb;
  border: 2px solid #fbbf24;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.bulk-actions-panel h4 {
  margin: 0 0 1rem 0;
  color: #92400e;
}

.bulk-actions-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Saved Searches Panel */
.saved-searches-panel {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.saved-searches-panel h4 {
  margin: 0 0 1rem 0;
  color: #1a202c;
}

.saved-search-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.saved-search-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 8px;
  transition: background 0.2s;
}

.saved-search-item:hover {
  background: #edf2f7;
}

.saved-search-item strong {
  color: #2d3748;
}

.badge-default {
  background: #4299e1;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

/* Search box buttons */
.search-box {
  position: relative;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-box input {
  flex: 1;
}

/* Transitions */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
