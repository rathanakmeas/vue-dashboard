<template>
  <div class="org-node" :class="{ 'has-children': hasChildren }">
    <div class="node-card" @click="$emit('select', node)" :style="{ marginLeft: `${level * 3}rem` }">
      <div class="node-header">
        <button 
          v-if="hasChildren" 
          @click.stop="$emit('toggle', node.code)"
          class="toggle-btn"
        >
          <i :class="['fas', isExpanded ? 'fa-minus-square' : 'fa-plus-square']"></i>
        </button>
        <div class="node-content">
          <div class="node-code">{{ node.code }}</div>
          <div class="node-name">{{ node.name }}</div>
        </div>
      </div>
      <div class="node-meta">
        <span class="category-badge">{{ node.category }}</span>
        <span v-if="node.head" class="head-badge">
          <i class="fas fa-user"></i> {{ node.head.username }}
        </span>
        <span v-if="hasChildren" class="children-count">
          <i class="fas fa-sitemap"></i> {{ node.children.length }}
        </span>
      </div>
    </div>

    <transition name="expand">
      <div v-if="isExpanded && hasChildren" class="children-container">
        <OrgNode
          v-for="child in node.children"
          :key="child.code"
          :node="child"
          :level="level + 1"
          :expanded-state="expandedState"
          @toggle="$emit('toggle', $event)"
          @select="$emit('select', $event)"
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  expandedState: {
    type: Object,
    default: () => ({})
  }
});

defineEmits(['toggle', 'select']);

const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0;
});

const isExpanded = computed(() => {
  return props.expandedState[props.node.code] || false;
});
</script>

<style scoped>
.org-node {
  margin: 1rem 0;
}

.node-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
  min-width: 350px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.node-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.node-header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.toggle-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: #667eea;
  padding: 0;
  transition: color 0.2s;
}

.toggle-btn:hover {
  color: #764ba2;
}

.node-content {
  flex: 1;
}

.node-code {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.25rem;
}

.node-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.75rem;
}

.node-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
}

.category-badge,
.head-badge,
.children-count {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.category-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.head-badge {
  background: #f0f4f8;
  color: #4a5568;
}

.children-count {
  background: #e6fffa;
  color: #234e52;
}

.children-container {
  margin-left: 2rem;
  padding-left: 2rem;
  border-left: 3px solid #e2e8f0;
  margin-top: 1rem;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 10000px;
}
</style>
