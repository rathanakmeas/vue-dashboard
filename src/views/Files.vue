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
                <div class="mode-toggle">
                    <button type="button" :class="['mode-btn', { active: uploadMode === 'upload' }]" @click="setUploadMode('upload')">Upload file</button>
                    <button type="button" :class="['mode-btn', { active: uploadMode === 'link' }]" @click="setUploadMode('link')">Add by link</button>
                </div>

                <div v-if="uploadMode === 'upload'" class="upload-area" @drop="handleDrop" @dragover.prevent @dragleave.prevent>
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
                    <p v-if="uploadError" class="error-text">{{ uploadError }}</p>
                </div>

                <div v-else class="link-form">
                    <label class="input-label" for="link-name">File name</label>
                    <input id="link-name" class="text-input" type="text" v-model="linkName" placeholder="Quarterly-report.pdf" />

                    <label class="input-label" for="link-url">File URL</label>
                    <input id="link-url" class="text-input" type="url" v-model="linkUrl" placeholder="https://example.com/report.pdf" />

                    <label class="input-label" for="link-type">MIME type (optional)</label>
                    <input id="link-type" class="text-input" type="text" v-model="linkType" placeholder="application/pdf" />

                    <p class="helper-text">Use this when the file is already hosted elsewhere.</p>
                    <p v-if="uploadError" class="error-text">{{ uploadError }}</p>
                </div>
                <div class="modal-actions">
                    <button @click="uploadFile" :disabled="!canSubmit" class="btn-save">
                        {{ uploading ? (uploadMode === 'upload' ? 'Uploading...' : 'Saving...') : (uploadMode === 'upload' ? 'Upload' : 'Save Link') }}
                    </button>
                    <button @click="closeModal" class="btn-cancel">Cancel</button>
                </div>
            </div>
        </div>

        <!-- Rename Modal -->
        <div v-if="showRenameModal" class="modal-overlay" @click.self="closeRenameModal">
            <div class="modal-content">
                <h3>Rename File</h3>
                <div class="form-group">
                    <label>New name</label>
                    <input type="text" v-model="renameName" placeholder="Enter new file name" />
                </div>
                <p v-if="renameError" class="error-text">{{ renameError }}</p>
                <div class="modal-actions">
                    <button class="btn-save" @click="renameFile" :disabled="renaming">
                        {{ renaming ? 'Renaming...' : 'Save' }}
                    </button>
                    <button class="btn-cancel" @click="closeRenameModal">Cancel</button>
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
                        <td class="file-name">{{ getFileIcon(file.fileType) }} {{ file.name }}</td>
                        <td>{{ formatFileSize(file.fileSize) }}</td>
                        <td>{{ file.fileType }}</td>
                        <td>{{ formatDate(file.createdAt) }}</td>
                        <td class="actions">
                            <button @click="downloadFile(file)" class="btn-action" title="Download">⬇️</button>
                            <button @click="openRename(file)" class="btn-action" title="Rename">✏️</button>
                            <button @click="deleteFile(file._id)" class="btn-action btn-danger" title="Delete">🗑️</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
const uploadError = ref('')
const uploadMode = ref('upload')
const linkName = ref('')
const linkUrl = ref('')
const linkType = ref('')
const showRenameModal = ref(false)
const renameTarget = ref(null)
const renameName = ref('')
const renameError = ref('')
const renaming = ref(false)

const canSubmit = computed(() => {
    if (uploading.value) return false
    if (uploadMode.value === 'upload') return !!selectedFile.value
    return !!linkName.value && !!linkUrl.value
})

const loadFiles = async () => {
    loading.value = true
    try {
        const response = await fileAPI.getFiles(folderId)
        files.value = response.files || []

        // Also get folder name
        const folderResponse = await folderAPI.getFolder(folderId)
        folderName.value = folderResponse.name || 'Files'
    } catch (error) {
        console.error('Failed to load files:', error)
    } finally {
        loading.value = false
    }
}

const handleFileSelect = (event) => {
    uploadError.value = ''
    selectedFile.value = event.target.files[0]
}

const handleDrop = (event) => {
    event.preventDefault()
    uploadError.value = ''
    selectedFile.value = event.dataTransfer.files[0]
}

const uploadFile = async () => {
    if (uploadMode.value === 'upload' && !selectedFile.value) {
        uploadError.value = 'Please select a file to upload.'
        return
    }

    if (uploadMode.value === 'link' && (!linkName.value || !linkUrl.value)) {
        uploadError.value = 'File name and URL are required.'
        return
    }

    uploading.value = true
    uploadError.value = ''
    try {
        if (uploadMode.value === 'upload') {
            const result = await fileAPI.uploadFile(folderId, selectedFile.value)
            console.log('Upload success:', result)
            await loadFiles()
            closeModal()
        } else {
            const result = await fileAPI.uploadFile(folderId, {
                name: linkName.value,
                fileUrl: linkUrl.value,
                fileType: linkType.value
            })
            console.log('Link save success:', result)
            await loadFiles()
            closeModal()
        }
    } catch (error) {
        console.error('Upload error details:', error)
        uploadError.value = error.message || 'Error uploading file'
    } finally {
        uploading.value = false
    }
}

const setUploadMode = (mode) => {
    uploadMode.value = mode
    uploadError.value = ''
    if (mode === 'upload') {
        linkName.value = ''
        linkUrl.value = ''
        linkType.value = ''
    } else {
        selectedFile.value = null
        if (fileInput.value) fileInput.value.value = ''
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
    if (file.fileUrl) {
        window.open(file.fileUrl, '_blank')
    } else {
        alert(`Download link not available for: ${file.name}`)
    }
}

const openRename = (file) => {
    renameTarget.value = file
    renameName.value = file.name
    renameError.value = ''
    showRenameModal.value = true
}

const renameFile = async () => {
    if (!renameName.value.trim()) {
        renameError.value = 'File name is required'
        return
    }
    renaming.value = true
    renameError.value = ''
    try {
        await fileAPI.updateFile(renameTarget.value._id, renameName.value.trim())
        await loadFiles()
        closeRenameModal()
    } catch (error) {
        renameError.value = error.message || 'Error renaming file'
    } finally {
        renaming.value = false
    }
}

const closeModal = () => {
    showUploadModal.value = false
    selectedFile.value = null
    uploadError.value = ''
    linkName.value = ''
    linkUrl.value = ''
    linkType.value = ''
    uploadMode.value = 'upload'
    if (fileInput.value) fileInput.value.value = ''
}

const closeRenameModal = () => {
    showRenameModal.value = false
    renameTarget.value = null
    renameName.value = ''
    renameError.value = ''
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

.mode-toggle {
    display: inline-flex;
    gap: 0.75rem;
    margin: 0.5rem 0 1rem;
}

.mode-btn {
    padding: 0.6rem 1rem;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.mode-btn.active {
    background: #2563eb;
    color: #fff;
    border-color: #1d4ed8;
}

.mode-btn:not(.active):hover {
    background: #e2e8f0;
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
    margin-bottom: 1.25rem;
}

.form-group label {
    display: block;
    font-weight: 600;
    color: #334155;
    margin-bottom: 0.5rem;
}

.form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
    box-sizing: border-box;
}

.form-group input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
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

.link-form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem 0;
}

.input-label {
    font-weight: 600;
    color: #1e293b;
}

.text-input {
    padding: 0.75rem 1rem;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.text-input:focus {
    border-color: #2563eb;
    outline: none;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.helper-text {
    color: #64748b;
    margin: 0;
    font-size: 0.95rem;
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

.error-text {
    color: #dc2626;
    margin-top: 0.75rem;
    font-weight: 600;
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
