// Example API Usage - Add this to your Vue components

import { authAPI, folderAPI, setToken, getToken } from '@/api.js'

// ==================== AUTHENTICATION ====================

// Register a new user
async function registerUser() {
  try {
    const response = await authAPI.register(
      'johndoe',
      'john@example.com',
      'password123',
      'John',
      'Doe'
    )
    
    if (response.token) {
      console.log('User registered successfully!')
      console.log('Token:', response.token)
      console.log('User:', response.user)
      // Token is automatically saved to localStorage
    }
  } catch (error) {
    console.error('Registration failed:', error)
  }
}

// Login user
async function loginUser() {
  try {
    const response = await authAPI.login(
      'john@example.com',
      'password123'
    )
    
    if (response.token) {
      console.log('Login successful!')
      console.log('Token:', response.token)
      // Token is automatically saved to localStorage
    }
  } catch (error) {
    console.error('Login failed:', error)
  }
}

// Get user profile
async function getUserProfile() {
  try {
    const profile = await authAPI.getProfile()
    console.log('User profile:', profile)
    return profile
  } catch (error) {
    console.error('Failed to fetch profile:', error)
  }
}

// Update user profile
async function updateUserProfile() {
  try {
    const response = await authAPI.updateProfile(
      'Jane',
      'Smith',
      'https://example.com/avatar.jpg'
    )
    console.log('Profile updated:', response)
  } catch (error) {
    console.error('Profile update failed:', error)
  }
}

// Get all users
async function getAllUsers() {
  try {
    const users = await authAPI.getAllUsers()
    console.log('All users:', users)
    return users
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }
}

// Logout
function logoutUser() {
  authAPI.logout()
  console.log('Logged out successfully')
  // Token is removed from localStorage
}

// ==================== FOLDER OPERATIONS ====================

// Create a folder
async function createNewFolder() {
  try {
    const response = await folderAPI.createFolder(
      'My Documents',
      'Important documents for work'
    )
    console.log('Folder created:', response)
    return response.folder
  } catch (error) {
    console.error('Folder creation failed:', error)
  }
}

// Get all user folders
async function getUserFolders() {
  try {
    const folders = await folderAPI.getFolders()
    console.log('User folders:', folders)
    return folders
  } catch (error) {
    console.error('Failed to fetch folders:', error)
  }
}

// Get specific folder
async function getSpecificFolder(folderId) {
  try {
    const folder = await folderAPI.getFolder(folderId)
    console.log('Folder details:', folder)
    return folder
  } catch (error) {
    console.error('Failed to fetch folder:', error)
  }
}

// Update folder
async function updateUserFolder(folderId) {
  try {
    const response = await folderAPI.updateFolder(
      folderId,
      'Updated Folder Name',
      'Updated description'
    )
    console.log('Folder updated:', response)
  } catch (error) {
    console.error('Folder update failed:', error)
  }
}

// Delete folder
async function deleteUserFolder(folderId) {
  try {
    const response = await folderAPI.deleteFolder(folderId)
    console.log('Folder deleted:', response)
  } catch (error) {
    console.error('Folder deletion failed:', error)
  }
}

// Share folder with another user
async function shareFolderWithUser(folderId, userId) {
  try {
    const response = await folderAPI.shareFolder(folderId, userId)
    console.log('Folder shared:', response)
  } catch (error) {
    console.error('Share failed:', error)
  }
}

// ==================== EXAMPLE VUE COMPONENT ====================

/*

<template>
  <div class="dashboard">
    <h1>My Folders</h1>
    
    <button @click="loadFolders">Load Folders</button>
    <button @click="createFolder">Create Folder</button>
    
    <ul v-if="folders.length > 0">
      <li v-for="folder in folders" :key="folder._id">
        {{ folder.name }} - {{ folder.description }}
        <button @click="deleteFolder(folder._id)">Delete</button>
        <button @click="shareFolder(folder._id)">Share</button>
      </li>
    </ul>
    
    <p v-else>No folders found</p>
  </div>
</template>

<script>
import { folderAPI, authAPI } from '@/api.js'

export default {
  data() {
    return {
      folders: []
    }
  },
  
  methods: {
    async loadFolders() {
      const data = await folderAPI.getFolders()
      this.folders = data
    },
    
    async createFolder() {
      const name = prompt('Folder name:')
      const description = prompt('Description:')
      
      if (name) {
        const response = await folderAPI.createFolder(name, description)
        this.loadFolders()
      }
    },
    
    async deleteFolder(folderId) {
      if (confirm('Delete this folder?')) {
        await folderAPI.deleteFolder(folderId)
        this.loadFolders()
      }
    },
    
    async shareFolder(folderId) {
      // Get list of users
      const users = await authAPI.getAllUsers()
      const userId = prompt('Enter user ID to share with')
      
      if (userId) {
        await folderAPI.shareFolder(folderId, userId)
        alert('Folder shared!')
      }
    }
  },
  
  mounted() {
    this.loadFolders()
  }
}
</script>

*/

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  logoutUser,
  createNewFolder,
  getUserFolders,
  getSpecificFolder,
  updateUserFolder,
  deleteUserFolder,
  shareFolderWithUser
}
