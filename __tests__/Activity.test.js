import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Activity from '../src/views/Activity.vue';
import { activityAPI } from '../src/api';

vi.mock('../src/api', () => ({
  activityAPI: {
    getMyActivities: vi.fn(),
    getAllActivities: vi.fn(),
  },
}));

describe('Activity.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title and filter', () => {
    activityAPI.getMyActivities.mockResolvedValue({ activities: [], pagination: { total: 0 } });

    const wrapper = mount(Activity);

    expect(wrapper.text()).toContain('Activity Log');
    expect(wrapper.find('.filter-select').exists()).toBe(true);
  });

  it('displays empty state when no activities', async () => {
    activityAPI.getMyActivities.mockResolvedValue({ activities: [], pagination: { total: 0 } });

    const wrapper = mount(Activity);
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(wrapper.text()).toContain('No activities found');
  });

  it('displays activities from API', async () => {
    const mockActivities = [
      {
        _id: '1',
        action: 'FOLDER_CREATE',
        resourceType: 'FOLDER',
        metadata: { name: 'Test Folder' },
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        action: 'FILE_UPLOAD',
        resourceType: 'FILE',
        metadata: { name: 'test.pdf' },
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
      },
    ];

    activityAPI.getMyActivities.mockResolvedValue({
      activities: mockActivities,
      pagination: { total: 2, limit: 20, skip: 0 },
    });

    const wrapper = mount(Activity);
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(wrapper.text()).toContain('Folder Create');
    expect(wrapper.text()).toContain('File Upload');
    expect(wrapper.text()).toContain('Test Folder');
    expect(wrapper.text()).toContain('test.pdf');
  });

  it('formats action names correctly', async () => {
    const mockActivities = [
      {
        _id: '1',
        action: 'FOLDER_CREATE',
        resourceType: 'FOLDER',
        metadata: { name: 'Test' },
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        action: 'FILE_UPLOAD',
        resourceType: 'FILE',
        metadata: { name: 'file.pdf' },
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
      },
    ];

    activityAPI.getMyActivities.mockResolvedValue({
      activities: mockActivities,
      pagination: { total: 2, limit: 20, skip: 0 },
    });

    const wrapper = mount(Activity);
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(wrapper.text()).toContain('Folder Create');
    expect(wrapper.text()).toContain('File Upload');
  });

  it('shows correct icons for actions', async () => {
    const mockActivities = [
      {
        _id: '1',
        action: 'LOGIN',
        resourceType: 'USER',
        metadata: { email: 'test@example.com' },
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        action: 'FILE_UPLOAD',
        resourceType: 'FILE',
        metadata: { name: 'file.pdf' },
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
      },
    ];

    activityAPI.getMyActivities.mockResolvedValue({
      activities: mockActivities,
      pagination: { total: 2, limit: 20, skip: 0 },
    });

    const wrapper = mount(Activity);
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(wrapper.text()).toContain('🔓');
    expect(wrapper.text()).toContain('📤');
  });

  it('formats dates correctly', async () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now - 5 * 60000);

    const mockActivities = [
      {
        _id: '1',
        action: 'LOGIN',
        resourceType: 'USER',
        metadata: { email: 'test@example.com' },
        status: 'SUCCESS',
        createdAt: fiveMinutesAgo.toISOString(),
      },
    ];

    activityAPI.getMyActivities.mockResolvedValue({
      activities: mockActivities,
      pagination: { total: 1, limit: 20, skip: 0 },
    });

    const wrapper = mount(Activity);
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(wrapper.text()).toContain('minute');
  });

  it('handles pagination', async () => {
    const mockActivities = Array.from({ length: 20 }, (_, i) => ({
      _id: `${i}`,
      action: 'FOLDER_CREATE',
      resourceType: 'FOLDER',
      metadata: { name: `Folder ${i}` },
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    }));

    activityAPI.getMyActivities.mockResolvedValue({
      activities: mockActivities,
      pagination: { total: 100, limit: 20, skip: 0 },
    });

    const wrapper = mount(Activity);
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(wrapper.text()).toContain('Page 1 of 5');

    const nextBtn = wrapper.findAll('.btn-pagination')[1];
    await nextBtn.trigger('click');

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(wrapper.vm.currentPage).toBe(2);
  });

  it('filters activities by action type', async () => {
    activityAPI.getMyActivities.mockResolvedValue({
      activities: [],
      pagination: { total: 0 },
    });
    activityAPI.getAllActivities.mockResolvedValue({
      activities: [],
      pagination: { total: 0 },
    });

    const wrapper = mount(Activity);
    await wrapper.vm.$nextTick();

    const select = wrapper.find('.filter-select');
    await select.setValue('FOLDER_CREATE');

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(activityAPI.getAllActivities).toHaveBeenCalledWith(20, 0, 'FOLDER_CREATE');
  });
});
