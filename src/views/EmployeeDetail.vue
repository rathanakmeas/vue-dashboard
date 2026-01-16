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
                  <th>កាលបរិច្ឆេទ</th>
                  <th>ប្រភេទលិខិត</th>
                  <th>ក្រសួង-ស្ថាប័ន</th>
                  <th>ប្រភេទការលើកសរសើរ</th>
                  <th>ប្រភេទថ្នាក់</th>
                  <th>រូបភាពលើកសរសើរ</th>
                  <th>កំណត់សម្គាល់</th>
                  <th>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.awards || employee.awards.length === 0">
                  <td colspan="9" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(item, i) in employee.awards" :key="i">
                  <td>{{ item.referenceLetterNo || '-' }}</td>
                  <td>{{ formatDateKH(item.date) || '-' }}</td>
                  <td>{{ item.documentType || '-' }}</td>
                  <td>{{ item.ministryInstitution || '-' }}</td>
                  <td>{{ item.awardType || '-' }}</td>
                  <td>{{ item.awardClass || '-' }}</td>
                  <td>
                    <img v-if="item.awardImage" :src="item.awardImage" alt="Award" class="table-image" />
                    <span v-else>-</span>
                  </td>
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
                  <th>កាលបរិច្ឆេទ</th>
                  <th>ប្រភេទលិខិត</th>
                  <th>ក្រសួង-ស្ថាប័ន</th>
                  <th>ប្រភេទការដាក់ពិន័យ</th>
                  <th>រូបភាព</th>
                  <th>ឯកសារ</th>
                  <th>កំណត់សម្គាល់</th>
                  <th>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.disciplinaryActions || employee.disciplinaryActions.length === 0">
                  <td colspan="9" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(item, i) in employee.disciplinaryActions" :key="i">
                  <td>{{ item.referenceLetterNo || '-' }}</td>
                  <td>{{ formatDateKH(item.date) || '-' }}</td>
                  <td>{{ item.documentType || '-' }}</td>
                  <td>{{ item.ministryInstitution || '-' }}</td>
                  <td>{{ item.actionType || '-' }}</td>
                  <td>
                    <img v-if="item.actionImage" :src="item.actionImage" alt="Disciplinary" class="table-image" />
                    <span v-else>-</span>
                  </td>
                  <td>{{ item.disciplinaryAttachment || '-' }}</td>
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
                  <th>ល.រ</th>
                  <th>លេខកូដឯកសារ</th>
                  <th>ប្រភេទលិខិត</th>
                  <th>លេខលិខិតយោង</th>
                  <th>ឈ្មោះឯកសារ</th>
                  <th>ប្រភេទឯកសារ</th>
                  <th>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!employee.relatedDocuments || employee.relatedDocuments.length === 0">
                  <td colspan="7" class="no-data">មិនមានទិន្នន័យ</td>
                </tr>
                <tr v-for="(item, i) in employee.relatedDocuments" :key="i">
                  <td>{{ i + 1 }}</td>
                  <td>{{ item.documentCode || '-' }}</td>
                  <td>{{ item.letterType || '-' }}</td>
                  <td>{{ item.documentNo || '-' }}</td>
                  <td>{{ item.documentName || '-' }}</td>
                  <td>{{ item.documentType || '-' }}</td>
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
    <div v-if="showDialog" class="dialog-overlay" :class="{ 'centered-overlay': dialogType === 'document' }" @click.self="closeDialog">
      <div class="dialog-container" :class="{ 'blur-content': calendarVisible, 'centered-dialog': dialogType === 'document' }">
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
              <SearchableSelect 
                v-model="formData.letterType" 
                :options="letterTypes" 
                placeholder="ជ្រើសរើសឬស្វែងរក..."
              />
            </div>
            <div class="form-field">
              <label>ប្រភេទមន្ត្រី</label>
              <SearchableSelect 
                v-model="formData.employeeType" 
                :options="employeeTypes" 
                placeholder="ជ្រើសរើសឬស្វែងរក..."
              />
            </div>
            <div class="form-field">
              <label>ស្ថានភាព</label>
              <SearchableSelect 
                v-model="formData.status" 
                :options="statusOptions" 
                placeholder="ជ្រើសរើសឬស្វែងរក..."
              />
            </div>
            <div class="form-field">
              <label>ក្រសួង-ស្ថាប័ន</label>
              <SearchableSelect 
                v-model="formData.ministry" 
                :options="ministries" 
                placeholder="ជ្រើសរើសឬស្វែងរក..."
              />
            </div>
            <div class="form-field">
              <label>កាលបរិច្ឆេទចាប់ផ្តើម*</label>
              <input v-model="formData.startDate" type="date" />
            </div>
            <div class="form-field">
              <label>បច្ចុប្បន្ន</label>
              <div style="display: flex; align-items: center; gap: 10px;">
                <label class="switch">
                  <input type="checkbox" v-model="formData.isCurrent" />
                  <span class="slider round"></span>
                </label>
                <span>{{ formData.isCurrent ? 'បើក' : 'បិទ' }}</span>
              </div>
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
              <div style="display: flex; align-items: center; gap: 10px;">
                <label class="switch">
                  <input type="checkbox" v-model="formData.isCurrent" />
                  <span class="slider round"></span>
                </label>
                <span>{{ formData.isCurrent ? 'បើក' : 'បិទ' }}</span>
              </div>
            </div>
            <div class="form-field">
              <label>កាលបរិច្ឆេទបញ្ចប់</label>
              <input v-model="formData.endDate" type="date" :disabled="formData.isCurrent" />
            </div>
            <div class="form-field">
              <label>ប្រភេទលិខិត</label>
              <SearchableSelect 
                v-model="formData.documentType" 
                :options="documentTypes" 
                placeholder="ជ្រើសរើសឬស្វែងរក..."
              />
            </div>
            <div class="form-field">
              <label>ប្រភេទការតម្លើង</label>
              <select v-model="formData.installationType">
                <option value="" disabled>ជ្រើសរើស</option>
                <option v-for="option in installationTypes" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div class="form-field">
              <label>ក្រសួង-ស្ថាប័ន</label>
              <SearchableSelect 
                v-model="formData.ministryInstitution" 
                :options="ministries" 
                placeholder="ជ្រើសរើសឬស្វែងរក..."
              />
            </div>
            <div class="form-field">
              <label>អង្គភាពចំណុះ</label>
              <input v-model="formData.department" type="text" placeholder="អង្គភាពចំណុះ" />
            </div>
            <div class="form-field">
              <label>នាយកដ្ឋាន-អង្គភាព</label>
              <input v-model="formData.division" type="text" placeholder="នាយកដ្ឋាន-អង្គភាព" />
            </div>
            <div class="form-field">
              <label>ការិយាល័យ-ផ្នែក</label>
              <input v-model="formData.office" type="text" placeholder="ការិយាល័យ-ផ្នែក" />
            </div>
            <div class="form-field">
              <label>ប្រភេទលក្ខន្តិកៈ</label>
              <select v-model="formData.characteristicType">
                <option value="" disabled>ជ្រើសរើស</option>
                <option v-for="option in characteristicTypes" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div class="form-field">
              <label>ក្របខ័ណ្ឌ</label>
              <select v-model="formData.framework">
                <option value="" disabled>ជ្រើសរើស</option>
                <option v-for="option in computedFrameworks" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div class="form-field">
              <label>ឋានន្តរស័ក្តិ និងថ្នាក់</label>
              <select v-model="formData.rankAndGrade">
                <option value="" disabled>ជ្រើសរើស</option>
                <option v-for="option in computedRankGradeOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div class="form-field" v-if="computedRankClassOptions.length > 0">
              <label>ថ្នាក់ (PayScale)</label>
              <select v-model="formData.payScale">
                <option value="" disabled>ជ្រើសរើស</option>
                <option v-for="option in computedRankClassOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div class="form-field full-width">
              <label>កំណត់សម្គាល់</label>
              <textarea v-model="formData.remarks" placeholder="កំណត់សម្គាល់" rows="3"></textarea>
            </div>
          </div>

          <!-- Position Form -->
          <div v-if="dialogType === 'position'" class="form-grid">
            <div class="form-field">
              <label>លេខលិខិតយោង</label>
              <input v-model="formData.referenceLetterNo" type="text" placeholder="លេខលិខិតយោង" />
            </div>
            <div class="form-field">
              <label>ប្រភេទលិខិត</label>
              <SearchableSelect 
                v-model="formData.documentType" 
                :options="documentTypes" 
                placeholder="ជ្រើសរើសឬស្វែងរក..."
              />
            </div>
            <div class="form-field">
              <label>ក្រសួង-ស្ថាប័ន</label>
              <SearchableSelect 
                v-model="formData.ministryInstitution" 
                :options="ministries" 
                placeholder="ជ្រើសរើសឬស្វែងរក..."
              />
            </div>
            <div class="form-field">
              <label>ប្រភេទស្ថាប័ន</label>
              <select v-model="formData.institutionType">
                <option value="" disabled>ជ្រើសរើស</option>
                <option value="ថ្នាក់កណ្តាល">ថ្នាក់កណ្តាល</option>
                <option value="ថ្នាក់រាជធានី-ខេត្ត">ថ្នាក់រាជធានី-ខេត្ត</option>
              </select>
            </div>
            <div class="form-field">
              <label>មុខតំណែង</label>
              <input v-model="formData.position" type="text" placeholder="មុខតំណែង" />
            </div>
            <div class="form-field full-width">
              <label>អង្គភាពចំណុះ</label>
              <SearchableSelect 
                v-model="formData.department" 
                :options="computedDepartmentOptions" 
                placeholder="ជ្រើសរើសឬស្វែងរក..."
              />
            </div>
            <div class="form-field">
              <label>កាលបរិច្ឆេទតែងតាំង <span class="required">*</span></label>
              <input v-model="formData.appointmentDate" type="date" required />
            </div>
            <div class="form-field">
              <label>បច្ចុប្បន្ន</label>
              <div style="display: flex; align-items: center; gap: 10px;">
                <label class="switch">
                  <input type="checkbox" v-model="formData.isCurrent" />
                  <span class="slider round"></span>
                </label>
                <span>{{ formData.isCurrent ? 'បើក' : 'បិទ' }}</span>
              </div>
            </div>
            <div class="form-field">
              <label>កាលបរិច្ឆេទបញ្ចប់</label>
              <input v-model="formData.endDate" type="date" :disabled="formData.isCurrent" />
            </div>
            <div class="form-field">
              <label>ជំនាញ/បច្ចេកទេស</label>
              <input v-model="formData.skillTechnical" type="text" placeholder="ជំនាញ/បច្ចេកទេស" />
            </div>
            <div class="form-field full-width">
              <label>កន្លែងបម្រើការងារដែលមិនក្នុងប្រព័ន្ធ</label>
              <textarea v-model="formData.outsideSystemWorkplace" placeholder="កន្លែងបម្រើការងារដែលមិនក្នុងប្រព័ន្ធ" rows="3"></textarea>
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
              <label>កំណត់សម្គាល់</label>
              <textarea v-model="formData.remarks" placeholder="កំណត់សម្គាល់" rows="3"></textarea>
            </div>
          </div>

          <!-- Award Form -->
          <AwardForm 
            v-if="dialogType === 'award'"
            v-model="formData"
            ref="awardFormRef"
          />

          <!-- Disciplinary Action Form -->
          <DisciplinaryForm
            v-if="dialogType === 'disciplinary'"
            v-model="formData"
            ref="disciplinaryFormRef"
          />

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
              <label>កំណត់សម្គាល់</label>
              <textarea v-model="formData.remarks" placeholder="កំណត់សម្គាល់" rows="3"></textarea>
            </div>
          </div>

          <!-- Cultural Level Form -->
          <div v-if="dialogType === 'cultural'" class="form-grid">
            <div class="form-field">
              <label>កម្រិតវប្បធម៌<span style="color: red;">*</span></label>
              <SearchableSelect 
                v-model="formData.level" 
                :options="culturalLevels" 
                placeholder="ជ្រើសរើសឬស្វែងរក..."
              />
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
              <label>កំណត់សម្គាល់</label>
              <textarea v-model="formData.remarks" placeholder="កំណត់សម្គាល់" rows="3"></textarea>
            </div>
          </div>

          <!-- Related Document Form -->
          <DocumentForm
            v-if="dialogType === 'document'"
            v-model="formData"
            ref="documentFormRef"
          />
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
import SearchableSelect from '../components/SearchableSelect.vue';
import DatePicker from 'primevue/datepicker';
import AwardForm from '../components/AwardForm.vue';
import DisciplinaryForm from '../components/DisciplinaryForm.vue';
import DocumentForm from '../components/DocumentForm.vue';

// Import constants
import {
  CHARACTERISTIC_TYPES,
  INSTALLATION_TYPES,
  AWARD_TYPES,
  AWARD_CLASSES,
  DISCIPLINARY_TYPES,
  DOCUMENT_TYPES,
  DOCUMENT_CATEGORIES,
  LETTER_TYPES,
  CULTURAL_LEVELS,
  CENTRAL_DEPARTMENTS,
  PROVINCIAL_DEPARTMENTS
} from '../constants/dropdown-options.js';

import {
  FRAMEWORKS,
  RANK_GRADE_MAPPING,
  RANK_CLASS_MAPPING
} from '../constants/rank-grade-mapping.js';

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
const calendarVisible = ref(false);

// Form component refs for validation
const awardFormRef = ref(null);
const disciplinaryFormRef = ref(null);
const documentFormRef = ref(null);

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

// Using imported constants from constants/dropdown-options.js
const documentCategories = DOCUMENT_CATEGORIES;
const culturalLevels = CULTURAL_LEVELS;
const letterTypes = LETTER_TYPES;

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
const characteristicTypes = CHARACTERISTIC_TYPES;

const frameworks = FRAMEWORKS;

// Mapping of framework to rank options
const rankGradeMapping = RANK_GRADE_MAPPING;

// Mapping of rank to class options
const rankClassMapping = RANK_CLASS_MAPPING;

// Dropdown options for document types
const documentTypes = DOCUMENT_TYPES;

// Award types dropdown options
const awardTypes = AWARD_TYPES;

// Award class types dropdown options
const awardClasses = AWARD_CLASSES;

// Disciplinary types dropdown options
const disciplinaryTypes = DISCIPLINARY_TYPES;

// Dropdown options for installation types
const installationTypes = INSTALLATION_TYPES;

// Department options for central level
const centralDepartments = CENTRAL_DEPARTMENTS;

// Department options for provincial level
const provincialDepartments = PROVINCIAL_DEPARTMENTS;

// Computed departments based on institution type

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
  
  if (characteristicType === 'ក្រសួងមហាផ្ទៃ') {
    return [
      'មន្រ្តីរដ្ឋបាលជាន់ខ្ពស់',
      'មន្រ្តីក្រមការ',
      'លេខាធិការរដ្ឋបាល'
    ];
  }
  
  if (characteristicType === 'អប់រំ') {
    return [
      'ក្របខ័ណ្ឌគ្រូបង្រៀនកម្រិតឧត្តម',
      'ក្របខ័ណ្ឌគ្រូបង្រៀនកម្រិតមូលដ្ឋាន',
      'ក្របខ័ណ្ឌគ្រូបង្រៀនកម្រិតបឋម'
    ];
  }
  
  if (characteristicType === 'ការទូត') {
    return [
      'មន្រ្តីការទូតជាន់ខ្ពស់',
      'មន្រ្តីក្រមការបរទេស'
    ];
  }
  
  if (characteristicType === 'លក្ខន្តិកៈដោយឡែកនៃក្របខណ្ឌមន្រ្តីរាជការនៃ គ.ជ.ប') {
    return [
      'មន្រ្តីបោះឆ្នោតជាន់ខ្ពស់ ក្របខណ្ឌ(ក)',
      'មន្រ្តីបោះឆ្នោតមធ្យម ក្របខណ្ឌ(ខ)',
      'មន្រ្តីបោះឆ្នោតបឋម ក្របខណ្ឌ(គ)'
    ];
  }
  
  if (characteristicType === 'លក្ខន្តិកៈដោយឡែកនៃក្របខណ្ឌ ចៅក្រម និងព្រះរាជអាជ្ញា') {
    return [
      'ក្របខណ្ឌចៅក្រម',
      'ក្របខណ្ឌព្រះរាជអាជ្ញា'
    ];
  }
  
  if (characteristicType === 'លក្ខន្តិកៈដោយឡែកនៃក្របខណ្ឌមន្រ្តីពន្ធនាគារ ក្រសួងមហាផ្ទៃ') {
    return [
      'ក្របខណ្ឌមន្រ្តីពន្ធនាគារ'
    ];
  }
  
  if (characteristicType === 'លក្ខន្តិកៈដោយឡែកនៃក្របខណ្ឌមន្រ្តីនគរបាលជាតិ ក្រសួងមហាផ្ទៃ') {
    return [
      'ក្របខណ្ឌមន្រ្តីនគរបាលជាតិ'
    ];
  }
  
  if (characteristicType === 'លក្ខន្តិកៈទូទៅចំពោះយោធិននៃកងយោធពលខេមរភូមិន្ទ') {
    return [
      'យោធិននៃកងយោធពលខេមរភូមិន្ទ',
      'យោធិននៃកងយោធពលខេមរភូមិន្ទ(ខាងជើងទឹក)'
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

// Computed department options based on institution type
const computedDepartmentOptions = computed(() => {
  const institutionType = formData.value.institutionType;
  if (institutionType === 'ថ្នាក់កណ្តាល') {
    return centralDepartments;
  } else if (institutionType === 'ថ្នាក់រាជធានី-ខេត្ត') {
    return provincialDepartments;
  }
  return [];
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

const handleFileUpload = (event, fieldName) => {
  const file = event.target.files[0];
  if (file) {
    // For now, store the filename. In production, upload to server
    formData.value[fieldName] = file.name;
    
    // Optional: Create a preview or upload to server
    // const reader = new FileReader();
    // reader.onload = (e) => {
    //   formData.value[fieldName] = e.target.result;
    // };
    // reader.readAsDataURL(file);
  }
};

const saveRecord = async () => {
  try {
    // Validate form if it's award, disciplinary, or document
    if (dialogType.value === 'award' && awardFormRef.value) {
      const isValid = await awardFormRef.value.validate();
      if (!isValid) return;
    } else if (dialogType.value === 'disciplinary' && disciplinaryFormRef.value) {
      const isValid = await disciplinaryFormRef.value.validate();
      if (!isValid) return;
    } else if (dialogType.value === 'document' && documentFormRef.value) {
      const isValid = await documentFormRef.value.validate();
      if (!isValid) return;
    }

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
  font-family: Tahoma, 'Siemreap', cursive;
  font-size: 14pt;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: #6366f1;
  font-size: 14pt;
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
  font-family: Tahoma, 'Siemreap', cursive;
  font-size: 11pt;
  color: #6b7280;
}

.info-value {
  font-family: Tahoma, 'Siemreap', cursive;
  font-size: 11pt;
  color: #2563eb;
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
  font-family: Tahoma, 'Siemreap', cursive;
  font-size: 10pt;
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
  font-family: Tahoma, 'Siemreap', cursive;
  font-size: 11pt;
  font-weight: 500;
  color: #374151;
}

.field input,
.field select {
  font-family: Tahoma, 'Siemreap', cursive;
  font-size: 11pt;
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
  font-family: Tahoma, 'Siemreap', cursive;
  font-size: 11pt;
}

.data-table thead {
  background: #f9fafb;
}

.data-table th {
  font-family: Tahoma, 'Siemreap', cursive;
  font-size: 11pt;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.data-table td {
  font-family: Tahoma, 'Siemreap', cursive;
  font-size: 11pt;
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
  font-family: Tahoma, 'Siemreap', cursive;
  font-size: 11pt;
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

/* Dialog Styles - Right Slide Panel (VS Code Style) */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
  z-index: 1000;
  animation: fadeIn 0.25s ease-out;
}

/* Centered overlay for document modal */
.dialog-overlay.centered-overlay {
  align-items: center;
  justify-content: center;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dialog-container {
  background: white;
  width: 60vw;
  max-width: 90vw;
  min-width: 600px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.12);
  animation: slideInFromRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px 0 0 16px;
  overflow: hidden;
}

/* Centered dialog for document modal */
.dialog-container.centered-dialog {
  width: 850px;
  max-width: 90vw;
  height: auto;
  max-height: 90vh;
  border-radius: 16px;
  overflow: hidden;
  animation: slideInFromCenter 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.dialog-container.centered-dialog .dialog-header {
  border-radius: 16px 16px 0 0;
}

.dialog-container.centered-dialog .dialog-body {
  border-radius: 0 0 16px 16px;
}

@keyframes slideInFromCenter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Hide modal content completely when calendar is visible */
.dialog-container.blur-content .dialog-body {
  visibility: hidden;
}

@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: -0.01em;
}

.btn-close {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  font-size: 1.25rem;
  color: white;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.15s;
  padding: 0;
}

.btn-close i {
  font-size: 0.95rem;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.dialog-body {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  flex: 1;
  background: #fafafa;
}

/* Custom Scrollbar for Dialog (VS Code Style) */
.dialog-body::-webkit-scrollbar {
  width: 10px;
}

.dialog-body::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.dialog-body::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}

.dialog-body::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background: white;
  padding: 0.875rem;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.8125rem;
  letter-spacing: -0.01em;
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

/* PrimeVue DatePicker Styling */
.form-field :deep(.p-datepicker-input-icon-container) {
  width: 100%;
}

.form-field :deep(.p-datepicker-input-icon-container .p-inputtext),
.form-field :deep(.p-datepicker .p-inputtext) {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: 'Khmer OS Siemreap', 'Segoe UI', sans-serif;
  width: 100%;
}

.form-field :deep(.p-datepicker-input-icon-container .p-inputtext:focus),
.form-field :deep(.p-datepicker .p-inputtext:focus) {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-field :deep(.p-datepicker) {
  font-family: 'Khmer OS Siemreap', 'Segoe UI', sans-serif !important;
  background: #ffffff !important;
  border: 3px solid #6366f1 !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
  z-index: 1100 !important;
  padding: 12px !important;
  position: relative !important;
  isolation: isolate !important;
  max-width: 380px !important;
  width: auto !important;
}

/* Add solid white base layer */
.form-field :deep(.p-datepicker)::after {
  content: '';
  position: absolute;
  inset: 0;
  background: #ffffff;
  border-radius: 12px;
  z-index: -1;
}

/* Add white wrapper to datepicker */
.form-field :deep(.p-datepicker),
.form-field :deep(.p-datepicker-panel) {
  background: #ffffff !important;
}

/* Calendar header styling */
.form-field :deep(.p-datepicker .p-datepicker-header) {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
  color: white;
  border-radius: 13px 13px 0 0;
  padding: 1.25rem;
  margin: 0;
  position: relative;
  z-index: 20;
}

.form-field :deep(.p-datepicker .p-datepicker-title) {
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.form-field :deep(.p-datepicker .p-datepicker-prev),
.form-field :deep(.p-datepicker .p-datepicker-next) {
  color: white !important;
  width: 2rem;
  height: 2rem;
}

.form-field :deep(.p-datepicker .p-datepicker-prev:hover),
.form-field :deep(.p-datepicker .p-datepicker-next:hover) {
  background: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
}

/* Calendar table container */
.form-field :deep(.p-datepicker .p-datepicker-calendar-container) {
  padding: 1.5rem;
  background: #ffffff !important;
  position: relative;
  z-index: 10;
  margin: 0;
}

/* Make entire calendar area white with padding */
.form-field :deep(.p-datepicker .p-datepicker-group-container) {
  background: #ffffff !important;
  padding: 8px;
  margin: -8px;
}

.form-field :deep(.p-datepicker .p-datepicker-group) {
  background: #ffffff !important;
}

/* Ensure all calendar internals are white */
.form-field :deep(.p-datepicker *) {
  box-sizing: border-box;
}

/* Day headers (អា.ចន្ទ ចន្ទ អង្គារ...) */
.form-field :deep(.p-datepicker table th) {
  color: #6366f1;
  font-weight: 700;
  padding: 0.75rem 0.5rem;
  font-size: 0.875rem;
  text-align: center;
  background: #f9fafb !important;
  position: relative;
  z-index: 2;
}

/* Calendar table */
.form-field :deep(.p-datepicker table) {
  background: #ffffff !important;
  position: relative;
  z-index: 1;
}

.form-field :deep(.p-datepicker table tbody),
.form-field :deep(.p-datepicker table tr) {
  background: #ffffff !important;
}

.form-field :deep(.p-datepicker .p-datepicker-group-container),
.form-field :deep(.p-datepicker .p-datepicker-group) {
  background: #ffffff !important;
}

/* Day cells */
.form-field :deep(.p-datepicker table td) {
  padding: 0.2rem;
  text-align: center;
  background: white !important;
  position: relative;
  z-index: 1;
}

.form-field :deep(.p-datepicker table td > span) {
  font-family: 'Khmer OS Siemreap', 'Segoe UI', sans-serif !important;
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #1f2937;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s;
  margin: 0 auto;
  background: #ffffff !important;
  border: 1px solid #e5e7eb;
  position: relative;
  z-index: 10;
  opacity: 1 !important;
}

/* Hover effect on days */
.form-field :deep(.p-datepicker table td > span:hover) {
  background: #e0e7ff !important;
  color: #4f46e5 !important;
  transform: scale(1.08);
  border-color: #c7d2fe !important;
  cursor: pointer;
}

/* Selected day */
.form-field :deep(.p-datepicker table td > span.p-highlight) {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
  color: white !important;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.4);
  border-color: transparent !important;
}

/* Today's date */
.form-field :deep(.p-datepicker table td.p-datepicker-today > span) {
  background: #fef3c7 !important;
  color: #92400e !important;
  border: 2px solid #fbbf24 !important;
  font-weight: 700;
}

/* Today's date when hovered */
.form-field :deep(.p-datepicker table td.p-datepicker-today > span:hover) {
  background: #fde68a !important;
  color: #78350f !important;
  transform: scale(1.08);
}

/* Other month days */
.form-field :deep(.p-datepicker table td > span.p-disabled) {
  color: #d1d5db !important;
  background: #ffffff !important;
  cursor: not-allowed !important;
  border-color: #f3f4f6 !important;
  opacity: 0.6 !important;
}

/* Button bar (ថ្ងៃនេះ / សម្អាត) */
.form-field :deep(.p-datepicker .p-datepicker-buttonbar) {
  padding: 1rem 1.5rem;
  border-top: 2px solid #e5e7eb;
  background: #ffffff !important;
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
  position: relative;
  z-index: 20;
  border-radius: 0 0 13px 13px;
}

.form-field :deep(.p-datepicker .p-datepicker-buttonbar button) {
  font-family: 'Khmer OS Siemreap', 'Segoe UI', sans-serif !important;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  transition: all 0.2s;
  font-weight: 600;
  font-size: 0.875rem;
  flex: 1;
}

.form-field :deep(.p-datepicker .p-datepicker-buttonbar .p-button-text) {
  background: #4f46e5 !important;
  color: white !important;
  border: none !important;
}

.form-field :deep(.p-datepicker .p-datepicker-buttonbar .p-button-text:hover) {
  background: #4338ca !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

/* DatePicker backdrop overlay - dark overlay behind calendar */
:deep(.p-datepicker-mask) {
  position: fixed !important;
  inset: 0 !important;
  background: rgba(0, 0, 0, 0.5) !important;
  z-index: 1099 !important;
}

/* DatePicker panel container wrapper - solid white background */
:deep(.p-datepicker-panel) {
  z-index: 1100 !important;
  position: fixed !important;
  background: #ffffff !important;
  border: 2px solid #6366f1 !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3) !important;
  border-radius: 12px !important;
  padding: 12px !important;
  max-width: 380px !important;
  width: auto !important;
  overflow: hidden;
}

:deep(.p-datepicker) {
  z-index: 1100 !important;
  background: #ffffff !important;
}

/* Ensure no text overlap in calendar */
.form-field :deep(.p-datepicker *) {
  box-sizing: border-box;
  overflow: visible;
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
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
  z-index: 10;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
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

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #6366f1;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
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
