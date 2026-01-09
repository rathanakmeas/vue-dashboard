<template>
    <div class="files-container">
        <!-- Header -->
        <div class="page-header">
            <h2 class="title">📁 {{ folderName }}</h2>
            <button @click="showUploadModal = true" class="btn-upload">📤 Upload File</button>
        </div>

        <!-- Upload Modal -->
        <div v-if="showUploadModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal-content">
                <h3>Upload File</h3>
                <div class="upload-area" @drop="handleDrop" @dragover.prevent @dragleave.prevent>
                    <input 
                        ref="fileInput"
                        type="file" 
                        @change="handleFileSelect"
                        style="display: none"
                    />
                    <p class="drag-hint">Drag & drop files here or <button @click="$refs.fileInput.click()" type="button" class="btn-link">choose from computer</button></p>
                    <div v-if="selectedFile" class="file-info">
                        <p>📄 {{ selectedFile.name }}</p>
                        <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
                    </div>
                </div>
                <div class="modal-actions">
                    <button @click="uploadFile" :disabled="!selectedFile || uploading" class="btn-save">
                        {{ uploading ? 'Uploading...' : 'Upload' }}
                    </button>
                    <button @click="closeModal" class="btn-cancel">Cancel</button>
                </div>
            </div>
        </div>

        <!-- Files List -->
        <div v-if="loading" class="loading">Loading files...</div>
        <div v-else-if="files.length === 0" class="empty-state">
            <p>No files in this folder yet. Upload one to get started!</p>
        </div>
        <div v-else class="files-table">
            <table>
                <thead>
                    <tr>
                        <th>File Name</th>
                        <th>Size</th>
                        <th>Type</th>
                        <th>Uploaded</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="file in files" :key="file._id">
                        <td class="file-name">{{ getFileIcon(file.mimeType) }} {{ file.name }}</td>
                        <td>{{ formatFileSize(file.fileSize) }}</td>
                        <td>{{ file.mimeType }}</td>
                        <td>{{ formatDate(file.uploadedAt) }}</td>
                        <td class="actions">
                            <button @click="downloadFile(file)" class="btn-action" title="Download">⬇️</button>
                            <button @click="deleteFile(file._id)" class="btn-action btn-danger" title="Delete">🗑️</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fileAPI, folderAPI } from '../api'

const route = useRoute()
const folderId = route.params.id

const files = ref([])
const folderName = ref('Files')
const loading = ref(false)
const uploading = ref(false)
const showUploadModal = ref(false)
const selectedFile = ref(null)
const fileInput = ref(null)

const loadFiles = async () => {
    loading.value = true
    try {
        const response = await fileAPI.getFiles(folderId)
        files.value = response.files || []

        // Also get folder name
        const folderResponse = await folderAPI.getFolder(folderId)
        folderName.value = folderResponse.folder?.name || 'Files'
    } catch (error) {
        console.error('Failed to load files:', error)
    } finally {
        loading.value = false
    }
}

const handleFileSelect = (event) => {
    selectedFile.value = event.target.files[0]
}

const handleDrop = (event) => {
    event.preventDefault()
    selectedFile.value = event.dataTransfer.files[0]
}

const uploadFile = async () => {
    if (!selectedFile.value) return

    uploading.value = true
    try {
        await fileAPI.uploadFile(
            folderId,
            selectedFile.value.name,
            selectedFile.value.size,
            selectedFile.value.type
        )
        closeModal()
        loadFiles()
    } catch (error) {
        alert('Error uploading file: ' + error.message)
    } finally {
        uploading.value = false
    }
}

const deleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
        await fileAPI.deleteFile(fileId)
        loadFiles()
    } catch (error) {
        alert('Error deleting file: ' + error.message)
    }
}

const downloadFile = (file) => {
    // In a real app, this would download the file from server
    // For now, just show a message
    alert(`Download feature coming soon for: ${file.name}`)
}

const closeModal = () => {
    showUploadModal.value = false
    selectedFile.value = null
    if (fileInput.value) fileInput.value.value = ''
}

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString()
}

const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return '📄'
    if (mimeType?.includes('image')) return '🖼️'
    if (mimeType?.includes('video')) return '🎥'
    if (mimeType?.includes('audio')) return '🎵'
    if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝'
    if (mimeType?.includes('sheet') || mimeType?.includes('excel')) return '📊'
    if (mimeType?.includes('zip') || mimeType?.includes('rar')) return '📦'
    return '📎'
}

onMounted(() => {
    loadFiles()
})
</script>

<style scoped>
.files-container {
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

.btn-upload {
    padding: 0.75rem 1.5rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-upload:hover {
    background-color: #1d4ed8;
}

.loading, .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: #64748b;
    font-size: 1.1rem;
}

.files-table {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th {
    background-color: #f8fafc;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #334155;
    border-bottom: 2px solid #e2e8f0;
}

td {
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    color: #475569;
}

tr:hover {
    background-color: #f8fafc;
}

.file-name {
    font-weight: 500;
    color: #1e293b;
}

.actions {
    display: flex;
    gap: 0.5rem;
}

.btn-action {
    padding: 0.5rem 1rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-action:hover {
    background-color: #1d4ed8;
}

.btn-action.btn-danger:hover {
    background-color: #dc2626;
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

.upload-area {
    border: 2px dashed #cbd5e1;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    background-color: #f9fafb;
}

.upload-area:hover {
    border-color: #2563eb;
    background-color: #eff6ff;
}

.drag-hint {
    color: #64748b;
    margin: 0;
}

.btn-link {
    background: none;
    border: none;
    color: #2563eb;
    cursor: pointer;
    text-decoration: underline;
    font-weight: 600;
}

.btn-link:hover {
    color: #1d4ed8;
}

.file-info {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
}

.file-info p {
    margin: 0.5rem 0;
    color: #1e293b;
    font-weight: 500;
}

.file-size {
    color: #64748b;
    font-size: 0.9rem;
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

.btn-save:hover:not(:disabled) {
    background-color: #1d4ed8;
}

.btn-save:disabled {
    background-color: #cbd5e1;
    cursor: not-allowed;
}

.btn-cancel {
    background-color: #f1f5f9;
    color: #334155;
}

.btn-cancel:hover {
    background-color: #e2e8f0;
}
</style>
