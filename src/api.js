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

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  const authToken = getToken();
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

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

  getFolders: async () => {
    const response = await fetch(`${API_URL}/folders`, {
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
  }
};

// Files API
export const fileAPI = {
  uploadFile: async (folderId, fileName, fileSize, mimeType) => {
    const response = await fetch(`${API_URL}/files/${folderId}/upload`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ fileName, fileSize, mimeType })
    });
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
