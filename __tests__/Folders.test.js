import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Folders from '../src/views/Folders.vue'
import { folderAPI } from '../src/api'

// Mock the API module
vi.mock('../src/api', () => ({
  folderAPI: {
    getFolders: vi.fn(),
    createFolder: vi.fn(),
    updateFolder: vi.fn(),
    deleteFolder: vi.fn(),
  }
}))

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('Folders.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page title and create button', () => {
    folderAPI.getFolders.mockResolvedValue({ folders: [] })
    
    const wrapper = mount(Folders)
    
    expect(wrapper.text()).toContain('My Folders')
    expect(wrapper.find('.btn-create').text()).toContain('New Folder')
  })

  it('displays empty state when no folders', async () => {
    folderAPI.getFolders.mockResolvedValue({ folders: [] })
    
    const wrapper = mount(Folders)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))
    
    expect(wrapper.text()).toContain('No folders yet')
  })

  it('displays folders from API', async () => {
    const mockFolders = [
      { _id: '1', name: 'Work', description: 'Work files', createdAt: new Date().toISOString() },
      { _id: '2', name: 'Personal', description: 'Personal files', createdAt: new Date().toISOString() }
    ]
    
    folderAPI.getFolders.mockResolvedValue({ folders: mockFolders })
    
    const wrapper = mount(Folders)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))
    
    expect(wrapper.text()).toContain('Work')
    expect(wrapper.text()).toContain('Personal')
  })

  it('opens create modal when clicking new folder button', async () => {
    folderAPI.getFolders.mockResolvedValue({ folders: [] })
    
    const wrapper = mount(Folders)
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
    
    await wrapper.find('.btn-create').trigger('click')
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
    expect(wrapper.text()).toContain('Create New Folder')
  })

  it('creates a new folder when form is submitted', async () => {
    folderAPI.getFolders.mockResolvedValue({ folders: [] })
    folderAPI.createFolder.mockResolvedValue({ 
      folder: { _id: '3', name: 'New Folder', description: 'Test' }
    })
    
    const wrapper = mount(Folders)
    await wrapper.find('.btn-create').trigger('click')
    
    const nameInput = wrapper.find('input[type="text"]')
    const descInput = wrapper.find('textarea')
    
    await nameInput.setValue('New Folder')
    await descInput.setValue('Test description')
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(folderAPI.createFolder).toHaveBeenCalledWith('New Folder', 'Test description')
  })

  it('opens edit modal with folder data', async () => {
    const mockFolders = [
      { _id: '1', name: 'Work', description: 'Work files', createdAt: new Date().toISOString() }
    ]
    
    folderAPI.getFolders.mockResolvedValue({ folders: mockFolders })
    
    const wrapper = mount(Folders)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const editBtn = wrapper.findAll('.btn-icon').find(btn => btn.attributes('title') === 'Edit')
    await editBtn.trigger('click')
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
    expect(wrapper.text()).toContain('Edit Folder')
    expect(wrapper.find('input[type="text"]').element.value).toBe('Work')
  })

  it('deletes a folder after confirmation', async () => {
    const mockFolders = [
      { _id: '1', name: 'Work', description: 'Work files', createdAt: new Date().toISOString() }
    ]
    
    folderAPI.getFolders.mockResolvedValue({ folders: mockFolders })
    folderAPI.deleteFolder.mockResolvedValue({})
    
    // Mock window.confirm
    global.confirm = vi.fn(() => true)
    
    const wrapper = mount(Folders)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const deleteBtn = wrapper.findAll('.btn-icon').find(btn => btn.attributes('title') === 'Delete')
    await deleteBtn.trigger('click')
    
    expect(global.confirm).toHaveBeenCalled()
    expect(folderAPI.deleteFolder).toHaveBeenCalledWith('1')
  })

  it('navigates to files when clicking open files button', async () => {
    const mockFolders = [
      { _id: '1', name: 'Work', description: 'Work files', createdAt: new Date().toISOString() }
    ]
    
    folderAPI.getFolders.mockResolvedValue({ folders: mockFolders })
    
    const wrapper = mount(Folders)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const filesBtn = wrapper.findAll('.btn-icon').find(btn => btn.attributes('title') === 'Open Files')
    await filesBtn.trigger('click')
    
    expect(mockPush).toHaveBeenCalledWith({ name: 'files', params: { id: '1' } })
  })

  it('validates folder name is required', async () => {
    folderAPI.getFolders.mockResolvedValue({ folders: [] })
    
    // Mock window.alert
    global.alert = vi.fn()
    
    const wrapper = mount(Folders)
    await wrapper.find('.btn-create').trigger('click')
    
    // Try to submit with empty name
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(folderAPI.createFolder).not.toHaveBeenCalled()
  })
})
