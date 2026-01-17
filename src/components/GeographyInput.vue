<template>
  <div class="geography-input-wrapper" :class="{ 'full-width': fullWidth }">
    <!-- Toggle Checkbox -->
    <div class="geography-toggle">
      <input 
        type="checkbox" 
        :id="`manual-${id}`"
        v-model="isManualInput"
        class="toggle-checkbox"
      />
      <label :for="`manual-${id}`">វាយបញ្ចូល (Manual)</label>
    </div>

    <!-- Geography Selector Mode -->
    <div v-if="!isManualInput" class="geography-selector-mode">
      <GeographySelector 
        :model-value="modelValue"
        :include-village="includeVillage"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </div>

    <!-- Manual Text Input Mode -->
    <div v-else class="manual-input-mode">
      <div class="form-row">
        <div class="form-group">
          <label>{{ labels.province || 'រាជធានី/ខេត្ត' }}</label>
          <input 
            type="text" 
            :value="manualText.province"
            @input="updateManualText('province', $event.target.value)"
            :placeholder="labels.province || 'រាជធានី/ខេត្ត'"
          />
        </div>
        <div class="form-group">
          <label>{{ labels.district || 'ស្រុក/ខណ្ឌ' }}</label>
          <input 
            type="text" 
            :value="manualText.district"
            @input="updateManualText('district', $event.target.value)"
            :placeholder="labels.district || 'ស្រុក/ខណ្ឌ'"
          />
        </div>
        <div class="form-group">
          <label>{{ labels.commune || 'ឃុំ/សង្កាត់' }}</label>
          <input 
            type="text" 
            :value="manualText.commune"
            @input="updateManualText('commune', $event.target.value)"
            :placeholder="labels.commune || 'ឃុំ/សង្កាត់'"
          />
        </div>
      </div>
      <div v-if="includeVillage" class="form-row">
        <div class="form-group">
          <label>{{ labels.village || 'ភូមិ' }}</label>
          <input 
            type="text" 
            :value="manualText.village"
            @input="updateManualText('village', $event.target.value)"
            :placeholder="labels.village || 'ភូមិ'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import GeographySelector from './GeographySelector.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ province: '', district: '', commune: '', village: '' })
  },
  includeVillage: {
    type: Boolean,
    default: true
  },
  labels: {
    type: Object,
    default: () => ({})
  },
  id: {
    type: String,
    required: true
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const isManualInput = ref(false);
const manualText = ref({
  province: '',
  district: '',
  commune: '',
  village: ''
});

// Watch for external changes to modelValue
watch(() => props.modelValue, (newVal) => {
  if (!isManualInput.value && newVal) {
    // Update manual text when model value changes (from selector)
    manualText.value = {
      province: newVal.province || '',
      district: newVal.district || '',
      commune: newVal.commune || '',
      village: newVal.village || ''
    };
  }
}, { deep: true });

// Initialize manual text from model value
if (props.modelValue) {
  manualText.value = {
    province: props.modelValue.province || '',
    district: props.modelValue.district || '',
    commune: props.modelValue.commune || '',
    village: props.modelValue.village || ''
  };
}

const updateManualText = (field, value) => {
  manualText.value[field] = value;
  // Emit the updated value
  emit('update:modelValue', { ...manualText.value });
};
</script>

<style scoped>
.geography-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.geography-input-wrapper.full-width {
  grid-column: 1 / -1;
}

.geography-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.75rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  border-left: 3px solid #2196F3;
}

.toggle-checkbox {
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: #2196F3;
}

.geography-toggle label {
  cursor: pointer;
  margin: 0;
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
  font-family: 'Noto Serif Khmer', serif;
  font-size: 12px;
}

.geography-toggle label:hover {
  color: #2196F3;
}

.geography-selector-mode {
  width: 100%;
}

.manual-input-mode {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.manual-input-mode .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}

.manual-input-mode .form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.manual-input-mode label {
  font-family: 'Siemreap', sans-serif;
  font-weight: 600;
  color: #475569;
  font-size: 12px;
}

.manual-input-mode input {
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-family: 'Siemreap', sans-serif;
  font-size: 12px;
  transition: all 0.2s;
}

.manual-input-mode input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

@media (max-width: 1024px) {
  .manual-input-mode .form-row {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .manual-input-mode .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
