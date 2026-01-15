<template>
  <div class="employee-detail-page">
    <!-- Breadcrumb -->
    <nav class="breadcrumb">
      <router-link to="/" class="breadcrumb-link">ទំព័រដើម</router-link>
      <span class="breadcrumb-sep">»</span>
      <router-link to="/employees" class="breadcrumb-link active">គ្រប់គ្រងបុគ្គលិក មន្រ្តីរាជការ</router-link>
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
            <button class="btn-edit-blue" @click="editInstallationDate">
              កែប្រែកាលបរិច្ឆេទតាំងស៊ប់
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
                    <button class="action-btn" @click="editRecord('civilStatus', i)" title="កែសម្រួល">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button class="action-btn delete" @click="deleteRecord('civilStatus', i)" title="លុប">
                      <i class="pi pi-trash"></i>
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
                    <button class="action-btn" @click="editRecord('rankGrade', i)" title="កែសម្រួល">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button class="action-btn delete" @click="deleteRecord('rankGrade', i)" title="លុប">
                      <i class="pi pi-trash"></i>
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
                    <button class="action-btn" @click="editRecord('position', i)" title="កែសម្រួល">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button class="action-btn delete" @click="deleteRecord('position', i)" title="លុប">
                      <i class="pi pi-trash"></i>
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
                    <button class="action-btn" @click="editRecord('privateSector', i)" title="កែសម្រួល">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button class="action-btn delete" @click="deleteRecord('privateSector', i)" title="លុប">
                      <i class="pi pi-trash"></i>
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
                    <button class="action-btn" @click="editRecord('award', i)" title="កែសម្រួល">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button class="action-btn delete" @click="deleteRecord('award', i)" title="លុប">
                      <i class="pi pi-trash"></i>
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
                    <button class="action-btn" @click="editRecord('disciplinary', i)" title="កែសម្រួល">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button class="action-btn delete" @click="deleteRecord('disciplinary', i)" title="លុប">
                      <i class="pi pi-trash"></i>
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
                    <button class="action-btn" @click="editRecord('union', i)" title="កែសម្រួល">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button class="action-btn delete" @click="deleteRecord('union', i)" title="លុប">
                      <i class="pi pi-trash"></i>
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
                    <button class="action-btn" @click="editRecord('cultural', i)" title="កែសម្រួល">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button class="action-btn delete" @click="deleteRecord('cultural', i)" title="លុប">
                      <i class="pi pi-trash"></i>
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
                    <button class="action-btn" @click="editRecord('document', i)" title="កែសម្រួល">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button class="action-btn delete" @click="deleteRecord('document', i)" title="លុប">
                      <i class="pi pi-trash"></i>
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

    <!-- Dialog for Adding/Editing Records -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog-container" @click.stop>
        <div class="dialog-header">
          <h3>{{ dialogTitle }}</h3>
          <button class="btn-close" @click="closeDialog">
            <i class="pi pi-times"></i>
          </button>
        </div>
        
        <div class="dialog-body">
          <!-- Civil Status Form -->
          <div v-if="dialogType === 'civilStatus'" class="form-grid">
            <div class="form-field">
              <label>លេខលិខិត</label>
              <input v-model="formData.letterNo" type="text" placeholder="លេខលិខិត" />
            </div>
            <div class="form-field">
              <label>ប្រភេទលិខិត</label>
              <select v-model="formData.letterType">
                <option value="">ជ្រើសរើស</option>
                <option v-for="option in letterTypes" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div class="form-field">
              <label>ប្រភេទមន្ត្រី</label>
              <select v-model="formData.employeeType">
                <option value="">ជ្រើសរើស</option>
                <option v-for="option in employeeTypes" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div class="form-field">
              <label>ស្ថានភាព</label>
              <select v-model="formData.status">
                <option value="">ជ្រើសរើស</option>
                <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div class="form-field">
              <label>ក្រសួង-ស្ថាប័ន</label>
              <select v-model="formData.ministry">
                <option value="">ជ្រើសរើស</option>
                <option v-for="option in ministries" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div class="form-field">
              <label>កាលបរិច្ឆេទចាប់ផ្តើម*</label>
              <input v-model="formData.startDate" type="date" />
            </div>
            <div class="form-field">
              <label>បច្ចុប្បន្ន</label>
              <button class="btn-toggle" :class="{ active: formData.isCurrent }" @click="formData.isCurrent = !formData.isCurrent">
                <i :class="formData.isCurrent ? 'pi pi-check' : 'pi pi-times'"></i>
                {{ formData.isCurrent ? 'បាទ' : 'ទេ' }}
              </button>
            </div>
            <div class="form-field">
              <label>កាលបរិច្ឆេទបញ្ចប់</label>
              <input v-model="formData.endDate" type="date" :disabled="formData.isCurrent" />
            </div>
            <div class="form-field full-width">
              <label>កំណត់សម្គាល់</label>
              <textarea v-model="formData.other" placeholder="កំណត់សម្គាល់" rows="3"></textarea>
            </div>
          </div>

          <!-- Rank and Grade Form -->
          <div v-if="dialogType === 'rankGrade'" class="form-grid">
            <div class="form-field">
              <label>លេខលិខិតយោង</label>
              <input v-model="formData.referenceLetterNo" type="text" placeholder="លេខលិខិតយោង" />
            </div>
            <div class="form-field">
              <label>កាលបរិច្ឆេទចាប់ផ្តើម</label>
              <input v-model="formData.startDate" type="date" />
            </div>
            <div class="form-field">
              <label>បច្ចុប្បន្ន</label>
              <button class="btn-toggle" :class="{ active: formData.isCurrent }" @click="formData.isCurrent = !formData.isCurrent">
                <i :class="formData.isCurrent ? 'pi pi-check' : 'pi pi-times'"></i>
                {{ formData.isCurrent ? 'បាទ' : 'ទេ' }}
              </button>
            </div>
            <div class="form-field">
              <label>កាលបរិច្ឆេទបញ្ចប់</label>
              <input v-model="formData.endDate" type="date" :disabled="formData.isCurrent" />
            </div>
            <div class="form-field">
              <label>ប្រភេទលិខិត</label>
              <select v-model="formData.documentType">
                <option value="">ជ្រើសរើស</option>
                <option v-for="option in documentTypes" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div class="form-field">
              <label>ប្រភេទលក្ខន្តិកៈ</label>
              <select v-model="formData.characteristicType">
                <option value="">ជ្រើសរើស</option>
                <option v-for="option in characteristicTypes" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div class="form-field">
              <label>ប្រភេទការតម្លើង</label>
              <select v-model="formData.installationType">
                <option value="">ជ្រើសរើស</option>
                <option v-for="option in installationTypes" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div class="form-field">
              <label>ក្របខ័ណ្ឌ</label>
              <select v-model="formData.framework">
                <option value="">ជ្រើសរើស</option>
                <option v-for="option in computedFrameworks" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div class="form-field">
              <label>ឋានន្តរស័ក្តិ និងថ្នាក់</label>
              <select v-model="formData.rankAndGrade">
                <option value="">ជ្រើសរើស</option>
                <option v-for="option in computedRankGradeOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div class="form-field">
              <label>ថ្នាក់ (PayScale)</label>
              <select v-model="formData.payScale">
                <option value="">ជ្រើសរើស</option>
                <option v-for="option in computedRankClassOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div class="form-field full-width">
              <label>ផ្សេងៗ</label>
              <textarea v-model="formData.remarks" placeholder="ផ្សេងៗ" rows="3"></textarea>
            </div>
          </div>

          <!-- Position Form -->
          <div v-if="dialogType === 'position'" class="form-grid">
            <div class="form-field">
              <label>លេខលិខិត</label>
              <input v-model="formData.letterNo" type="text" placeholder="លេខលិខិត" />
            </div>
            <div class="form-field">
              <label>មុខតំណែង</label>
              <input v-model="formData.position" type="text" placeholder="មុខតំណែង" />
            </div>
            <div class="form-field">
              <label>ឋានៈស្មើ</label>
              <input v-model="formData.equivalentRank" type="text" placeholder="ឋានៈស្មើ" />
            </div>
            <div class="form-field">
              <label>ថ្ងៃចុះហត្ថលេខា</label>
              <input v-model="formData.signatureDate" type="date" />
            </div>
            <div class="form-field">
              <label>ថ្ងៃបញ្ចប់</label>
              <input v-model="formData.endDate" type="date" />
            </div>
            <div class="form-field">
              <label>ក្រសួង-ស្ថាប័ន</label>
              <input v-model="formData.ministryInstitution" type="text" placeholder="ក្រសួង-ស្ថាប័ន" />
            </div>
            <div class="form-field full-width">
              <label>ផ្សេងៗ</label>
              <textarea v-model="formData.remarks" placeholder="ផ្សេងៗ" rows="3"></textarea>
            </div>
          </div>

          <!-- Private Sector Form -->
          <div v-if="dialogType === 'privateSector'" class="form-grid">
            <div class="form-field">
              <label>គ្រឹះស្ថាន-អង្គភាព</label>
              <input v-model="formData.institution" type="text" placeholder="គ្រឹះស្ថាន-អង្គភាព" />
            </div>
            <div class="form-field">
              <label>តួនាទី</label>
              <input v-model="formData.role" type="text" placeholder="តួនាទី" />
            </div>
            <div class="form-field">
              <label>ជំនាញ/បច្ចេកទេស</label>
              <input v-model="formData.skill" type="text" placeholder="ជំនាញ/បច្ចេកទេស" />
            </div>
            <div class="form-field">
              <label>ថ្ងៃចូលបម្រើការងារ</label>
              <input v-model="formData.startDate" type="date" />
            </div>
            <div class="form-field">
              <label>ថ្ងៃបញ្ចប់ការងារ</label>
              <input v-model="formData.endDate" type="date" />
            </div>
            <div class="form-field full-width">
              <label>ផ្សេងៗ</label>
              <textarea v-model="formData.remarks" placeholder="ផ្សេងៗ" rows="3"></textarea>
            </div>
          </div>

          <!-- Award Form -->
          <div v-if="dialogType === 'award'" class="form-grid">
            <div class="form-field">
              <label>លេខលិខិតយោង</label>
              <input v-model="formData.referenceLetterNo" type="text" placeholder="លេខលិខិតយោង" />
            </div>
            <div class="form-field">
              <label>ប្រភេទការលើកសរសើរ</label>
              <input v-model="formData.awardType" type="text" placeholder="ប្រភេទការលើកសរសើរ" />
            </div>
            <div class="form-field">
              <label>កាលបរិច្ឆេទ</label>
              <input v-model="formData.date" type="date" />
            </div>
            <div class="form-field">
              <label>ក្រសួង-ស្ថាប័ន</label>
              <input v-model="formData.ministryInstitution" type="text" placeholder="ក្រសួង-ស្ថាប័ន" />
            </div>
            <div class="form-field full-width">
              <label>រូបភាពលើកសរសើរ (URL)</label>
              <input v-model="formData.awardImage" type="text" placeholder="URL រូបភាព" />
            </div>
            <div class="form-field full-width">
              <label>ផ្សេងៗ</label>
              <textarea v-model="formData.remarks" placeholder="ផ្សេងៗ" rows="3"></textarea>
            </div>
          </div>

          <!-- Disciplinary Action Form -->
          <div v-if="dialogType === 'disciplinary'" class="form-grid">
            <div class="form-field">
              <label>លេខលិខិតយោង</label>
              <input v-model="formData.referenceLetterNo" type="text" placeholder="លេខលិខិតយោង" />
            </div>
            <div class="form-field">
              <label>ប្រភេទការដាក់ពិន័យ</label>
              <input v-model="formData.actionType" type="text" placeholder="ប្រភេទការដាក់ពិន័យ" />
            </div>
            <div class="form-field">
              <label>កាលបរិច្ឆេទ</label>
              <input v-model="formData.date" type="date" />
            </div>
            <div class="form-field">
              <label>ក្រសួង-ស្ថាប័ន</label>
              <input v-model="formData.ministryInstitution" type="text" placeholder="ក្រសួង-ស្ថាប័ន" />
            </div>
            <div class="form-field full-width">
              <label>រូបភាពការដាក់ពិន័យ (URL)</label>
              <input v-model="formData.actionImage" type="text" placeholder="URL រូបភាព" />
            </div>
            <div class="form-field full-width">
              <label>ផ្សេងៗ</label>
              <textarea v-model="formData.remarks" placeholder="ផ្សេងៗ" rows="3"></textarea>
            </div>
          </div>

          <!-- Union Info Form -->
          <div v-if="dialogType === 'union'" class="form-grid">
            <div class="form-field">
              <label>លេខសមាជិក</label>
              <input v-model="formData.memberNo" type="text" placeholder="លេខសមាជិក" />
            </div>
            <div class="form-field">
              <label>ប្រភេទសហព័ទ្ធ</label>
              <input v-model="formData.unionType" type="text" placeholder="ប្រភេទសហព័ទ្ធ" />
            </div>
            <div class="form-field">
              <label>កាលបរិច្ឆេទចូលរួម</label>
              <input v-model="formData.joinDate" type="date" />
            </div>
            <div class="form-field">
              <label>តួនាទី</label>
              <input v-model="formData.role" type="text" placeholder="តួនាទី" />
            </div>
            <div class="form-field">
              <label>ស្ថានភាព</label>
              <input v-model="formData.status" type="text" placeholder="ស្ថានភាព" />
            </div>
            <div class="form-field full-width">
              <label>ផ្សេងៗ</label>
              <textarea v-model="formData.remarks" placeholder="ផ្សេងៗ" rows="3"></textarea>
            </div>
          </div>

          <!-- Cultural Level Form -->
          <div v-if="dialogType === 'cultural'" class="form-grid">
            <div class="form-field">
              <label>កម្រិតវប្បធម៌</label>
              <input v-model="formData.level" type="text" placeholder="កម្រិតវប្បធម៌" />
            </div>
            <div class="form-field">
              <label>ឆ្នាំបញ្ចប់</label>
              <input v-model="formData.graduationYear" type="text" placeholder="ឆ្នាំបញ្ចប់" />
            </div>
            <div class="form-field">
              <label>សាលារៀន/ស្ថាប័ន</label>
              <input v-model="formData.institution" type="text" placeholder="សាលារៀន/ស្ថាប័ន" />
            </div>
            <div class="form-field">
              <label>ជំនាញ</label>
              <input v-model="formData.major" type="text" placeholder="ជំនាញ" />
            </div>
            <div class="form-field">
              <label>សញ្ញាបត្រ</label>
              <input v-model="formData.certificate" type="text" placeholder="សញ្ញាបត្រ" />
            </div>
            <div class="form-field full-width">
              <label>ផ្សេងៗ</label>
              <textarea v-model="formData.remarks" placeholder="ផ្សេងៗ" rows="3"></textarea>
            </div>
          </div>

          <!-- Related Document Form -->
          <div v-if="dialogType === 'document'" class="form-grid">
            <div class="form-field">
              <label>ឈ្មោះឯកសារ</label>
              <input v-model="formData.documentName" type="text" placeholder="ឈ្មោះឯកសារ" />
            </div>
            <div class="form-field">
              <label>ប្រភេទឯកសារ</label>
              <input v-model="formData.documentType" type="text" placeholder="ប្រភេទឯកសារ" />
            </div>
            <div class="form-field">
              <label>លេខឯកសារ</label>
              <input v-model="formData.documentNo" type="text" placeholder="លេខឯកសារ" />
            </div>
            <div class="form-field">
              <label>កាលបរិច្ឆេទ</label>
              <input v-model="formData.date" type="date" />
            </div>
            <div class="form-field full-width">
              <label>ឯកសារភ្ជាប់ (URL)</label>
              <input v-model="formData.attachment" type="text" placeholder="URL ឯកសារ" />
            </div>
            <div class="form-field full-width">
              <label>ផ្សេងៗ</label>
              <textarea v-model="formData.remarks" placeholder="ផ្សេងៗ" rows="3"></textarea>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn-cancel" @click="closeDialog">បោះបង់</button>
          <button class="btn-save" @click="saveRecord">រក្សាទុក</button>
        </div>
      </div>
    </div>

    <!-- Dialog for Installation Date -->
    <div v-if="showInstallationDialog" class="dialog-overlay" @click="closeInstallationDialog">
      <div class="dialog-container" @click.stop style="max-width: 400px;">
        <div class="dialog-header">
          <h3>កែប្រែកាលបរិច្ឆេទតាំងស៊ប់</h3>
          <button class="btn-close" @click="closeInstallationDialog">
            <i class="pi pi-times"></i>
          </button>
        </div>
        
        <div class="dialog-body">
          <div class="form-grid">
            <div class="form-field full-width">
              <label>កាលបរិច្ឆេទតាំងស៊ប់</label>
              <input 
                v-model="installationDate" 
                type="datetime-local" 
                class="datetime-input"
                :disabled="false"
              />
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn-cancel" @click="closeInstallationDialog">បោះបង់</button>
          <button class="btn-save" @click="saveInstallationDate">រក្សាទុក</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api.js';

const route = useRoute();
const router = useRouter();

const employee = ref(null);
const loading = ref(true);
const activeTab = ref(0);
const showDialog = ref(false);
const dialogType = ref('');
const dialogTitle = ref('');
const formData = ref({});
const editIndex = ref(-1);
const showInstallationDialog = ref(false);
const installationDate = ref('');

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

// Dropdown options for civil status tab
const letterTypes = [
  'ព្រះរាជក្រម',
  'ព្រះរាជក្រឹត្យ',
  'អនុក្រឹត្យ',
  'ប្រកាស',
  'ដីកា',
  'សារាចរ',
  'សារាចរណែនាំ',
  'សេចក្តីប្រកាស',
  'សេចក្តីជូនដំណឹង',
  'សេចក្តីសម្រេចរាជរដ្ឋាភិបាល',
  'សេចក្តីសម្រេចក្រសួង',
  'លិខិតរដ្ឋបាល',
  'លិខិតសាម៉ីខ្លួន',
  'ដីការតុលាការ',
  'លិខិតបង្គាប់ការ',
  'លិខិតបញ្ជាក់',
  'សេចក្តីសម្រេចថ្នាក់មូលដ្ឋាន',
  'កំណែធម្មតា',
  'លិខិតឧទ្ទេសនាម'
];

const employeeTypes = [
  'មន្ត្រីពេញសិទ្ធ/មន្ត្រី',
  'ក្របខណ្ឌ មន្ត្រីកិច្ចសន្យា',
  'មន្ត្រីកម្មសិក្សា',
  'គ្មានក្របខណ្ឌ',
  'និវត្តជន',
  'ទីប្រឹក្សាបច្ចេកទេស'
];

const statusOptions = [
  'ថ្នាក់ដឹកនាំ',
  'មន្ត្រី សកម្ម',
  'មន្ត្រី ផ្ទេរចេញ',
  'មន្ត្រី ផ្ទេរចូល',
  'មន្ត្រី ស្ថិតនៅក្នុងភាពទំនេរគ្មានបៀវត្ស',
  'មន្ត្រី ស្ថិតនៅក្រៅក្របខ័ណ្ឌដើម',
  'មន្ត្រី ជាប់បេសកកម្មក្នុងប្រទេស',
  'មន្ត្រី ជាប់បេសកកម្មក្រៅប្រទេស',
  'មន្ត្រី ជាប់សិក្សាក្នុងប្រទេស',
  'មន្ត្រី ជាប់សិក្សាក្រៅប្រទេស',
  'មន្ត្រី ស្ថិតក្នុងរយៈពេលកម្មសិក្សា',
  'មន្ត្រី បាត់បង់សម្ថភាពពលកម្ម',
  'មន្ត្រី មានជំងឺរាំរ៉ៃ',
  'មន្ត្រី ដល់អាយុចូលនិវត្តន្តិ និង ចូលនិវត្តន៏',
  'មន្ត្រី ស្លាប់',
  'មន្ត្រី ជាប់ទណ្ឌកម្មដោយសាលក្រម ឬ សាលដីកា',
  'មន្ត្រី បោះបង់ចោលការងារ',
  'មន្ត្រី សុំលាឈប់ពីការងារ',
  'មន្ត្រី ត្រូវបានលប់ឈ្មោះ',
  'មន្ត្រី ស៊ីឈ្មោះគេ',
  'មន្ត្រី ក្រោយពីជំរឿន',
  'មន្ត្រី សកម្មក្រោយពីជំរឿន',
  'មន្ត្រី ទីប្រឹក្សា',
  'មន្ត្រី ជំនួយការ',
  'មន្ត្រី បំរើការងារពីរកន្លង',
  'មន្ត្រី ត្រូវបានប្ដូរអត្តលេខ',
  'អត្តលេខលប់',
  'បម្រុង',
  'និរាករ',
  'មន្ត្រី មិនទាន់បានប្រាក់ឧបត្ថម ចូលនិវត្តន៏',
  'មន្ត្រី រង់ចាំប្រាក់ឧបត្ថម្ភ ចូលនិវត្តន៏'
];

const ministries = [
  '1-ក្រសួងកសិកម្ម រុក្ខាប្រមាញ់ និងនេសាទ',
  '2-ក្រសួងអធិការកិច្ច',
  '3-អាកាសចរស៊ីវិល',
  '4-ក្រសួងមុខងារសាធារណៈ',
  '5-ក្រសួងពាណិជ្ជកម្ម',
  '6-ទីស្តីការគណៈរដ្ឋមន្ត្រី',
  '7-ក្រសួងធម្មការ និងសាសនា',
  '8-ក្រសួងវប្បធម៌ និង វិចិត្រសិល្បៈ',
  '9-ក្រសួងសេដ្ឋកិច្ច និង ហិរញ្ញវត្ថុ',
  '10-ក្រសួងអប់រំ យុវជន និង កីឡា',
  '11-ក្រសួងបរិស្ថាន',
  '12-ក្រសួងការបរទេស និង សហប្រតិបត្តិការអន្តរជាតិ',
  '13-ក្រសួងសុខាភិបាល',
  '14-ក្រសួងឧស្សាហកម្ម វិទ្យាសាស្រ្ត បច្ចេកវិទ្យា និងនវានុវត្តន៍',
  '15-ក្រសួងព័ត៌មាន',
  '16-ក្រសួងមហាផ្ទៃ',
  '17-ក្រសួងយុត្តិធម៌',
  '18-ក្រសួងការពារជាតិ',
  '19-ក្រសួងផែនការ',
  '20-ក្រសួងប្រៃសណ៍យ៍ និងទូរគមនាគមន៍',
  '21-ក្រសួងសាធារណការ និង ដឹកជញ្ជូន',
  '22-ក្រសួងព្រះបរមរាជវាំង',
  '23-ក្រសួងអភិវឌ្ឍន៍ជនបទ',
  '24-ក្រសួងសង្គមកិច្ច អតីតយុទ្ធជន និងយុវនីតិសម្បទា',
  '25-ក្រសួងទេសចរណ៍',
  '26-ក្រសួងរៀបចំដែនដី នគរូបនីយកម្ម និង សំណង់',
  '27-ក្រសួងធនធានទឹក និង ឧតុនិយម',
  '28-ក្រសួងកិច្ចការនារី',
  '29-តុលាការកំពូល',
  '31-ក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ',
  '32-អង្គភាពប្រឆាំងអំពើពុករលួយ',
  '33-ក្រសួងរ៉ែ និងថាមពល',
  '34-សាលាឧទ្ធរណ៍',
  '37-រដ្ឋលេខាធិការដ្ឋានកិច្ចការព្រំដែន',
  '7299-រដ្ឋលេខាធិការដ្ឋានមុខងារសាធារណ',
  '7309-ធនាគាជាតិនៃកម្ពុជា',
  '7326-ព្រឹទ្ធសភាជាតិ',
  '7337-រដ្ឋសភាជាតិ',
  '7346-គណៈកម្មាធិការជាតិរៀបចំការបោះឆ្នោត (គ.ជ.ប)',
  '7357-អង្គជំនុំជម្រះវិសាមញ្ញក្នុងតុលាការ',
  '8244-សមាគមន៍នារីមជ្ឈឹម',
  '8245-សហព័ន្ធសហជីពកម្ពុជា',
  '8254-ក្រសួងត្រួតពិនិត្យកិច្ចការរដ្ឋ',
  '9688-ក្រុមប្រឹក្សាអភិវឌ្ឍន៍កម្ពុជា',
  '10352-អាជ្ញាធរសវនកម្មជាតិ'
];

// Dropdown options for rank and grade tab
const characteristicTypes = [
  'រដ្ឋបាលទូទៅ',
  'ក្រសួងមហាផ្ទៃ',
  'ការទូត',
  'អប់រំ',
  'សុខាភិបាល',
  'បច្ចេកទេស',
  'លក្ខន្តិកៈដោយឡែកនៃក្របខណ្ឌមន្រ្តីរាជការនៃ គ.ជ.ប',
  'លក្ខន្តិកៈដោយឡែកនៃក្របខណ្ឌ ចៅក្រម និងព្រះរាជអាជ្ញា',
  'លក្ខន្តិកៈដោយឡែកនៃក្របខណ្ឌមន្រ្តីពន្ធនាគារ ក្រសួងមហផ្ទៃ',
  'លក្ខន្តិកៈដោយឡែកនៃក្របខណ្ឌមន្រ្តីនគរបាលជាតិ ក្រសួងមហផ្ទៃ',
  'លក្ខន្តិកៈទូទៅចំពោះយោធិននៃកងយោធពលខេមរភូមិន្ទ'
];

const frameworks = [
  'ក្របខ័ណ្ឌមន្រ្តីសុខាភិបាលបឋម',
  'ក្របខ័ណ្ឌមន្រ្តីសុខាភិបាលមធ្យម',
  'ក្របខ័ណ្ឌមន្រ្តីសុខាភិបាលជាន់ខ្ពស់'
];

// Mapping of framework to rank options
const rankGradeMapping = {
  'ក្របខ័ណ្ឌមន្រ្តីសុខាភិបាលបឋម': [
    'មន្រ្តីសុខាភិបាលបឋម(គ)'
  ],
  'ក្របខ័ណ្ឌមន្រ្តីសុខាភិបាលមធ្យម': [
    'មន្រ្តីសុខាភិបាលមធ្យម ដើមខ្សែពិសេស(ខ.១.)',
    'មន្រ្តីសុខាភិបាលមធ្យម ដើមខ្សែ(ខ.២.)',
    'មន្រ្តីសុខាភិបាលមធ្យម (ខ.៣.)'
  ],
  'ក្របខ័ណ្ឌមន្រ្តីសុខាភិបាលជាន់ខ្ពស់': [
    'មន្រ្តីសុខាភិបាលជាន់ខ្ពស់ ដើមខ្សែពិសេស(ក.១.)',
    'មន្រ្តីសុខាភិបាលជាន់ខ្ពស់ ដើមខ្សែ(ក.២.)',
    'មន្រ្តីសុខាភិបាលជាន់ខ្ពស់ (ក.៣.)'
  ],
  'មន្រ្តីបច្ចេកទេសបឋម': [
    'មន្រ្តីបច្ចេកទេសបឋម(គ)'
  ],
  'មន្រ្តីបច្ចេកទេសមធ្យម': [
    'មន្រ្តីបច្ចេកទេសមធ្យម ដើមខ្សែពិសេស(ខ.១.)',
    'មន្រ្តីបច្ចេកទេសមធ្យម ដើមខ្សែ(ខ.២.)',
    'មន្រ្តីបច្ចេកទេសមធ្យម (ខ.៣.)'
  ],
  'មន្រ្តីបច្ចេកទេសជាន់ខ្ពស់': [
    'មន្រ្តីបច្ចេកទេសជាន់ខ្ពស់ ដើមខ្សែពិសេស(ក.១.)',
    'មន្រ្តីបច្ចេកទេសជាន់ខ្ពស់ ដើមខ្សែ(ក.២.)',
    'មន្រ្តីបច្ចេកទេសជាន់ខ្ពស់(ក.៣.)'
  ],
  'មន្រ្តីគ្រប់គ្រងរដ្ឋបាល': [
    'ឧត្តមន្ត្រី(ក.១.)',
    'វរៈមន្រ្តី(ក.២.)',
    'អនុមន្រ្តី(ក.៣.)'
  ],
  'មន្រ្តីក្រមការ': [
    'នាយក្រមការ(ខ.២.)',
    'ក្រមការដើមខ្សែ(ខ.២.)',
    'ក្រមការ(ខ.៣.)'
  ],
  'លេខាធិការរដ្ឋបាល': [
    'លេខាធិការរដ្ឋបាល(គ)'
  ]
};

// Mapping of rank to class options
const rankClassMapping = {
  'មន្រ្តីសុខាភិបាលបឋម(គ)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤',
    'ថ្នាក់លេខ៥',
    'ថ្នាក់លេខ៦',
    'ថ្នាក់លេខ៧',
    'ថ្នាក់លេខ៨',
    'ថ្នាក់លេខ៩',
    'ថ្នាក់លេខ១០'
  ],
  'មន្រ្តីសុខាភិបាលមធ្យម ដើមខ្សែពិសេស(ខ.១.)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤',
    'ថ្នាក់លេខ៥',
    'ថ្នាក់លេខ៦'
  ],
  'មន្រ្តីសុខាភិបាលមធ្យម ដើមខ្សែ(ខ.២.)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤'
  ],
  'មន្រ្តីសុខាភិបាលមធ្យម (ខ.៣.)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤'
  ],
  'មន្រ្តីសុខាភិបាលជាន់ខ្ពស់ ដើមខ្សែពិសេស(ក.១.)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤',
    'ថ្នាក់លេខ៥',
    'ថ្នាក់លេខ៦'
  ],
  'មន្រ្តីសុខាភិបាលជាន់ខ្ពស់ ដើមខ្សែ(ក.២.)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤'
  ],
  'មន្រ្តីសុខាភិបាលជាន់ខ្ពស់ (ក.៣.)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤'
  ],
  'មន្រ្តីបច្ចេកទេសបឋម(គ)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤',
    'ថ្នាក់លេខ៥',
    'ថ្នាក់លេខ៦',
    'ថ្នាក់លេខ៧',
    'ថ្នាក់លេខ៨',
    'ថ្នាក់លេខ៩',
    'ថ្នាក់លេខ១០'
  ],
  'មន្រ្តីបច្ចេកទេសមធ្យម ដើមខ្សែពិសេស(ខ.១.)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤',
    'ថ្នាក់លេខ៥',
    'ថ្នាក់លេខ៦'
  ],
  'មន្រ្តីបច្ចេកទេសមធ្យម ដើមខ្សែ(ខ.២.)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤'
  ],
  'មន្រ្តីបច្ចេកទេសមធ្យម (ខ.៣.)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤'
  ],
  'មន្រ្តីបច្ចេកទេសជាន់ខ្ពស់ ដើមខ្សែពិសេស(ក.១.)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤',
    'ថ្នាក់លេខ៥',
    'ថ្នាក់លេខ៦'
  ],
  'មន្រ្តីបច្ចេកទេសជាន់ខ្ពស់ ដើមខ្សែ(ក.២.)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤'
  ],
  'មន្រ្តីបច្ចេកទេសជាន់ខ្ពស់(ក.៣.)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤'
  ],
  'ឧត្តមន្ត្រី(ក.១.)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤',
    'ថ្នាក់លេខ៥',
    'ថ្នាក់លេខ៦'
  ],
  'វរៈមន្រ្តី(ក.២.)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤'
  ],
  'អនុមន្រ្តី(ក.៣.)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤'
  ],
  'នាយក្រមការ(ខ.២.)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤',
    'ថ្នាក់លេខ៥'
  ],
  'ក្រមការដើមខ្សែ(ខ.២.)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤'
  ],
  'ក្រមការ(ខ.៣.)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤'
  ],
  'លេខាធិការរដ្ឋបាល(គ)': [
    'ថ្នាក់លេខ១',
    'ថ្នាក់លេខ២',
    'ថ្នាក់លេខ៣',
    'ថ្នាក់លេខ៤',
    'ថ្នាក់លេខ៥',
    'ថ្នាក់លេខ៦',
    'ថ្នាក់លេខ៧',
    'ថ្នាក់លេខ៨',
    'ថ្នាក់លេខ៩',
    'ថ្នាក់លេខ១០'
  ]
};

// Dropdown options for document types
const documentTypes = [
  'ជ្រើសរើស',
  'ព្រះរាជក្រម',
  'ព្រះរាជក្រឹត្យ',
  'អនុក្រឹត្យ',
  'ប្រកាស',
  'ដីកា',
  'សារាចរ',
  'សារាចរណែនាំ',
  'សេចក្តីប្រកាស',
  'សេចក្តីជូនដំណឹង',
  'សេចក្តីសម្រេចរាជរដ្ឋាភិបាល',
  'សេចក្តីសម្រេចក្រសួង',
  'លិខិតរដ្ឋបាល',
  'លិខិតសាម៉ីខ្លួន',
  'ដីការតុលាការ',
  'លិខិតបង្គាប់ការ',
  'លិខិតបញ្ជាក់',
  'សេចក្តីសម្រេចថ្នាក់មូលដ្ឋាន',
  'កំណែធម្មតា',
  'លិខិតឧទ្ទេសនាម'
];

// Dropdown options for installation types
const installationTypes = [
  'វេនជ្រើសរើស',
  'សញ្ញាបត្រ',
  'ពិសេស',
  'តាមអតីតភាព',
  'ប្តូរប្រភេទក្របខ័ណ្ឌ',
  'និយ័តកម្មថ្នាក់',
  'មុនសមាហរណកម្មឆ្នាំ២០១៥',
  'ក្របខណ្ឌថ្មី',
  'តាំងស៊ប់'
];

// Computed frameworks based on selected characteristic type
const computedFrameworks = computed(() => {
  const characteristicType = formData.value.characteristicType;
  
  if (characteristicType === 'បច្ចេកទេស') {
    return [
      'មន្រ្តីបច្ចេកទេសបឋម',
      'មន្រ្តីបច្ចេកទេសមធ្យម',
      'មន្រ្តីបច្ចេកទេសជាន់ខ្ពស់'
    ];
  }
  
  if (characteristicType === 'រដ្ឋបាលទូទៅ') {
    return [
      'មន្រ្តីគ្រប់គ្រងរដ្ឋបាល',
      'មន្រ្តីក្រមការ',
      'លេខាធិការរដ្ឋបាល'
    ];
  }
  
  // Default frameworks for other characteristic types
  return frameworks;
});

// Computed rank options based on selected framework
const computedRankGradeOptions = computed(() => {
  const framework = formData.value.framework;
  return rankGradeMapping[framework] || [];
});

// Computed rank class options based on selected rankAndGrade
const computedRankClassOptions = computed(() => {
  const rankGrade = formData.value.rankAndGrade;
  return rankClassMapping[rankGrade] || [];
});


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
  dialogType.value = type;
  editIndex.value = -1;
  formData.value = {};
  
  const titles = {
    civilStatus: 'បញ្ចូលស្ថានភាពមន្ត្រី',
    rankGrade: 'បញ្ចូលឋានន្តរស័ក្តិ និងថ្នាក់',
    position: 'បញ្ចូលមុខតំណែង',
    privateSector: 'បញ្ចូលវិស័យឯកជន',
    award: 'បញ្ចូលការលើកសរសើរ',
    disciplinary: 'បញ្ចូលការដាក់ពិន័យ',
    union: 'បញ្ចូលព័ត៌មានសហព័ទ្ធ',
    cultural: 'បញ្ចូលកម្រិតវប្បធម៌',
    document: 'បញ្ចូលឯកសារពាក់ព័ន្ធ'
  };
  
  dialogTitle.value = titles[type] || 'បញ្ចូលទិន្នន័យ';
  showDialog.value = true;
};

const editInstallationDate = () => {
  // Load current installation date if exists
  if (employee.value && employee.value.installationDate) {
    installationDate.value = employee.value.installationDate;
  } else {
    installationDate.value = '';
  }
  showInstallationDialog.value = true;
};

const closeInstallationDialog = () => {
  showInstallationDialog.value = false;
  installationDate.value = '';
};

const saveInstallationDate = async () => {
  try {
    // Save installation date to employee record
    const response = await api.put(`/api/employees/${employee.value._id}`, {
      ...employee.value,
      installationDate: installationDate.value
    });
    
    employee.value = response.data;
    closeInstallationDialog();
    alert('រក្សាទុកកាលបរិច្ឆេទតាំងស៊ប់បានជោគជ័យ');
  } catch (error) {
    console.error('Error saving installation date:', error);
    alert('មានបញ្ហាក្នុងការរក្សាទុក');
  }
};

const editRecord = (type, index) => {
  dialogType.value = type;
  editIndex.value = index;
  
  const fieldMap = {
    civilStatus: 'civilStatuses',
    rankGrade: 'rankGrades',
    position: 'positions',
    privateSector: 'privateSectors',
    award: 'awards',
    disciplinary: 'disciplinaryActions',
    union: 'unionInfo',
    cultural: 'culturalLevels',
    document: 'relatedDocuments'
  };
  
  const fieldName = fieldMap[type];
  const records = employee.value[fieldName] || [];
  
  if (records[index]) {
    formData.value = { ...records[index] };
  }
  
  const titles = {
    civilStatus: 'កែសម្រួលស្ថានភាពមន្ត្រី',
    rankGrade: 'កែសម្រួលឋានន្តរស័ក្តិ និងថ្នាក់',
    position: 'កែសម្រួលមុខតំណែង',
    privateSector: 'កែសម្រួលវិស័យឯកជន',
    award: 'កែសម្រួលការលើកសរសើរ',
    disciplinary: 'កែសម្រួលការដាក់ពិន័យ',
    union: 'កែសម្រួលព័ត៌មានសហព័ទ្ធ',
    cultural: 'កែសម្រួលកម្រិតវប្បធម៌',
    document: 'កែសម្រួលឯកសារពាក់ព័ន្ធ'
  };
  
  dialogTitle.value = titles[type] || 'កែសម្រួលទិន្នន័យ';
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
  formData.value = {};
  editIndex.value = -1;
};

const saveRecord = async () => {
  try {
    const fieldMap = {
      civilStatus: 'civilStatuses',
      rankGrade: 'rankGrades',
      position: 'positions',
      privateSector: 'privateSectors',
      award: 'awards',
      disciplinary: 'disciplinaryActions',
      union: 'unionInfo',
      cultural: 'culturalLevels',
      document: 'relatedDocuments'
    };
    
    const fieldName = fieldMap[dialogType.value];
    
    if (!employee.value[fieldName]) {
      employee.value[fieldName] = [];
    }
    
    if (editIndex.value >= 0) {
      // Update existing record
      employee.value[fieldName][editIndex.value] = { ...formData.value };
    } else {
      // Add new record
      employee.value[fieldName].push({ ...formData.value });
    }
    
    // Save to backend
    await api.put(`/employees/${route.params.id}`, {
      [fieldName]: employee.value[fieldName]
    });
    
    closeDialog();
    
    // Refresh employee data
    await fetchEmployee();
  } catch (error) {
    console.error('Failed to save record:', error);
    alert('មិនអាចរក្សាទុកទិន្នន័យបានទេ: ' + (error.response?.data?.message || error.message));
  }
};

const deleteRecord = async (type, index) => {
  if (!confirm('តើអ្នកប្រាកដថាចង់លុបទិន្នន័យនេះទេ?')) {
    return;
  }
  
  try {
    const fieldMap = {
      civilStatus: 'civilStatuses',
      rankGrade: 'rankGrades',
      position: 'positions',
      privateSector: 'privateSectors',
      award: 'awards',
      disciplinary: 'disciplinaryActions',
      union: 'unionInfo',
      cultural: 'culturalLevels',
      document: 'relatedDocuments'
    };
    
    const fieldName = fieldMap[type];
    
    if (employee.value[fieldName]) {
      employee.value[fieldName].splice(index, 1);
      
      // Save to backend
      await api.put(`/employees/${route.params.id}`, {
        [fieldName]: employee.value[fieldName]
      });
      
      // Refresh employee data
      await fetchEmployee();
    }
  } catch (error) {
    console.error('Failed to delete record:', error);
    alert('មិនអាចលុបទិន្នន័យបានទេ: ' + (error.response?.data?.message || error.message));
  }
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

.btn-edit-blue {
  padding: 0.625rem 1.25rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-edit-blue:hover {
  background: #2563eb;
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

.action-btn.delete {
  color: #ef4444;
}

.action-btn.delete:hover {
  background: #fef2f2;
  color: #dc2626;
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

/* Dialog Styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.dialog-container {
  background: white;
  border-radius: 0.5rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.dialog-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-field input,
.form-field textarea,
.form-field select {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: 'Khmer OS Siemreap', 'Segoe UI', sans-serif;
  transition: all 0.2s;
}

.form-field input:focus,
.form-field textarea:focus,
.form-field select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-field input:disabled,
.form-field textarea:disabled,
.form-field select:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.datetime-input {
  background-color: white !important;
  color: #111827 !important;
  cursor: text !important;
  opacity: 1 !important;
  width: 100%;
}

.form-field textarea {
  resize: vertical;
  min-height: 80px;
}

.btn-toggle {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: #f3f4f6;
  cursor: pointer;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-toggle:hover {
  border-color: #9ca3af;
  background-color: #e5e7eb;
}

.btn-toggle.active {
  background-color: #10b981;
  color: white;
  border-color: #059669;
}

.btn-toggle.active:hover {
  background-color: #059669;
  border-color: #047857;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-save {
  padding: 0.625rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-family: 'Khmer OS Siemreap', 'Segoe UI', sans-serif;
}

.btn-cancel {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-save {
  background: #6366f1;
  color: white;
}

.btn-save:hover {
  background: #4f46e5;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .dialog-container {
    max-height: 95vh;
  }
}
</style>
