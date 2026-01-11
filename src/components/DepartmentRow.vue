<template>
  <tr :class="['tree-row', { 'has-children': hasChildren }]" :style="{ '--level': level }">
    <td>
      <input 
        type="checkbox" 
        :checked="selected"
        @change="$emit('toggle-select', department.code)"
      />
    </td>
    <td>
      <div class="expand-cell" :style="{ paddingLeft: `${level * 2}rem` }">
        <button 
          v-if="hasChildren" 
          @click="toggleExpand" 
          class="expand-btn"
        >
          <i :class="['fas', expanded ? 'fa-chevron-down' : 'fa-chevron-right']"></i>
        </button>
        <span v-else class="expand-spacer"></span>
      </div>
    </td>
    <td>
      <code class="dept-code">{{ department.code }}</code>
    </td>
    <td>
      <div class="dept-name-cell" :style="{ paddingLeft: hasChildren ? '0' : '0' }">
        <span class="dept-name">{{ department.name }}</span>
        <span v-if="department.parent" class="parent-badge">
          Child of {{ department.parent }}
        </span>
      </div>
    </td>
    <td>
      <span class="category-badge" :style="getCategoryColor(department.category)">
        {{ department.category }}
      </span>
    </td>
    <td>
      <span :class="['status-badge', `status-${department.status}`]">
        {{ department.status }}
      </span>
    </td>
    <td class="text-center">{{ department.staffCount || 0 }}</td>
    <td>
      <div v-if="department.head" class="head-info">
        {{ department.head.username }}
      </div>
      <span v-else class="text-muted">Not assigned</span>
    </td>
    <td>
      <div class="action-buttons">
        <button @click="$emit('view', department)" class="btn-icon" title="View Details">
          <i class="fas fa-eye"></i>
        </button>
        <button @click="$emit('edit', department)" class="btn-icon" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button @click="$emit('delete', department)" class="btn-icon btn-danger" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </td>
  </tr>
  
  <!-- Render children recursively -->
  <template v-if="expanded && hasChildren">
    <DepartmentRow
      v-for="child in department.children"
      :key="child.code"
      :department="child"
      :level="level + 1"
      :selected="selected"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
      @view="$emit('view', $event)"
      @toggle-select="$emit('toggle-select', $event)"
    />
  </template>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  department: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  selected: {
    type: Boolean,
    default: false
  }
});

defineEmits(['edit', 'delete', 'view', 'toggle-select']);

const expanded = ref(true);

const hasChildren = computed(() => {
  return props.department.children && props.department.children.length > 0;
});

const toggleExpand = () => {
  expanded.value = !expanded.value;
};

const getCategoryColor = (category) => {
  const colors = {
    'Administration': 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;',
    'Clinical': 'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;',
    'Diagnostic': 'background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;',
    'Support': 'background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white;',
    'Medical': 'background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white;',
    'Surgical': 'background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); color: white;',
    'Emergency': 'background: linear-gradient(135deg, #ff0844 0%, #ffb199 100%); color: white;',
    'Specialty': 'background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333;',
    'Rehabilitation': 'background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); color: #333;',
    'Ancillary': 'background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%); color: #333;'
  };
  return colors[category] || 'background: #e0e0e0; color: #333;';
};
</script>

<style scoped>
.tree-row {
  transition: background-color 0.2s;
}

.tree-row:hover {
  background-color: #f7fafc;
}

.tree-row.has-children > td:first-child {
  position: relative;
}

.expand-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.expand-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  color: #4a5568;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
}

.expand-btn:hover {
  background: #e2e8f0;
  color: #2d3748;
}

.expand-spacer {
  width: 24px;
  display: inline-block;
}

.dept-code {
  background: #edf2f7;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  font-weight: 600;
}

.dept-name-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dept-name {
  font-weight: 500;
}

.parent-badge {
  font-size: 0.75rem;
  color: #718096;
  font-style: italic;
}

.category-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-active {
  background: #c6f6d5;
  color: #22543d;
}

.status-inactive {
  background: #fed7d7;
  color: #742a2a;
}

.status-closed {
  background: #e2e8f0;
  color: #4a5568;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: #a0aec0;
  font-style: italic;
  font-size: 0.875rem;
}

.head-info {
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  padding: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  color: #4a5568;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #edf2f7;
  color: #2d3748;
}

.btn-icon.btn-danger:hover {
  background: #fed7d7;
  color: #c53030;
}
</style>
