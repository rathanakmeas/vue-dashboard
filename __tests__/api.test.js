import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authAPI, folderAPI, setToken, getToken, clearToken } from '../src/api'

// Mock fetch globally
global.fetch = vi.fn()

describe('API Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    global.fetch.mockClear()
  })

  describe('Token Management', () => {
    it('sets and gets token', () => {
      setToken('test-token-123')
      expect(getToken()).toBe('test-token-123')
      expect(localStorage.getItem('token')).toBe('test-token-123')
    })

    it('clears token', () => {
      setToken('test-token')
      clearToken()
      expect(getToken()).toBe(null)
      expect(localStorage.getItem('token')).toBe(null)
    })
  })

  describe('Auth API', () => {
    it('registers a user and stores token', async () => {
      const mockResponse = {
        token: 'new-token',
        user: { id: '1', email: 'test@example.com' }
      }

      global.fetch.mockResolvedValueOnce({
        json: async () => mockResponse
      })

      const result = await authAPI.register('testuser', 'test@example.com', 'password123', 'Test', 'User')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User'
          })
        })
      )

      expect(result.token).toBe('new-token')
      expect(getToken()).toBe('new-token')
    })

    it('logs in and stores token', async () => {
      const mockResponse = {
        token: 'login-token',
        user: { id: '1', email: 'test@example.com' }
      }

      global.fetch.mockResolvedValueOnce({
        json: async () => mockResponse
      })

      const result = await authAPI.login('test@example.com', 'password123')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
          })
        })
      )

      expect(result.token).toBe('login-token')
      expect(getToken()).toBe('login-token')
    })

    it('gets user profile with auth header', async () => {
      setToken('auth-token')

      global.fetch.mockResolvedValueOnce({
        json: async () => ({ id: '1', email: 'test@example.com' })
      })

      await authAPI.getProfile()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/profile'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer auth-token'
          })
        })
      )
    })
  })

  describe('Folder API', () => {
    beforeEach(() => {
      setToken('test-token')
    })

    it('creates a folder', async () => {
      const mockFolder = { _id: '1', name: 'Test Folder', description: 'Test' }

      global.fetch.mockResolvedValueOnce({
        json: async () => ({ folder: mockFolder })
      })

      const result = await folderAPI.createFolder('Test Folder', 'Test')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/folders'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test Folder', description: 'Test' }),
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )

      expect(result.folder.name).toBe('Test Folder')
    })

    it('fetches folders with auth', async () => {
      global.fetch.mockResolvedValueOnce({
        json: async () => ({ folders: [] })
      })

      await folderAPI.getFolders()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/folders'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })
  })
})
