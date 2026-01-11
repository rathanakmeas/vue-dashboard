<template>
    <div class="archived-container">
        <div class="page-header">
            <h2 class="title">📦 Archived Documents</h2>
            <button @click="emptyArchive" class="btn-danger" v-if="archivedDocuments.length > 0">
                Empty Archive
            </button>
        </div>

        <div v-if="loading" class="loading">Loading archived documents...</div>
        <div v-else-if="archivedDocuments.length === 0" class="empty-state">
            <div class="empty-icon">📦</div>
            <p>No archived documents</p>
            <span class="empty-subtitle">Documents you archive will appear here</span>
        </div>
        <div v-else class="documents-grid">
            <div v-for="doc in archivedDocuments" :key="doc._id" class="document-card">
                <div class="doc-icon">{{ getFileIcon(doc.fileType) }}</div>
                <div class="doc-info">
                    <h4>{{ doc.name }}</h4>
                    <p class="doc-meta">{{ formatFileSize(doc.fileSize) }}</p>
                    <p class="doc-date">Archived: {{ formatDate(doc.deletedAt || doc.updatedAt) }}</p>
                    <span class="archive-badge">Archived</span>
                </div>
                <div class="doc-actions">
                    <button @click="restoreDocument(doc._id)" class="btn-icon" title="Restore">♻️</button>
                    <button @click="downloadDocument(doc)" class="btn-icon" title="Download">⬇️</button>
                    <button @click="permanentDelete(doc._id)" class="btn-icon btn-danger" title="Delete Forever">🗑️</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fileAPI, folderAPI } from '../../api'

const archivedDocuments = ref([])
const loading = ref(false)

const loadArchivedDocuments = async () => {
    loading.value = true
    try {
        const response = await fileAPI.getArchivedFiles()
        archivedDocuments.value = response.files || []
    } catch (error) {
        console.error('Failed to load archived documents:', error)
    } finally {
        loading.value = false
    }
}

const restoreDocument = async (docId) => {
    if (!confirm('Restore this document?')) return
    
    try {
        await fileAPI.restoreFile(docId)
        alert('Document restored successfully')
        loadArchivedDocuments()
    } catch (error) {
        alert('Failed to restore: ' + error.message)
    }
}

const downloadDocument = (doc) => {
    window.open(doc.fileUrl, '_blank')
}

const permanentDelete = async (docId) => {
    if (!confirm('Delete this document permanently? This action cannot be undone.')) return
    
    try {
        await fileAPI.deleteFile(docId)
        loadArchivedDocuments()
    } catch (error) {
        alert('Failed to delete: ' + error.message)
    }
}

const emptyArchive = async () => {
    if (!confirm('Delete all archived documents permanently? This action cannot be undone.')) return
    
    try {
        for (const doc of archivedDocuments.value) {
            await fileAPI.deleteFile(doc._id)
        }
        archivedDocuments.value = []
    } catch (error) {
        alert('Failed to empty archive: ' + error.message)
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
    return '📄'
}

onMounted(loadArchivedDocuments)
</script>

<style scoped>
.archived-container {
    padding: 2rem;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.empty-state {
    text-align: center;
    padding: 4rem 2rem;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.empty-subtitle {
    color: #94a3b8;
    font-size: 0.9rem;
}

.documents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.document-card {
    background: #fef3c7;
    border: 1px solid #fde68a;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    gap: 1rem;
    transition: all 0.2s;
}

.document-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.doc-icon {
    font-size: 2.5rem;
    opacity: 0.7;
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
    color: #92400e;
    margin: 0.25rem 0;
}

.doc-date {
    font-size: 0.8rem;
    color: #a16207;
    margin-bottom: 0.5rem;
}

.archive-badge {
    background: #fbbf24;
    color: #78350f;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
}

.doc-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.btn-danger {
    background: #ef4444;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
}

.btn-danger:hover {
    background: #dc2626;
}
</style>
