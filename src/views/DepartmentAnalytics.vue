<template>
  <div class="analytics-dashboard">
    <div class="dashboard-header">
      <h2>Department Analytics</h2>
      <select v-model="selectedYear" @change="loadAnalytics" class="year-select">
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
    </div>

    <div class="charts-grid">
      <!-- Staff Distribution by Category -->
      <div class="chart-card">
        <h3>Staff Distribution by Category</h3>
        <Bar :data="staffChartData" :options="chartOptions" v-if="staffChartData" />
      </div>

      <!-- Budget Distribution -->
      <div class="chart-card">
        <h3>Budget Distribution by Category</h3>
        <Pie :data="budgetPieData" :options="pieOptions" v-if="budgetPieData" />
      </div>

      <!-- Status Breakdown -->
      <div class="chart-card">
        <h3>Department Status</h3>
        <Doughnut :data="statusChartData" :options="pieOptions" v-if="statusChartData" />
      </div>

      <!-- Monthly Budget Trend -->
      <div class="chart-card full-width">
        <h3>Monthly Budget Trend</h3>
        <Line :data="monthlyTrendData" :options="trendOptions" v-if="monthlyTrendData" />
      </div>

      <!-- Top Departments by Staff -->
      <div class="table-card">
        <h3>Top 10 Departments by Staff</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Department</th>
              <th>Staff Count</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(dept, idx) in topStaffDepts" :key="dept._id">
              <td>{{ idx + 1 }}</td>
              <td><code>{{ dept.code }}</code> {{ dept.name }}</td>
              <td><strong>{{ dept.staffCount }}</strong></td>
              <td><span class="badge">{{ dept.category }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Top Departments by Budget -->
      <div class="table-card">
        <h3>Top 10 Departments by Budget</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Department</th>
              <th>Budget</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(dept, idx) in topBudgetDepts" :key="dept._id">
              <td>{{ idx + 1 }}</td>
              <td><code>{{ dept.code }}</code> {{ dept.name }}</td>
              <td><strong>${{ formatNumber(dept.budget) }}</strong></td>
              <td><span class="badge">{{ dept.category }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Budget Utilization by Department -->
      <div class="table-card full-width">
        <h3>Budget Utilization by Department</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Allocated</th>
              <th>Expenses</th>
              <th>Remaining</th>
              <th>Utilization</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dept in deptUtilization" :key="dept._id">
              <td>{{ dept.department }}</td>
              <td>${{ formatNumber(dept.allocated) }}</td>
              <td>${{ formatNumber(dept.expenses) }}</td>
              <td :class="dept.remaining < 0 ? 'text-danger' : 'text-success'">
                ${{ formatNumber(dept.remaining) }}
              </td>
              <td>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ 
                      width: Math.min(dept.utilizationRate, 100) + '%',
                      background: getUtilizationColor(dept.utilizationRate)
                    }"
                  >
                    {{ dept.utilizationRate.toFixed(1) }}%
                  </div>
                </div>
              </td>
              <td>
                <span :class="['status-badge', getUtilizationStatus(dept.utilizationRate)]">
                  {{ getUtilizationLabel(dept.utilizationRate) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Bar, Pie, Doughnut, Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { departmentAPI } from '../api';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement);

const selectedYear = ref(new Date().getFullYear());
const years = ref([2024, 2025, 2026, 2027]);

const analytics = ref(null);
const budgetAnalytics = ref(null);
const topStaffDepts = ref([]);
const topBudgetDepts = ref([]);
const deptUtilization = ref([]);

const staffChartData = computed(() => {
  if (!analytics.value?.staffByCategory) return null;
  return {
    labels: analytics.value.staffByCategory.map(c => c._id),
    datasets: [{
      label: 'Total Staff',
      data: analytics.value.staffByCategory.map(c => c.totalStaff),
      backgroundColor: 'rgba(102, 126, 234, 0.8)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 1
    }]
  };
});

const budgetPieData = computed(() => {
  if (!analytics.value?.budgetByCategory) return null;
  return {
    labels: analytics.value.budgetByCategory.map(c => c._id),
    datasets: [{
      data: analytics.value.budgetByCategory.map(c => c.totalBudget),
      backgroundColor: [
        'rgba(102, 126, 234, 0.8)',
        'rgba(240, 147, 251, 0.8)',
        'rgba(79, 172, 254, 0.8)',
        'rgba(67, 233, 123, 0.8)',
        'rgba(250, 112, 154, 0.8)',
        'rgba(48, 207, 208, 0.8)',
        'rgba(255, 8, 68, 0.8)',
        'rgba(168, 237, 234, 0.8)',
        'rgba(255, 236, 210, 0.8)',
        'rgba(224, 195, 252, 0.8)'
      ]
    }]
  };
});

const statusChartData = computed(() => {
  if (!analytics.value?.statusBreakdown) return null;
  return {
    labels: analytics.value.statusBreakdown.map(s => s._id),
    datasets: [{
      data: analytics.value.statusBreakdown.map(s => s.count),
      backgroundColor: [
        'rgba(67, 233, 123, 0.8)',
        'rgba(254, 215, 215, 0.8)',
        'rgba(226, 232, 240, 0.8)'
      ]
    }]
  };
});

const monthlyTrendData = computed(() => {
  if (!budgetAnalytics.value?.monthlyData) return null;
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const allocations = new Array(12).fill(0);
  const expenses = new Array(12).fill(0);
  
  budgetAnalytics.value.monthlyData.forEach(item => {
    const monthIdx = item._id.month - 1;
    if (item._id.type === 'allocation') allocations[monthIdx] = item.total;
    if (item._id.type === 'expense') expenses[monthIdx] = item.total;
  });
  
  return {
    labels: months,
    datasets: [
      {
        label: 'Allocations',
        data: allocations,
        borderColor: 'rgba(67, 233, 123, 1)',
        backgroundColor: 'rgba(67, 233, 123, 0.2)',
        tension: 0.4
      },
      {
        label: 'Expenses',
        data: expenses,
        borderColor: 'rgba(240, 147, 251, 1)',
        backgroundColor: 'rgba(240, 147, 251, 0.2)',
        tension: 0.4
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true }
  }
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right' }
  }
};

const trendOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true }
  },
  scales: {
    y: { beginAtZero: true }
  }
};

const loadAnalytics = async () => {
  try {
    const [analyticsRes, budgetRes] = await Promise.all([
      departmentAPI.getAnalytics(),
      departmentAPI.getBudgetAnalytics({ year: selectedYear.value })
    ]);
    
    analytics.value = analyticsRes;
    budgetAnalytics.value = budgetRes;
    topStaffDepts.value = analyticsRes.topStaffDepts || [];
    topBudgetDepts.value = analyticsRes.topBudgetDepts || [];
    deptUtilization.value = budgetRes.deptUtilization || [];
  } catch (error) {
    console.error('Failed to load analytics:', error);
  }
};

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num || 0);
};

const getUtilizationColor = (rate) => {
  if (rate < 70) return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
  if (rate < 90) return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
  return 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)';
};

const getUtilizationStatus = (rate) => {
  if (rate < 70) return 'status-low';
  if (rate < 90) return 'status-medium';
  return 'status-high';
};

const getUtilizationLabel = (rate) => {
  if (rate < 70) return 'Under Budget';
  if (rate < 90) return 'On Track';
  if (rate < 100) return 'Near Limit';
  return 'Over Budget';
};

onMounted(() => {
  loadAnalytics();
});
</script>

<style scoped>
.analytics-dashboard {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.year-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.chart-card, .table-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.chart-card {
  height: 400px;
}

.full-width {
  grid-column: 1 / -1;
}

.chart-card h3, .table-card h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  color: #1a202c;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f7fafc;
  border-bottom: 2px solid #e2e8f0;
}

.data-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.data-table code {
  background: #edf2f7;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.875rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background: #edf2f7;
  font-size: 0.75rem;
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 30px;
  background: #f7fafc;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  transition: width 0.3s ease;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-low {
  background: #c6f6d5;
  color: #22543d;
}

.status-medium {
  background: #feebc8;
  color: #7c2d12;
}

.status-high {
  background: #fed7d7;
  color: #742a2a;
}

.text-danger {
  color: #c53030;
  font-weight: 600;
}

.text-success {
  color: #22543d;
  font-weight: 600;
}
</style>
