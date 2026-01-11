import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Files from '../src/views/Files.vue';
import { fileAPI, folderAPI } from '../src/api';

vi.mock('../src/api', () => ({
  fileAPI: {
    getFiles: vi.fn(),
    uploadFile: vi.fn(),
    deleteFile: vi.fn(),
  },
  folderAPI: {
    getFolder: vi.fn(),
  },
}));

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: 'folder123' },
  }),
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Files.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title and upload button', async () => {
    fileAPI.getFiles.mockResolvedValue({ files: [] });
    folderAPI.getFolder.mockResolvedValue({ name: 'My Folder' });

    const wrapper = mount(Files);
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(wrapper.text()).toContain('My Folder');
    expect(wrapper.find('.btn-upload').text()).toContain('Upload File');
  });

  it('displays empty state when no files', async () => {
    fileAPI.getFiles.mockResolvedValue({ files: [] });
    folderAPI.getFolder.mockResolvedValue({ name: 'Empty Folder' });

    const wrapper = mount(Files);
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(wrapper.text()).toContain('No files in this folder yet');
  });

  it('displays files from API', async () => {
    const mockFiles = [
      {
        _id: '1',
        name: 'document.pdf',
        fileSize: 1024,
        fileType: 'application/pdf',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        name: 'image.jpg',
        fileSize: 2048,
        fileType: 'image/jpeg',
        createdAt: new Date().toISOString(),
      },
    ];

    fileAPI.getFiles.mockResolvedValue({ files: mockFiles });
    folderAPI.getFolder.mockResolvedValue({ name: 'Documents' });

    const wrapper = mount(Files);
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(wrapper.text()).toContain('document.pdf');
    expect(wrapper.text()).toContain('image.jpg');
  });

  it('opens upload modal when clicking upload button', async () => {
    fileAPI.getFiles.mockResolvedValue({ files: [] });
    folderAPI.getFolder.mockResolvedValue({ name: 'Folder' });

    const wrapper = mount(Files);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.modal-overlay').exists()).toBe(false);

    await wrapper.find('.btn-upload').trigger('click');

    expect(wrapper.find('.modal-overlay').exists()).toBe(true);
    expect(wrapper.text()).toContain('Upload File');
  });

  it('deletes a file after confirmation', async () => {
    const mockFiles = [
      {
        _id: '1',
        name: 'delete-me.txt',
        fileSize: 512,
        fileType: 'text/plain',
        createdAt: new Date().toISOString(),
      },
    ];

    fileAPI.getFiles.mockResolvedValue({ files: mockFiles });
    folderAPI.getFolder.mockResolvedValue({ name: 'Folder' });
    fileAPI.deleteFile.mockResolvedValue({});

    global.confirm = vi.fn(() => true);

    const wrapper = mount(Files);
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 10));

    const deleteBtn = wrapper.findAll('.btn-action.btn-danger')[0];
    await deleteBtn.trigger('click');

    expect(global.confirm).toHaveBeenCalled();
    expect(fileAPI.deleteFile).toHaveBeenCalledWith('1');
  });

  it('formats file size correctly', async () => {
    fileAPI.getFiles.mockResolvedValue({ files: [] });
    folderAPI.getFolder.mockResolvedValue({ name: 'Folder' });

    const wrapper = mount(Files);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.formatFileSize(0)).toBe('0 Bytes');
    expect(wrapper.vm.formatFileSize(1024)).toBe('1 KB');
    expect(wrapper.vm.formatFileSize(1048576)).toBe('1 MB');
  });

  it('gets correct file icon for different types', async () => {
    fileAPI.getFiles.mockResolvedValue({ files: [] });
    folderAPI.getFolder.mockResolvedValue({ name: 'Folder' });

    const wrapper = mount(Files);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.getFileIcon('application/pdf')).toBe('📄');
    expect(wrapper.vm.getFileIcon('image/png')).toBe('🖼️');
    expect(wrapper.vm.getFileIcon('video/mp4')).toBe('🎥');
    expect(wrapper.vm.getFileIcon('audio/mp3')).toBe('🎵');
  });
});
