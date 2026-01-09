<template>
  <div class="users-container">
    <div class="page-header">
      <h2 class="title">🔒 User Management</h2>
    </div>

    <div v-if="loading" class="loading">Loading users...</div>
    <div v-else-if="users.length === 0" class="empty-state">
      <p>No users found</p>
    </div>
    <div v-else class="users-table-wrapper">
      <EasyDataTable
        :headers="headers"
        :items="users"
        :rows-per-page="10"
        table-class="rounded-xl shadow bg-white"
      >
        <template #item-joined="{ joined }">
          <span>{{ formatDate(joined) }}</span>
        </template>
        <template #item-actions="{ id }">
          <button @click="viewUser(id)" class="btn-view">View</button>
        </template>
      </EasyDataTable>
    </div>

    <!-- User Detail Modal -->
    <div v-if="selectedUser" class="modal-overlay" @click.self="selectedUser = null">
      <div class="modal-content">
        <h3>User Details</h3>
        <div class="user-details">
          <p><strong>Username:</strong> {{ selectedUser.username }}</p>
          <p><strong>Email:</strong> {{ selectedUser.email }}</p>
          <p><strong>First Name:</strong> {{ selectedUser.firstName || 'N/A' }}</p>
          <p><strong>Last Name:</strong> {{ selectedUser.lastName || 'N/A' }}</p>
          <p><strong>Joined:</strong> {{ formatDate(selectedUser.createdAt) }}</p>
        </div>
        <div class="modal-actions">
          <button @click="selectedUser = null" class="btn-close">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'
import { authAPI } from '../../api'

const users = ref([])
const loading = ref(false)
const selectedUser = ref(null)

const headers = [
  { text: 'Username', value: 'username', sortable: true },
  { text: 'Email', value: 'email', sortable: true },
  { text: 'Full Name', value: 'fullName', sortable: true },
  { text: 'Joined', value: 'joined', sortable: true },
  { text: 'Actions', value: 'actions' }
]

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await authAPI.getAllUsers()
    users.value = (response.users || []).map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
      joined: user.createdAt,
      ...user
    }))
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

const viewUser = (id) => {
  selectedUser.value = users.value.find(u => u.id === id)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.users-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.loading, .empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #64748b;
  font-size: 1.1rem;
}

.users-table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.btn-view {
  padding: 0.4rem 0.8rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-view:hover {
  background-color: #1d4ed8;
}

/* Modal */
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

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 1.5rem;
  margin-top: 0;
}

.user-details {
  margin-bottom: 1.5rem;
}

.user-details p {
  margin: 0.75rem 0;
  color: #475569;
  line-height: 1.6;
}

.user-details strong {
  color: #1e293b;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-close {
  padding: 0.75rem 1.5rem;
  background-color: #f1f5f9;
  color: #334155;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-close:hover {
  background-color: #e2e8f0;
}
</style>
