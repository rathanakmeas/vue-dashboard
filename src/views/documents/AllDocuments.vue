<template>
    <div class="documents-container">
        <div class="page-header">
            <h2 class="title">📄 All Documents</h2>
            <div class="header-actions">
                <input type="text" v-model="searchQuery" placeholder="Search documents..." class="search-input" />
                <button @click="showUploadModal = true" class="btn-create">+ Upload Document</button>
            </div>
        </div>

        <!-- Upload Modal -->
        <div v-if="showUploadModal" class="modal-overlay" @click.self="closeUploadModal">
            <div class="modal-content large-modal">
                <h3>Upload Document</h3>
                <form @submit.prevent="uploadDocument" class="upload-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Letter No</label>
                            <input v-model="uploadForm.letterNo" type="text" placeholder="e.g., LTR-2026-001" />
                        </div>
                        <div class="form-group">
                            <label>Number In/No</label>
                            <input v-model="uploadForm.numberInNo" type="text" placeholder="Incoming number" />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>From</label>
                            <input v-model="uploadForm.from" type="text" placeholder="Sender/Department" />
                        </div>
                        <div class="form-group">
                            <label>Dateline</label>
                            <input v-model="uploadForm.dateline" type="date" />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Folder <span class="required">*</span></label>
                            <select v-model="uploadForm.folderId" required>
                                <option value="">Select folder...</option>
                                <option v-for="folder in folders" :key="folder._id" :value="folder._id">
                                    {{ folder.name }}
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Category</label>
                            <select v-model="uploadForm.category">
                                <option value="">Select category...</option>
                                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Document Name <span class="required">*</span></label>
                        <input v-model="uploadForm.name" type="text" placeholder="Document name" />
                    </div>

                    <div class="form-group">
                        <label>Description</label>
                        <textarea v-model="uploadForm.description" rows="3" placeholder="Document description"></textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Storage</label>
                            <select v-model="uploadForm.storage">
                                <option value="Local Disk">Local Disk (Default)</option>
                                <option value="Cloud Storage">Cloud Storage</option>
                                <option value="Network Drive">Network Drive</option>
                                <option value="Archive">Archive</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Department</label>
                            <select v-model="uploadForm.departmentCode">
                                <option value="">Select department...</option>
                                <optgroup v-for="cat in departmentCategories" :key="cat" :label="cat">
                                    <option 
                                        v-for="dept in departments.filter(d => d.category === cat)" 
                                        :key="dept.code" 
                                        :value="dept.code">
                                        {{ dept.name }}
                                    </option>
                                </optgroup>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Priority</label>
                            <select v-model="uploadForm.priority">
                                <option value="">None</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Expiry Date</label>
                            <input v-model="uploadForm.expiryDate" type="date" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Meta Tags</label>
                        <input v-model="uploadForm.metaTags" type="text" placeholder="Separate tags with commas (e.g., urgent, confidential, policy)" />
                        <small class="help-text">Use commas to separate tags</small>
                    </div>

                    <div class="form-group">
                        <label>Share with Roles</label>
                        <div class="checkbox-group">
                            <label v-for="role in availableRoles" :key="role" class="checkbox-label">
                                <input type="checkbox" :value="role" v-model="uploadForm.sharedWithRoles" />
                                {{ role }}
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Share with Users</label>
                        <select v-model="uploadForm.sharedWithUsers" multiple class="multi-select">
                            <option v-for="user in allUsers" :key="user._id" :value="user._id">
                                {{ user.username }} ({{ user.email }})
                            </option>
                        </select>
                        <small class="help-text">Hold Ctrl/Cmd to select multiple users</small>
                    </div>

                    <div class="upload-area">
                        <input ref="fileInput" type="file" @change="handleFileSelect" style="display: none" required />
                        <button @click="$refs.fileInput.click()" type="button" class="btn-link">
                            {{ selectedFile ? 'Change file' : 'Choose file' }}
                        </button>
                        <div v-if="selectedFile" class="file-info">
                            <p>📄 {{ selectedFile.name }}</p>
                            <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
                        </div>
                        <p v-else class="upload-hint">No file selected</p>
                    </div>

                    <div class="modal-actions">
                        <button type="submit" :disabled="uploading || !selectedFile" class="btn-save">
                            {{ uploading ? 'Uploading...' : 'Upload Document' }}
                        </button>
                        <button type="button" @click="closeUploadModal" class="btn-cancel">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Documents Grid -->
        <div v-if="loading" class="loading">Loading documents...</div>
        <div v-else-if="filteredDocuments.length === 0" class="empty-state">
            <p>No documents found. Upload one to get started!</p>
        </div>
        <div v-else class="documents-grid">
            <div v-for="doc in filteredDocuments" :key="doc._id" class="document-card">
                <div class="doc-icon">{{ getFileIcon(doc.fileType) }}</div>
                <div class="doc-info">
                    <h4>{{ doc.name }}</h4>
                    <p class="doc-meta" v-if="doc.letterNo">📋 {{ doc.letterNo }}</p>
                    <p class="doc-meta">{{ formatFileSize(doc.fileSize) }} • {{ doc.category || 'Uncategorized' }}</p>
                    <p class="doc-meta" v-if="doc.from">From: {{ doc.from }}</p>
                    <p class="doc-meta" v-if="doc.priority">
                        <span :class="['priority-badge', `priority-${doc.priority.toLowerCase()}`]">{{ doc.priority }}</span>
                    </p>
                    <p class="doc-date">{{ formatDate(doc.createdAt) }}</p>
                    <div v-if="doc.metaTags && doc.metaTags.length > 0" class="tags">
                        <span v-for="tag in doc.metaTags" :key="tag" class="tag">{{ tag }}</span>
                    </div>
                </div>
                <div class="doc-actions">
                    <button @click="downloadDocument(doc)" class="btn-icon" title="Download">⬇️</button>
                    <button @click="archiveDocument(doc._id)" class="btn-icon" title="Archive">📦</button>
                    <button @click="deleteDocument(doc._id)" class="btn-icon" title="Delete">🗑️</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fileAPI, folderAPI, authAPI, departmentAPI } from '../../api'

const documents = ref([])
const folders = ref([])
const allUsers = ref([])
const departments = ref([])
const departmentCategories = ref([])
const loading = ref(false)
const searchQuery = ref('')
const showUploadModal = ref(false)
const selectedFile = ref(null)
const uploading = ref(false)
const fileInput = ref(null)
const selectedCategory = ref('')

const categories = ['Contract', 'Report', 'Invoice', 'Policy', 'Proposal', 'Presentation', 'Letter', 'Memo', 'Other']
const availableRoles = ['Admin', 'Manager', 'Employee', 'HR', 'Finance', 'IT', 'Guest']

const uploadForm = ref({
    folderId: '',
    category: '',
    name: '',
    description: '',
    letterNo: '',
    from: '',
    dateline: '',
    numberInNo: '',
    storage: 'Local Disk',
    metaTags: '',
    sharedWithRoles: [],
    sharedWithUsers: [],
    departmentCode: '',
    priority: '',
    expiryDate: ''
})

const filteredDocuments = computed(() => {
    if (!searchQuery.value) return documents.value
    const query = searchQuery.value.toLowerCase()
    return documents.value.filter(doc => 
        doc.name.toLowerCase().includes(query) ||
        (doc.category && doc.category.toLowerCase().includes(query))
    )
})

const loadDocuments = async () => {
    loading.value = true
    try {
        const [folderRes, usersRes, deptRes] = await Promise.all([
            folderAPI.getFolders({ page: 1, pageSize: 100 }),
            authAPI.getAllUsers(),
            departmentAPI.getDepartments()
        ])
        
        folders.value = folderRes.data || []
        allUsers.value = usersRes.users || []
        departments.value = deptRes.departments || []
        departmentCategories.value = deptRes.categories || []
        
        const allDocs = []
        for (const folder of folders.value) {
            try {
                const filesRes = await fileAPI.getFiles(folder._id)
                const files = (filesRes.files || []).map(f => ({
                    ...f,
                    category: f.category || getCategoryFromType(f.fileType),
                    folderName: folder.name
                }))
                allDocs.push(...files)
            } catch (err) {
                console.error(`Error loading files for folder ${folder.name}:`, err)
            }
        }
        documents.value = allDocs
    } catch (error) {
        console.error('Failed to load documents:', error)
    } finally {
        loading.value = false
    }
}

const getCategoryFromType = (fileType) => {
    if (fileType.includes('pdf')) return 'Report'
    if (fileType.includes('word') || fileType.includes('document')) return 'Contract'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'Invoice'
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'Presentation'
    return 'Other'
}

const handleFileSelect = (event) => {
    selectedFile.value = event.target.files[0]
}

const uploadDocument = async () => {
    if (!selectedFile.value || !uploadForm.value.folderId) return
    
    uploading.value = true
    try {
        const formData = new FormData()
        formData.append('file', selectedFile.value)
        
        // Add all form fields
        if (uploadForm.value.name) formData.append('name', uploadForm.value.name)
        if (uploadForm.value.category) formData.append('category', uploadForm.value.category)
        if (uploadForm.value.description) formData.append('description', uploadForm.value.description)
        if (uploadForm.value.letterNo) formData.append('letterNo', uploadForm.value.letterNo)
        if (uploadForm.value.from) formData.append('from', uploadForm.value.from)
        if (uploadForm.value.dateline) formData.append('dateline', uploadForm.value.dateline)
        if (uploadForm.value.numberInNo) formData.append('numberInNo', uploadForm.value.numberInNo)
        if (uploadForm.value.storage) formData.append('storage', uploadForm.value.storage)
        if (uploadForm.value.departmentCode) formData.append('departmentCode', uploadForm.value.departmentCode)
        if (uploadForm.value.priority) formData.append('priority', uploadForm.value.priority)
        if (uploadForm.value.expiryDate) formData.append('expiryDate', uploadForm.value.expiryDate)
        
        // Handle arrays
        if (uploadForm.value.metaTags) {
            const tags = uploadForm.value.metaTags.split(',').map(t => t.trim()).filter(Boolean)
            formData.append('metaTags', tags.join(','))
        }
        
        if (uploadForm.value.sharedWithRoles.length > 0) {
            formData.append('sharedWithRoles', uploadForm.value.sharedWithRoles.join(','))
        }
        
        if (uploadForm.value.sharedWithUsers.length > 0) {
            formData.append('sharedWithUsers', uploadForm.value.sharedWithUsers.join(','))
        }
        
        // Upload using raw fetch to handle FormData properly
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:5000/api/files/${uploadForm.value.folderId}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
        
        if (!response.ok) {
            throw new Error('Upload failed')
        }
        
        closeUploadModal()
        loadDocuments()
    } catch (error) {
        alert('Upload failed: ' + error.message)
    } finally {
        uploading.value = false
    }
}

const downloadDocument = (doc) => {
    window.open(doc.fileUrl, '_blank')
}

const archiveDocument = async (docId) => {
    if (!confirm('Archive this document?')) return
    try {
        await fileAPI.archiveFile(docId)
        alert('Document archived successfully')
        loadDocuments()
    } catch (error) {
        alert('Failed to archive: ' + error.message)
    }
}

const deleteDocument = async (docId) => {
    if (!confirm('Delete this document permanently?')) return
    try {
        await fileAPI.deleteFile(docId)
        loadDocuments()
    } catch (error) {
        alert('Failed to delete: ' + error.message)
    }
}

const closeUploadModal = () => {
    showUploadModal.value = false
    selectedFile.value = null
    uploadForm.value = {
        folderId: '',
        category: '',
        name: '',
        description: '',
        letterNo: '',
        from: '',
        dateline: '',
        numberInNo: '',
        storage: 'Local Disk',
        metaTags: '',
        sharedWithRoles: [],
        sharedWithUsers: [],
        departmentCode: '',
        priority: '',
        expiryDate: ''
    }
}

const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString()
}

const getFileIcon = (fileType) => {
    if (!fileType) return '📄'
    if (fileType.includes('pdf')) return '📕'
    if (fileType.includes('word') || fileType.includes('document')) return '📘'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️'
    if (fileType.includes('image')) return '🖼️'
    if (fileType.includes('video')) return '🎥'
    return '📄'
}

onMounted(loadDocuments)
</script>

<style scoped>
.documents-container {
    padding: 2rem;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.header-actions {
    display: flex;
    gap: 1rem;
}

.search-input {
    padding: 0.5rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    min-width: 300px;
}

.documents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.document-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    gap: 1rem;
    transition: all 0.2s;
}

.document-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.doc-icon {
    font-size: 2.5rem;
}

.doc-info {
    flex: 1;
}

.doc-info h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
}

.doc-meta {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0.25rem 0;
}

.doc-date {
    font-size: 0.8rem;
    color: #94a3b8;
}

.doc-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.large-modal {
    min-width: 700px;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
}

.upload-form {
    max-height: calc(90vh - 150px);
    overflow-y: auto;
    padding-right: 0.5rem;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.required {
    color: #ef4444;
}

.help-text {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.85rem;
    color: #64748b;
}

.checkbox-group {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.5rem;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #f8fafc;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: normal;
}

.checkbox-label input[type="checkbox"] {
    width: auto;
    cursor: pointer;
}

.multi-select {
    min-height: 120px;
}

.upload-area {
    padding: 2rem;
    border: 2px dashed #cbd5e1;
    border-radius: 8px;
    text-align: center;
    margin: 1rem 0;
}

.upload-hint {
    color: #94a3b8;
    font-size: 0.9rem;
    margin-top: 0.5rem;
}

.file-info {
    margin-top: 1rem;
    padding: 1rem;
    background: #f1f5f9;
    border-radius: 8px;
}

.file-size {
    color: #64748b;
    font-size: 0.9rem;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.tag {
    background: #dbeafe;
    color: #1e40af;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
}

.priority-badge {
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
}

.priority-low {
    background: #dbeafe;
    color: #1e40af;
}

.priority-medium {
    background: #fef3c7;
    color: #92400e;
}

.priority-high {
    background: #fed7aa;
    color: #9a3412;
}

.priority-urgent {
    background: #fee2e2;
    color: #991b1b;
}
</style>
