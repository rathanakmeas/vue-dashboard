<template>
    <div class="categories-container">
        <div class="page-header">
            <h2 class="title">🗂️ Document Categories</h2>
            <button @click="showCreateModal = true" class="btn-create">+ New Category</button>
        </div>

        <!-- Create/Edit Modal -->
        <div v-if="showCreateModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal-content">
                <h3>{{ editingCategory ? 'Edit Category' : 'Create Category' }}</h3>
                <form @submit.prevent="saveCategory">
                    <div class="form-group">
                        <label>Category Name</label>
                        <input v-model="formData.name" type="text" placeholder="e.g., Contracts" required />
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea v-model="formData.description" placeholder="Category description"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Icon</label>
                        <select v-model="formData.icon">
                            <option value="📄">📄 Document</option>
                            <option value="📕">📕 PDF</option>
                            <option value="📘">📘 Contract</option>
                            <option value="📊">📊 Spreadsheet</option>
                            <option value="📽️">📽️ Presentation</option>
                            <option value="💼">💼 Business</option>
                            <option value="📋">📋 Report</option>
                            <option value="🎯">🎯 Policy</option>
                        </select>
                    </div>
                    <div class="modal-actions">
                        <button type="submit" class="btn-save">Save</button>
                        <button type="button" @click="closeModal" class="btn-cancel">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Categories Grid -->
        <div v-if="loading" class="loading">Loading categories...</div>
        <div v-else class="categories-grid">
            <div v-for="category in categories" :key="category.name" class="category-card" @click="viewCategory(category)">
                <div class="category-icon">{{ category.icon }}</div>
                <div class="category-info">
                    <h3>{{ category.name }}</h3>
                    <p>{{ category.description }}</p>
                    <span class="doc-count">{{ category.count }} documents</span>
                </div>
                <div class="category-actions" @click.stop>
                    <button @click="editCategory(category)" class="btn-icon" title="Edit">✏️</button>
                    <button @click="deleteCategory(category.name)" class="btn-icon" title="Delete">🗑️</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fileAPI, folderAPI } from '../../api'

const router = useRouter()
const categories = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const editingCategory = ref(null)
const formData = ref({
    name: '',
    description: '',
    icon: '📄'
})

const predefinedCategories = [
    { name: 'Contracts', description: 'Legal contracts and agreements', icon: '📘', count: 0 },
    { name: 'Reports', description: 'Business and financial reports', icon: '📋', count: 0 },
    { name: 'Invoices', description: 'Billing and payment documents', icon: '📊', count: 0 },
    { name: 'Policies', description: 'Company policies and procedures', icon: '🎯', count: 0 },
    { name: 'Proposals', description: 'Project proposals and bids', icon: '💼', count: 0 },
    { name: 'Presentations', description: 'Slide decks and presentations', icon: '📽️', count: 0 },
]

const loadCategories = async () => {
    loading.value = true
    try {
        // Load all documents to count by category
        const folderRes = await folderAPI.getFolders({ page: 1, pageSize: 100 })
        const folders = folderRes.data || []
        
        const categoryCounts = {}
        for (const folder of folders) {
            try {
                const filesRes = await fileAPI.getFiles(folder._id)
                const files = filesRes.files || []
                files.forEach(file => {
                    const cat = file.category || 'Other'
                    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
                })
            } catch (err) {
                console.error('Error loading files:', err)
            }
        }
        
        categories.value = predefinedCategories.map(cat => ({
            ...cat,
            count: categoryCounts[cat.name] || 0
        }))
        
        // Add custom categories from documents
        Object.keys(categoryCounts).forEach(catName => {
            if (!categories.value.find(c => c.name === catName)) {
                categories.value.push({
                    name: catName,
                    description: 'Custom category',
                    icon: '📄',
                    count: categoryCounts[catName]
                })
            }
        })
    } catch (error) {
        console.error('Failed to load categories:', error)
    } finally {
        loading.value = false
    }
}

const saveCategory = () => {
    if (!formData.value.name) return
    
    if (editingCategory.value) {
        const index = categories.value.findIndex(c => c.name === editingCategory.value.name)
        if (index !== -1) {
            categories.value[index] = { ...formData.value, count: categories.value[index].count }
        }
    } else {
        categories.value.push({ ...formData.value, count: 0 })
    }
    
    closeModal()
}

const editCategory = (category) => {
    editingCategory.value = category
    formData.value = { ...category }
    showCreateModal.value = true
}

const deleteCategory = (categoryName) => {
    if (!confirm(`Delete category "${categoryName}"?`)) return
    categories.value = categories.value.filter(c => c.name !== categoryName)
}

const viewCategory = (category) => {
    router.push(`/documents?category=${encodeURIComponent(category.name)}`)
}

const closeModal = () => {
    showCreateModal.value = false
    editingCategory.value = null
    formData.value = { name: '', description: '', icon: '📄' }
}

onMounted(loadCategories)
</script>

<style scoped>
.categories-container {
    padding: 2rem;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}

.category-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    gap: 1rem;
}

.category-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.category-icon {
    font-size: 3rem;
}

.category-info {
    flex: 1;
}

.category-info h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
}

.category-info p {
    color: #64748b;
    font-size: 0.9rem;
    margin: 0 0 0.75rem 0;
}

.doc-count {
    background: #eff6ff;
    color: #3b82f6;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 500;
}

.category-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
</style>
