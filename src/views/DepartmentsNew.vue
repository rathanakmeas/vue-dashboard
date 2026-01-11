<template>
  <div class="departments-prime">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <i class="pi pi-sitemap"></i> Departments Management
        </h1>
        <p class="page-subtitle">Hierarchical organization structure with complete CRUD operations</p>
      </div>
      <div class="header-actions">
        <Button icon="pi pi-plus-circle" label="Add Department" @click="openCreateDialog" severity="primary" class="btn-primary" />
        <Divider layout="vertical" />
        <Button icon="pi pi-download" label="Export" @click="exportToExcel" severity="success" outlined class="btn-export" />
        <Button icon="pi pi-upload" label="Import" @click="$refs.fileUpload.click()" severity="info" outlined class="btn-import" />
        <input ref="fileUpload" type="file" accept=".xlsx,.xls" @change="handleImport" style="display: none;" />
        <Divider layout="vertical" />
        <Button icon="pi pi-refresh" @click="loadDepartments" :loading="loading" severity="secondary" rounded outlined v-tooltip.bottom="'Refresh'" />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-row">
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <i class="pi pi-building stat-icon" style="color: #667eea"></i>
            <div>
              <div class="stat-value">{{ stats.total || 0 }}</div>
              <div class="stat-label">Total Departments</div>
            </div>
          </div>
        </template>
      </Card>
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <i class="pi pi-check-circle stat-icon" style="color: #48bb78"></i>
            <div>
              <div class="stat-value">{{ stats.active || 0 }}</div>
              <div class="stat-label">Active</div>
            </div>
          </div>
        </template>
      </Card>
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <i class="pi pi-sitemap stat-icon" style="color: #4299e1"></i>
            <div>
              <div class="stat-value">{{ stats.withChildren || 0 }}</div>
              <div class="stat-label">Parent Departments</div>
            </div>
          </div>
        </template>
      </Card>
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <i class="pi pi-th-large stat-icon" style="color: #ed8936"></i>
            <div>
              <div class="stat-value">{{ stats.byCategory?.length || 0 }}</div>
              <div class="stat-label">Categories</div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Toolbar -->
    <Toolbar class="mb-4">
      <template #start>
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <InputText v-model="searchQuery" placeholder="Search departments..." @input="handleSearch" />
        </span>
        <Dropdown 
          v-model="filterCategory" 
          :options="categories" 
          placeholder="All Categories" 
          @change="loadDepartments"
          showClear
          class="ml-3"
          scrollHeight="300px"
          :pt="{
            panel: { style: 'background: #f8fafc; border: 2px solid #0288D1; box-shadow: 0 10px 25px rgba(0,0,0,0.3);' },
            list: { style: 'padding: 0.25rem; background: #f8fafc;' },
            item: { style: 'background: #e0f2fe !important; color: #0f172a !important; padding: 0.75rem 1rem; margin-bottom: 0.125rem; border-radius: 4px; font-weight: 600;' }
          }"
        >
          <template #option="slotProps">
            <div style="padding: 0.5rem 0; color: #0f172a; font-weight: 600;">{{ slotProps.option }}</div>
          </template>
        </Dropdown>
        <Dropdown 
          v-model="filterStatus" 
          :options="statuses" 
          placeholder="All Status" 
          @change="loadDepartments"
          showClear
          style="margin-left: 1.5rem;"
          scrollHeight="300px"
          :pt="{
            panel: { style: 'background: #f8fafc; border: 2px solid #0288D1; box-shadow: 0 10px 25px rgba(0,0,0,0.3);' },
            list: { style: 'padding: 0.25rem; background: #f8fafc;' },
            item: { style: 'background: #e0f2fe !important; color: #0f172a !important; padding: 0.75rem 1rem; margin-bottom: 0.125rem; border-radius: 4px; font-weight: 600;' }
          }"
        >
          <template #option="slotProps">
            <div style="padding: 0.5rem 0; color: #0f172a; font-weight: 600;">{{ slotProps.option }}</div>
          </template>
        </Dropdown>
      </template>
      <template #end>
        <Button 
          v-if="selectedNodes.length > 0"
          :label="`Bulk Actions (${selectedNodes.length})`" 
          icon="pi pi-cog" 
          @click="showBulkMenu = !showBulkMenu"
          severity="warning"
        />
      </template>
    </Toolbar>

    <!-- Bulk Actions Menu -->
    <Card v-if="showBulkMenu && selectedNodes.length > 0" class="bulk-card mb-3">
      <template #content>
        <div class="flex align-items-center gap-3">
          <Dropdown 
            v-model="bulkAction" 
            :options="bulkActions" 
            optionLabel="label" 
            optionValue="value" 
            placeholder="Select Action"
            :pt="{
              panel: { style: 'background: #f8fafc; border: 2px solid #0288D1; box-shadow: 0 10px 25px rgba(0,0,0,0.3);' },
              list: { style: 'padding: 0.25rem; background: #f8fafc;' },
              item: { style: 'background: #e0f2fe !important; color: #0f172a !important; padding: 0.75rem 1rem; margin-bottom: 0.125rem; border-radius: 4px; font-weight: 600;' }
            }"
          />
          <Button label="Execute" icon="pi pi-check" @click="executeBulkAction" :disabled="!bulkAction" />
          <Button label="Clear Selection" icon="pi pi-times" @click="clearSelection" severity="secondary" />
        </div>
      </template>
    </Card>

    <!-- TreeTable -->
    <TreeTable 
      :value="treeData" 
      v-model:selectionKeys="selectedNodes"
      :loading="loading"
      showGridlines
      :resizableColumns="true"
      columnResizeMode="fit"
      class="prime-treetable"
      :paginator="false"
      selectionMode="checkbox"
    >
      <Column selectionMode="multiple" headerStyle="width: 3rem" :expander="false"></Column>
      <Column field="code" header="Code" :expander="true" style="min-width: 200px">
        <template #body="slotProps">
          <Tag :value="slotProps.node.data.code" severity="info" />
        </template>
      </Column>
      <Column field="name" header="Department Name" style="min-width: 300px">
        <template #body="slotProps">
          <strong>{{ slotProps.node.data.name }}</strong>
        </template>
      </Column>
      <Column field="category" header="Category" style="min-width: 180px">
        <template #body="slotProps">
          <Tag :value="slotProps.node.data.category" :style="getCategoryStyle(slotProps.node.data.category)" />
        </template>
      </Column>
      <Column field="status" header="Status" style="min-width: 120px">
        <template #body="slotProps">
          <Tag 
            :value="slotProps.node.data.status" 
            :severity="getStatusSeverity(slotProps.node.data.status)"
          />
        </template>
      </Column>
      <Column field="staffCount" header="Staff" style="min-width: 100px; text-align: center">
        <template #body="slotProps">
          <Badge :value="slotProps.node.data.staffCount || 0" severity="info" />
        </template>
      </Column>
      <Column field="head" header="Department Head" style="min-width: 180px">
        <template #body="slotProps">
          <span v-if="slotProps.node.data.head">
            <i class="pi pi-user"></i> {{ slotProps.node.data.head.username }}
          </span>
          <span v-else class="text-muted">Not assigned</span>
        </template>
      </Column>
      <Column header="Actions" style="min-width: 200px">
        <template #body="slotProps">
          <div class="action-buttons">
            <Button icon="pi pi-eye" rounded text severity="info" @click="viewDetails(slotProps.node.data)" v-tooltip.top="'View'" />
            <Button icon="pi pi-pencil" rounded text severity="warning" @click="openEditDialog(slotProps.node.data)" v-tooltip.top="'Edit'" />
            <Button icon="pi pi-trash" rounded text severity="danger" @click="confirmDelete(slotProps.node.data)" v-tooltip.top="'Delete'" />
          </div>
        </template>
      </Column>
    </TreeTable>

    <!-- Create/Edit Dialog -->
    <Dialog v-model:visible="showDialog" :header="dialogMode === 'create' ? '➕ Create New Department' : '✏️ Edit Department'" :modal="true" :style="{ width: '50rem' }" class="department-dialog">
      <div class="form-grid">
        <div class="field">
          <label for="code">Code <span class="required">*</span></label>
          <InputText id="code" v-model="formData.code" :disabled="dialogMode === 'edit'" class="w-full" />
        </div>
        <div class="field">
          <label for="name">Name <span class="required">*</span></label>
          <InputText id="name" v-model="formData.name" class="w-full" />
        </div>
        <div class="field">
          <label for="category">Category <span class="required">*</span></label>
          <Dropdown 
            id="category" 
            v-model="formData.category" 
            :options="categories" 
            placeholder="Select Category" 
            class="w-full" 
            appendTo="body"
            scrollHeight="300px"
            :pt="{
              panel: { style: 'background: #f8fafc; border: 2px solid #0288D1; box-shadow: 0 10px 25px rgba(0,0,0,0.3);' },
              list: { style: 'padding: 0.25rem; background: #f8fafc;' },
              item: { style: 'background: #e0f2fe !important; color: #0f172a !important; padding: 0.75rem 1rem; margin-bottom: 0.125rem; border-radius: 4px; font-weight: 600;' }
            }"
          >
            <template #option="slotProps">
              <div style="padding: 0.5rem 0; color: #0f172a; font-weight: 600;">{{ slotProps.option }}</div>
            </template>
          </Dropdown>
        </div>
        <div class="field">
          <label for="status">Status</label>
          <Dropdown 
            id="status" 
            v-model="formData.status" 
            :options="statuses" 
            class="w-full" 
            appendTo="body"
            scrollHeight="300px"
            :pt="{
              panel: { style: 'background: #f8fafc; border: 2px solid #0288D1; box-shadow: 0 10px 25px rgba(0,0,0,0.3);' },
              list: { style: 'padding: 0.25rem; background: #f8fafc;' },
              item: { style: 'background: #e0f2fe !important; color: #0f172a !important; padding: 0.75rem 1rem; margin-bottom: 0.125rem; border-radius: 4px; font-weight: 600;' }
            }"
          >
            <template #option="slotProps">
              <div style="padding: 0.5rem 0; color: #0f172a; font-weight: 600;">{{ slotProps.option }}</div>
            </template>
          </Dropdown>
        </div>
        <div class="field">
          <label for="parent">Parent Department</label>
          <Dropdown 
            id="parent" 
            v-model="formData.parent" 
            :options="parentOptions" 
            optionLabel="name" 
            optionValue="code"
            placeholder="None (Top Level)" 
            showClear
            class="w-full"
            appendTo="body"
            scrollHeight="300px"
            :pt="{
              panel: { style: 'background: #f8fafc; border: 2px solid #0288D1; box-shadow: 0 10px 25px rgba(0,0,0,0.3);' },
              list: { style: 'padding: 0.25rem; background: #f8fafc;' },
              item: { style: 'background: #e0f2fe !important; color: #0f172a !important; padding: 0.75rem 1rem; margin-bottom: 0.125rem; border-radius: 4px; font-weight: 600;' }
            }"
          >
            <template #option="slotProps">
              <div style="padding: 0.5rem 0; color: #0f172a; font-weight: 600;">{{ slotProps.option.name }}</div>
            </template>
          </Dropdown>
        </div>
        <div class="field">
          <label for="staffCount">Staff Count</label>
          <InputNumber id="staffCount" v-model="formData.staffCount" class="w-full" />
        </div>
        <div class="field col-span-2">
          <label for="description">Description</label>
          <Textarea id="description" v-model="formData.description" rows="3" class="w-full" />
        </div>
        <div class="field">
          <label for="email">Email</label>
          <InputText id="email" v-model="formData.email" class="w-full" />
        </div>
        <div class="field">
          <label for="phone">Phone</label>
          <InputText id="phone" v-model="formData.phone" class="w-full" />
        </div>
        <div class="field">
          <label for="location">Location</label>
          <InputText id="location" v-model="formData.location" class="w-full" />
        </div>
        <div class="field">
          <label for="building">Building</label>
          <InputText id="building" v-model="formData.building" class="w-full" />
        </div>
      </div>
      <template #footer>
        <div style="display: flex; gap: 1rem; justify-content: flex-end; padding: 0.5rem;">
          <Button 
            label="Cancel" 
            icon="pi pi-times" 
            @click="showDialog = false" 
            severity="secondary"
            style="min-width: 120px; font-weight: 600; border-radius: 8px; padding: 0.75rem 1.5rem;"
            class="cancel-btn"
          />
          <Button 
            label="Save" 
            icon="pi pi-check" 
            @click="saveDepartment" 
            :loading="saving"
            style="min-width: 120px; font-weight: 600; border-radius: 8px; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #0288D1 0%, #00BCD4 100%); border: none;"
            class="save-btn"
          />
        </div>
      </template>
    </Dialog>

    <!-- View Details Dialog -->
    <Dialog v-model:visible="showDetailsDialog" header="📋 Department Details" :modal="true" :style="{ width: '45rem' }" class="details-dialog">
      <div v-if="selectedDepartment" class="details-content">
        <div class="detail-row">
          <strong>Code:</strong> <Tag :value="selectedDepartment.code" severity="info" />
        </div>
        <div class="detail-row">
          <strong>Name:</strong> {{ selectedDepartment.name }}
        </div>
        <div class="detail-row">
          <strong>Category:</strong> <Tag :value="selectedDepartment.category" />
        </div>
        <div class="detail-row">
          <strong>Status:</strong> <Tag :value="selectedDepartment.status" :severity="getStatusSeverity(selectedDepartment.status)" />
        </div>
        <div class="detail-row">
          <strong>Staff Count:</strong> {{ selectedDepartment.staffCount || 0 }}
        </div>
        <div class="detail-row" v-if="selectedDepartment.head">
          <strong>Department Head:</strong> {{ selectedDepartment.head.username }}
        </div>
        <div class="detail-row" v-if="selectedDepartment.description">
          <strong>Description:</strong> {{ selectedDepartment.description }}
        </div>
        <div class="detail-row" v-if="selectedDepartment.email">
          <strong>Email:</strong> {{ selectedDepartment.email }}
        </div>
        <div class="detail-row" v-if="selectedDepartment.phone">
          <strong>Phone:</strong> {{ selectedDepartment.phone }}
        </div>
        <div class="detail-row" v-if="selectedDepartment.location">
          <strong>Location:</strong> {{ selectedDepartment.location }}
        </div>
        <Divider v-if="childrenDepts.length > 0" />
        <div v-if="childrenDepts.length > 0">
          <strong>Sub-departments ({{ childrenDepts.length }}):</strong>
          <ul>
            <li v-for="child in childrenDepts" :key="child.code">{{ child.code }} - {{ child.name }}</li>
          </ul>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { departmentAPI } from '../api';

// PrimeVue Components
import TreeTable from 'primevue/treetable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import Toolbar from 'primevue/toolbar';
import Divider from 'primevue/divider';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

// Data
const loading = ref(false);
const saving = ref(false);
const departments = ref([]);
const treeData = ref([]);
const stats = ref({});
const searchQuery = ref('');
const filterCategory = ref(null);
const filterStatus = ref(null);

// Selection
const selectedNodes = ref({});
const showBulkMenu = ref(false);
const bulkAction = ref(null);

// Dialog
const showDialog = ref(false);
const showDetailsDialog = ref(false);
const dialogMode = ref('create');
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

// Options
const categories = [
  'Administration',
  'Clinical',
  'Diagnostic',
  'Support',
  'Medical',
  'Surgical',
  'Emergency',
  'Specialty',
  'Rehabilitation',
  'Ancillary'
];

const statuses = ['active', 'inactive', 'closed'];

const bulkActions = [
  { label: 'Activate All', value: 'activate' },
  { label: 'Deactivate All', value: 'deactivate' },
  { label: 'Close All', value: 'close' },
  { label: 'Delete All', value: 'delete' }
];

const parentOptions = computed(() => {
  return departments.value.filter(d => d.code !== formData.value.code);
});

// Methods
const loadDepartments = async () => {
  try {
    loading.value = true;
    const params = {
      page: 1,
      pageSize: 1000,
      search: searchQuery.value,
      category: filterCategory.value,
      status: filterStatus.value,
      tree: true
    };
    
    const response = await departmentAPI.getDepartments(params);
    departments.value = flattenTree(response.departments);
    treeData.value = buildPrimeTree(response.departments);
  } catch (error) {
    console.error('Error loading departments:', error);
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

const buildPrimeTree = (depts) => {
  return depts.map(dept => ({
    key: dept.code,
    data: dept,
    children: dept.children ? buildPrimeTree(dept.children) : []
  }));
};

const flattenTree = (tree) => {
  let result = [];
  tree.forEach(node => {
    result.push(node);
    if (node.children && node.children.length > 0) {
      result = result.concat(flattenTree(node.children));
    }
  });
  return result;
};

const handleSearch = (() => {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(loadDepartments, 500);
  };
})();

const openCreateDialog = () => {
  dialogMode.value = 'create';
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
  showDialog.value = true;
};

const openEditDialog = (dept) => {
  dialogMode.value = 'edit';
  formData.value = { ...dept };
  showDialog.value = true;
};

const saveDepartment = async () => {
  try {
    saving.value = true;
    
    if (dialogMode.value === 'create') {
      await departmentAPI.createDepartment(formData.value);
    } else {
      await departmentAPI.updateDepartment(formData.value.code, formData.value);
    }
    
    showDialog.value = false;
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
    showDetailsDialog.value = true;
  } catch (error) {
    console.error('Error loading department details:', error);
    alert('Failed to load department details');
  }
};

const clearSelection = () => {
  selectedNodes.value = {};
  showBulkMenu.value = false;
  bulkAction.value = null;
};

const executeBulkAction = async () => {
  if (!bulkAction.value) return;
  
  const selectedCodes = Object.keys(selectedNodes.value).filter(key => selectedNodes.value[key].checked);
  
  if (!confirm(`Are you sure you want to ${bulkAction.value} ${selectedCodes.length} departments?`)) {
    return;
  }
  
  try {
    loading.value = true;
    
    if (bulkAction.value === 'delete') {
      await departmentAPI.bulkDelete(selectedCodes);
    } else {
      const statusMap = {
        activate: 'active',
        deactivate: 'inactive',
        close: 'closed'
      };
      await departmentAPI.bulkUpdate(selectedCodes, { status: statusMap[bulkAction.value] });
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

const getStatusSeverity = (status) => {
  const map = {
    active: 'success',
    inactive: 'warning',
    closed: 'danger'
  };
  return map[status] || 'info';
};

const getCategoryStyle = (category) => {
  const colors = {
    'Administration': 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none;',
    'Clinical': 'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border: none;',
    'Diagnostic': 'background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border: none;',
    'Support': 'background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; border: none;',
    'Medical': 'background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; border: none;',
    'Surgical': 'background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); color: white; border: none;'
  };
  return colors[category] || 'background: #e0e0e0; color: #333; border: none;';
};

onMounted(() => {
  loadDepartments();
  loadStats();
});
</script>

<style scoped>
.departments-prime {
  padding: 2rem;
  background: linear-gradient(to bottom, #E1F5FE 0%, #F0F4F8 100%);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  background: #0288D1;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(2, 136, 209, 0.25);
  color: white;
  border-bottom: 4px solid #01579B;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.page-title i {
  font-size: 2.5rem;
}

.page-subtitle {
  margin: 0.75rem 0 0 0;
  font-size: 1rem;
  opacity: 0.95;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}

.btn-primary {
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
}

.btn-export,
.btn-import {
  font-weight: 600;
  padding: 0.65rem 1.25rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 4px 6px rgba(0,0,0,0.07);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.12);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
}

.stat-icon {
  font-size: 3rem;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #E1F5FE;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a202c;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bulk-card {
  background: linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 50%);
  border: 2px solid #0288D1;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(2, 136, 209, 0.2);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 700;
  color: #01579B;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.35rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.col-span-2 {
  grid-column: span 2;
}

.required {
  color: #e53e3e;
  font-weight: 700;
}

.w-full {
  width: 100%;
}

.ml-3 {
  margin-left: 0.75rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.text-muted {
  color: #a0aec0;
  font-style: italic;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.detail-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem 1.5rem;
  background: #ffffff;
  border-left: 4px solid #00BCD4;
  border-radius: 6px;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 188, 212, 0.1);
}

.detail-row:hover {
  background: #E1F5FE;
  border-left-color: #0288D1;
  transform: translateX(6px);
  box-shadow: 0 2px 8px rgba(2, 136, 209, 0.15);
}

.detail-row strong {
  min-width: 160px;
  color: #4a5568;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

:deep(.prime-treetable) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.07);
  background: white;
}

:deep(.p-treetable .p-treetable-thead > tr > th) {
  background: linear-gradient(135deg, #0288D1 0%, #00BCD4 100%);
  color: white;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.75rem;
  padding: 1.25rem 1rem;
  border: none;
}

:deep(.p-treetable .p-treetable-tbody > tr) {
  transition: all 0.2s;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}

/* Parent departments that have children - highlighted background */
:deep(.p-treetable .p-treetable-tbody > tr:has(.p-treetable-toggler)) {
  background: linear-gradient(90deg, #E1F5FE 0%, #F0F9FF 100%);
  font-weight: 600;
  border-left: 4px solid #0288D1;
}

/* Child department rows - level 1 - white background */
:deep(.p-treetable .p-treetable-tbody > tr[aria-level="1"]) {
  background: #ffffff;
  font-weight: 500;
  border-left: 4px solid #4FC3F7;
}

/* Child department rows - level 2 - white background */
:deep(.p-treetable .p-treetable-tbody > tr[aria-level="2"]) {
  background: #ffffff;
  font-weight: 400;
  border-left: 4px solid #81D4FA;
}

:deep(.p-treetable .p-treetable-tbody > tr:hover) {
  background: linear-gradient(90deg, #B3E5FC 0%, #E1F5FE 100%);
  transform: translateX(4px);
  box-shadow: -4px 0 0 #0288D1, 0 2px 8px rgba(2, 136, 209, 0.15);
}

:deep(.p-treetable .p-treetable-tbody > tr > td) {
  padding: 1rem;
  vertical-align: middle;
}

/* TreeTable Toggler Icon Styling */
:deep(.p-treetable-toggler) {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #0288D1 0%, #00BCD4 100%);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(2, 136, 209, 0.3);
}

:deep(.p-treetable-toggler:hover) {
  transform: scale(1.15) rotate(90deg);
  box-shadow: 0 4px 12px rgba(2, 136, 209, 0.5);
  background: linear-gradient(135deg, #0277BD 0%, #00ACC1 100%);
}

:deep(.p-treetable-toggler-icon) {
  color: #ffffff !important;
  font-size: 1.25rem !important;
  font-weight: 900 !important;
}

:deep(.p-toolbar) {
  background: white;
  border: none;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
}

:deep(.p-button) {
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.8rem;
}

:deep(.p-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

:deep(.p-button-icon-only) {
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
}

/* Enhanced Dialog Footer Buttons */
.cancel-btn {
  background: #f8fafc !important;
  border: 2px solid #cbd5e1 !important;
  color: #475569 !important;
  transition: all 0.2s ease !important;
}

.cancel-btn:hover {
  background: #e2e8f0 !important;
  border-color: #94a3b8 !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.save-btn {
  transition: all 0.2s ease !important;
  box-shadow: 0 2px 8px rgba(2, 136, 209, 0.3) !important;
}

.save-btn:hover {
  background: linear-gradient(135deg, #0277BD 0%, #00ACC1 100%) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(2, 136, 209, 0.5) !important;
}

:deep(.p-button-rounded) {
  border-radius: 50%;
}

/* Modal Backdrop - Modern Design */
:deep(.p-dialog-mask) {
  background: linear-gradient(135deg, rgba(3, 169, 244, 0.15) 0%, rgba(2, 136, 209, 0.25) 100%);
  backdrop-filter: saturate(180%) blur(10px);
  -webkit-backdrop-filter: saturate(180%) blur(10px);
  animation: fadeIn 0.25s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

:deep(.p-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 
    0 0 0 1px rgba(2, 136, 209, 0.08),
    0 24px 48px -12px rgba(2, 136, 209, 0.18),
    0 32px 64px -16px rgba(0, 0, 0, 0.12);
  border: none;
  animation: modalSlide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalSlide {
  from {
    transform: translateY(-30px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

:deep(.p-dialog .p-dialog-header) {
  background: linear-gradient(135deg, #0288D1 0%, #03A9F4 100%);
  color: white;
  padding: 2rem 2.5rem;
  border-radius: 0;
  border-bottom: none;
  box-shadow: none;
  position: relative;
  overflow: hidden;
}

:deep(.p-dialog .p-dialog-header::after) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, 
    #00BCD4 0%, 
    #03A9F4 25%, 
    #0288D1 50%, 
    #03A9F4 75%, 
    #00BCD4 100%);
  background-size: 200% 100%;
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

:deep(.p-dialog .p-dialog-header .p-dialog-title) {
  font-weight: 600;
  font-size: 1.5rem;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: -0.5px;
  line-height: 1.3;
}

/* Department Dialog Specific Styles */
:deep(.department-dialog .p-dialog-header) {
  background: linear-gradient(135deg, #0288D1 0%, #0277BD 100%);
}

:deep(.details-dialog .p-dialog-header) {
  background: linear-gradient(135deg, #00BCD4 0%, #00ACC1 100%);
}

:deep(.p-dialog .p-dialog-content) {
  padding: 2.5rem;
  background: #ffffff;
  color: #37474F;
  position: relative;
  z-index: 1;
  line-height: 1.6;
}

:deep(.p-dialog .p-dialog-footer) {
  padding: 1.75rem 2.5rem;
  border-top: 1px solid #E0E0E0;
  background: linear-gradient(to bottom, #FAFAFA 0%, #F5F5F5 100%);
  gap: 1rem;
  display: flex;
  justify-content: flex-end;
}

:deep(.p-card) {
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.07);
  border: none;
  overflow: hidden;
}

:deep(.p-card .p-card-body) {
  padding: 1.5rem;
}

:deep(.p-tag) {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

:deep(.p-badge) {
  border-radius: 20px;
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 2rem;
  height: 1.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

:deep(.p-inputtext) {
  border-radius: 8px;
  border: 2px solid #B3E5FC;
  padding: 0.75rem 1rem;
  transition: all 0.2s;
  font-size: 0.95rem;
  background: #ffffff;
  color: #263238;
  font-weight: 500;
}

:deep(.p-inputtext:focus) {
  border-color: #0288D1;
  box-shadow: 0 0 0 4px rgba(2, 136, 209, 0.15);
  background: #ffffff;
}

:deep(.p-dropdown) {
  border: 2px solid #CBD5E1;
  border-radius: 8px;
  transition: all 0.2s;
  background: #ffffff;
}

:deep(.p-dropdown:hover) {
  border-color: #0288D1;
}

:deep(.p-dropdown.p-focus) {
  border-color: #0288D1;
  box-shadow: 0 0 0 3px rgba(2, 136, 209, 0.1);
}

:deep(.p-dropdown .p-dropdown-label) {
  color: #334155;
  font-weight: 500;
  font-size: 0.95rem;
}

:deep(.p-dropdown .p-dropdown-label.p-placeholder) {
  color: #94A3B8;
  font-weight: 400;
}

/* Overlay/backdrop when dropdown is open */
:deep(.p-component-overlay) {
  background: rgba(15, 23, 42, 0.75) !important;
  z-index: 99998 !important;
}

:deep(.p-dropdown-panel) {
  background: #f8fafc !important;
  border: 2px solid #0288D1 !important;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
  margin-top: 4px;
  z-index: 99999 !important;
  position: relative !important;
}

:deep(.p-dropdown-panel .p-dropdown-items) {
  padding: 0.25rem;
  background: #f8fafc !important;
}

:deep(.p-dropdown-panel .p-dropdown-item) {
  color: #0f172a !important;
  background: #e0f2fe !important;
  padding: 0.75rem 1rem !important;
  font-size: 0.95rem !important;
  font-weight: 600 !important;
  border: none !important;
  cursor: pointer !important;
  margin-bottom: 0.125rem !important;
  border-radius: 4px !important;
}

:deep(.p-dropdown-panel .p-dropdown-item:hover) {
  background: #0288D1 !important;
  color: #ffffff !important;
}

:deep(.p-dropdown-panel .p-dropdown-item.p-highlight) {
  background: #0277BD !important;
  color: #ffffff !important;
  font-weight: 700 !important;
}

:deep(.p-dropdown-panel .p-dropdown-item.p-focus) {
  background: #4FC3F7 !important;
  color: #0f172a !important;
  font-weight: 600 !important;
}

:deep(.p-inputtext) {
  border-radius: 8px;
  border: 2px solid #B3E5FC;
  padding: 0.75rem 1rem;
  transition: all 0.2s;
  font-size: 0.95rem;
  background: #ffffff;
  color: #263238;
  font-weight: 500;
}

:deep(.p-inputtext:focus) {
  border-color: #0288D1;
  box-shadow: 0 0 0 4px rgba(2, 136, 209, 0.15);
  background: #ffffff;
}

:deep(.p-dropdown:focus) {
  border-color: #0288D1;
  box-shadow: 0 0 0 4px rgba(2, 136, 209, 0.15);
}

:deep(.p-inputtextarea) {
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  padding: 0.75rem 1rem;
  transition: all 0.2s;
  font-family: inherit;
}

:deep(.p-dropdown:focus) {
  border-color: #0288D1;
  box-shadow: 0 0 0 4px rgba(2, 136, 209, 0.15);
}

:deep(.p-inputtextarea:focus) {
  border-color: #0288D1;
  box-shadow: 0 0 0 4px rgba(2, 136, 209, 0.15);
}

:deep(.p-inputnumber-input) {
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  padding: 0.75rem 1rem;
}

:deep(.p-checkbox .p-checkbox-box) {
  border: 2px solid #cbd5e0;
  border-radius: 6px;
  width: 1.25rem;
  height: 1.25rem;
  transition: all 0.2s;
}

:deep(.p-checkbox .p-checkbox-box.p-highlight) {
  background: linear-gradient(135deg, #0288D1 0%, #00BCD4 100%);
  border-color: #0288D1;
}

:deep(.p-divider) {
  margin: 1.5rem 0;
  border-top: 2px solid #e2e8f0;
}

/* Animation */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  animation: slideIn 0.3s ease forwards;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

/* Responsive */
@media (max-width: 768px) {
  .departments-prime {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .col-span-2 {
    grid-column: span 1;
  }
}
</style>
