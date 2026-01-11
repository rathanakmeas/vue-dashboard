<template>
  <div class="employee-detail-page">
    <!-- Breadcrumb -->
    <nav class="breadcrumb">
      <router-link to="/" class="breadcrumb-link">ទំព័រដើម</router-link>
      <span class="breadcrumb-sep">»</span>
      <router-link to="/employees" class="breadcrumb-link active">គ្រប់គ្រងបុគ្គលិក</router-link>
    </nav>

    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner" style="font-size: 3rem; color: #6366f1;"></i>
      <p>កំពុងផ្ទុក...</p>
    </div>

    <div v-else-if="employee" class="employee-detail">
      <!-- Top Section: Photo + Info Card -->
      <div class="top-section">
        <!-- Left: Photo Card -->
        <div class="photo-card">
          <div class="photo-wrapper">
            <img 
              v-if="employee.photo" 
              :src="`http://localhost:5000${employee.photo}`" 
              alt="Employee Photo"
              class="employee-photo"
            />
            <div v-else class="photo-placeholder">
              <i class="pi pi-user"></i>
            </div>
          </div>
          <button class="btn-edit-photo" @click="openPhotoDialog">
            <i class="pi pi-camera"></i>
            កែសម្រួលរូបថត
          </button>
        </div>

        <!-- Right: Info Card -->
        <div class="info-card">
          <h2 class="section-title">ព័ត៌មានទូទៅ</h2>
          
          <div class="info-list">
            <div class="info-row">
              <div class="info-col">
                <span class="info-label">គោត្តនាម ដំបូង:</span>
                <span class="info-value">{{ employee.khmerName || (employee.firstName + ' ' + employee.lastName) }}</span>
              </div>
              <div class="info-col">
                <span class="info-label">លេខសំគាល់បុគ្គលិក:</span>
                <span class="info-value highlight">{{ employee.employeeId }}</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-col">
                <span class="info-label">គោត្តនាម ដំបូង ឡាតាំង:</span>
                <span class="info-value">{{ (employee.firstNameLatin || employee.firstName).toUpperCase() }} {{ (employee.lastNameLatin || employee.lastName).toUpperCase() }}</span>
              </div>
              <div class="info-col">
                <span class="info-label">លេខទូ សព្វសារព័ត៌មាន:</span>
                <span class="info-value">{{ employee.nationalId || '០៩០៨៦៦៦៥៩' }}</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-col">
                <span class="info-label">ភេទ:</span>
                <span class="info-value">{{ employee.gender === 'Female' ? 'ស្រី' : 'ប្រុស' }}</span>
              </div>
              <div class="info-col">
                <span class="info-label">លេខទីប់លាត់អង្គ័:</span>
                <span class="info-value">{{ employee.civilServantId || 'គុម' }}</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-col">
                <span class="info-label">ថ្ងៃខែឆ្នាំកំណើត:</span>
                <span class="info-value">{{ formatDateKH(employee.dateOfBirth) }}</span>
              </div>
              <div class="info-col">
                <span class="info-label">លេខទូរស័ព្ទ:</span>
                <span class="info-value">{{ employee.phone || '០៩៦៨៨៦៦៩៨' }}</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-col">
                <span class="info-label">អត្ថលេខសំគាល់បុគ្គលិក:</span>
                <span class="info-value">{{ employee.civilServantId || employee.employeeId }}</span>
              </div>
              <div class="info-col">
                <span class="info-label">អុីមែល:</span>
                <span class="info-value">{{ employee.email }}</span>
              </div>
            </div>

            <div class="info-row full">
              <div class="info-col">
                <span class="info-label">អាសយដ្ឋាន:</span>
                <span class="info-value">{{ getAddress() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-bar">
        <button 
          v-for="(tab, idx) in tabs" 
          :key="idx"
          :class="['tab-item', { active: activeTab === idx }]"
          @click="activeTab = idx"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Tab 0: Civil Servant Status -->
        <div v-show="activeTab === 0" class="tab-panel">
          <div class="form-grid">
            <div class="field">
              <label>អត្ថលេខសំគាល់បុគ្គលិក</label>
              <input 
                type="text" 
                :value="employee.civilServantId || employee.employeeId" 
                readonly
                class="input-readonly"
              />
            </div>

            <div class="field">
              <label>ថ្ងៃខែឆ្នាំចូលបំរើការ</label>
              <input 
                type="date" 
                :value="employee.startWorkDate" 
                readonly
                class="input-readonly"
              />
            </div>

            <div class="field">
              <label>កាលបរិច្ឆេទកំណត់កាល</label>
              <input 
                type="date" 
                :value="employee.appointmentDate" 
                readonly
                class="input-readonly"
              />
            </div>

            <div class="field">
              <label>ពិណ៌នាលំអិតផងបូ</label>
              <input 
                type="text" 
                :value="employee.civilServantNotes" 
                readonly
                placeholder="ពិណ៌នាលំអិតផងបូ"
                class="input-readonly"
              />
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-add" @click="addRecord('civilStatus')">
              + មុខសម្រាយតារូតាំង
            </button>
            <button class="btn-save" @click="saveInfo">
              រក្សាទុកពត៌មានកំណត់កាល
            </button>
          </div>

          <!-- Data Table -->
          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>លេខបិទរូប</th>
                  <th>ប្រភេទបិទរូប</th>
                  <th>ប្រភេទគន</th>
                  <th>សូត្រតាម</th>
                  <th>ថ្ងៃខែឆ្នាំសុពលភាព</th>
                  <th>ថ្ងៃបង់បព់ប</th>
                  <th>ចុះបូម</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.civilStatuses || employee.civilStatuses.length === 0">
                  <td colspan="7" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(item, i) in employee.civilStatuses" :key="i">
                  <td>{{ item.letterNo || '-' }}</td>
                  <td>{{ item.letterType || 'មុរច្ឆ័យណាចាំឡ្យ/មុរច្ឆាច្យឡ្យ' }}</td>
                  <td>{{ item.employeeType || 'រាតុ ក្មូរុស' }}</td>
                  <td>{{ formatDateKH(item.startDate) || '១៨/០៧/២០១៩' }}</td>
                  <td>{{ item.status || 'បុងល្យុម' }}</td>
                  <td>{{ formatDateKH(item.endDate) || '-' }}</td>
                  <td>
                    <button class="action-btn" @click="editRecord('civilStatus', i)">
                      <i class="pi pi-ellipsis-v"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination">
            <button class="page-btn">« ក្រោម</button>
            <button class="page-btn active">១</button>
            <button class="page-btn">បន្ទុះ »</button>
          </div>
        </div>

        <!-- Tab 1: Family Info -->
        <div v-show="activeTab === 1" class="tab-panel">
          <h3 class="subsection-title">ព័ត៌មានឪពុក</h3>
          <div class="form-grid">
            <div class="field">
              <label>ឈ្មោះឪពុក</label>
              <input type="text" :value="employee.fatherInfo?.name" readonly class="input-readonly" />
            </div>
            <div class="field">
              <label>ឈ្មោះឡាតាំង</label>
              <input type="text" :value="employee.fatherInfo?.latinName" readonly class="input-readonly" />
            </div>
            <div class="field">
              <label>មុខរបរ</label>
              <input type="text" :value="employee.fatherInfo?.occupation" readonly class="input-readonly" />
            </div>
          </div>

          <h3 class="subsection-title">ព័ត៌មានម្ដាយ</h3>
          <div class="form-grid">
            <div class="field">
              <label>ឈ្មោះម្ដាយ</label>
              <input type="text" :value="employee.motherInfo?.name" readonly class="input-readonly" />
            </div>
            <div class="field">
              <label>ឈ្មោះឡាតាំង</label>
              <input type="text" :value="employee.motherInfo?.latinName" readonly class="input-readonly" />
            </div>
            <div class="field">
              <label>មុខរបរ</label>
              <input type="text" :value="employee.motherInfo?.occupation" readonly class="input-readonly" />
            </div>
          </div>

          <h3 class="subsection-title">ព័ត៌មានប្តី/ប្រពន្ធ</h3>
          <div class="form-grid">
            <div class="field">
              <label>ឈ្មោះ</label>
              <input type="text" :value="employee.spouseInfo?.name" readonly class="input-readonly" />
            </div>
            <div class="field">
              <label>មុខរបរ</label>
              <input type="text" :value="employee.spouseInfo?.occupation" readonly class="input-readonly" />
            </div>
            <div class="field">
              <label>លេខទូរស័ព្ទ</label>
              <input type="text" :value="employee.spouseInfo?.birthPlace?.phone" readonly class="input-readonly" />
            </div>
          </div>

          <h3 class="subsection-title">ព័ត៌មានកូន</h3>
          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>ឈ្មោះ</th>
                  <th>ភេទ</th>
                  <th>ថ្ងៃខែឆ្នាំកំណើត</th>
                  <th>មុខរបរ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.children || employee.children.length === 0">
                  <td colspan="4" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(child, i) in employee.children" :key="i">
                  <td>{{ child.name }}</td>
                  <td>{{ child.gender }}</td>
                  <td>{{ formatDateKH(child.dateOfBirth) }}</td>
                  <td>{{ child.occupation || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 2: Education -->
        <div v-show="activeTab === 2" class="tab-panel">
          <h3 class="subsection-title">ការសិក្សា</h3>
          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>វគ្គ</th>
                  <th>កម្រិត</th>
                  <th>គ្រឹះស្ថាន</th>
                  <th>ចាប់ផ្ដើម</th>
                  <th>បញ្ចប់</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.education || employee.education.length === 0">
                  <td colspan="5" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(edu, i) in employee.education" :key="i">
                  <td>{{ edu.course || '-' }}</td>
                  <td>{{ edu.level || '-' }}</td>
                  <td>{{ edu.institution || '-' }}</td>
                  <td>{{ formatDateKH(edu.startDate) }}</td>
                  <td>{{ formatDateKH(edu.endDate) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 class="subsection-title">ភាសា</h3>
          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>ភាសា</th>
                  <th>អាន</th>
                  <th>និយាយ</th>
                  <th>សរសេរ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.languages || employee.languages.length === 0">
                  <td colspan="4" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(lang, i) in employee.languages" :key="i">
                  <td>{{ lang.language }}</td>
                  <td>{{ lang.reading || '-' }}</td>
                  <td>{{ lang.speaking || '-' }}</td>
                  <td>{{ lang.writing || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 3: Ranks -->
        <div v-show="activeTab === 3" class="tab-panel">
          <h3 class="subsection-title">ថ្នាក់និងចំណាត់ថ្នាក់</h3>
          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>លេខយោង</th>
                  <th>ប្រភេទ</th>
                  <th>ក្របខណ្ឌ</th>
                  <th>ថ្នាក់</th>
                  <th>ប្រាក់ខែ</th>
                  <th>ថ្ងៃបញ្ចប់</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.ranks || employee.ranks.length === 0">
                  <td colspan="6" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(rank, i) in employee.ranks" :key="i">
                  <td>{{ rank.referenceNo || '-' }}</td>
                  <td>{{ rank.regulationType || '-' }}</td>
                  <td>{{ rank.framework || '-' }}</td>
                  <td>{{ rank.rankAndGrade || '-' }}</td>
                  <td>{{ rank.payScale || '-' }}</td>
                  <td>{{ formatDateKH(rank.endDate) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 4: Positions -->
        <div v-show="activeTab === 4" class="tab-panel">
          <h3 class="subsection-title">មុខតំណែង</h3>
          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>លេខលិខិត</th>
                  <th>មុខតំណែង</th>
                  <th>ថ្នាក់ស្មើ</th>
                  <th>ថ្ងៃចុះហត្ថលេខា</th>
                  <th>ក្រសួង</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.positions || employee.positions.length === 0">
                  <td colspan="5" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(pos, i) in employee.positions" :key="i">
                  <td>{{ pos.letterNo || '-' }}</td>
                  <td>{{ pos.position || '-' }}</td>
                  <td>{{ pos.equivalentRank || '-' }}</td>
                  <td>{{ formatDateKH(pos.signatureDate) }}</td>
                  <td>{{ pos.ministry || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 5: Private Sector -->
        <div v-show="activeTab === 5" class="tab-panel">
          <h3 class="subsection-title">បទពិសោធន៍វិស័យឯកជន</h3>
          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>ស្ថាប័ន</th>
                  <th>តួនាទី</th>
                  <th>ជំនាញ</th>
                  <th>ចាប់ផ្ដើម</th>
                  <th>បញ្ចប់</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.privateSectors || employee.privateSectors.length === 0">
                  <td colspan="5" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(ps, i) in employee.privateSectors" :key="i">
                  <td>{{ ps.organization || '-' }}</td>
                  <td>{{ ps.role || '-' }}</td>
                  <td>{{ ps.skills || '-' }}</td>
                  <td>{{ formatDateKH(ps.startDate) }}</td>
                  <td>{{ formatDateKH(ps.endDate) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 6: Recognition -->
        <div v-show="activeTab === 6" class="tab-panel">
          <h3 class="subsection-title">ការទទួលស្គាល់</h3>
          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>លេខយោង</th>
                  <th>ប្រភេទ</th>
                  <th>កាលបរិច្ឆេទ</th>
                  <th>ក្រសួង</th>
                  <th>រូបភាព</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.recognitions || employee.recognitions.length === 0">
                  <td colspan="5" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(rec, i) in employee.recognitions" :key="i">
                  <td>{{ rec.referenceNo || '-' }}</td>
                  <td>{{ rec.recognitionType || '-' }}</td>
                  <td>{{ formatDateKH(rec.date) }}</td>
                  <td>{{ rec.ministry || '-' }}</td>
                  <td>
                    <img v-if="rec.imageFile" :src="rec.imageData" alt="Image" class="table-img" />
                    <span v-else>-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 7: Disciplinary -->
        <div v-show="activeTab === 7" class="tab-panel">
          <h3 class="subsection-title">វិធានការបូលី</h3>
          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>លេខយោង</th>
                  <th>ប្រភេទ</th>
                  <th>កាលបរិច្ឆេទ</th>
                  <th>ក្រសួង</th>
                  <th>រូបភាព</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.disciplinaryActions || employee.disciplinaryActions.length === 0">
                  <td colspan="5" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(disc, i) in employee.disciplinaryActions" :key="i">
                  <td>{{ disc.referenceNo || '-' }}</td>
                  <td>{{ disc.disciplinaryType || '-' }}</td>
                  <td>{{ formatDateKH(disc.date) }}</td>
                  <td>{{ disc.ministry || '-' }}</td>
                  <td>
                    <img v-if="disc.imageFile" :src="disc.imageData" alt="Image" class="table-img" />
                    <span v-else>-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error-state">
      <i class="pi pi-exclamation-triangle" style="font-size: 3rem; color: #ef4444;"></i>
      <p>មិនអាចរកឃើញបុគ្គលិក</p>
      <router-link to="/employees" class="btn-back">ត្រឡប់ក្រោយ</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api.js';

const route = useRoute();
const router = useRouter();

const employee = ref(null);
const loading = ref(true);
const activeTab = ref(0);

const tabs = [
  { label: 'ស្ថានភាព', icon: 'pi pi-check-circle' },
  { label: 'ប្រវត្តិគ្រួសារ និងគូនែ', icon: 'pi pi-users' },
  { label: 'មុខតំណែង និងការ', icon: 'pi pi-briefcase' },
  { label: 'ថ្នាក់ និងដំណាក់', icon: 'pi pi-star' },
  { label: 'ការរៀបចំគេស្តារទី', icon: 'pi pi-folder' },
  { label: 'កាពបទីកជ្ឈមេការ', icon: 'pi pi-building' },
  { label: 'គតិសពេលគីប្រី', icon: 'pi pi-trophy' },
  { label: 'វិធានការបូលី', icon: 'pi pi-exclamation-triangle' }
];

const fetchEmployee = async () => {
  try {
    loading.value = true;
    const response = await api.get(`/employees/${route.params.id}`);
    employee.value = response.data;
  } catch (error) {
    console.error('Failed to fetch employee:', error);
  } finally {
    loading.value = false;
  }
};

const formatDateKH = (date) => {
  if (!date) return '-';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('km-KH');
  } catch {
    return '-';
  }
};

const getAddress = () => {
  const emp = employee.value;
  if (!emp) return '-';
  
  const parts = [];
  if (emp.address) {
    const addr = emp.address;
    if (addr.street) parts.push(addr.street);
    if (addr.commune) parts.push(addr.commune);
    if (addr.district) parts.push(addr.district);
    if (addr.province) parts.push(addr.province);
  }
  
  return parts.length > 0 ? parts.join(', ') : (emp.currentResidence || '-');
};

const openPhotoDialog = () => {
  console.log('Open photo dialog');
};

const addRecord = (type) => {
  console.log('Add record:', type);
};

const editRecord = (type, index) => {
  console.log('Edit record:', type, index);
};

const saveInfo = () => {
  console.log('Save information');
  // To be implemented: Save employee information
};

onMounted(() => {
  fetchEmployee();
});
</script>

<style scoped>
.employee-detail-page {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Khmer OS Siemreap', 'Segoe UI', sans-serif;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.breadcrumb-link {
  color: #6366f1;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover,
.breadcrumb-link.active {
  color: #4f46e5;
}

.breadcrumb-sep {
  color: #9ca3af;
}

/* States */
.loading-state,
.error-state {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 0.5rem;
}

.error-state .btn-back {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.625rem 1.25rem;
  background: #6366f1;
  color: white;
  text-decoration: none;
  border-radius: 0.375rem;
  transition: background 0.2s;
}

.error-state .btn-back:hover {
  background: #4f46e5;
}

/* Top Section */
.top-section {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.photo-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.photo-wrapper {
  width: 200px;
  height: 250px;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
}

.employee-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  font-size: 4rem;
  color: #d1d5db;
}

.btn-edit-photo {
  width: 100%;
  padding: 0.75rem;
  background: white;
  border: 1px solid #dc2626;
  color: #dc2626;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-edit-photo:hover {
  background: #dc2626;
  color: white;
}

/* Info Card */
.info-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1f2937;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.info-row.full {
  grid-template-columns: 1fr;
}

.info-col {
  display: grid;
  grid-template-columns: 170px 1fr;
  gap: 1rem;
  align-items: start;
}

.info-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.info-value {
  font-size: 0.9rem;
  color: #1f2937;
  font-weight: 500;
}

.info-value.highlight {
  color: #2563eb;
  font-weight: 600;
}

/* Tabs */
.tab-bar {
  display: flex;
  gap: 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

.tab-item {
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-item:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.tab-item.active {
  background: #6366f1;
  color: white;
}

/* Tab Content */
.tab-content {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  min-height: 400px;
}

.tab-panel {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.subsection-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  margin-top: 1.5rem;
  color: #1f2937;
}

.subsection-title:first-child {
  margin-top: 0;
}

/* Form */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.field input,
.field select {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.input-readonly {
  background: #f9fafb;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.btn-add {
  padding: 0.625rem 1.25rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #059669;
}

.btn-save {
  padding: 0.625rem 1.5rem;
  background: white;
  color: #6366f1;
  border: 1px solid #6366f1;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-save:hover {
  background: #6366f1;
  color: white;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #059669;
}

/* Table */
.data-table {
  overflow-x: auto;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

.data-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table thead {
  background: #f9fafb;
}

.data-table th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.data-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.no-data {
  text-align: center;
  color: #9ca3af;
  padding: 2rem !important;
  font-style: italic;
}

.action-btn {
  background: transparent;
  border: none;
  color: #6366f1;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e0e7ff;
  color: #4f46e5;
}

.table-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  transition: all 0.2s;
}

.page-btn:hover {
  background: #f3f4f6;
}

.page-btn.active {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
}

/* Responsive */
@media (max-width: 768px) {
  .top-section {
    grid-template-columns: 1fr;
  }
  
  .info-row {
    grid-template-columns: 1fr;
  }
  
  .info-col {
    grid-template-columns: 1fr;
  }

  .tab-bar {
    overflow-x: scroll;
  }
}
</style>
