import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '../api'

// Layout
import DefaultLayout from '../layouts/DefaultLayout.vue'

// Main Views
import Dashboard from '../views/Dashboard.vue'
import Folders from '../views/Folders.vue'
import Files from '../views/Files.vue'
import Activity from '../views/Activity.vue'
import Recent from '../views/folder/Recent.vue'
import Shared from '../views/folder/Shared.vue'
import Settings from '../views/Settings.vue'
import Departments from '../views/DepartmentsNew.vue'
import Employees from '../views/Employees.vue'
import EmployeeDetail from '../views/EmployeeDetail.vue'

// Document Views
import AllDocuments from '../views/documents/AllDocuments.vue'
import Categories from '../views/documents/Categories.vue'
import AuditTrail from '../views/documents/AuditTrail.vue'
import Archived from '../views/documents/Archived.vue'

// Department Views
import DepartmentAnalytics from '../views/DepartmentAnalytics.vue'
import OrgChart from '../views/OrgChart.vue'

// Auth Views
import Login from '../views/Login.vue'
import Register from '../views/auth/Register.vue'
import Logout from '../views/auth/Logout.vue'
import Users from '../views/auth/Users.vue'
import Security from '../views/auth/Security.vue'
import Privacy from '../views/auth/Privacy.vue'
import Profile from '../views/auth/Profile.vue'

const isAuthenticated = () => !!getToken()

const routes = [
    // Layout-wrapped routes (with sidebar + topbar)
    {
        path: '/',
        component: DefaultLayout,
        meta: { requiresAuth: true },
        children: [
        {
            path: '',
            name: 'dashboard',
            component: Dashboard,
            meta: { title: '📊 Dashboard', requiresAuth: true }
        },
        {
            path: 'folders',
            name: 'folders',
            component: Folders,
            meta: { title: '📁 Folder', requiresAuth: true }
        },
        {
            path: 'files/:id',
            name: 'files',
            component: Files,
            meta: { title: '📄 Files', requiresAuth: true }
        },
        {
            path: 'activity',
            name: 'activity',
            component: Activity,
            meta: { title: '📋 Activity Log', requiresAuth: true }
        },
        {
            path: 'folder/recent',
            name: 'recent',
            component: Recent,
            meta: { title: '🕓 Recent', requiresAuth: true }
        },
        {
            path: 'folder/shared',
            name: 'shared',
            component: Shared,
            meta: { title: '📤 Shared', requiresAuth: true }
        },
        {
            path: 'documents',
            name: 'documents',
            component: AllDocuments,
            meta: { title: '📄 All Documents', requiresAuth: true }
        },
        {
            path: 'documents/categories',
            name: 'categories',
            component: Categories,
            meta: { title: '🗂️ Categories', requiresAuth: true }
        },
        {
            path: 'documents/audit',
            name: 'audit',
            component: AuditTrail,
            meta: { title: '📋 Audit Trail', requiresAuth: true }
        },
        {
            path: 'documents/archived',
            name: 'archived',
            component: Archived,
            meta: { title: '📦 Archived', requiresAuth: true }
        },
        {
            path: 'departments',
            name: 'departments',
            component: Departments,
            meta: { title: '🏥 Departments', requiresAuth: true }
        },
        {
            path: 'employees',
            name: 'employees',
            component: Employees,
            meta: { title: '👥 Employees', requiresAuth: true }
        },
        {
            path: 'employees/:id',
            name: 'employee-detail',
            component: EmployeeDetail,
            meta: { title: '👤 Employee Detail', requiresAuth: true }
        },
        {
            path: 'departments/analytics',
            name: 'department-analytics',
            component: DepartmentAnalytics,
            meta: { title: '📊 Department Analytics', requiresAuth: true }
        },
        {
            path: 'departments/orgchart',
            name: 'org-chart',
            component: OrgChart,
            meta: { title: '🌳 Org Chart', requiresAuth: true }
        },
        {
            path: 'settings',
            name: 'settings',
            component: Settings,
            meta: { title: '⚙️ Settings', requiresAuth: true }
        }
        ]
    },

    // Auth layout-wrapped routes (sidebar still applies)
    {
        path: '/auth',
        component: DefaultLayout,
        meta: { requiresAuth: true },
        children: [
        {
            path: 'profile',
            name: 'profile',
            component: Profile,
            meta: { title: '👤 Profile', requiresAuth: true }
        },
        {
            path: 'users',
            name: 'users',
            component: Users,
            meta: { title: '🔒 Users', requiresAuth: true }
        },
        {
            path: 'security',
            name: 'security',
            component: Security,
            meta: { title: '🛡️ Security', requiresAuth: true }
        },
        {
            path: 'privacy',
            name: 'privacy',
            component: Privacy,
            meta: { title: '🔒 Privacy', requiresAuth: true }
        }
        ]
    },

    // Public auth routes (no sidebar)
    {
        path: '/auth/login',
        name: 'login',
        component: Login,
        meta: { title: '🔐 Login', requiresAuth: false }
    },
    {
        path: '/auth/register',
        name: 'register',
        component: Register,
        meta: { title: '📝 Register', requiresAuth: false }
    },
    {
        path: '/auth/logout',
        name: 'logout',
        component: Logout,
        meta: { title: '🔒 Logout', requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Auth guard - protect routes that require authentication
router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta?.requiresAuth)
    const isAuth = isAuthenticated()

    if (requiresAuth && !isAuth) {
        // Redirect to login if route requires auth but user is not authenticated
        next('/auth/login')
    } else if (!requiresAuth && isAuth && (to.path === '/auth/login' || to.path === '/auth/register')) {
        // Redirect to dashboard if user is already logged in but tries to access login/register
        next('/')
    } else {
        next()
    }
})

// Update document title based on route meta title
router.afterEach((to) => {
    const nearestWithTitle = to.matched.slice().reverse().find(r => r.meta?.title)
    document.title = nearestWithTitle ? nearestWithTitle.meta.title : 'StarCode Kh'
})

export default router
