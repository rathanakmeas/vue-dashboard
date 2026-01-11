<template>
    <div class="main-page">
        <div class="page-header">
            <h1 class="title">📤 Shared Files</h1>
            <p class="subtitle">Quick access to items you’ve shared with others.</p>
        </div>

        <div class="shared-list">
            <div v-if="loading" class="loading">Loading...</div>
            <div v-else-if="sharedItems.length === 0" class="empty">No shared folders yet.</div>
            <div v-else>
                <div v-for="(item, index) in sharedItems" :key="index" class="shared-card">
                    <div class="icon">
                        <span>{{ item.icon }}</span>
                    </div>
                    <div class="info">
                        <div class="name">{{ item.name }}</div>
                        <div class="shared-to">Shared with: {{ item.sharedWith }}</div>
                    </div>
                    <div class="time">
                        {{ item.time }}
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
import { useRouter } from 'vue-router'
import { folderAPI, activityAPI, fileAPI } from '../../api'

const router = useRouter()
const sharedItems = ref([])
const sharedFolders = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
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

const loadShared = async () => {
    loading.value = true
    try {
        const res = await folderAPI.getFolders({ page: page.value, pageSize: pageSize.value, sharedOnly: true })
        const data = res.data || []
        total.value = res.total ?? data.length
        sharedFolders.value = data
        
        sharedItems.value = data.map((f) => ({
            id: f._id,
            type: 'folder',
            icon: f.isShared ? '🔗' : '📁',
            name: f.name,
            sharedWith: (f.sharedWith || []).length ? `Shared with ${f.sharedWith.length} users` : 'Shared with you',
            time: formatTime(f.updatedAt || f.createdAt)
        }))

        // Fallback: show recent folder-share activities if shared list is empty
        if (!sharedItems.value.length) {
            const act = await activityAPI.getMyActivities(50, 0)
            const rows = act.data || act.activities || []
            const shareEvents = rows.filter((a) => a.action === 'FOLDER_SHARE')
            total.value = shareEvents.length
            sharedItems.value = shareEvents.slice(0, pageSize.value).map((a) => ({
                type: 'activity',
                icon: '🔗',
                name: a.metadata?.name || 'Shared folder',
                sharedWith: a.metadata?.sharedWith?.length ? `${a.metadata.sharedWith.length} users` : 'Shared',
                time: formatTime(a.createdAt)
            }))
        }
    } catch (err) {
        console.error('Failed to load shared folders', err)
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
        alert('File uploaded successfully to shared folder!')
    } catch (error) {
        uploadError.value = error.message || 'Upload failed'
    } finally {
        uploading.value = false
    }
}

const viewFolder = (folderId) => {
    router.push(`/files/${folderId}`)
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
        loadShared()
    }
}

const prevPage = () => {
    if (page.value > 1) {
        page.value -= 1
        loadShared()
    }
}

onMounted(loadShared)
</script>

<style scoped>

    .shared-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .shared-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1rem 1.25rem;
        transition: background-color 0.2s ease;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }

    .shared-card:hover {
        background-color: #f1f5f9;
    }

    .icon {
        font-size: 1.5rem;
        color: #3b82f6;
        margin-right: 1rem;
    }

    .info {
        flex-grow: 1;
    }

    .info .name {
        font-size: 1rem;
        font-weight: 500;
    }

    .info .shared-to {
        font-size: 0.85rem;
        color: #64748b;
    }

    .time {
        font-size: 0.85rem;
        color: #94a3b8;
        min-width: 90px;
        text-align: right;
    }
</style>
