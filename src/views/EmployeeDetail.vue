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
          <h2 class="section-title">
            <i class="pi pi-info-circle"></i>
            ព័ត៌មានទូទៅ
          </h2>
          
          <div class="info-list">
            <div class="info-row">
              <div class="info-col">
                <span class="info-label">គោត្តនាម និងនាម:</span>
                <span class="info-value">{{ employee.khmerName || (employee.firstName + ' ' + employee.lastName) }}</span>
              </div>
              <div class="info-col">
                <span class="info-label">លេខសំគាល់បុគ្គលិក:</span>
                <span class="info-value highlight">{{ employee.employeeId }}</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-col">
                <span class="info-label">គោត្តនាម និងនាម ឡាតាំង:</span>
                <span class="info-value">{{ (employee.firstNameLatin || employee.firstName).toUpperCase() }} {{ (employee.lastNameLatin || employee.lastName).toUpperCase() }}</span>
              </div>
              <div class="info-col">
                <span class="info-label">លេខអត្ត.សញ្ជាតិខ្មែរ:</span>
                <span class="info-value">{{ employee.nationalId || '០៩០៨៦៦៦៥៩' }}</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-col">
                <span class="info-label">ភេទ:</span>
                <span class="info-value">{{ employee.gender === 'Female' ? 'ស្រី' : 'ប្រុស' }}</span>
              </div>
              <div class="info-col">
                <span class="info-label">លេខលិខិតឆ្លងដែន:</span>
                <span class="info-value">{{ employee.passportNo || 'គុម' }}</span>
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
                <span class="info-label">អត្តលេខមន្ត្រីរាជការ:</span>
                <span class="info-value">{{ employee.civilServantId || employee.employeeId }}</span>
              </div>
              <div class="info-col">
                <span class="info-label">លេខសំបុត្រកំណើត:</span>
                <span class="info-value">{{ employee.birthCertificateNo || 'គុម' }}</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-col">
                <span class="info-label">អុីមែល:</span>
                <span class="info-value">{{ employee.email }}</span>
              </div>
              <div class="info-col">
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
        <!-- Tab 0: ស្ថានភាពមន្ត្រី (Employee Status) -->
        <div v-show="activeTab === 0" class="tab-panel">
          <div class="form-grid">
            <div class="field">
              <label>អត្តលេខមន្ត្រីរាជការ</label>
              <input 
                type="text" 
                :value="employee.civilServantId || employee.employeeId" 
                readonly
                class="input-readonly"
              />
            </div>

            <div class="field">
              <label>ថ្ងៃខែឆ្នាំចូលបម្រើការងារ</label>
              <input 
                type="date" 
                :value="employee.startWorkDate" 
                readonly
                class="input-readonly"
              />
            </div>

            <div class="field">
              <label>កាលបរិច្ឆេទតាំងស៊ប់</label>
              <input 
                type="date" 
                :value="employee.appointmentDate" 
                readonly
                class="input-readonly"
              />
            </div>

            <div class="field">
              <label>កំណត់សំគាល់ផ្សេងៗ</label>
              <input 
                type="text" 
                :value="employee.civilServantNotes" 
                readonly
                placeholder="កំណត់សំគាល់ផ្សេងៗ"
                class="input-readonly"
              />
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-add" @click="addRecord('civilStatus')">
              + បញ្ចូលស្ថានភាពមន្ត្រី
            </button>
          </div>

          <!-- Data Table -->
          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>លេខលិខិត</th>
                  <th>ប្រភេទលិខិត</th>
                  <th>ប្រភេទមន្ត្រី</th>
                  <th>ស្ថានភាព</th>
                  <th>ថ្ងៃបញ្ចប់</th>
                  <th>ផ្សេងៗ</th>
                  <th>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.civilStatuses || employee.civilStatuses.length === 0">
                  <td colspan="7" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(item, i) in employee.civilStatuses" :key="i">
                  <td>{{ item.letterNo || '-' }}</td>
                  <td>{{ item.letterType || '-' }}</td>
                  <td>{{ item.employeeType || '-' }}</td>
                  <td>{{ item.status || '-' }}</td>
                  <td>{{ formatDateKH(item.endDate) || '-' }}</td>
                  <td>{{ item.remarks || '-' }}</td>
                  <td>
                    <button class="action-btn" @click="editRecord('civilStatus', i)">
                      <i class="pi pi-pencil"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 1: ឋានន្តរស័ក្តិ និងថ្នាក់ (Rank and Grade) -->
        <div v-show="activeTab === 1" class="tab-panel">
          <div class="form-actions">
            <button class="btn-add" @click="addRecord('rankGrade')">
              + បញ្ចូលឋានន្តរស័ក្តិ និងថ្នាក់
            </button>
          </div>

          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>លេខលិខិតយោង</th>
                  <th>ប្រភេទលក្ខន្តិកៈ</th>
                  <th>ក្របខ័ណ្ឌ</th>
                  <th>ឋានន្តរស័ក្តិ និងថ្នាក់</th>
                  <th>PayScale</th>
                  <th>ថ្ងៃខែឆ្នាំបញ្ចប់</th>
                  <th>ផ្សេងៗ</th>
                  <th>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.rankGrades || employee.rankGrades.length === 0">
                  <td colspan="8" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(item, i) in employee.rankGrades" :key="i">
                  <td>{{ item.referenceLetterNo || '-' }}</td>
                  <td>{{ item.characteristicType || '-' }}</td>
                  <td>{{ item.framework || '-' }}</td>
                  <td>{{ item.rankAndGrade || '-' }}</td>
                  <td>{{ item.payScale || '-' }}</td>
                  <td>{{ formatDateKH(item.endDate) || '-' }}</td>
                  <td>{{ item.remarks || '-' }}</td>
                  <td>
                    <button class="action-btn" @click="editRecord('rankGrade', i)">
                      <i class="pi pi-pencil"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 2: មុខតំណែង (Position) -->
        <div v-show="activeTab === 2" class="tab-panel">
          <div class="form-actions">
            <button class="btn-add" @click="addRecord('position')">
              + បញ្ចូលមុខតំណែង
            </button>
          </div>

          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>លេខលិខិត</th>
                  <th>មុខតំណែង</th>
                  <th>ឋានៈស្មើ</th>
                  <th>ថ្ងៃចុះហត្ថលេខា</th>
                  <th>ថ្ងៃបញ្ចប់</th>
                  <th>ក្រសួង-ស្ថាប័ន</th>
                  <th>ផ្សេងៗ</th>
                  <th>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.positions || employee.positions.length === 0">
                  <td colspan="8" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(item, i) in employee.positions" :key="i">
                  <td>{{ item.letterNo || '-' }}</td>
                  <td>{{ item.position || '-' }}</td>
                  <td>{{ item.equivalentRank || '-' }}</td>
                  <td>{{ formatDateKH(item.signatureDate) || '-' }}</td>
                  <td>{{ formatDateKH(item.endDate) || '-' }}</td>
                  <td>{{ item.ministryInstitution || '-' }}</td>
                  <td>{{ item.remarks || '-' }}</td>
                  <td>
                    <button class="action-btn" @click="editRecord('position', i)">
                      <i class="pi pi-pencil"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 3: វិស័យឯកជន (Private Sector) -->
        <div v-show="activeTab === 3" class="tab-panel">
          <div class="form-actions">
            <button class="btn-add" @click="addRecord('privateSector')">
              + បញ្ចូលវិស័យឯកជន
            </button>
          </div>

          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>គ្រឹះស្ថាន-អង្គភាព</th>
                  <th>តួនាទី</th>
                  <th>ជំនាញ/បច្ចេកទេស</th>
                  <th>ថ្ងៃចូលបម្រើការងារ</th>
                  <th>ថ្ងៃបញ្ចប់ការងារ</th>
                  <th>ផ្សេងៗ</th>
                  <th>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.privateSectors || employee.privateSectors.length === 0">
                  <td colspan="7" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(item, i) in employee.privateSectors" :key="i">
                  <td>{{ item.institution || '-' }}</td>
                  <td>{{ item.role || '-' }}</td>
                  <td>{{ item.skill || '-' }}</td>
                  <td>{{ formatDateKH(item.startDate) || '-' }}</td>
                  <td>{{ formatDateKH(item.endDate) || '-' }}</td>
                  <td>{{ item.remarks || '-' }}</td>
                  <td>
                    <button class="action-btn" @click="editRecord('privateSector', i)">
                      <i class="pi pi-pencil"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 4: ការលើកសរសើរ (Awards/Recognition) -->
        <div v-show="activeTab === 4" class="tab-panel">
          <div class="form-actions">
            <button class="btn-add" @click="addRecord('award')">
              + បញ្ចូលការលើកសរសើរ
            </button>
          </div>

          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>លេខលិខិតយោង</th>
                  <th>ប្រភេទការលើកសរសើរ</th>
                  <th>រូបភាពលើកសរសើរ</th>
                  <th>កាលបរិច្ឆេទ</th>
                  <th>ក្រសួង-ស្ថាប័ន</th>
                  <th>ផ្សេងៗ</th>
                  <th>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.awards || employee.awards.length === 0">
                  <td colspan="7" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(item, i) in employee.awards" :key="i">
                  <td>{{ item.referenceLetterNo || '-' }}</td>
                  <td>{{ item.awardType || '-' }}</td>
                  <td>
                    <img v-if="item.awardImage" :src="item.awardImage" alt="Award" class="table-image" />
                    <span v-else>-</span>
                  </td>
                  <td>{{ formatDateKH(item.date) || '-' }}</td>
                  <td>{{ item.ministryInstitution || '-' }}</td>
                  <td>{{ item.remarks || '-' }}</td>
                  <td>
                    <button class="action-btn" @click="editRecord('award', i)">
                      <i class="pi pi-pencil"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 5: ការដាក់ពិន័យ (Disciplinary Actions) -->
        <div v-show="activeTab === 5" class="tab-panel">
          <div class="form-actions">
            <button class="btn-add" @click="addRecord('disciplinary')">
              + បញ្ចូលការដាក់ពិន័យ
            </button>
          </div>

          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>លេខលិខិតយោង</th>
                  <th>ប្រភេទការដាក់ពិន័យ</th>
                  <th>រូបភាពការដាក់ពិន័យ</th>
                  <th>កាលបរិច្ឆេទ</th>
                  <th>ក្រសួង-ស្ថាប័ន</th>
                  <th>ផ្សេងៗ</th>
                  <th>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.disciplinaryActions || employee.disciplinaryActions.length === 0">
                  <td colspan="7" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(item, i) in employee.disciplinaryActions" :key="i">
                  <td>{{ item.referenceLetterNo || '-' }}</td>
                  <td>{{ item.actionType || '-' }}</td>
                  <td>
                    <img v-if="item.actionImage" :src="item.actionImage" alt="Disciplinary" class="table-image" />
                    <span v-else>-</span>
                  </td>
                  <td>{{ formatDateKH(item.date) || '-' }}</td>
                  <td>{{ item.ministryInstitution || '-' }}</td>
                  <td>{{ item.remarks || '-' }}</td>
                  <td>
                    <button class="action-btn" @click="editRecord('disciplinary', i)">
                      <i class="pi pi-pencil"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 6: ព័ត៌មានសហព័ទ្ធ (Union Information) -->
        <div v-show="activeTab === 6" class="tab-panel">
          <div class="form-actions">
            <button class="btn-add" @click="addRecord('union')">
              + បញ្ចូលព័ត៌មានសហព័ទ្ធ
            </button>
          </div>

          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>លេខសមាជិក</th>
                  <th>ប្រភេទសហព័ទ្ធ</th>
                  <th>កាលបរិច្ឆេទចូលរួម</th>
                  <th>តួនាទី</th>
                  <th>ស្ថានភាព</th>
                  <th>ផ្សេងៗ</th>
                  <th>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.unionInfo || employee.unionInfo.length === 0">
                  <td colspan="7" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(item, i) in employee.unionInfo" :key="i">
                  <td>{{ item.memberNo || '-' }}</td>
                  <td>{{ item.unionType || '-' }}</td>
                  <td>{{ formatDateKH(item.joinDate) || '-' }}</td>
                  <td>{{ item.role || '-' }}</td>
                  <td>{{ item.status || '-' }}</td>
                  <td>{{ item.remarks || '-' }}</td>
                  <td>
                    <button class="action-btn" @click="editRecord('union', i)">
                      <i class="pi pi-pencil"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 7: កម្រិតវប្បធម៌ (Cultural Level) -->
        <div v-show="activeTab === 7" class="tab-panel">
          <div class="form-actions">
            <button class="btn-add" @click="addRecord('cultural')">
              + បញ្ចូលកម្រិតវប្បធម៌
            </button>
          </div>

          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>កម្រិតវប្បធម៌</th>
                  <th>ឆ្នាំបញ្ចប់</th>
                  <th>សាលារៀន/ស្ថាប័ន</th>
                  <th>ជំនាញ</th>
                  <th>សញ្ញាបត្រ</th>
                  <th>ផ្សេងៗ</th>
                  <th>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.culturalLevels || employee.culturalLevels.length === 0">
                  <td colspan="7" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(item, i) in employee.culturalLevels" :key="i">
                  <td>{{ item.level || '-' }}</td>
                  <td>{{ item.graduationYear || '-' }}</td>
                  <td>{{ item.institution || '-' }}</td>
                  <td>{{ item.major || '-' }}</td>
                  <td>{{ item.certificate || '-' }}</td>
                  <td>{{ item.remarks || '-' }}</td>
                  <td>
                    <button class="action-btn" @click="editRecord('cultural', i)">
                      <i class="pi pi-pencil"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 8: ឯកសារពាក់ព័ន្ធ (Related Documents) -->
        <div v-show="activeTab === 8" class="tab-panel">
          <div class="form-actions">
            <button class="btn-add" @click="addRecord('document')">
              + បញ្ចូលឯកសារពាក់ព័ន្ធ
            </button>
          </div>

          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>ឈ្មោះឯកសារ</th>
                  <th>ប្រភេទឯកសារ</th>
                  <th>លេខឯកសារ</th>
                  <th>កាលបរិច្ឆេទ</th>
                  <th>ឯកសារភ្ជាប់</th>
                  <th>ផ្សេងៗ</th>
                  <th>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.relatedDocuments || employee.relatedDocuments.length === 0">
                  <td colspan="7" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(item, i) in employee.relatedDocuments" :key="i">
                  <td>{{ item.documentName || '-' }}</td>
                  <td>{{ item.documentType || '-' }}</td>
                  <td>{{ item.documentNo || '-' }}</td>
                  <td>{{ formatDateKH(item.date) || '-' }}</td>
                  <td>
                    <a v-if="item.attachment" :href="item.attachment" target="_blank" class="file-link">
                      <i class="pi pi-file-pdf"></i> មើល
                    </a>
                    <span v-else>-</span>
                  </td>
                  <td>{{ item.remarks || '-' }}</td>
                  <td>
                    <button class="action-btn" @click="editRecord('document', i)">
                      <i class="pi pi-pencil"></i>
                    </button>
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
  { label: 'ស្ថានភាពមន្ត្រី', icon: 'pi pi-check-circle' },
  { label: 'ឋានន្តរស័ក្តិ និងថ្នាក់', icon: 'pi pi-star' },
  { label: 'មុខតំណែង', icon: 'pi pi-briefcase' },
  { label: 'វិស័យឯកជន', icon: 'pi pi-building' },
  { label: 'ការលើកសរសើរ', icon: 'pi pi-trophy' },
  { label: 'ការដាក់ពិន័យ', icon: 'pi pi-exclamation-triangle' },
  { label: 'ព័ត៌មានសហព័ទ្ធ', icon: 'pi pi-users' },
  { label: 'កម្រិតវប្បធម៌', icon: 'pi pi-book' },
  { label: 'ឯកសារពាក់ព័ន្ធ', icon: 'pi pi-file' }
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
  font-family: 'Siemreap', cursive;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: #6366f1;
  font-size: 1.1rem;
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
  font-family: 'Siemreap', cursive;
  font-size: 12px;
  color: #6b7280;
}

.info-value {
  font-family: 'Siemreap', cursive;
  font-size: 12px;
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
  font-family: 'Siemreap', cursive;
  font-size: 12px;
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
  font-family: 'Siemreap', cursive;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.field input,
.field select {
  font-family: 'Siemreap', cursive;
  font-size: 12px;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
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
  font-family: 'Siemreap', cursive;
  font-size: 12px;
}

.data-table thead {
  background: #f9fafb;
}

.data-table th {
  font-family: 'Siemreap', cursive;
  font-size: 12px;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.data-table td {
  font-family: 'Siemreap', cursive;
  font-size: 12px;
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

.table-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: transform 0.2s;
}

.table-image:hover {
  transform: scale(1.1);
}

.table-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
}

.file-link {
  font-family: 'Siemreap', cursive;
  font-size: 12px;
  color: #2563eb;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: color 0.2s;
}

.file-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
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
