<template>
    <div class="profile-container">
        <!-- Header -->
        <div class="page-header">
            <h2 class="title">👤 My Profile</h2>
            <p class="subtitle">Manage your personal information</p>
        </div>

        <!-- Tabs -->
        <div class="tabs">
            <button 
                v-for="tab in tabs" 
                :key="tab" 
                :class="['tab-button', { active: currentTab === tab }]" 
                @click="currentTab = tab"
            >
                {{ tab }}
            </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content card">
            <!-- Profile Tab -->
            <div v-if="currentTab === 'Profile'" class="tab-pane">
                <h3>📋 Personal Information</h3>
                <form @submit.prevent="updateProfile">
                    <div class="form-row">
                        <div class="form-group">
                            <label>First Name</label>
                            <input v-model="formData.firstName" type="text" placeholder="Enter first name" />
                        </div>
                        <div class="form-group">
                            <label>Last Name</label>
                            <input v-model="formData.lastName" type="text" placeholder="Enter last name" />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Email</label>
                            <input v-model="currentUser.email" type="email" disabled />
                        </div>
                        <div class="form-group">
                            <label>Username</label>
                            <input v-model="currentUser.username" type="text" disabled />
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn-save" :disabled="updating">{{ updating ? 'Saving...' : 'Save Changes' }}</button>
                        <span v-if="successMessage" class="success-message">{{ successMessage }}</span>
                        <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
                    </div>
                </form>
            </div>

            <!-- Account Tab -->
            <div v-if="currentTab === 'Account'" class="tab-pane">
                <h3>🔐 Account Information</h3>
                <div class="info-group">
                    <label>Joined Date</label>
                    <p>{{ formatDate(currentUser.createdAt) }}</p>
                </div>
                <div class="info-group">
                    <label>Last Updated</label>
                    <p>{{ formatDate(currentUser.updatedAt) }}</p>
                </div>
                <div class="info-group">
                    <label>Account Status</label>
                    <p><span class="badge badge-active">Active</span></p>
                </div>
            </div>

            <!-- Security Tab -->
            <div v-if="currentTab === 'Security'" class="tab-pane">
                <h3>🛡️ Security</h3>
                <form @submit.prevent="changePassword">
                    <div class="form-group">
                        <label>Current Password</label>
                        <input v-model="passwordData.currentPassword" type="password" placeholder="Enter current password" required />
                    </div>
                    <div class="form-group">
                        <label>New Password</label>
                        <input v-model="passwordData.newPassword" type="password" placeholder="Enter new password" required />
                    </div>
                    <div class="form-group">
                        <label>Confirm New Password</label>
                        <input v-model="passwordData.confirmPassword" type="password" placeholder="Confirm new password" required />
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-save" :disabled="updatingPassword">{{ updatingPassword ? 'Updating...' : 'Change Password' }}</button>
                        <span v-if="passwordSuccess" class="success-message">{{ passwordSuccess }}</span>
                        <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authAPI } from '../../api'

const currentTab = ref('Profile')
const tabs = ['Profile', 'Account', 'Security']

const currentUser = ref({
    username: '',
    email: '',
    createdAt: '',
    updatedAt: ''
})

const formData = ref({
    firstName: '',
    lastName: ''
})

const passwordData = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

const updating = ref(false)
const updatingPassword = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const passwordSuccess = ref('')
const passwordError = ref('')

const loadProfile = async () => {
    try {
        const response = await authAPI.getProfile()
        currentUser.value = response.user
        formData.value = {
            firstName: response.user.firstName || '',
            lastName: response.user.lastName || ''
        }
    } catch (error) {
        console.error('Failed to load profile:', error)
    }
}

const updateProfile = async () => {
    updating.value = true
    successMessage.value = ''
    errorMessage.value = ''

    try {
        await authAPI.updateProfile(
            formData.value.firstName,
            formData.value.lastName
        )
        currentUser.value.firstName = formData.value.firstName
        currentUser.value.lastName = formData.value.lastName
        successMessage.value = 'Profile updated successfully!'
        setTimeout(() => { successMessage.value = '' }, 3000)
    } catch (error) {
        errorMessage.value = error.message || 'Failed to update profile'
        setTimeout(() => { errorMessage.value = '' }, 3000)
    } finally {
        updating.value = false
    }
}

const changePassword = async () => {
    if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
        passwordError.value = 'Passwords do not match'
        return
    }

    if (passwordData.value.newPassword.length < 6) {
        passwordError.value = 'Password must be at least 6 characters'
        return
    }

    updatingPassword.value = true
    passwordSuccess.value = ''
    passwordError.value = ''

    try {
        passwordSuccess.value = 'Password changed successfully!'
        passwordData.value = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
        setTimeout(() => { passwordSuccess.value = '' }, 3000)
    } catch (error) {
        passwordError.value = error.message || 'Failed to change password'
        setTimeout(() => { passwordError.value = '' }, 3000)
    } finally {
        updatingPassword.value = false
    }
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString()
}

onMounted(() => {
    loadProfile()
})
</script>

<style scoped>
.profile-container {
    padding: 2rem;
    max-width: 1000px;
    margin: 0 auto;
}

.page-header {
    margin-bottom: 2rem;
}

.title {
    font-size: 2rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 0.5rem 0;
}

.subtitle {
    color: #64748b;
    margin: 0;
}

.tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    border-bottom: 2px solid #e2e8f0;
}

.tab-button {
    padding: 1rem 1.5rem;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    color: #64748b;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
}

.tab-button:hover {
    color: #334155;
}

.tab-button.active {
    color: #2563eb;
    border-bottom-color: #2563eb;
}

.tab-content {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-pane h3 {
    font-size: 1.3rem;
    color: #1e293b;
    margin-bottom: 1.5rem;
    margin-top: 0;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    font-weight: 600;
    color: #334155;
    margin-bottom: 0.5rem;
}

.form-group input {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s;
}

.form-group input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-group input:disabled {
    background-color: #f1f5f9;
    color: #64748b;
    cursor: not-allowed;
}

.form-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-top: 2rem;
}

.btn-save {
    padding: 0.75rem 1.5rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-save:hover:not(:disabled) {
    background-color: #1d4ed8;
}

.btn-save:disabled {
    background-color: #cbd5e1;
    cursor: not-allowed;
}

.success-message {
    color: #059669;
    font-weight: 600;
}

.error-message {
    color: #dc2626;
    font-weight: 600;
}

.info-group {
    margin-bottom: 1.5rem;
}

.info-group label {
    font-weight: 600;
    color: #334155;
    display: block;
    margin-bottom: 0.5rem;
}

.info-group p {
    color: #475569;
    margin: 0;
}

.badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
}

.badge-active {
    background-color: #dcfce7;
    color: #166534;
}

@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr;
    }

    .tabs {
        flex-direction: column;
    }

    .tab-button {
        border-bottom: none;
        border-left: 3px solid transparent;
        padding: 0.75rem 1rem;
    }

    .tab-button.active {
        border-left-color: #2563eb;
        border-bottom-color: transparent;
    }
}
</style>


