<template>
  <div class="form-grid">
    <div class="form-field">
      <label>លេខកូដឯកសារ <span class="required">*</span></label>
      <input 
        v-model="formData.documentCode" 
        type="text" 
        placeholder="លេខកូដឯកសារ"
        :class="{ 'error': errors.documentCode }"
      />
      <span v-if="errors.documentCode" class="error-message">{{ errors.documentCode }}</span>
    </div>

    <div class="form-field">
      <label>ឈ្មោះឯកសារ <span class="required">*</span></label>
      <input 
        v-model="formData.documentName" 
        type="text" 
        placeholder="ឈ្មោះឯកសារ"
        :class="{ 'error': errors.documentName }"
      />
      <span v-if="errors.documentName" class="error-message">{{ errors.documentName }}</span>
    </div>

    <div class="form-field">
      <label>ប្រភេទឯកសារ <span class="required">*</span></label>
      <select 
        v-model="formData.documentType"
        :class="{ 'error': errors.documentType }"
      >
        <option value="" disabled>ជ្រើសរើស</option>
        <option value="គ្រឿងបញ្ជាក់">គ្រឿងបញ្ជាក់</option>
        <option value="វិញ្ញាបនប័ត្រ">វិញ្ញាបនប័ត្រ</option>
        <option value="សំបុត្រកំណើត">សំបុត្រកំណើត</option>
        <option value="លិខិតឆ្លងដែន">លិខិតឆ្លងដែន</option>
        <option value="អត្តសញ្ញាណប័ណ្ណ">អត្តសញ្ញាណប័ណ្ណ</option>
        <option value="ផ្សេងៗ">ផ្សេងៗ</option>
      </select>
      <span v-if="errors.documentType" class="error-message">{{ errors.documentType }}</span>
    </div>

    <div class="form-field">
      <label>ប្រភេទ</label>
      <select v-model="formData.category">
        <option value="" disabled>ជ្រើសរើស</option>
        <option v-for="cat in DOCUMENT_CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>

    <div class="form-field">
      <label>កាលបរិច្ឆេទចេញផ្សាយ</label>
      <input 
        v-model="formData.issueDate" 
        type="date"
      />
    </div>

    <div class="form-field">
      <label>កាលបរិច្ឆេទផុតកំណត់</label>
      <input 
        v-model="formData.expiryDate" 
        type="date"
      />
    </div>

    <div class="form-field full-width">
      <label>កំណត់សម្គាល់</label>
      <textarea 
        v-model="formData.remarks" 
        placeholder="កំណត់សម្គាល់" 
        rows="3"
      ></textarea>
    </div>

    <div class="form-field full-width">
      <label>ឯកសារភ្ជាប់ <span class="required">*</span></label>
      <input 
        type="file" 
        @change="handleFileUpload" 
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        :class="{ 'error': errors.fileAttachment }"
      />
      <span v-if="errors.fileAttachment" class="error-message">{{ errors.fileAttachment }}</span>
      <small v-if="formData.fileAttachment" style="color: #059669; margin-top: 0.5rem; display: block;">
        <i class="pi pi-check-circle"></i> {{ formData.fileAttachment }}
      </small>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { DOCUMENT_CATEGORIES } from '../constants/dropdown-options';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue']);

// Validation schema
const schema = yup.object({
  documentCode: yup.string().required('សូមបំពេញលេខកូដឯកសារ'),
  documentName: yup.string().required('សូមបំពេញឈ្មោះឯកសារ'),
  documentType: yup.string().required('សូមជ្រើសរើសប្រភេទឯកសារ'),
  fileAttachment: yup.string().required('សូមភ្ជាប់ឯកសារ')
});

const { errors, validate } = useForm({
  validationSchema: schema
});

const formData = ref({
  documentCode: '',
  documentName: '',
  documentType: '',
  category: '',
  issueDate: '',
  expiryDate: '',
  remarks: '',
  fileAttachment: '',
  ...props.modelValue
});

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  formData.value = { ...formData.value, ...newValue };
}, { deep: true });

// Emit changes
watch(formData, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    formData.value.fileAttachment = file.name;
  }
};

// Expose validate method
defineExpose({
  validate
});
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background: white;
  padding: 0.875rem;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.8125rem;
  letter-spacing: -0.01em;
  font-family: 'Khmer OS Siemreap', sans-serif;
}

.required {
  color: #dc2626;
}

.form-field input,
.form-field textarea,
.form-field select {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: 'Khmer OS Siemreap', 'Segoe UI', sans-serif;
  transition: all 0.2s;
}

.form-field input:focus,
.form-field textarea:focus,
.form-field select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-field input.error,
.form-field textarea.error,
.form-field select.error {
  border-color: #dc2626;
}

.error-message {
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  font-family: 'Khmer OS Siemreap', sans-serif;
}
</style>
