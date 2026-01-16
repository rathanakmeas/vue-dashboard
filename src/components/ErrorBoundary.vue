<template>
  <div v-if="error" class="error-boundary">
    <div class="error-container">
      <div class="error-icon">
        <i class="pi pi-exclamation-triangle"></i>
      </div>
      
      <h2 class="error-title">{{ errorTitle }}</h2>
      <p class="error-message">{{ errorMessage }}</p>
      
      <div class="error-details" v-if="showDetails && errorDetails">
        <button @click="toggleDetails" class="details-toggle">
          <i :class="detailsExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
          {{ detailsExpanded ? 'លាក់ព័ត៌មានលម្អិត' : 'បង្ហាញព័ត៌មានលម្អិត' }}
        </button>
        
        <div v-if="detailsExpanded" class="details-content">
          <pre>{{ errorDetails }}</pre>
        </div>
      </div>
      
      <div class="error-actions">
        <button @click="handleRetry" class="btn-retry">
          <i class="pi pi-refresh"></i>
          ព្យាយាមម្តងទៀត
        </button>
        
        <button @click="handleGoBack" class="btn-back">
          <i class="pi pi-arrow-left"></i>
          ត្រឡប់ក្រោយ
        </button>
        
        <button v-if="showReportButton" @click="handleReport" class="btn-report">
          <i class="pi pi-flag"></i>
          រាយការណ៍បញ្ហា
        </button>
      </div>
    </div>
  </div>
  
  <slot v-else></slot>
</template>

<script setup>
import { ref, computed, onErrorCaptured } from 'vue';
import { useRouter } from 'vue-router';
import { logError, getErrorMessage, getErrorType } from '../utils/errorHandler';

const props = defineProps({
  fallbackTitle: {
    type: String,
    default: 'មានបញ្ហាកើតឡើង'
  },
  fallbackMessage: {
    type: String,
    default: 'សូមអភ័យទោស មានបញ្ហាមិនរំពឹងទុកកើតឡើង។ សូមព្យាយាមម្តងទៀត។'
  },
  showDetails: {
    type: Boolean,
    default: true
  },
  showReportButton: {
    type: Boolean,
    default: false
  },
  onRetry: {
    type: Function,
    default: null
  },
  onError: {
    type: Function,
    default: null
  }
});

const emit = defineEmits(['error', 'retry']);

const router = useRouter();
const error = ref(null);
const detailsExpanded = ref(false);

const errorTitle = computed(() => {
  if (!error.value) return props.fallbackTitle;
  
  const errorType = getErrorType(error.value);
  
  const titles = {
    network: 'បញ្ហាការតភ្ជាប់',
    authentication: 'សូមចូលប្រើប្រាស់ម្តងទៀត',
    authorization: 'មិនមានសិទ្ធិចូលប្រើ',
    validation: 'ទិន្នន័យមិនត្រឹមត្រូវ',
    not_found: 'រកមិនឃើញ',
    server: 'បញ្ហាម៉ាស៊ីនមេ',
    timeout: 'អស់ពេលរង់ចាំ',
    unknown: props.fallbackTitle
  };
  
  return titles[errorType] || props.fallbackTitle;
});

const errorMessage = computed(() => {
  if (!error.value) return props.fallbackMessage;
  return getErrorMessage(error.value) || props.fallbackMessage;
});

const errorDetails = computed(() => {
  if (!error.value) return null;
  
  return {
    message: error.value.message,
    stack: error.value.stack,
    response: error.value.response?.data,
    timestamp: new Date().toISOString()
  };
});

const toggleDetails = () => {
  detailsExpanded.value = !detailsExpanded.value;
};

const handleRetry = () => {
  error.value = null;
  detailsExpanded.value = false;
  
  if (props.onRetry) {
    props.onRetry();
  }
  
  emit('retry');
};

const handleGoBack = () => {
  router.back();
};

const handleReport = () => {
  const reportData = {
    error: errorDetails.value,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.log('Error Report:', reportData);
  alert('របាយការណ៍ត្រូវបានផ្ញើរួចរាល់');
};

// Capture errors from child components
onErrorCaptured((err, instance, info) => {
  error.value = err;
  
  // Log error
  logError(err, `Component Error: ${info}`);
  
  // Call custom error handler
  if (props.onError) {
    props.onError(err, instance, info);
  }
  
  emit('error', { error: err, instance, info });
  
  // Prevent error propagation
  return false;
});
</script>

<style scoped>
.error-boundary {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #f8fafc;
}

.error-container {
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.error-icon {
  margin-bottom: 1.5rem;
}

.error-icon i {
  font-size: 4rem;
  color: #f59e0b;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.error-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-details {
  margin-bottom: 2rem;
}

.details-toggle {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #6b7280;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.details-toggle:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.details-toggle i {
  font-size: 0.75rem;
}

.details-content {
  margin-top: 1rem;
  padding: 1rem;
  background: #1f2937;
  border-radius: 8px;
  text-align: left;
  max-height: 300px;
  overflow-y: auto;
}

.details-content pre {
  color: #f3f4f6;
  font-size: 0.75rem;
  font-family: 'Monaco', 'Courier New', monospace;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.error-actions button {
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  font-size: 1rem;
}

.btn-retry {
  background: #6366f1;
  color: white;
}

.btn-retry:hover {
  background: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
}

.btn-back {
  background: white;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.btn-back:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-report {
  background: #f59e0b;
  color: white;
}

.btn-report:hover {
  background: #d97706;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
}

.error-actions button i {
  font-size: 1rem;
}
</style>
