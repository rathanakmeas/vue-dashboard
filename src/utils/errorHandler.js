/**
 * Error Handler Utility
 * Centralized error handling with Khmer translations
 */

// Error type constants
export const ERROR_TYPES = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  SERVER: 'server',
  NOT_FOUND: 'not_found',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown'
};

// Khmer error messages
const ERROR_MESSAGES_KH = {
  // Network errors
  'Network Error': 'មានបញ្ហាក្នុងការតភ្ជាប់បណ្តាញ',
  'ERR_NETWORK': 'មិនអាចតភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេបានទេ',
  'ERR_CONNECTION_REFUSED': 'ការតភ្ជាប់ត្រូវបានបដិសេធ',
  'ERR_TIMEOUT': 'អស់ពេលក្នុងការរង់ចាំ',
  
  // Authentication errors
  'Unauthorized': 'សូមចូលប្រើប្រាស់ម្តងទៀត',
  'Invalid token': 'សម័យចូលប្រើប្រាស់បានផុតកំណត់',
  'Token expired': 'សម័យចូលប្រើប្រាស់បានផុតកំណត់',
  'Authentication failed': 'ការផ្ទៀងផ្ទាត់មិនបានជោគជ័យ',
  
  // Authorization errors
  'Forbidden': 'អ្នកមិនមានសិទ្ធិចូលប្រើមុខងារនេះទេ',
  'Access denied': 'ការចូលប្រើត្រូវបានបដិសេធ',
  
  // Validation errors
  'Validation error': 'ទិន្នន័យមិនត្រឹមត្រូវ',
  'Required field': 'ចាំបាច់បំពេញ',
  'Invalid format': 'ទម្រង់មិនត្រឹមត្រូវ',
  
  // Server errors
  'Internal server error': 'មានបញ្ហាកើតឡើងនៅម៉ាស៊ីនមេ',
  'Service unavailable': 'សេវាកម្មមិនអាចប្រើបានទេ',
  'Bad gateway': 'មានបញ្ហាក្នុងការតភ្ជាប់',
  
  // CRUD errors
  'Not found': 'រកមិនឃើញទិន្នន័យ',
  'Already exists': 'ទិន្នន័យមានរួចហើយ',
  'Failed to create': 'មិនអាចបង្កើតបានទេ',
  'Failed to update': 'មិនអាចកែប្រែបានទេ',
  'Failed to delete': 'មិនអាចលុបបានទេ',
  'Failed to fetch': 'មិនអាចទាញយកទិន្នន័យបានទេ',
  
  // Default
  'Unknown error': 'មានបញ្ហាមិនរំពឹងទុក'
};

/**
 * Determine error type from error object
 */
export function getErrorType(error) {
  if (!error) return ERROR_TYPES.UNKNOWN;
  
  // Network errors
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return ERROR_TYPES.NETWORK;
  }
  
  if (error.code === 'ECONNABORTED' || error.code === 'ERR_TIMEOUT') {
    return ERROR_TYPES.TIMEOUT;
  }
  
  // HTTP status code errors
  const status = error.response?.status;
  
  if (status === 401) return ERROR_TYPES.AUTHENTICATION;
  if (status === 403) return ERROR_TYPES.AUTHORIZATION;
  if (status === 404) return ERROR_TYPES.NOT_FOUND;
  if (status === 422) return ERROR_TYPES.VALIDATION;
  if (status >= 500) return ERROR_TYPES.SERVER;
  
  return ERROR_TYPES.UNKNOWN;
}

/**
 * Extract error message from various error formats
 */
export function getErrorMessage(error) {
  if (!error) return ERROR_MESSAGES_KH['Unknown error'];
  
  // String error
  if (typeof error === 'string') {
    return ERROR_MESSAGES_KH[error] || error;
  }
  
  // API error response
  if (error.response?.data) {
    const data = error.response.data;
    
    // Structured error response
    if (data.message) {
      return ERROR_MESSAGES_KH[data.message] || data.message;
    }
    
    // Validation errors array
    if (Array.isArray(data.errors)) {
      return data.errors.map(err => 
        ERROR_MESSAGES_KH[err.message] || err.message
      ).join(', ');
    }
    
    // Single error object
    if (data.error) {
      return ERROR_MESSAGES_KH[data.error] || data.error;
    }
  }
  
  // Axios error with message
  if (error.message) {
    return ERROR_MESSAGES_KH[error.message] || error.message;
  }
  
  return ERROR_MESSAGES_KH['Unknown error'];
}

/**
 * Format error for display with Khmer message
 */
export function formatError(error, context = '') {
  const type = getErrorType(error);
  const message = getErrorMessage(error);
  
  return {
    type,
    message,
    context,
    timestamp: new Date().toISOString(),
    details: error.response?.data || error
  };
}

/**
 * Log error to console with structured format
 */
export function logError(error, context = '') {
  const formatted = formatError(error, context);
  
  console.group(`❌ Error: ${context || formatted.type}`);
  console.error('Message:', formatted.message);
  console.error('Type:', formatted.type);
  console.error('Timestamp:', formatted.timestamp);
  if (formatted.details) {
    console.error('Details:', formatted.details);
  }
  console.groupEnd();
  
  return formatted;
}

/**
 * Handle API errors with logging and user-friendly message
 */
export function handleApiError(error, context = '', options = {}) {
  const {
    showAlert = true,
    logToConsole = true,
    customMessage = null
  } = options;
  
  // Log error
  const formatted = logToConsole ? logError(error, context) : formatError(error, context);
  
  // Get user-friendly message
  const userMessage = customMessage || formatted.message;
  
  // Show alert if needed
  if (showAlert && typeof alert !== 'undefined') {
    alert(userMessage);
  }
  
  return formatted;
}

/**
 * Create error handler for specific context
 */
export function createErrorHandler(context, options = {}) {
  return (error) => handleApiError(error, context, options);
}

/**
 * Retry helper for failed requests
 */
export async function retryRequest(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isLastRetry = i === retries - 1;
      
      if (isLastRetry) {
        throw error;
      }
      
      // Only retry on network errors
      const errorType = getErrorType(error);
      if (errorType !== ERROR_TYPES.NETWORK && errorType !== ERROR_TYPES.TIMEOUT) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
}

/**
 * Safe async wrapper with error handling
 */
export async function safeAsync(fn, errorHandler = null) {
  try {
    return await fn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      logError(error);
    }
    throw error;
  }
}

export default {
  ERROR_TYPES,
  getErrorType,
  getErrorMessage,
  formatError,
  logError,
  handleApiError,
  createErrorHandler,
  retryRequest,
  safeAsync
};
