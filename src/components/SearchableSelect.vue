<template>
  <div class="searchable-select" ref="selectContainer">
    <div class="select-input">
      <input 
        type="text" 
        v-model="searchQuery"
        :placeholder="placeholder"
        @input="onSearch"
        @focus="openDropdown"
        @click="openDropdown"
        ref="searchInput"
        autocomplete="off"
      />
      <i class="pi" :class="showDropdown ? 'pi-chevron-up' : 'pi-chevron-down'" @click.stop="toggleDropdown"></i>
    </div>
    <div v-if="showDropdown" class="dropdown-list">
      <div 
        v-for="option in filteredOptions" 
        :key="option"
        class="dropdown-item"
        :class="{ 'selected': modelValue === option }"
        @click="selectOption(option)"
      >
        {{ option }}
      </div>
      <div v-if="filteredOptions.length === 0" class="dropdown-item no-results">
        គ្មានលទ្ធផល
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  modelValue: String,
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: 'ជ្រើសរើស'
  }
});

const emit = defineEmits(['update:modelValue']);

const searchQuery = ref('');
const showDropdown = ref(false);
const selectContainer = ref(null);
const searchInput = ref(null);

// Watch for changes in modelValue to update searchQuery
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    searchQuery.value = newValue;
  }
});

// Filter options based on search query
const filteredOptions = computed(() => {
  if (!searchQuery.value) {
    return props.options;
  }
  const query = searchQuery.value.toLowerCase();
  return props.options.filter(option => 
    option.toLowerCase().includes(query)
  );
});

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
  if (showDropdown.value) {
    searchInput.value?.focus();
  }
};

const openDropdown = () => {
  console.log('Opening dropdown, options:', props.options.length);
  showDropdown.value = true;
};

const onSearch = () => {
  console.log('Searching:', searchQuery.value);
  showDropdown.value = true;
};

const selectOption = (option) => {
  searchQuery.value = option;
  emit('update:modelValue', option);
  showDropdown.value = false;
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (selectContainer.value && !selectContainer.value.contains(event.target)) {
    showDropdown.value = false;
    // Restore to selected value if search was not completed
    if (searchQuery.value !== props.modelValue) {
      searchQuery.value = props.modelValue || '';
    }
  }
};

// Set initial search query and add click outside listener
onMounted(() => {
  console.log('SearchableSelect mounted:', { 
    modelValue: props.modelValue, 
    optionsCount: props.options.length,
    options: props.options 
  });
  if (props.modelValue) {
    searchQuery.value = props.modelValue;
  }
  // Use capture phase to handle clicks before dialog
  document.addEventListener('click', handleClickOutside, true);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true);
});
</script>

<style scoped>
.searchable-select {
  position: relative;
  width: 100%;
}

.select-input {
  position: relative;
}

.select-input input {
  width: 100%;
  padding: 0.75rem;
  padding-right: 35px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-family: 'Siemreap', sans-serif;
  font-size: 12px;
  cursor: text;
  background: white;
  transition: all 0.2s;
}

.select-input input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.select-input .pi {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 4px;
  pointer-events: auto;
}

.dropdown-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  z-index: 9999;
}

.dropdown-item {
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: 'Siemreap', sans-serif;
  font-size: 12px;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.selected {
  background-color: #e3f2fd;
  color: #0288D1;
  font-weight: 500;
}

.dropdown-item.no-results {
  color: #6c757d;
  text-align: center;
  cursor: default;
}

.dropdown-item.no-results:hover {
  background-color: white;
}

/* Scrollbar styling */
.dropdown-list::-webkit-scrollbar {
  width: 6px;
}

.dropdown-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dropdown-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.dropdown-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
