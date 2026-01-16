/**
 * useDocuments Composable
 * Reusable document management logic
 */

import { ref } from 'vue';
import api from '../api';
import { handleApiError, getErrorMessage } from '../utils/errorHandler';

export function useDocuments(employeeId = null) {
  const documents = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Fetch documents for an employee
  const fetchDocuments = async (id = employeeId) => {
    if (!id) {
      error.value = 'Employee ID is required';
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await api.get(`/employees/${id}/documents`);
      documents.value = response.data || [];
    } catch (err) {
      error.value = getErrorMessage(err);
      handleApiError(err, 'មិនអាចទាញយកឯកសារបានទេ', { showAlert: false });
      documents.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Add a new document
  const createDocument = async (documentData, id = employeeId) => {
    if (!id) {
      error.value = 'Employee ID is required';
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await api.post(`/employees/${id}/documents`, documentData);
      if (response.data) {
        documents.value.push(response.data);
      }
      return true;
    } catch (err) {
      error.value = getErrorMessage(err);
      handleApiError(err, 'មិនអាចបន្ថែមឯកសារបានទេ', { showAlert: false });
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Update an existing document
  const modifyDocument = async (documentId, updates, id = employeeId) => {
    if (!id || !documentId) {
      error.value = 'Employee ID and Document ID are required';
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await api.put(`/employees/${id}/documents/${documentId}`, updates);
      if (response.data) {
        const index = documents.value.findIndex(doc => doc._id === documentId);
        if (index !== -1) {
          documents.value[index] = response.data;
        }
      }
      return true;
    } catch (err) {
      error.value = getErrorMessage(err);
      handleApiError(err, 'មិនអាចកែប្រែឯកសារបានទេ', { showAlert: false });
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Delete a document
  const removeDocument = async (documentId, id = employeeId) => {
    if (!id || !documentId) {
      error.value = 'Employee ID and Document ID are required';
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      await api.delete(`/employees/${id}/documents/${documentId}`);
      documents.value = documents.value.filter(doc => doc._id !== documentId);
      return true;
    } catch (err) {
      error.value = getErrorMessage(err);
      handleApiError(err, 'មិនអាចលុបឯកសារបានទេ', { showAlert: false });
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Refresh documents
  const refresh = () => fetchDocuments(employeeId);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    createDocument,
    modifyDocument,
    removeDocument,
    refresh
  };
}
