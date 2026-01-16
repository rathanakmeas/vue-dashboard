/**
 * useEmployee Composable
 * Reusable employee data fetching and management logic
 */

import { ref, computed } from 'vue';
import api from '../api';

export function useEmployee(employeeId = null) {
  const employee = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Computed properties
  const fullName = computed(() => {
    if (!employee.value) return '';
    return employee.value.khmerName || 
      `${employee.value.firstName} ${employee.value.lastName}`;
  });

  const fullNameLatin = computed(() => {
    if (!employee.value) return '';
    const first = (employee.value.firstNameLatin || employee.value.firstName || '').toUpperCase();
    const last = (employee.value.lastNameLatin || employee.value.lastName || '').toUpperCase();
    return `${first} ${last}`.trim();
  });

  const displayGender = computed(() => {
    if (!employee.value) return '';
    return employee.value.gender === 'Female' ? 'ស្រី' : 'ប្រុស';
  });

  // Fetch employee data
  const fetchEmployee = async (id = employeeId) => {
    if (!id) {
      error.value = 'Employee ID is required';
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await api.get(`/employees/${id}`);
      employee.value = response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch employee';
      console.error('Error fetching employee:', err);
    } finally {
      loading.value = false;
    }
  };

  // Update employee data
  const updateEmployee = async (updates, id = employeeId) => {
    if (!id) {
      error.value = 'Employee ID is required';
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await api.put(`/employees/${id}`, updates);
      employee.value = response.data;
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update employee';
      console.error('Error updating employee:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Refresh employee data
  const refresh = () => fetchEmployee(employeeId);

  return {
    employee,
    loading,
    error,
    fullName,
    fullNameLatin,
    displayGender,
    fetchEmployee,
    updateEmployee,
    refresh
  };
}
