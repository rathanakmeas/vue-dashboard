<template>
    <div class="audit-trail-container">
        <div class="page-header">
            <h2 class="title">📋 Documents Audit Trail</h2>
            <div class="filters">
                <select v-model="filterAction" @change="loadAuditTrail">
                    <option value="">All Actions</option>
                    <option value="FILE_UPLOAD">Upload</option>
                    <option value="FILE_UPDATE">Update</option>
                    <option value="FILE_DELETE">Delete</option>
                </select>
                <input type="date" v-model="filterDate" @change="loadAuditTrail" class="date-input" />
            </div>
        </div>

        <div v-if="loading" class="loading">Loading audit trail...</div>
        <div v-else-if="activities.length === 0" class="empty-state">
            <p>No audit records found.</p>
        </div>
        <div v-else class="audit-table">
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Document</th>
                        <th>Details</th>
                        <th>IP Address</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="activity in activities" :key="activity._id" :class="getActionClass(activity.action)">
                        <td>{{ formatDateTime(activity.createdAt) }}</td>
                        <td>
                            <span class="user-badge">{{ activity.userId?.username || 'Unknown' }}</span>
                        </td>
                        <td>
                            <span :class="['action-badge', getActionClass(activity.action)]">
                                {{ formatAction(activity.action) }}
                            </span>
                        </td>
                        <td>{{ activity.metadata?.fileName || 'N/A' }}</td>
                        <td class="details">{{ activity.description }}</td>
                        <td>{{ activity.ipAddress || 'N/A' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div v-if="total > pageSize" class="pagination">
            <button :disabled="page === 1" @click="prevPage">← Previous</button>
            <span>Page {{ page }} of {{ totalPages }}</span>
            <button :disabled="page >= totalPages" @click="nextPage">Next →</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { activityAPI } from '../../api'

const activities = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const filterAction = ref('')
const filterDate = ref('')

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const loadAuditTrail = async () => {
    loading.value = true
    try {
        const response = await activityAPI.getMyActivities(pageSize.value, (page.value - 1) * pageSize.value)
        let data = response.data || response.activities || []
        
        // Filter for file-related activities
        data = data.filter(a => 
            a.resourceType === 'FILE' || 
            a.action.includes('FILE')
        )
        
        // Apply filters
        if (filterAction.value) {
            data = data.filter(a => a.action === filterAction.value)
        }
        
        if (filterDate.value) {
            const filterDateObj = new Date(filterDate.value)
            data = data.filter(a => {
                const activityDate = new Date(a.createdAt)
                return activityDate.toDateString() === filterDateObj.toDateString()
            })
        }
        
        activities.value = data
        total.value = data.length
    } catch (error) {
        console.error('Failed to load audit trail:', error)
    } finally {
        loading.value = false
    }
}

const formatDateTime = (date) => {
    const d = new Date(date)
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatAction = (action) => {
    const actionMap = {
        'FILE_UPLOAD': 'Upload',
        'FILE_UPDATE': 'Update',
        'FILE_DELETE': 'Delete',
        'FOLDER_CREATE': 'Folder Created',
        'FOLDER_DELETE': 'Folder Deleted'
    }
    return actionMap[action] || action
}

const getActionClass = (action) => {
    if (action.includes('DELETE')) return 'action-delete'
    if (action.includes('UPLOAD') || action.includes('CREATE')) return 'action-create'
    if (action.includes('UPDATE')) return 'action-update'
    return 'action-default'
}

const nextPage = () => {
    if (page.value < totalPages.value) {
        page.value++
        loadAuditTrail()
    }
}

const prevPage = () => {
    if (page.value > 1) {
        page.value--
        loadAuditTrail()
    }
}

onMounted(loadAuditTrail)
</script>

<style scoped>
.audit-trail-container {
    padding: 2rem;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.filters {
    display: flex;
    gap: 1rem;
}

.filters select,
.date-input {
    padding: 0.5rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
}

.audit-table {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

table {
    width: 100%;
    border-collapse: collapse;
}

thead {
    background: #f8fafc;
}

th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #475569;
    border-bottom: 2px solid #e2e8f0;
}

td {
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;
}

tr:hover {
    background: #f8fafc;
}

.user-badge {
    background: #dbeafe;
    color: #1e40af;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 500;
}

.action-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 500;
}

.action-create {
    background: #dcfce7;
    color: #166534;
}

.action-update {
    background: #fef3c7;
    color: #92400e;
}

.action-delete {
    background: #fee2e2;
    color: #991b1b;
}

.action-default {
    background: #f1f5f9;
    color: #475569;
}

.details {
    color: #64748b;
    font-size: 0.9rem;
}

.pagination {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
}

.pagination button {
    padding: 0.5rem 1rem;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: 8px;
    cursor: pointer;
}

.pagination button:hover:not(:disabled) {
    background: #f8fafc;
}

.pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
