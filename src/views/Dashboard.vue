<template>
    <div class="container">
        <!-- Header -->
        <div class="page-header">
            <h2 class="title">📊 Dashboard</h2>
            <p class="subtitle">{{ today }}</p>
        </div>

        <!-- Stats Cards Grid -->
        <div class="stats-grid">
            <template v-if="loading">
                <LoadingSkeleton variant="card" v-for="n in 4" :key="n" />
            </template>
            <template v-else>
                <div class="stat-card">
                    <h3>📁 Total Folders</h3>
                    <p>{{ statistics.totalFolders }}</p>
                </div>
                <div class="stat-card">
                    <h3>🔒 Owned</h3>
                    <p>{{ statistics.ownedFolders }}</p>
                </div>
                <div class="stat-card">
                    <h3>🔗 Shared</h3>
                    <p>{{ statistics.sharedFolders }}</p>
                </div>
                <div class="stat-card">
                    <h3>📄 Total Files</h3>
                    <p>{{ statistics.totalFiles }}</p>
                </div>
            </template>
        </div>

        <!-- Activity Stats -->
        <section class="dashboard-section card">
            <h3>📊 Activity Summary</h3>
            <div class="activity-stats">
                <div v-for="stat in activityStats" :key="stat._id" class="activity-stat">
                    <span class="action-badge">{{ stat._id }}</span>
                    <span class="count">{{ stat.count }}</span>
                </div>
            </div>
        </section>

        <!-- Top Folders -->
        <section class="dashboard-section card">
            <h3>📁 Top Folders by Files</h3>
            <LoadingSkeleton v-if="loading" variant="list" :rows="5" />
            <div v-else-if="topFolders.length === 0" class="no-data">No folders yet</div>
            <div v-else class="top-folders">
                <div v-for="folder in topFolders" :key="folder._id" class="folder-stat">
                    <div class="folder-info">
                        <h4>{{ folder.name }}</h4>
                        <p class="folder-meta">{{ folder.fileCount }} files • {{ formatSize(folder.totalSize) }}</p>
                    </div>
                    <span v-if="!folder.isShared" class="shared-badge">Owned</span>
                    <span v-else class="shared-badge">Shared</span>
                </div>
            </div>
        </section>

        <!-- Recent Activities -->
        <section class="dashboard-section card">
            <h3>📌 Recent Activities</h3>
            <div v-if="loading" class="loading">Loading...</div>
            <div v-else-if="recentActivities.length === 0" class="no-data">No recent activity yet</div>
            <div v-else class="recent-activities">
                <div v-for="activity in recentActivities" :key="activity._id" class="activity-item">
                    <div class="activity-action">{{ activity.action }}</div>
                    <div class="activity-time">{{ formatTime(activity.createdAt) }}</div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import LoadingSkeleton from '../components/LoadingSkeleton.vue'

    const today = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const statistics = ref({
        totalFolders: 0,
        ownedFolders: 0,
        sharedFolders: 0,
        totalFiles: 0
    })
    const activityStats = ref([])
    const topFolders = ref([])
    const recentActivities = ref([])
    const loading = ref(false)

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const formatTime = (date) => {
        const now = new Date()
        const diff = now - new Date(date)
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return 'just now'
        if (minutes < 60) return `${minutes} mins ago`
        if (hours < 24) return `${hours} hours ago`
        return `${days} days ago`
    }

    const loadDashboard = async () => {
        loading.value = true
        try {
            const response = await fetch('/api/dashboard', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            const data = await response.json()
            statistics.value = data.statistics
            activityStats.value = data.activityStats
            topFolders.value = data.topFolders
            recentActivities.value = data.recentActivities
        } catch (error) {
            console.error('Failed to load dashboard:', error)
        } finally {
            loading.value = false
        }
    }

    onMounted(() => {
        loadDashboard()
    })
</script>

<style scoped>
    /* Stats Cards Grid */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .stat-card {
        background: #fff;
        border-radius: 8px;
        box-shadow:
            0 1.5px 3px rgba(0, 0, 0, 0.06),
            0 6px 12px rgba(0, 0, 0, 0.1);
        padding: 1rem 1.25rem;
        text-align: center;
        user-select: none;
        transition: transform 0.2s ease;
    }

    .stat-card:hover {
        transform: translateY(-5px);
    }

    .stat-card h3 {
        font-size: 1rem;
        margin-bottom: 0.5rem;
        color: #444;
        font-weight: 600;
    }

    .stat-card p {
        font-size: 1.5rem;
        font-weight: 700;
        color: #111;
    }

    /* Sections */
    .dashboard-section {
        margin-top: 2rem;
        user-select: none;
    }

    .dashboard-section h3 {
        font-weight: 700;
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: #222;
    }

    /* Chart Placeholder */
    .chart-placeholder {
        background: #e9efff;
        height: 200px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #64748b;
        font-style: italic;
        user-select: none;
    }

    /* Progress Bar */
    .progress-bar {
        background: #e0e7ff;
        height: 28px;
        border-radius: 8px;
        overflow: hidden;
        margin-top: 0.5rem;
        width: 100%;
        max-width: 400px;
        user-select: none;
    }

    .progress-fill {
        height: 100%;
        background: #3b82f6;
        color: white;
        font-size: 1rem;
        font-weight: 700;
        text-align: center;
        line-height: 28px;
        border-radius: 8px;
        transition: width 0.5s ease;
    }

    /* Card container for table */
    .card {
        background: #ffffff;
        border-radius: 8px;
        padding: 2rem;
    }

    /* Search input modern style */
    .search-input {
        width: 100%;
        max-width: 220px;
        padding: 0.5rem 1rem;
        margin-bottom: 1.5rem;
        background: none;
        border: 1px solid #d2d6da;
        border-radius: .375rem;
        line-height: 1.3;
    }

    .search-input:focus {
        outline: none;
        border-color: #3b82f6;
    }

    /* Responsive horizontal scroll wrapper */
    .table-responsive {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        background: white;
        padding: 0.5rem;
        margin-top: 1rem;
    }

    .loading {
        text-align: center;
        padding: 2rem;
        color: #64748b;
        font-size: 1rem;
    }

    .no-data {
        text-align: center;
        padding: 2rem;
        color: #94a3b8;
        font-size: 0.95rem;
    }

    /* Activity Stats */
    .activity-stats {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
    }

    .activity-stat {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: #f8f9fa;
        border-radius: 4px;
    }

    .action-badge {
        font-weight: 600;
        color: #1e293b;
    }

    .count {
        background: #3b82f6;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-weight: bold;
        font-size: 0.9rem;
    }

    /* Top Folders */
    .top-folders {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .folder-stat {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 4px;
        border-left: 3px solid #3b82f6;
    }

    .folder-info h4 {
        margin: 0 0 0.25rem 0;
        color: #1e293b;
    }

    .folder-meta {
        margin: 0;
        color: #64748b;
        font-size: 0.85rem;
    }

    .shared-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 600;
        background: #3b82f6;
        color: white;
    }

    /* Recent Activities */
    .recent-activities {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .activity-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: #f8f9fa;
        border-radius: 4px;
        border-left: 3px solid #4CAF50;
    }

    .activity-action {
        font-weight: 600;
        color: #1e293b;
    }

    .activity-time {
        color: #64748b;
        font-size: 0.85rem;
    }

    /* Responsive adjustments */
    @media (max-width: 900px) {
        .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        }

        .progress-bar {
            max-width: 100%;
        }
    }

    @media (max-width: 480px) {
        .dashboard-container {
            padding: 1rem;
        }

        .stat-card h3 {
            font-size: 0.9rem;
        }

        .stat-card p {
            font-size: 1.25rem;
        }

        .search-input {
            max-width: 100%;
        }
    }
</style>
