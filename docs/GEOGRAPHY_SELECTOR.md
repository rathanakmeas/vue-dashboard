# Cambodia Geography Cascading Dropdowns

## Overview
This feature provides automatic cascading dropdowns for Cambodia's administrative divisions using official data from the Ministry of Economy and Finance (MEF) 2025 dataset.

## Features
- ✅ **Auto-cascading dropdowns**: Province → District → Commune → Village
- ✅ **Offline caching**: Data is cached for 7 days to reduce API calls
- ✅ **Bilingual support**: Both Khmer and English names
- ✅ **Official data**: Uses MEF 2025 geographical dataset
- ✅ **Easy integration**: Reusable Vue component

## Data Source
API: `https://data.mef.gov.kh/api/v1/public-datasets/pd_68e370856a965e00074a5e7b/json`

Data structure:
- **Province** (រាជធានី/ខេត្ត): 25 provinces
- **District** (ស្រុក/ខណ្ឌ): Districts within each province
- **Commune** (ឃុំ/សង្កាត់): Communes within each district  
- **Village** (ភូមិ): Villages within each commune

## Usage

### Basic Usage
```vue
<template>
  <form>
    <GeographySelector 
      v-model="addressData"
      @change="handleAddressChange"
    />
  </form>
</template>

<script setup>
import { ref } from 'vue';
import GeographySelector from '@/components/GeographySelector.vue';

const addressData = ref({
  province: '',
  district: '',
  commune: '',
  village: ''
});

function handleAddressChange(value) {
  console.log('Selected address:', value);
}
</script>
```

### Without Village Selection
```vue
<GeographySelector 
  v-model="addressData"
  :include-village="false"
/>
```

### With Custom Labels
```vue
<GeographySelector 
  v-model="addressData"
  :labels="{
    province: 'Province',
    district: 'District',
    commune: 'Commune',
    village: 'Village'
  }"
/>
```

### With Validation
```vue
<GeographySelector 
  v-model="addressData"
  :required="true"
  :errors="{
    province: 'សូមជ្រើសរើសរាជធានី/ខេត្ត',
    district: 'សូមជ្រើសរើសស្រុក/ខណ្ឌ'
  }"
/>
```

## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | Object | `{}` | v-model binding with province, district, commune, village codes |
| `includeVillage` | Boolean | `true` | Whether to show village dropdown |
| `required` | Boolean | `false` | Show required asterisk (*) |
| `labels` | Object | `{}` | Custom labels for dropdowns |
| `errors` | Object | `{}` | Validation error messages |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | Object | Emitted when any dropdown changes |
| `change` | Object | Emitted when any dropdown changes |

## Service Methods

The `geographyService` provides these methods:

```javascript
import geographyService from '@/services/geographyService';

// Get all provinces
const provinces = await geographyService.getProvinces();

// Get districts for a province
const districts = await geographyService.getDistricts('01'); // Banteay Meanchey

// Get communes for a district
const communes = await geographyService.getCommunes('01', '0102');

// Get villages for a commune
const villages = await geographyService.getVillages('01', '0102', '010201');

// Clear cache (force refresh)
geographyService.clearCache();
```

## Cache Management

Data is automatically cached in localStorage for 7 days. To clear cache:

```javascript
import geographyService from '@/services/geographyService';
geographyService.clearCache();
```

## Integration Example in Employee Form

```vue
<template>
  <div class="form-section">
    <h3>ទីកន្លែងកំណើត (Place of Birth)</h3>
    <div class="form-grid">
      <GeographySelector 
        v-model="formData.birthPlace"
        :required="true"
        @change="onBirthPlaceChange"
      />
    </div>
  </div>

  <div class="form-section">
    <h3>អាសយដ្ឋានបច្ចុប្បន្ន (Current Address)</h3>
    <div class="form-grid">
      <GeographySelector 
        v-model="formData.currentAddress"
        :required="true"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import GeographySelector from '@/components/GeographySelector.vue';

const formData = ref({
  birthPlace: {
    province: '',
    district: '',
    commune: '',
    village: ''
  },
  currentAddress: {
    province: '',
    district: '',
    commune: '',
    village: ''
  }
});

function onBirthPlaceChange(value) {
  console.log('Birth place changed:', value);
}
</script>
```

## Notes

- First load fetches all data from API (may take a few seconds)
- Subsequent loads use cached data (instant)
- Cache expires after 7 days
- All dropdowns are automatically filtered based on parent selection
- Component is fully reactive and supports v-model

## Troubleshooting

**Issue**: Dropdowns are empty
- Check internet connection
- Clear cache: `geographyService.clearCache()`
- Check browser console for errors

**Issue**: Slow initial load
- Normal for first load (fetching ~14,000+ records)
- Subsequent loads will be instant due to caching

**Issue**: Need to refresh data
```javascript
geographyService.clearCache();
window.location.reload();
```
