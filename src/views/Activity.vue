<template>
    <div class="activity-container">
        <!-- Header -->
        <div class="page-header">
            <h2 class="title">📋 Activity Log</h2>
            <select v-model="filterAction" @change="loadActivities" class="filter-select">
                <option value="">All Activities</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="FILE_UPLOAD">File Upload</option>
                <option value="FILE_UPDATE">File Update</option>
                <option value="FILE_DELETE">File Delete</option>
                <option value="FOLDER_CREATE">Folder Create</option>
                <option value="FOLDER_UPDATE">Folder Update</option>
                <option value="FOLDER_DELETE">Folder Delete</option>
                <option value="FOLDER_SHARE">Folder Share</option>
                <option value="FOLDER_UNSHARE">Folder Unshare</option>
                <option value="PROFILE_UPDATE">Profile Update</option>
            </select>
        </div>

        <!-- Activity List -->
        <div v-if="loading" class="loading">Loading activities...</div>
        <div v-else-if="activities.length === 0" class="empty-state">
            <p>No activities found</p>
        </div>
        <div v-else class="activity-list">
            <div v-for="activity in activities" :key="activity._id" class="activity-item">
                <div class="activity-icon">{{ getActionIcon(activity.action) }}</div>
                <div class="activity-details">
                    <h4 class="activity-action">{{ formatAction(activity.action) }}</h4>
                    <p class="activity-description">{{ getActivityDescription(activity) }}</p>
                    <p class="activity-time">{{ formatDate(activity.createdAt) }}</p>
                </div>
                <div class="activity-status">
                    <span :class="['badge', activity.status === 'SUCCESS' ? 'badge-success' : 'badge-error']">
                        {{ activity.status }}
                    </span>
                </div>
            </div>

            <!-- Pagination -->
            <div class="pagination">
                <button 
                    @click="previousPage" 
                    :disabled="currentPage === 1"
                    class="btn-pagination"
                >
                    ← Previous
                </button>
                <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
                <button 
                    @click="nextPage" 
                    :disabled="currentPage >= totalPages"
                    class="btn-pagination"
                >
                    Next →
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { activityAPI } from '../api'

const activities = ref([])
const loading = ref(false)
const filterAction = ref('')
const currentPage = ref(1)
const limit = 20
const totalActivities = ref(0)

const totalPages = ref(1)

const loadActivities = async () => {
    loading.value = true
    try {
        const skip = (currentPage.value - 1) * limit
        const response = filterAction.value
            ? await activityAPI.getAllActivities(limit, skip, filterAction.value)
            : await activityAPI.getMyActivities(limit, skip)
        
        activities.value = response.activities || []
        totalActivities.value = response.pagination?.total || 0
        totalPages.value = Math.ceil(totalActivities.value / limit)
    } catch (error) {
        console.error('Failed to load activities:', error)
    } finally {
        loading.value = false
    }
}

const formatAction = (action) => {
    const actionMap = {
        'LOGIN': 'Login',
        'LOGOUUPDATE': 'File Update',
        'FILE_DELETE': 'File Delete',
        'FOLDER_CREATE': 'Folder Create',
        'FOLDER_UPDATE': 'Folder Update',
        'FOLDER_DELETE': 'Folder Delete',
        'FOLDER_SHARE': 'Folder Share',
        'FOLDER_UNSHARE': 'Folder Unshare',
        'PROFILE_UPDATE': 'Profile Update'
    }
    return actionMap[action] || action
}

const getActionIcon = (action) => {
    const iconMap = {
        'LOGIN': '🔓',
        'LOGOUT': '🔒',
        'FILE_UPLOAD': '📤',
        'FILE_UPDATE': '✏️',
        'FILE_DELETE': '🗑️',
        'FOLDER_CREATE': '📁',
        'FOLDER_UPDATE': '✏️',
        'FOLDER_DELETE': '🗑️',
        'FOLDER_SHARE': '🔗',
        'FOLDER_UNSHARE': '🔓',
        'PROFILE_UPDATE': '👤'
    }
    return iconMap[action] || '📋'
}

const getActivityDescription = (activity) => {
    if (activity.metadata?.name) {
        return `${activity.metadata.name}`
    }
    if (activity.metadata?.email) {
        return `${activity.metadata.email}`
    }
    return `Action on ${activity.resourceType}`
}

const formatDate = (date) => {
    const now = new Date()
    const activityDate = new Date(date)
    const diffMs = now - activityDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    
    return activityDate.toLocaleDateString() + ' ' + activityDate.toLocaleTimeString()
}

const previousPage = () => {
    if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++
}

watch(currentPage, () => {
    loadActivities()
})

onMounted(() => {
    loadActivities()
})
</script>

<style scoped>
.activity-container {
    padding: 2rem;
    max-width: 1000px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.title {
    font-size: 2rem;
    font-weight: 600;
    color: #1e293b;
}

.filter-select {
    padding: 0.75rem 1rem;
    border: 2px solid #cbd5e1;
    border-radius: 6px;
    font-size: 0.95rem;
    color: #334155;
    background-color: white;
    cursor: pointer;
}

.filter-select:hover {
    border-color: #2563eb;
}

.loading, .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: #64748b;
    font-size: 1.1rem;
}

.activity-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.activity-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s;
}

.activity-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.activity-icon {
    font-size: 2rem;
    flex-shrink: 0;
}

.activity-details {
    flex: 1;
    min-width: 0;
}

.activity-action {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
}

.activity-description {
    margin: 0.25rem 0;
    color: #64748b;
    font-size: 0.9rem;
}

.activity-time {
    margin: 0.25rem 0 0 0;
    color: #94a3b8;
    font-size: 0.85rem;
}

.activity-status {
    flex-shrink: 0;
}

.badge {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
}

.badge-success {
    background-color: #dcfce7;
    color: #166534;
}

.badge-error {
    background-color: #fee2e2;
    color: #991b1b;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e2e8f0;
}

.btn-pagination {
    padding: 0.5rem 1rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-pagination:hover:not(:disabled) {
    background-color: #1d4ed8;
}

.btn-pagination:disabled {
    background-color: #cbd5e1;
    cursor: not-allowed;
}

.page-info {
    color: #64748b;
    font-weight: 600;
    min-width: 150px;
    text-align: center;
}
</style>
