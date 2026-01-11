<template>
    <div class="folders-container">
        <!-- Header -->
        <div class="page-header">
            <h2 class="title">📁 My Folders</h2>
            <button @click="showCreateModal = true" class="btn-create">+ New Folder</button>
        </div>

        <!-- Create/Edit Modal -->
        <div v-if="showCreateModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal-content">
                <h3>{{ editingFolder ? 'Edit Folder' : 'Create New Folder' }}</h3>
                <form @submit.prevent="saveFolder">
                    <div class="form-group">
                        <label>Folder Name</label>
                        <input v-model="formData.name" type="text" placeholder="Enter folder name" required />
                    </div>
                    <div class="form-group">
                        <label>Description (Optional)</label>
                        <textarea v-model="formData.description" placeholder="Add a description"></textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="submit" class="btn-save">Save</button>
                        <button type="button" @click="closeModal" class="btn-cancel">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Share Modal -->
        <div v-if="showShareModal" class="modal-overlay" @click.self="closeShareModal">
            <div class="modal-content">
                <h3>Share: {{ shareTarget?.name }}</h3>
                <div class="form-group">
                    <label>Select user</label>
                    <select v-model="selectedUserId">
                        <option disabled value="">Choose a user</option>
                        <option v-for="user in shareCandidates" :key="user._id || user.id" :value="user._id || user.id">
                            {{ user.username || user.email }}
                        </option>
                    </select>
                </div>

                <div class="shared-list" v-if="shareTarget?.sharedWith?.length">
                    <p class="section-label">Already shared with</p>
                    <div class="shared-users">
                        <span v-for="user in shareTarget.sharedWith" :key="user._id || user.id || user" class="chip">
                            {{ user.username || user.email || user }}
                            <button class="chip-action" @click="unshareUser(user._id || user.id || user)" :disabled="shareLoading">✖</button>
                        </span>
                    </div>
                </div>

                <p v-if="shareError" class="error-text">{{ shareError }}</p>
                <p v-if="shareSuccess" class="success-text">{{ shareSuccess }}</p>

                <div class="modal-actions">
                    <button type="button" class="btn-save" @click="shareFolder" :disabled="shareLoading || !selectedUserId">
                        {{ shareLoading ? 'Sharing...' : 'Share' }}
                    </button>
                    <button type="button" class="btn-cancel" @click="closeShareModal">Close</button>
                </div>
            </div>
        </div>

        <!-- Folders List -->
        <div v-if="loading" class="loading">Loading folders...</div>
        <div v-else-if="folders.length === 0" class="empty-state">
            <p>No folders yet. Create one to get started!</p>
        </div>
        <div v-else class="folders-grid">
            <div v-for="folder in folders" :key="folder._id" class="folder-card">
                <div class="folder-header">
                    <h3>📁 {{ folder.name }}</h3>
                    <div class="folder-actions">
                        <button @click="goToFiles(folder._id)" class="btn-icon" title="Open Files">📄</button>
                        <button @click="openShare(folder)" class="btn-icon" title="Share">🔗</button>
                        <button @click="editFolder(folder)" class="btn-icon" title="Edit">✏️</button>
                        <button @click="deleteFolder(folder._id)" class="btn-icon" title="Delete">🗑️</button>
                    </div>
                </div>
                <p class="folder-desc">{{ folder.description || 'No description' }}</p>
                <p class="folder-meta">Created: {{ formatDate(folder.createdAt) }}</p>
                <div v-if="folder.sharedWith?.length" class="share-chips">
                    <span class="chip">Shared</span>
                    <span v-for="user in folder.sharedWith" :key="user._id || user.id || user" class="chip subtle">
                        {{ user.username || user.email || user }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { folderAPI, authAPI } from '../api'

const router = useRouter()
const folders = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const editingFolder = ref(null)
const formData = ref({
    name: '',
    description: ''
})
const showShareModal = ref(false)
const shareTarget = ref(null)
const selectedUserId = ref('')
const shareLoading = ref(false)
const shareError = ref('')
const shareSuccess = ref('')
const allUsers = ref([])
const currentUserId = ref(null)

const shareCandidates = computed(() => {
    const target = shareTarget.value
    const sharedIds = new Set((target?.sharedWith || []).map(u => u._id || u.id || u))
    const ownerId = target?.userId?._id || target?.userId
    return (allUsers.value || []).filter((u) => {
        const uid = u._id || u.id
        if (!uid) return false
        if (currentUserId.value && uid === currentUserId.value) return false
        if (ownerId && uid === ownerId) return false
        return !sharedIds.has(uid)
    })
})

const loadFolders = async () => {
    loading.value = true
    try {
        const response = await folderAPI.getFolders({ page: 1, pageSize: 50 })
        // Backend returns { data, page, pageSize, total }
        // Fallback to response.folders for older shape
        folders.value = response.data || response.folders || []
        refreshShareTarget()
    } catch (error) {
        console.error('Failed to load folders:', error)
    } finally {
        loading.value = false
    }
}

const loadUsers = async () => {
    try {
        const response = await authAPI.getAllUsers()
        const list = response.users || response.data || response
        allUsers.value = Array.isArray(list) ? list : []
    } catch (error) {
        console.error('Failed to load users:', error)
    }
}

const loadProfile = async () => {
    try {
        const profile = await authAPI.getProfile()
        currentUserId.value = profile._id || profile.id || null
    } catch (error) {
        console.error('Failed to load profile:', error)
    }
}

const refreshShareTarget = () => {
    if (!shareTarget.value) return
    const updated = folders.value.find(f => f._id === shareTarget.value._id)
    if (updated) {
        shareTarget.value = updated
    }
}

const saveFolder = async () => {
    if (!formData.value.name.trim()) {
        alert('Folder name is required')
        return
    }

    try {
        if (editingFolder.value) {
            await folderAPI.updateFolder(
                editingFolder.value._id,
                formData.value.name,
                formData.value.description
            )
        } else {
            await folderAPI.createFolder(
                formData.value.name,
                formData.value.description
            )
        }
        closeModal()
        loadFolders()
    } catch (error) {
        alert('Error saving folder: ' + error.message)
    }
}

const editFolder = (folder) => {
    editingFolder.value = folder
    formData.value = {
        name: folder.name,
        description: folder.description || ''
    }
    showCreateModal.value = true
}

const openShare = async (folder) => {
    shareTarget.value = folder
    shareError.value = ''
    shareSuccess.value = ''
    selectedUserId.value = ''
    showShareModal.value = true
    if (!allUsers.value.length) {
        await loadUsers()
    }
}

const shareFolder = async () => {
    if (!selectedUserId.value) {
        shareError.value = 'Select a user to share with.'
        return
    }
    shareLoading.value = true
    shareError.value = ''
    shareSuccess.value = ''
    try {
        await folderAPI.shareFolder(shareTarget.value._id, selectedUserId.value)
        await loadFolders()
        shareSuccess.value = 'Folder shared successfully.'
        refreshShareTarget()
    } catch (error) {
        shareError.value = error.message || 'Error sharing folder'
    } finally {
        shareLoading.value = false
    }
}

const unshareUser = async (userId) => {
    shareLoading.value = true
    shareError.value = ''
    shareSuccess.value = ''
    try {
        await folderAPI.unshareFolder(shareTarget.value._id, userId)
        await loadFolders()
        shareSuccess.value = 'Access removed.'
        refreshShareTarget()
    } catch (error) {
        shareError.value = error.message || 'Error removing access'
    } finally {
        shareLoading.value = false
    }
}

const deleteFolder = async (id) => {
    if (!confirm('Are you sure you want to delete this folder?')) return

    try {
        await folderAPI.deleteFolder(id)
        loadFolders()
    } catch (error) {
        alert('Error deleting folder: ' + error.message)
    }
}

const goToFiles = (folderId) => {
    router.push({ name: 'files', params: { id: folderId } })
}

const closeModal = () => {
    showCreateModal.value = false
    editingFolder.value = null
    formData.value = { name: '', description: '' }
}

const closeShareModal = () => {
    showShareModal.value = false
    shareTarget.value = null
    selectedUserId.value = ''
    shareError.value = ''
    shareSuccess.value = ''
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString()
}

onMounted(() => {
    loadProfile()
    loadFolders()
})
</script>

<style scoped>
.folders-container {
    padding: 2rem;
    max-width: 1200px;
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

.btn-create {
    padding: 0.75rem 1.5rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-create:hover {
    background-color: #1d4ed8;
}

.loading, .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: #64748b;
    font-size: 1.1rem;
}

.folders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.folder-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.5rem;
    transition: all 0.3s;
}

.folder-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e1;
}

.folder-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.folder-header h3 {
    font-size: 1.2rem;
    color: #1e293b;
    margin: 0;
}

.folder-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-icon {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: background 0.2s;
}

.btn-icon:hover {
    background-color: #f1f5f9;
}

.folder-desc {
    color: #64748b;
    margin: 0.5rem 0;
    font-size: 0.95rem;
}

.folder-meta {
    color: #94a3b8;
    font-size: 0.85rem;
    margin: 0;
}

.share-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
}

.chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.65rem;
    background: #e0f2fe;
    color: #0f172a;
    border-radius: 999px;
    font-size: 0.9rem;
    border: 1px solid #bae6fd;
}

.chip.subtle {
    background: #f8fafc;
    border-color: #e2e8f0;
}

.chip-action {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #0f172a;
    font-size: 0.9rem;
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

.shared-list {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
}

.shared-users {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.section-label {
    margin: 0 0 0.25rem;
    color: #475569;
    font-weight: 600;
}

.error-text {
    color: #dc2626;
    font-weight: 600;
    margin: 0.5rem 0 0;
}

.success-text {
    color: #16a34a;
    font-weight: 600;
    margin: 0.5rem 0 0;
}

.modal-content h3 {
    font-size: 1.5rem;
    color: #1e293b;
    margin-bottom: 1.5rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    font-weight: 600;
    color: #334155;
    margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
    box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-group textarea {
    resize: vertical;
    min-height: 100px;
    font-family: inherit;
}

.modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
}

.btn-save, .btn-cancel {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-save {
    background-color: #2563eb;
    color: white;
}

.btn-save:hover {
    background-color: #1d4ed8;
}

.btn-cancel {
    background-color: #f1f5f9;
    color: #334155;
}

.btn-cancel:hover {
    background-color: #e2e8f0;
}

/* Responsive Design */
@media (max-width: 1024px) {
    .folders-container {
        padding: 1.5rem;
    }
    
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .folders-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
    }
}

@media (max-width: 768px) {
    .folders-container {
        padding: 1rem;
    }
    
    .page-header {
        flex-direction: column;
        align-items: stretch;
    }
    
    .btn-create {
        width: 100%;
        padding: 0.75rem 1rem;
    }
    
    .title {
        font-size: 1.5rem;
    }
    
    .folders-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .folder-card {
        padding: 1rem;
    }
    
    .folder-header {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .folder-actions {
        width: 100%;
        margin-top: 0.75rem;
    }
    
    .modal-content {
        width: 95%;
        padding: 1.5rem;
    }
    
    .modal-actions {
        flex-direction: column;
    }
    
    .btn-save, .btn-cancel {
        width: 100%;
    }
}

@media (max-width: 480px) {
    .folders-container {
        padding: 0.75rem;
    }
    
    .title {
        font-size: 1.25rem;
    }
    
    .btn-create {
        font-size: 0.9rem;
    }
    
    .folder-card {
        padding: 0.75rem;
    }
    
    .folder-header h3 {
        font-size: 1rem;
    }
    
    .folder-actions button {
        font-size: 1rem;
        padding: 0.4rem 0.5rem;
    }
    
    .modal-content {
        width: 98%;
        padding: 1rem;
    }
    
    .modal-content h3 {
        font-size: 1.25rem;
    }
    
    .form-group input,
    .form-group textarea {
        font-size: 16px; /* Prevents zoom on iOS */
    }
}
</style>
