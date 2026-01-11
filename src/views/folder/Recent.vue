<template>
    <div class="main-page">
        <div class="page-header">
            <h2 class="title">🕓 Recent Files & Folders</h2>
            <p class="subtitle">Stay updated with your most recent actions.</p>
            <button @click="showUploadModal = true" class="btn-upload" v-if="recentFolders.length">📤 Upload to Recent Folder</button>
        </div>

        <!-- Upload Modal -->
        <div v-if="showUploadModal" class="modal-overlay" @click.self="closeUploadModal">
            <div class="modal-content">
                <h3>Upload File</h3>
                <div class="form-group">
                    <label>Select Folder</label>
                    <select v-model="selectedFolderId" required>
                        <option value="">Choose a folder...</option>
                        <option v-for="folder in recentFolders" :key="folder._id" :value="folder._id">
                            {{ folder.name }}
                        </option>
                    </select>
                </div>
                <div class="upload-area">
                    <input ref="fileInput" type="file" @change="handleFileSelect" style="display: none" />
                    <p class="drag-hint">
                        <button @click="$refs.fileInput.click()" type="button" class="btn-link">Choose file</button>
                    </p>
                    <div v-if="selectedFile" class="file-info">
                        <p>📄 {{ selectedFile.name }}</p>
                        <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
                    </div>
                    <p v-if="uploadError" class="error-text">{{ uploadError }}</p>
                </div>
                <div class="modal-actions">
                    <button @click="uploadFile" :disabled="!selectedFile || !selectedFolderId || uploading" class="btn-save">
                        {{ uploading ? 'Uploading...' : 'Upload' }}
                    </button>
                    <button @click="closeUploadModal" class="btn-cancel">Cancel</button>
                </div>
            </div>
        </div>

        <div class="container">
            <div v-if="loading" class="loading">Loading...</div>
            <div v-else-if="activities.length === 0" class="empty">No recent files or folders yet.</div>
            <div v-else>
                <div v-for="(activity, index) in activities" :key="index" class="activity-card">
                    <div class="icon">
                        <span>{{ activity.icon }}</span>
                    </div>
                    <div class="details">
                        <div class="title">{{ activity.title }}</div>
                        <div class="time">{{ activity.time }}</div>
                    </div>
                    <div class="actions" v-if="activity.fileId">
                        <button @click="downloadFile(activity)" class="btn-icon" title="Download">⬇️</button>
                        <button @click="deleteFile(activity.fileId)" class="btn-icon" title="Delete">🗑️</button>
                    </div>
                </div>
                <div v-if="total > pageSize" class="pager">
                    <button :disabled="page === 1" @click="prevPage">Prev</button>
                    <span>Page {{ page }} / {{ totalPages }}</span>
                    <button :disabled="page >= totalPages" @click="nextPage">Next</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { folderAPI, activityAPI, fileAPI } from '../../api'

const activities = ref([])
const recentFolders = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

// Upload state
const showUploadModal = ref(false)
const selectedFolderId = ref('')
const selectedFile = ref(null)
const fileInput = ref(null)
const uploading = ref(false)
const uploadError = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

const formatTime = (date) => {
    const now = new Date()
    const d = new Date(date)
    const diff = (now - d) / 1000
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return d.toLocaleDateString()
}

const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const loadRecent = async () => {
    loading.value = true
    try {
        // Load recent activity including files and folders
        const act = await activityAPI.getMyActivities(50, 0)
        const rows = act.data || act.activities || []
        
        // Load folders for upload dropdown
        const folderRes = await folderAPI.getFolders({ page: 1, pageSize: 50 })
        recentFolders.value = folderRes.data || []
        
        // Map activities to display format
        activities.value = rows.slice(0, pageSize.value).map((a) => {
            let icon = '📋'
            let title = a.description || a.action
            
            if (a.resourceType === 'FOLDER') {
                icon = '📁'
                title = a.metadata?.folderName || a.description || 'Folder activity'
            } else if (a.resourceType === 'FILE' || a.action === 'FILE_UPLOAD') {
                icon = '📄'
                title = a.metadata?.fileName || a.description || 'File activity'
            }
            
            return {
                icon,
                title,
                time: formatTime(a.createdAt),
                fileId: a.resourceType === 'FILE' ? a.resourceId : null,
                fileUrl: a.metadata?.fileUrl,
                fileName: a.metadata?.fileName
            }
        })
        
        total.value = rows.length
    } catch (err) {
        console.error('Failed to load recent activity', err)
    } finally {
        loading.value = false
    }
}

const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
        selectedFile.value = file
        uploadError.value = ''
    }
}

const uploadFile = async () => {
    if (!selectedFile.value || !selectedFolderId.value) return
    
    uploading.value = true
    uploadError.value = ''
    
    try {
        await fileAPI.uploadFile(selectedFolderId.value, selectedFile.value)
        closeUploadModal()
        loadRecent()
    } catch (error) {
        uploadError.value = error.message || 'Upload failed'
    } finally {
        uploading.value = false
    }
}

const downloadFile = (activity) => {
    if (activity.fileUrl) {
        window.open(activity.fileUrl, '_blank')
    }
}

const deleteFile = async (fileId) => {
    if (!fileId) return
    if (!confirm('Delete this file?')) return
    
    try {
        await fileAPI.deleteFile(fileId)
        loadRecent()
    } catch (error) {
        alert('Failed to delete file: ' + error.message)
    }
}

const closeUploadModal = () => {
    showUploadModal.value = false
    selectedFile.value = null
    selectedFolderId.value = ''
    uploadError.value = ''
}

const nextPage = () => {
    if (page.value < totalPages.value) {
        page.value += 1
        loadRecent()
    }
}

const prevPage = () => {
    if (page.value > 1) {
        page.value -= 1
        loadRecent()
    }
}

onMounted(loadRecent)
</script>

<style scoped>

    .activity-card {
        display: flex;
        align-items: center;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1rem 1.25rem;
        transition: background-color 0.2s ease;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }

    .activity-card:hover {
        background-color: #f1f5f9;
    }

    .icon {
        font-size: 1.5rem;
        margin-right: 1rem;
        color: #3b82f6;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 36px;
    }

    .details {
        flex-grow: 1;
    }

    .details .title {
        font-size: 1rem;
        font-weight: 500;
    }

    .details .time {
        font-size: 0.85rem;
        color: #64748b;
        margin-top: 0.25rem;
    }
</style>
