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
                        <button @click="editFolder(folder)" class="btn-icon" title="Edit">✏️</button>
                        <button @click="deleteFolder(folder._id)" class="btn-icon" title="Delete">🗑️</button>
                    </div>
                </div>
                <p class="folder-desc">{{ folder.description || 'No description' }}</p>
                <p class="folder-meta">Created: {{ formatDate(folder.createdAt) }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { folderAPI } from '../api'

const router = useRouter()
const folders = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const editingFolder = ref(null)
const formData = ref({
    name: '',
    description: ''
})

const loadFolders = async () => {
    loading.value = true
    try {
        const response = await folderAPI.getFolders()
        folders.value = response.folders || []
    } catch (error) {
        console.error('Failed to load folders:', error)
    } finally {
        loading.value = false
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

const formatDate = (date) => {
    return new Date(date).toLocaleDateString()
}

onMounted(() => {
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
.form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
    box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
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
</style>
