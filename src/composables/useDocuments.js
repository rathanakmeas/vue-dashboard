/**
 * useDocuments Composable
 * Reusable document management logic
 */

import { ref } from 'vue';
import { getDocuments, addDocument, updateDocument, deleteDocument } from '../api';

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
      const response = await getDocuments(id);
      documents.value = response.data || [];
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch documents';
      console.error('Error fetching documents:', err);
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
      const response = await addDocument(id, documentData);
      if (response.data) {
        documents.value.push(response.data);
      }
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to add document';
      console.error('Error adding document:', err);
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
      const response = await updateDocument(id, documentId, updates);
      if (response.data) {
        const index = documents.value.findIndex(doc => doc._id === documentId);
        if (index !== -1) {
          documents.value[index] = response.data;
        }
      }
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update document';
      console.error('Error updating document:', err);
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
      await deleteDocument(id, documentId);
      documents.value = documents.value.filter(doc => doc._id !== documentId);
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete document';
      console.error('Error deleting document:', err);
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
