import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '../api'

// Layout (eagerly loaded)
import DefaultLayout from '../layouts/DefaultLayout.vue'

// Auth Views (eagerly loaded - needed immediately)
import Login from '../views/Login.vue'

// Main Views (lazy loaded)
const Dashboard = () => import('../views/Dashboard.vue')
const Folders = () => import('../views/Folders.vue')
const Files = () => import('../views/Files.vue')
const Activity = () => import('../views/Activity.vue')
const Recent = () => import('../views/folder/Recent.vue')
const Shared = () => import('../views/folder/Shared.vue')
const Settings = () => import('../views/Settings.vue')
const Departments = () => import('../views/DepartmentsNew.vue')
const Employees = () => import('../views/Employees.vue')
const EmployeeDetail = () => import('../views/EmployeeDetail.vue')

// Document Views (lazy loaded)
const AllDocuments = () => import('../views/documents/AllDocuments.vue')
const Categories = () => import('../views/documents/Categories.vue')
const AuditTrail = () => import('../views/documents/AuditTrail.vue')
const Archived = () => import('../views/documents/Archived.vue')

// Department Views (lazy loaded)
const DepartmentAnalytics = () => import('../views/DepartmentAnalytics.vue')
const OrgChart = () => import('../views/OrgChart.vue')

// Auth Views (lazy loaded)
const Register = () => import('../views/auth/Register.vue')
const Logout = () => import('../views/auth/Logout.vue')
const Users = () => import('../views/auth/Users.vue')
const Security = () => import('../views/auth/Security.vue')
const Privacy = () => import('../views/auth/Privacy.vue')
const Profile = () => import('../views/auth/Profile.vue')

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
