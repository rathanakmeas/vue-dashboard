<template>
  <div class="form-grid">
    <div class="form-field">
      <label>លេខលិខិតយោង <span class="required">*</span></label>
      <input 
        v-model="formData.referenceLetterNo" 
        type="text" 
        placeholder="លេខលិខិតយោង"
        :class="{ 'error': errors.referenceLetterNo }"
      />
      <span v-if="errors.referenceLetterNo" class="error-message">{{ errors.referenceLetterNo }}</span>
    </div>

    <div class="form-field">
      <label>កាលបរិច្ឆេទ <span class="required">*</span></label>
      <input 
        v-model="formData.date" 
        type="date"
        :class="{ 'error': errors.date }"
      />
      <span v-if="errors.date" class="error-message">{{ errors.date }}</span>
    </div>

    <div class="form-field">
      <label>ប្រភេទលិខិត <span class="required">*</span></label>
      <SearchableSelect 
        v-model="formData.documentType" 
        :options="DOCUMENT_TYPES" 
        placeholder="ជ្រើសរើសឬស្វែងរក..."
        :class="{ 'error': errors.documentType }"
      />
      <span v-if="errors.documentType" class="error-message">{{ errors.documentType }}</span>
    </div>

    <div class="form-field">
      <label>ប្រភេទការលើកសរសើរ <span class="required">*</span></label>
      <SearchableSelect 
        v-model="formData.awardType" 
        :options="AWARD_TYPES" 
        placeholder="ជ្រើសរើសឬស្វែងរក..."
        :class="{ 'error': errors.awardType }"
      />
      <span v-if="errors.awardType" class="error-message">{{ errors.awardType }}</span>
    </div>

    <div class="form-field">
      <label>ប្រភេទថ្នាក់</label>
      <SearchableSelect 
        v-model="formData.awardClass" 
        :options="AWARD_CLASSES" 
        placeholder="ជ្រើសរើសឬស្វែងរក..."
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
      <label>ឯកសារ</label>
      <input 
        type="file" 
        @change="handleFileUpload" 
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
      />
      <small v-if="formData.awardImage" style="color: #059669; margin-top: 0.5rem; display: block;">
        <i class="pi pi-check-circle"></i> {{ formData.awardImage }}
      </small>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import SearchableSelect from './SearchableSelect.vue';
import { DOCUMENT_TYPES, AWARD_TYPES, AWARD_CLASSES } from '../constants/dropdown-options';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue']);

// Validation schema
const schema = yup.object({
  referenceLetterNo: yup.string().required('សូមបំពេញលេខលិខិតយោង'),
  date: yup.date().required('សូមជ្រើសរើសកាលបរិច្ឆេទ'),
  documentType: yup.string().required('សូមជ្រើសរើសប្រភេទលិខិត'),
  awardType: yup.string().required('សូមជ្រើសរើសប្រភេទការលើកសរសើរ')
});

const { errors, validate } = useForm({
  validationSchema: schema
});

const formData = ref({
  referenceLetterNo: '',
  date: '',
  documentType: '',
  awardType: '',
  awardClass: '',
  remarks: '',
  awardImage: '',
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
    formData.value.awardImage = file.name;
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
.form-field textarea.error {
  border-color: #dc2626;
}

.error-message {
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  font-family: 'Khmer OS Siemreap', sans-serif;
}
</style>
