<template>
  <div class="org-chart-container">
    <div class="chart-header">
      <h2>Hospital Organizational Chart</h2>
      <div class="controls">
        <button @click="exportPDF" class="btn btn-primary">
          <i class="fas fa-file-pdf"></i> Export PDF
        </button>
        <button @click="expandAll" class="btn btn-outline">
          <i class="fas fa-expand-arrows-alt"></i> Expand All
        </button>
        <button @click="collapseAll" class="btn btn-outline">
          <i class="fas fa-compress-arrows-alt"></i> Collapse All
        </button>
      </div>
    </div>

    <div class="org-chart" ref="chartContainer">
      <div class="tree">
        <OrgNode 
          v-for="root in treeData" 
          :key="root.code" 
          :node="root"
          :level="0"
          :expanded-state="expandedState"
          @toggle="toggleNode"
          @select="selectNode"
        />
      </div>
    </div>

    <!-- Node Details Panel -->
    <transition name="slide">
      <div v-if="selectedNode" class="details-panel">
        <div class="panel-header">
          <h3>{{ selectedNode.name }}</h3>
          <button @click="selectedNode = null" class="btn-close">&times;</button>
        </div>
        <div class="panel-body">
          <div class="detail-item">
            <label>Code:</label>
            <span><code>{{ selectedNode.code }}</code></span>
          </div>
          <div class="detail-item">
            <label>Category:</label>
            <span class="badge">{{ selectedNode.category }}</span>
          </div>
          <div class="detail-item" v-if="selectedNode.parent">
            <label>Parent:</label>
            <span><code>{{ selectedNode.parent }}</code></span>
          </div>
          <div class="detail-item" v-if="selectedNode.description">
            <label>Description:</label>
            <span>{{ selectedNode.description }}</span>
          </div>
          <div class="detail-item">
            <label>Staff:</label>
            <span>{{ selectedNode.staffCount || 0 }}</span>
          </div>
          <div class="detail-item" v-if="selectedNode.head">
            <label>Department Head:</label>
            <span>{{ selectedNode.head.username }}</span>
          </div>
          <div class="detail-item" v-if="selectedNode.email">
            <label>Email:</label>
            <span>{{ selectedNode.email }}</span>
          </div>
          <div class="detail-item" v-if="selectedNode.phone">
            <label>Phone:</label>
            <span>{{ selectedNode.phone }}</span>
          </div>
          <div class="detail-item" v-if="selectedNode.children?.length">
            <label>Sub-departments:</label>
            <span>{{ selectedNode.children.length }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { departmentAPI } from '../api';
import OrgNode from '../components/OrgNode.vue';

const treeData = ref([]);
const selectedNode = ref(null);
const expandedState = ref({});
const chartContainer = ref(null);

const loadOrgChart = async () => {
  try {
    const response = await departmentAPI.getDepartments({ tree: true });
    treeData.value = response.departments || [];
    
    // Initially expand top level
    treeData.value.forEach(node => {
      expandedState.value[node.code] = true;
    });
  } catch (error) {
    console.error('Failed to load org chart:', error);
  }
};

const toggleNode = (code) => {
  expandedState.value[code] = !expandedState.value[code];
};

const selectNode = (node) => {
  selectedNode.value = node;
};

const expandAll = () => {
  const expand = (nodes) => {
    nodes.forEach(node => {
      expandedState.value[node.code] = true;
      if (node.children?.length) expand(node.children);
    });
  };
  expand(treeData.value);
};

const collapseAll = () => {
  expandedState.value = {};
  treeData.value.forEach(node => {
    expandedState.value[node.code] = true; // Keep top level expanded
  });
};

const exportPDF = () => {
  window.open('/api/departments/export/orgchart', '_blank');
};

onMounted(() => {
  loadOrgChart();
});
</script>

<style scoped>
.org-chart-container {
  padding: 2rem;
  max-width: 100%;
  min-height: 100vh;
  position: relative;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.chart-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.controls {
  display: flex;
  gap: 1rem;
}

.org-chart {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow-x: auto;
}

.tree {
  display: inline-block;
  min-width: 100%;
}

.details-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 8px rgba(0,0,0,0.1);
  z-index: 1000;
  overflow-y: auto;
}

.panel-header {
  padding: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.panel-body {
  padding: 1.5rem;
}

.detail-item {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.detail-item span {
  color: #1a202c;
}

.detail-item code {
  background: #edf2f7;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
}

.badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  background: #edf2f7;
  font-size: 0.875rem;
  font-weight: 600;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-outline {
  background: white;
  border: 2px solid #e2e8f0;
  color: #4a5568;
}

.btn-outline:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 2rem;
  color: white;
  cursor: pointer;
  line-height: 1;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from, .slide-leave-to {
  transform: translateX(100%);
}
</style>
