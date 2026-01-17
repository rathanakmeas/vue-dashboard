<template>
  <div class="geography-selector">
    <!-- Province -->
    <div class="form-field">
      <label>{{ labels.province || 'រាជធានី/ខេត្ត' }} <span v-if="required" class="required">*</span></label>
      <select 
        v-model="selectedProvince" 
        @change="onProvinceChange"
        :disabled="loading"
        :class="{ 'error': errors.province }"
      >
        <option value="">ជ្រើសរើស...</option>
        <option v-for="province in provinces" :key="province.code" :value="province.code">
          {{ province.name_kh }}
        </option>
      </select>
      <span v-if="errors.province" class="error-message">{{ errors.province }}</span>
    </div>

    <!-- District -->
    <div class="form-field">
      <label>{{ labels.district || 'ស្រុក/ខណ្ឌ' }} <span v-if="required" class="required">*</span></label>
      <select 
        v-model="selectedDistrict" 
        @change="onDistrictChange"
        :disabled="loading || !selectedProvince"
        :class="{ 'error': errors.district }"
      >
        <option value="">ជ្រើសរើស...</option>
        <option v-for="district in districts" :key="district.code" :value="district.code">
          {{ district.name_kh }}
        </option>
      </select>
      <span v-if="errors.district" class="error-message">{{ errors.district }}</span>
    </div>

    <!-- Commune -->
    <div class="form-field">
      <label>{{ labels.commune || 'ឃុំ/សង្កាត់' }} <span v-if="required" class="required">*</span></label>
      <select 
        v-model="selectedCommune" 
        @change="onCommuneChange"
        :disabled="loading || !selectedDistrict"
        :class="{ 'error': errors.commune }"
      >
        <option value="">ជ្រើសរើស...</option>
        <option v-for="commune in communes" :key="commune.code" :value="commune.code">
          {{ commune.name_kh }}
        </option>
      </select>
      <span v-if="errors.commune" class="error-message">{{ errors.commune }}</span>
    </div>

    <!-- Village -->
    <div class="form-field" v-if="includeVillage">
      <label>{{ labels.village || 'ភូមិ' }} <span v-if="required" class="required">*</span></label>
      <select 
        v-model="selectedVillage" 
        @change="onVillageChange"
        :disabled="loading || !selectedCommune"
        :class="{ 'error': errors.village }"
      >
        <option value="">ជ្រើសរើស...</option>
        <option v-for="village in villages" :key="village.code" :value="village.code">
          {{ village.name_kh }}
        </option>
      </select>
      <span v-if="errors.village" class="error-message">{{ errors.village }}</span>
    </div>

    <div v-if="loading" class="loading-indicator">
      <i class="pi pi-spin pi-spinner"></i> កំពុងទាញយកទិន្នន័យ...
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import geographyService from '../services/geographyService';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      province: '',
      district: '',
      commune: '',
      village: ''
    })
  },
  includeVillage: {
    type: Boolean,
    default: true
  },
  required: {
    type: Boolean,
    default: false
  },
  labels: {
    type: Object,
    default: () => ({})
  },
  errors: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const loading = ref(false);
const provinces = ref([]);
const districts = ref([]);
const communes = ref([]);
const villages = ref([]);

const selectedProvince = ref(props.modelValue.province || '');
const selectedDistrict = ref(props.modelValue.district || '');
const selectedCommune = ref(props.modelValue.commune || '');
const selectedVillage = ref(props.modelValue.village || '');

// Load provinces on mount
onMounted(async () => {
  loading.value = true;
  try {
    provinces.value = await geographyService.getProvinces();
    
    // If initial values are provided, load cascading data
    if (selectedProvince.value) {
      await loadDistricts(selectedProvince.value);
      
      if (selectedDistrict.value) {
        await loadCommunes(selectedProvince.value, selectedDistrict.value);
        
        if (selectedCommune.value && props.includeVillage) {
          await loadVillages(selectedProvince.value, selectedDistrict.value, selectedCommune.value);
        }
      }
    }
  } catch (error) {
    console.error('Failed to load provinces:', error);
  } finally {
    loading.value = false;
  }
});

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  if (newVal.province !== selectedProvince.value) {
    selectedProvince.value = newVal.province;
  }
  if (newVal.district !== selectedDistrict.value) {
    selectedDistrict.value = newVal.district;
  }
  if (newVal.commune !== selectedCommune.value) {
    selectedCommune.value = newVal.commune;
  }
  if (newVal.village !== selectedVillage.value) {
    selectedVillage.value = newVal.village;
  }
}, { deep: true });

async function loadDistricts(provinceCode) {
  districts.value = await geographyService.getDistricts(provinceCode);
}

async function loadCommunes(provinceCode, districtCode) {
  communes.value = await geographyService.getCommunes(provinceCode, districtCode);
}

async function loadVillages(provinceCode, districtCode, communeCode) {
  villages.value = await geographyService.getVillages(provinceCode, districtCode, communeCode);
}

async function onProvinceChange() {
  // Reset dependent selections
  selectedDistrict.value = '';
  selectedCommune.value = '';
  selectedVillage.value = '';
  districts.value = [];
  communes.value = [];
  villages.value = [];

  if (selectedProvince.value) {
    loading.value = true;
    try {
      await loadDistricts(selectedProvince.value);
    } finally {
      loading.value = false;
    }
  }

  emitValue();
}

async function onDistrictChange() {
  // Reset dependent selections
  selectedCommune.value = '';
  selectedVillage.value = '';
  communes.value = [];
  villages.value = [];

  if (selectedDistrict.value) {
    loading.value = true;
    try {
      await loadCommunes(selectedProvince.value, selectedDistrict.value);
    } finally {
      loading.value = false;
    }
  }

  emitValue();
}

async function onCommuneChange() {
  // Reset dependent selections
  selectedVillage.value = '';
  villages.value = [];

  if (selectedCommune.value && props.includeVillage) {
    loading.value = true;
    try {
      await loadVillages(selectedProvince.value, selectedDistrict.value, selectedCommune.value);
    } finally {
      loading.value = false;
    }
  }

  emitValue();
}

function onVillageChange() {
  emitValue();
}

function emitValue() {
  const value = {
    province: selectedProvince.value,
    district: selectedDistrict.value,
    commune: selectedCommune.value,
    village: selectedVillage.value
  };
  
  emit('update:modelValue', value);
  emit('change', value);
}
</script>

<style scoped>
.geography-selector {
  display: contents;
}

.form-field {
  margin-bottom: 1rem;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #334155;
}

.required {
  color: #ef4444;
}

select {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.2s;
}

select:focus {
  outline: none;
  border-color: #0288D1;
  box-shadow: 0 0 0 3px rgba(2, 136, 209, 0.1);
}

select:disabled {
  background-color: #f1f5f9;
  cursor: not-allowed;
  opacity: 0.6;
}

select.error {
  border-color: #ef4444;
}

.error-message {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #ef4444;
}

.loading-indicator {
  grid-column: 1 / -1;
  text-align: center;
  padding: 1rem;
  color: #64748b;
  font-size: 0.9rem;
}

.loading-indicator i {
  margin-right: 0.5rem;
}
</style>
