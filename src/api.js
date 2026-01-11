import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let token = localStorage.getItem('token');

export const setToken = (newToken) => {
  token = newToken;
  localStorage.setItem('token', newToken);
};

export const getToken = () => {
  return token || localStorage.getItem('token');
};

export const clearToken = () => {
  token = null;
  localStorage.removeItem('token');
};

const getHeaders = (isFormData = false) => {
  const headers = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  const authToken = getToken();
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

// Create axios instance for modern API calls
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const authToken = getToken();
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API calls
export const authAPI = {
  register: async (username, email, password, firstName, lastName) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, email, password, firstName, lastName })
    });
    const data = await response.json();
    if (data.token) setToken(data.token);
    return data;
  },

  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.token) setToken(data.token);
    return data;
  },

  logout: () => {
    clearToken();
  },

  getProfile: async () => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: getHeaders()
    });
    return await response.json();
  },

  updateProfile: async (firstName, lastName, profilePicture) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ firstName, lastName, profilePicture })
    });
    return await response.json();
  },

  getAllUsers: async () => {
    const response = await fetch(`${API_URL}/auth/users`, {
      headers: getHeaders()
    });
    return await response.json();
  }
};

// Folder API calls
export const folderAPI = {
  createFolder: async (name, description) => {
    const response = await fetch(`${API_URL}/folders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, description })
    });
    return await response.json();
  },

  getFolders: async (params = {}) => {
    const url = new URL(`${API_URL}/folders`);
    const allowedParams = ['page', 'pageSize', 'sharedOnly', 'ownedOnly', 'search'];
    allowedParams.forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url.toString(), {
      headers: getHeaders()
    });
    return await response.json();
  },

  getFolder: async (id) => {
    const response = await fetch(`${API_URL}/folders/${id}`, {
      headers: getHeaders()
    });
    return await response.json();
  },

  updateFolder: async (id, name, description) => {
    const response = await fetch(`${API_URL}/folders/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name, description })
    });
    return await response.json();
  },

  deleteFolder: async (id) => {
    const response = await fetch(`${API_URL}/folders/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await response.json();
  },

  shareFolder: async (folderId, userId) => {
    const response = await fetch(`${API_URL}/folders/${folderId}/share`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    return await response.json();
  },

  unshareFolder: async (folderId, userId) => {
    const response = await fetch(`${API_URL}/folders/${folderId}/unshare`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    return await response.json();
  }
};

// Files API
export const fileAPI = {
  uploadFile: async (folderId, fileOrData) => {
    if (!fileOrData) throw new Error('No file provided');

    // If a File object is provided, send multipart/form-data
    if (typeof File !== 'undefined' && fileOrData instanceof File) {
      const formData = new FormData();
      formData.append('file', fileOrData);

      const response = await fetch(`${API_URL}/files/${folderId}/upload`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return await response.json();
    }

    // Otherwise send JSON payload (e.g., add by link)
    const { name, fileUrl, fileSize = 0, fileType = '' } = fileOrData;
    if (!name || !fileUrl) throw new Error('File name and URL are required');

    const response = await fetch(`${API_URL}/files/${folderId}/upload`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ name, fileUrl, fileSize, fileType })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }
    
    return await response.json();
  },

  getFiles: async (folderId) => {
    const response = await fetch(`${API_URL}/files/${folderId}/files`, {
      headers: getHeaders()
    });
    return await response.json();
  },

  deleteFile: async (fileId) => {
    const response = await fetch(`${API_URL}/files/${fileId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await response.json();
  },

  getFile: async (fileId) => {
    const response = await fetch(`${API_URL}/files/${fileId}`, {
      headers: getHeaders()
    });
    return await response.json();
  },

  updateFile: async (fileId, name) => {
    const response = await fetch(`${API_URL}/files/${fileId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name })
    });
    return await response.json();
  },

  archiveFile: async (fileId) => {
    const response = await fetch(`${API_URL}/files/${fileId}/archive`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return await response.json();
  },

  restoreFile: async (fileId) => {
    const response = await fetch(`${API_URL}/files/${fileId}/restore`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return await response.json();
  },

  getArchivedFiles: async () => {
    const response = await fetch(`${API_URL}/files/archived/all`, {
      headers: getHeaders()
    });
    return await response.json();
  }
};

// Stats API
export const statsAPI = {
  getStats: async () => {
    const response = await fetch(`${API_URL}/stats`, {
      headers: getHeaders()
    });
    return await response.json();
  }
};

// Activity API
export const activityAPI = {
  getMyActivities: async (limit = 50, skip = 0) => {
    const response = await fetch(`${API_URL}/activity/my-activities?limit=${limit}&skip=${skip}`, {
      headers: getHeaders()
    });
    return await response.json();
  },

  getAllActivities: async (limit = 100, skip = 0, action = null) => {
    const url = new URL(`${API_URL}/activity/all`);
    url.searchParams.append('limit', limit);
    url.searchParams.append('skip', skip);
    if (action) url.searchParams.append('action', action);
    
    const response = await fetch(url.toString(), {
      headers: getHeaders()
    });
    return await response.json();
  },

  getActivityStats: async () => {
    const response = await fetch(`${API_URL}/activity/stats`, {
      headers: getHeaders()
    });
    return await response.json();
  }
};

// Health check
export const checkBackend = async () => {
  try {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Departments API
export const departmentAPI = {
  getDepartments: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.pageSize) query.append('pageSize', params.pageSize);
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.status) query.append('status', params.status);
    if (params.tree) query.append('tree', params.tree);
    
    const url = query.toString() ? `${API_URL}/departments?${query}` : `${API_URL}/departments`;
    const response = await fetch(url, {
      headers: getHeaders()
    });
    return await response.json();
  },

  getDepartment: async (code) => {
    const response = await fetch(`${API_URL}/departments/${code}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch department');
    return await response.json();
  },

  createDepartment: async (data) => {
    const response = await fetch(`${API_URL}/departments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create department');
    }
    return await response.json();
  },

  updateDepartment: async (code, data) => {
    const response = await fetch(`${API_URL}/departments/${code}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update department');
    }
    return await response.json();
  },

  deleteDepartment: async (code) => {
    const response = await fetch(`${API_URL}/departments/${code}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete department');
    }
    return await response.json();
  },

  getStats: async () => {
    const response = await fetch(`${API_URL}/departments/stats`, {
      headers: getHeaders()
    });
    return await response.json();
  },

  initializeDepartments: async () => {
    const response = await fetch(`${API_URL}/departments/initialize`, {
      method: 'POST',
      headers: getHeaders()
    });
    return await response.json();
  },

  // Analytics & Reports
  getAnalytics: async () => {
    const response = await fetch(`${API_URL}/departments/analytics`, {
      headers: getHeaders()
    });
    return await response.json();
  },

  exportExcel: async () => {
    const response = await fetch(`${API_URL}/departments/export/excel`, {
      headers: getHeaders()
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'departments.xlsx';
    a.click();
  },

  importExcel: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_URL}/departments/import/excel`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return await response.json();
  },

  // Bulk Operations
  bulkUpdate: async (codes, updates) => {
    const response = await fetch(`${API_URL}/departments/bulk/update`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ codes, updates })
    });
    return await response.json();
  },

  bulkDelete: async (codes) => {
    const response = await fetch(`${API_URL}/departments/bulk/delete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ codes })
    });
    return await response.json();
  },

  reorderDepartments: async (orders) => {
    const response = await fetch(`${API_URL}/departments/reorder`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ orders })
    });
    return await response.json();
  },

  // Saved Searches
  getSavedSearches: async () => {
    const response = await fetch(`${API_URL}/departments/searches`, {
      headers: getHeaders()
    });
    return await response.json();
  },

  saveSearch: async (name, criteria) => {
    const response = await fetch(`${API_URL}/departments/searches`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, criteria })
    });
    return await response.json();
  },

  deleteSavedSearch: async (id) => {
    const response = await fetch(`${API_URL}/departments/searches/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await response.json();
  },

  // Staff Assignment
  getDepartmentStaff: async (code) => {
    const response = await fetch(`${API_URL}/departments/${code}/staff`, {
      headers: getHeaders()
    });
    return await response.json();
  },

  assignStaff: async (data) => {
    const response = await fetch(`${API_URL}/departments/staff/assign`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return await response.json();
  },

  transferStaff: async (data) => {
    const response = await fetch(`${API_URL}/departments/staff/transfer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return await response.json();
  },

  removeStaff: async (id) => {
    const response = await fetch(`${API_URL}/departments/staff/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await response.json();
  },

  getUserDepartments: async (userId) => {
    const response = await fetch(`${API_URL}/departments/user/${userId}/departments`, {
      headers: getHeaders()
    });
    return await response.json();
  },

  // Budget Management
  getDepartmentBudget: async (code, params = {}) => {
    const query = new URLSearchParams(params);
    const url = `${API_URL}/departments/${code}/budget?${query}`;
    const response = await fetch(url, {
      headers: getHeaders()
    });
    return await response.json();
  },

  createBudgetTransaction: async (data) => {
    const response = await fetch(`${API_URL}/departments/budget/transaction`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return await response.json();
  },

  approveBudgetTransaction: async (id, status) => {
    const response = await fetch(`${API_URL}/departments/budget/transaction/${id}/approve`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return await response.json();
  },

  getBudgetAnalytics: async (params = {}) => {
    const query = new URLSearchParams(params);
    const url = `${API_URL}/departments/budget/analytics?${query}`;
    const response = await fetch(url, {
      headers: getHeaders()
    });
    return await response.json();
  },

  exportBudgetReport: async (code, params = {}) => {
    const query = new URLSearchParams(params);
    const response = await fetch(`${API_URL}/departments/${code}/budget/export?${query}`, {
      headers: getHeaders()
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-${code}.xlsx`;
    a.click();
  }
};
