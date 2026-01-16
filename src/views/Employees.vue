<template>
  <div class="employees-container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div class="title-section">
          <i class="pi pi-users" style="font-size: 2rem; color: #0288D1;"></i>
          <div>
            <h1>គ្រប់គ្រងបុគ្គលិក មន្រ្តីរាជការ</h1>
            <p class="subtitle">ការគ្រប់គ្រងព័ត៌មានបុគ្គលិក មន្រ្តីរាជការ</p>
          </div>
        </div>
        <button class="add-btn" @click="openDialog()">
          <i class="pi pi-plus"></i> បន្ថែមបុគ្គលិក
        </button>
      </div>
    </div>

    <!-- Employee Table -->
    <div class="table-container">
      <table class="simple-table">
        <thead>
          <tr>
            <th>រូបភាព</th>
            <th>ឈ្មោះ</th>
            <th>ស្ថានភាព</th>
            <th>ទូរស័ព្ទ</th>
            <th>អ៊ីមែល</th>
            <th>សកម្មភាព</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in employees" :key="employee._id || employee.id">
            <td>
              <div class="photo-cell">
                <img v-if="employee.photo" :src="`http://localhost:5000${employee.photo}`" alt="Photo" />
                <div v-else class="photo-placeholder">
                  <i class="pi pi-user"></i>
                </div>
              </div>
            </td>
            <td>
              <div class="name-cell">
                <div class="name-en">{{ employee.firstName }} {{ employee.lastName }}</div>
                <div class="name-kh" v-if="employee.khmerName">{{ employee.khmerName }}</div>
              </div>
            </td>
            <td>
              <span :class="['status-badge', employee.status || 'active']">
                {{ employee.status || 'Active' }}
              </span>
            </td>
            <td>{{ employee.phone || '-' }}</td>
            <td>{{ employee.email || '-' }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon view" @click="viewEmployee(employee._id || employee.id)" title="មើល">
                  <i class="pi pi-eye"></i>
                </button>
                <button class="btn-icon edit" @click="editEmployee(employee)" title="កែសម្រួល">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="btn-icon delete" @click="confirmDelete(employee)" title="លុប">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="employees.length === 0" class="empty-state">
        <i class="pi pi-users" style="font-size: 4rem; color: #cbd5e1;"></i>
        <p>មិនមានបុគ្គលិក</p>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="dialogVisible" class="modal-overlay" @click.self="closeDialog">
      <div class="modal-content-large">
        <h3>{{ dialogMode === 'create' ? '➕ កែប្រែព័ត៌មានទូទៅផ្ទាល់ខ្លួន' : '✏️ កែប្រែព័ត៌មានទូទៅផ្ទាល់ខ្លួន' }}</h3>
        <form @submit.prevent="handleSubmit">
          <!-- Top Icon Navigation (TreeTab) -->
          <div class="top-icon-tabs">
            <button 
              type="button"
              v-for="(iconTab, idx) in iconTabs" 
              :key="idx"
              :class="['icon-tab', { active: activeIconTab === idx }]"
              @click="activeIconTab = idx"
            >
              <div class="icon-circle">
                <i :class="iconTab.icon"></i>
              </div>
              <span class="icon-label">{{ iconTab.label }}</span>
            </button>
          </div>

          <!-- Progress Bar -->
          <div class="progress-section">
            <div class="progress-bar-container">
              <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            <span class="progress-text">{{ progressPercentage }}% បានបំពេញ</span>
          </div>

          <!-- Tab Content -->
          <div class="form-content">
            <!-- Tab 0: Personal Information -->
            <div v-show="activeIconTab === 0">
            <!-- General Information Block -->
            <div class="form-block general-info-block">
              <div class="form-section-header">
                <i class="pi pi-user"></i>
                <h4>ព័ត៌មានទូទៅ</h4>
              </div>
            
            <div class="general-info-layout">
              <!-- Photo Upload Section -->
              <div class="photo-upload-section">
                <div class="photo-preview">
                  <img v-if="formData.photo" :src="formData.photo" alt="Photo" />
                  <div v-else class="photo-placeholder">
                    <i class="pi pi-user"></i>
                  </div>
                </div>
                <div class="photo-buttons">
                  <button type="button" class="btn-photo upload">បញ្ចូល</button>
                  <button type="button" class="btn-photo delete">លុប</button>
                </div>
              </div>

              <!-- Form Fields Next to Photo -->
              <div class="general-info-fields">
                <div class="form-row">
                  <div class="form-group">
                    <label>លេខសំបុត្រកំណើត</label>
                    <input v-model="formData.birthCertificateNo" type="text" placeholder="លេខសំបុត្រកំណើត" />
                  </div>
                  <div class="form-group">
                    <label>លេខសម្គាល់បុគ្គលិក <span class="required">*</span></label>
                    <input v-model="formData.employeeId" type="text" placeholder="លេខសម្គាល់បុគ្គលិក" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>លេខអត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរ <span class="required">*</span></label>
                    <input v-model="formData.nationalIdNo" type="text" placeholder="010654986" />
                  </div>
                  <div class="form-group">
                    <label>សុពលភាពអត្តសញ្ញាណប័ណ្ណ <span class="required">*</span></label>
                    <input v-model="formData.idValidFrom" type="date" placeholder="30/03/2016" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>ថ្ងៃផុតសុពលភាពអត្តសញ្ញាណប័ណ្ណ <span class="required">*</span></label>
                    <input v-model="formData.idExpiryDate" type="date" placeholder="29/03/2026" />
                  </div>
                  <div class="form-group">
                    <label>លេខលិខិតឆ្លងដែន</label>
                    <input v-model="formData.passportNo" type="text" placeholder="លេខលិខិតឆ្លងដែន" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>អត្តលេខមន្ត្រីរាជការ</label>
                    <input v-model="formData.civilServantId" type="text" placeholder="អត្តលេខមន្ត្រីរាជការ" />
                  </div>
                  <div class="form-group">
                    <label>គោត្តនាម <span class="required">*</span></label>
                    <input v-model="formData.khmerSurname" type="text" placeholder="គោត្តនាម" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>នាមខ្លួន <span class="required">*</span></label>
                    <input v-model="formData.khmerGivenName" type="text" placeholder="នាមខ្លួន" />
                  </div>
                  <div class="form-group">
                    <label>សញ្ជាតិ <span class="required">*</span></label>
                    <select v-model="formData.citizenship">
                      <option value="">ជ្រើសរើស</option>
                      <option value="khmer">ខ្មែរ</option>
                      <option value="foreigner">បរទេស</option>
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>គោត្តនាមឡាតាំង</label>
                    <input v-model="formData.latinSurname" type="text" placeholder="Surname" />
                  </div>
                  <div class="form-group">
                    <label>នាមឡាតាំង</label>
                    <input v-model="formData.latinGivenName" type="text" placeholder="Given Name" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>ជនជាតិ <span class="required">*</span></label>
                    <select v-model="formData.ethnicity">
                      <option value="">ជ្រើសរើស</option>
                      <option value="khmer">ខ្មែរ</option>
                      <option value="chinese">ចិន</option>
                      <option value="vietnamese">វៀតណាម</option>
                      <option value="cham">ចាម</option>
                      <option value="other">ផ្សេងៗ</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>ភេទ <span class="required">*</span></label>
                    <div class="radio-group">
                      <label class="radio-label">
                        <input type="radio" v-model="formData.gender" value="male" />
                        <span>ប្រុស</span>
                      </label>
                      <label class="radio-label">
                        <input type="radio" v-model="formData.gender" value="female" />
                        <span>ស្រី</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Full width fields in general info block -->
            <div class="form-row">
              <div class="form-group">
                <label>ថ្ងៃខែឆ្នាំកំណើត <span class="required">*</span></label>
                <div class="date-picker-group">
                  <select v-model="formData.birthDay" class="date-select">
                    <option value="">ថ្ងៃ</option>
                    <option v-for="day in 31" :key="day" :value="day">{{ day }}</option>
                  </select>
                  <select v-model="formData.birthMonth" class="date-select">
                    <option value="">ខែ</option>
                    <option value="1">មករា</option>
                    <option value="2">កុម្ភៈ</option>
                    <option value="3">មីនា</option>
                    <option value="4">មេសា</option>
                    <option value="5">ឧសភា</option>
                    <option value="6">មិថុនា</option>
                    <option value="7">កក្កដា</option>
                    <option value="8">សីហា</option>
                    <option value="9">កញ្ញា</option>
                    <option value="10">តុលា</option>
                    <option value="11">វិច្ឆិកា</option>
                    <option value="12">ធ្នូ</option>
                  </select>
                  <select v-model="formData.birthYear" class="date-select">
                    <option value="">ឆ្នាំ</option>
                    <option v-for="year in 100" :key="year" :value="2026 - year">{{ 2026 - year }}</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>ប្រភេទឈាម</label>
                <select v-model="formData.bloodType">
                  <option value="">ជ្រើសរើស</option>
                  <option value="A+">A+</option>
                  <option value="A-">A−</option>
                  <option value="B+">B+</option>
                  <option value="B-">B−</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB−</option>
                  <option value="O+">O+</option>
                  <option value="O-">O−</option>
                </select>
              </div>
              <div class="form-group">
                <label>ស្ថានភាពគ្រួសារ <span class="required">*</span></label>
                <select v-model="formData.maritalStatus">
                  <option value="">ជ្រើសរើស</option>
                  <option value="single">នៅលីវ</option>
                  <option value="married">រៀបការ</option>
                  <option value="divorced">លែងលះ</option>
                  <option value="widowed">មេម៉ាយ/ប្តី</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>លេខទូរស័ព្ទទី១ <span class="required">*</span></label>
                <input v-model="formData.phone1" type="tel" placeholder="+855 12 345 678" />
              </div>
              <div class="form-group">
                <label>លេខទូរស័ព្ទទី២</label>
                <input v-model="formData.phone2" type="tel" placeholder="+855 12 345 678" />
              </div>
              <div class="form-group">
                <label>អ៊ីម៉ែល</label>
                <input v-model="formData.email" type="email" placeholder="email@example.com" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label>កាយសម្បទា</label>
                <textarea v-model="formData.physicalAttributes" rows="2" placeholder="កម្ពស់, ទម្ងន់, និងលក្ខណៈកាយសម្បទាផ្សេងៗ"></textarea>
              </div>
            </div>
            </div>

            <!-- Birth Place Block -->
            <div class="form-block birthplace-block">
              <div class="form-section-header">
                <i class="pi pi-map-marker"></i>
                <h4>ទីកន្លែងកំណើត</h4>
              </div>
            <div class="form-row">
              <div class="form-group">
                <label>រាជធានី/ខេត្ត</label>
                <input v-model="formData.birthProvince" type="text" placeholder="រាជធានី/ខេត្ត" />
              </div>
              <div class="form-group">
                <label>ស្រុក/ខណ្ឌ</label>
                <input v-model="formData.birthDistrict" type="text" placeholder="ស្រុក/ខណ្ឌ" />
              </div>
              <div class="form-group">
                <label>ឃុំ/សង្កាត់</label>
                <input v-model="formData.birthCommune" type="text" placeholder="ឃុំ/សង្កាត់" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>ភូមិ</label>
                <input v-model="formData.birthVillage" type="text" placeholder="ភូមិ" />
              </div>
              <div class="form-group">
                <label>ផ្ទះលេខ</label>
                <input v-model="formData.birthHouseNumber" type="text" placeholder="ផ្ទះលេខ" />
              </div>
              <div class="form-group">
                <label>ផ្លូវលេខ</label>
                <input v-model="formData.birthStreetNumber" type="text" placeholder="ផ្លូវលេខ" />
              </div>
            </div>
            </div>

            <!-- Current Address Block -->
            <div class="form-block address-block">
              <div class="form-section-header">
                <i class="pi pi-home"></i>
                <h4>អាសយដ្ឋាន</h4>
              </div>
            <div class="form-row">
              <div class="form-group">
                <label>រាជធានី/ខេត្ត</label>
                <input v-model="formData.addressProvince" type="text" placeholder="រាជធានី/ខេត្ត" />
              </div>
              <div class="form-group">
                <label>ស្រុក/ខណ្ឌ</label>
                <input v-model="formData.addressDistrict" type="text" placeholder="ស្រុក/ខណ្ឌ" />
              </div>
              <div class="form-group">
                <label>ឃុំ/សង្កាត់</label>
                <input v-model="formData.addressCommune" type="text" placeholder="ឃុំ/សង្កាត់" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>ភូមិ</label>
                <input v-model="formData.addressVillage" type="text" placeholder="ភូមិ" />
              </div>
              <div class="form-group">
                <label>ផ្ទះលេខ</label>
                <input v-model="formData.addressHouseNumber" type="text" placeholder="ផ្ទះលេខ" />
              </div>
              <div class="form-group">
                <label>ផ្លូវលេខ</label>
                <input v-model="formData.addressStreetNumber" type="text" placeholder="ផ្លូវលេខ" />
              </div>
            </div>
            </div>

            <!-- Emergency Contact Block -->
            <div class="form-block emergency-block">
              <div class="form-section-header">
                <i class="pi pi-phone"></i>
                <h4>ព័ត៌មានទំនាក់ទំនងក្នុងករណីមានអាសន្ន</h4>
              </div>
            <div class="form-row">
              <div class="form-group">
                <label>គោត្តនាម</label>
                <input v-model="formData.emergencySurname" type="text" placeholder="គោត្តនាម" />
              </div>
              <div class="form-group">
                <label>នាមខ្លួន</label>
                <input v-model="formData.emergencyGivenName" type="text" placeholder="នាមខ្លួន" />
              </div>
              <div class="form-group">
                <label>ភេទ</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" v-model="formData.emergencyGender" value="male" />
                    <span>ប្រុស</span>
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="formData.emergencyGender" value="female" />
                    <span>ស្រី</span>
                  </label>
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>ទំនាក់ទំនងត្រូវជា</label>
                <select v-model="formData.emergencyRelationship">
                  <option value="">ជ្រើសរើស</option>
                  <option value="parent">ឪពុក/ម្តាយ</option>
                  <option value="spouse">ប្តី/ប្រពន្ធ</option>
                  <option value="sibling">បងប្អូន</option>
                  <option value="child">កូន</option>
                  <option value="relative">សាច់ញាតិ</option>
                  <option value="friend">មិត្តភក្តិ</option>
                  <option value="other">ផ្សេងៗ</option>
                </select>
              </div>
              <div class="form-group">
                <label>មុខរបរ</label>
                <select v-model="formData.emergencyOccupation">
                  <option value="">ជ្រើសរើស</option>
                  <option value="civil-servant">មន្ត្រីរាជការ</option>
                  <option value="teacher">គ្រូបង្រៀន</option>
                  <option value="doctor">គ្រូពេទ្យ</option>
                  <option value="business">អ្នកជំនួញ</option>
                  <option value="farmer">កសិករ</option>
                  <option value="worker">កម្មករ</option>
                  <option value="student">និស្សិត</option>
                  <option value="retired">រាជការនិវត្ត</option>
                  <option value="unemployed">គ្មានការងារ</option>
                  <option value="other">ផ្សេងៗ</option>
                </select>
              </div>
              <div class="form-group">
                <label>រាជធានី/ខេត្ត</label>
                <input v-model="formData.emergencyProvince" type="text" placeholder="រាជធានី/ខេត្ត" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>ស្រុក/ខណ្ឌ</label>
                <input v-model="formData.emergencyDistrict" type="text" placeholder="ស្រុក/ខណ្ឌ" />
              </div>
              <div class="form-group">
                <label>ឃុំ/សង្កាត់</label>
                <input v-model="formData.emergencyCommune" type="text" placeholder="ឃុំ/សង្កាត់" />
              </div>
              <div class="form-group">
                <label>ភូមិ</label>
                <input v-model="formData.emergencyVillage" type="text" placeholder="ភូមិ" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>ផ្ទះលេខ</label>
                <input v-model="formData.emergencyHouseNumber" type="text" placeholder="ផ្ទះលេខ" />
              </div>
              <div class="form-group">
                <label>ផ្លូវលេខ</label>
                <input v-model="formData.emergencyStreetNumber" type="text" placeholder="ផ្លូវលេខ" />
              </div>
              <div class="form-group">
                <label>លេខទូរស័ព្ទ</label>
                <input v-model="formData.emergencyPhone" type="tel" placeholder="+855 12 345 678" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>អ៊ីម៉ែល</label>
                <input v-model="formData.emergencyEmail" type="email" placeholder="email@example.com" />
              </div>
            </div>
            </div>
            </div>

            <!-- Tab 1: Parent Information -->
            <div v-show="activeIconTab === 1">
              <!-- Father Information Block -->
              <div class="form-block general-info-block">
                <div class="form-section-header">
                  <i class="pi pi-user"></i>
                  <h4>ព័ត៌មានឪពុក</h4>
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label>គោត្តនាម និងនាម</label>
                    <input v-model="formData.fatherName" type="text" placeholder="គោត្តនាម និងនាម" />
                  </div>
                  <div class="form-group">
                    <label>គោត្តនាម និងនាមឡាតាំង</label>
                    <input v-model="formData.fatherLatinName" type="text" placeholder="PALV RATHOERN" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>ថ្ងៃខែឆ្នាំកំណើត</label>
                    <div class="date-picker-group">
                      <select v-model="formData.fatherBirthDay" class="date-select">
                        <option value="">ថ្ងៃ</option>
                        <option v-for="day in 31" :key="day" :value="day">{{ day }}</option>
                      </select>
                      <select v-model="formData.fatherBirthMonth" class="date-select">
                        <option value="">ខែ</option>
                        <option value="1">មករា</option>
                        <option value="2">កុម្ភៈ</option>
                        <option value="3">មីនា</option>
                        <option value="4">មេសា</option>
                        <option value="5">ឧសភា</option>
                        <option value="6">មិថុនា</option>
                        <option value="7">កក្កដា</option>
                        <option value="8">សីហា</option>
                        <option value="9">កញ្ញា</option>
                        <option value="10">តុលា</option>
                        <option value="11">វិច្ឆិកា</option>
                        <option value="12">ធ្នូ</option>
                      </select>
                      <select v-model="formData.fatherBirthYear" class="date-select">
                        <option value="">ឆ្នាំ</option>
                        <option v-for="year in 100" :key="year" :value="2026 - year">{{ 2026 - year }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>ស្ថានភាព</label>
                    <div class="radio-group">
                      <label class="radio-label">
                        <input type="radio" v-model="formData.fatherStatus" value="alive" />
                        <span>រស់</span>
                      </label>
                      <label class="radio-label">
                        <input type="radio" v-model="formData.fatherStatus" value="deceased" />
                        <span>ស្លាប់</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>ជនជាតិ</label>
                    <select v-model="formData.fatherEthnicity">
                      <option value="">ជ្រើសរើស</option>
                      <option value="khmer">ខ្មែរ</option>
                      <option value="chinese">ចិន</option>
                      <option value="vietnamese">វៀតណាម</option>
                      <option value="cham">ចាម</option>
                      <option value="other">ផ្សេងៗ</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>សញ្ជាតិ</label>
                    <select v-model="formData.fatherNationality">
                      <option value="">ជ្រើសរើស</option>
                      <option value="khmer">ខ្មែរ</option>
                      <option value="foreigner">បរទេស</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>មុខរបរ</label>
                    <select v-model="formData.fatherOccupation">
                      <option value="">ជ្រើសរើស</option>
                      <option value="civil-servant">មន្ត្រីរាជការ</option>
                      <option value="teacher">គ្រូបង្រីន</option>
                      <option value="professor">សាស្ត្រាចារ្យមហាបរិញ្ញា</option>
                      <option value="associate-professor">សាស្ឌ្រាចារ្យរង</option>
                      <option value="assistant-professor">សាស្ឌ្រាចារ្យជំនួយ</option>
                      <option value="medical-specialist">វេជ្ជបណ្ខិតឯកទេស</option>
                      <option value="medical-master">វេជ្ជបណ្ខិត(ជំនាញ/អនុបណ្ឌិត)</option>
                      <option value="medical-doctor">វេជ្ជបណ្ឌិត</option>
                      <option value="dentist">ទន្ឌបណ្ឌិត</option>
                      <option value="pharmacist">អុសថការី</option>
                      <option value="nurse-bachelor">គិលានុបឌ្ጶាក(បរិញ្ញាបត្រ)</option>
                      <option value="midwife-bachelor">ឆ្មប(បរិញ្ញាបត្រ)</option>
                      <option value="nurse-secondary">គិលានុបឌ្ጶាកមឌ្យម</option>
                      <option value="midwife-secondary">ឆ្មបមឌ្យម</option>
                      <option value="nurse-primary">គិលានុបឌ្ጶាកបធម</option>
                      <option value="dental-nurse">ទន្តគិលានុបឌ្ጶាកមឌ្យម</option>
                      <option value="lab-technician">អ្នកបច្ចេកទេសមន្ទីរពិសោធន៍មឌ្យម</option>
                      <option value="radiologist">អ្នកបច្ចេកទេសវិទ្យុសាស្រ្ត</option>
                      <option value="physiotherapist">ព្យាបាលដោយចលនាមឌ្យម</option>
                      <option value="it-specialist">ព័ត៌មានវិទ្យា</option>
                      <option value="accountant">គណនេយ្យករ</option>
                      <option value="public-admin">រឌ្ጶបាល​សាធារណៈ</option>
                      <option value="electrical-engineer">វិស្វកម្មអគ្គិសនី</option>
                      <option value="business">អាជីវក</option>
                      <option value="trader">លក់ដូរ</option>
                      <option value="caregiver">អ្នកថែទាំ</option>
                      <option value="mid-doctor">គ្រូពេត្យមឌ្យម</option>
                      <option value="farmer">កសិករ</option>
                      <option value="worker">កម្មករ</option>
                      <option value="student">និស្សិត</option>
                      <option value="retired">រាជការនិវត្ត</option>
                      <option value="unemployed">គ្មានការងារ</option>
                      <option value="housewife">មេផ្ទះ</option>
                      <option value="other">ផ្សេងៗ</option>
                    </select>
                  </div>
                </div>

                <div class="subsection-title">ទីកន្លែងកំណើតឪពុក</div>

                <div class="form-row">
                  <div class="form-group">
                    <label>រាជធានី/ខេត្ត</label>
                    <input v-model="formData.fatherBirthProvince" type="text" placeholder="រាជធានី/ខេត្ត" />
                  </div>
                  <div class="form-group">
                    <label>ស្រុក/ខណ្ឌ</label>
                    <input v-model="formData.fatherBirthDistrict" type="text" placeholder="ស្រុក/ខណ្ឌ" />
                  </div>
                  <div class="form-group">
                    <label>ឃុំ/សង្កាត់</label>
                    <input v-model="formData.fatherBirthCommune" type="text" placeholder="ឃុំ/សង្កាត់" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>ភូមិ</label>
                    <input v-model="formData.fatherBirthVillage" type="text" placeholder="ភូមិ" />
                  </div>
                  <div class="form-group">
                    <label>ផ្ទះលេខ</label>
                    <input v-model="formData.fatherBirthHouseNumber" type="text" placeholder="ផ្ទះលេខ" />
                  </div>
                  <div class="form-group">
                    <label>ផ្លូវលេខ</label>
                    <input v-model="formData.fatherBirthStreetNumber" type="text" placeholder="ផ្លូវលេខ" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>លេខទូរស័ព្ទ</label>
                    <input v-model="formData.fatherPhone" type="tel" placeholder="+855 12 345 678" />
                  </div>
                </div>
              </div>

              <!-- Mother Information Block -->
              <div class="form-block birthplace-block">
                <div class="form-section-header">
                  <i class="pi pi-user"></i>
                  <h4>ព័ត៌មានម្តាយ</h4>
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label>គោត្តនាម និងនាម</label>
                    <input v-model="formData.motherName" type="text" placeholder="គោត្តនាម និងនាម" />
                  </div>
                  <div class="form-group">
                    <label>គោត្តនាម និងនាមឡាតាំង</label>
                    <input v-model="formData.motherLatinName" type="text" placeholder="Latin Name" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>ថ្ងៃខែឆ្នាំកំណើត</label>
                    <div class="date-picker-group">
                      <select v-model="formData.motherBirthDay" class="date-select">
                        <option value="">ថ្ងៃ</option>
                        <option v-for="day in 31" :key="day" :value="day">{{ day }}</option>
                      </select>
                      <select v-model="formData.motherBirthMonth" class="date-select">
                        <option value="">ខែ</option>
                        <option value="1">មករា</option>
                        <option value="2">កុម្ភៈ</option>
                        <option value="3">មីនា</option>
                        <option value="4">មេសា</option>
                        <option value="5">ឧសភា</option>
                        <option value="6">មិថុនា</option>
                        <option value="7">កក្កដា</option>
                        <option value="8">សីហា</option>
                        <option value="9">កញ្ញា</option>
                        <option value="10">តុលា</option>
                        <option value="11">វិច្ឆិកា</option>
                        <option value="12">ធ្នូ</option>
                      </select>
                      <select v-model="formData.motherBirthYear" class="date-select">
                        <option value="">ឆ្នាំ</option>
                        <option v-for="year in 100" :key="year" :value="2026 - year">{{ 2026 - year }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>ស្ថានភាព</label>
                    <div class="radio-group">
                      <label class="radio-label">
                        <input type="radio" v-model="formData.motherStatus" value="alive" />
                        <span>រស់</span>
                      </label>
                      <label class="radio-label">
                        <input type="radio" v-model="formData.motherStatus" value="deceased" />
                        <span>ស្លាប់</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>ជនជាតិ</label>
                    <select v-model="formData.motherEthnicity">
                      <option value="">ជ្រើសរើស</option>
                      <option value="khmer">ខ្មែរ</option>
                      <option value="chinese">ចិន</option>
                      <option value="vietnamese">វៀតណាម</option>
                      <option value="cham">ចាម</option>
                      <option value="other">ផ្សេងៗ</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>សញ្ជាតិ</label>
                    <select v-model="formData.motherNationality">
                      <option value="">ជ្រើសរើស</option>
                      <option value="khmer">ខ្មែរ</option>
                      <option value="foreigner">បរទេស</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>មុខរបរ</label>
                    <select v-model="formData.motherOccupation">
                      <option value="">ជ្រើសរើស</option>
                      <option value="civil-servant">មន្ត្រីរាជការ</option>
                      <option value="teacher">គ្រូបង្រីន</option>
                      <option value="professor">សាស្ត្រាចារ្យមហាបរិញ្ញា</option>
                      <option value="associate-professor">សាស្ឌ្រាចារ្យរង</option>
                      <option value="assistant-professor">សាស្ឌ្រាចារ្យជំនួយ</option>
                      <option value="medical-specialist">វេជ្ជបណ្ខិតឯកទេស</option>
                      <option value="medical-master">វេជ្ជបណ្ខិត(ជំនាញ/អនុបណ្ឌិត)</option>
                      <option value="medical-doctor">វេជ្ជបណ្ឌិត</option>
                      <option value="dentist">ទន្ឌបណ្ឌិត</option>
                      <option value="pharmacist">អុសថការី</option>
                      <option value="nurse-bachelor">គិលានុបឌ្ጶាក(បរិញ្ញាបត្រ)</option>
                      <option value="midwife-bachelor">ឆ្មប(បរិញ្ញាបត្រ)</option>
                      <option value="nurse-secondary">គិលានុបឌ្ጶាកមឌ្យម</option>
                      <option value="midwife-secondary">ឆ្មបមឌ្យម</option>
                      <option value="nurse-primary">គិលានុបឌ្ጶាកបធម</option>
                      <option value="dental-nurse">ទន្តគិលានុបឌ្ጶាកមឌ្យម</option>
                      <option value="lab-technician">អ្នកបច្ចេកទេសមន្ទីរពិសោធន៍មឌ្យម</option>
                      <option value="radiologist">អ្នកបច្ចេកទេសវិទ្យុសាស្រ្ត</option>
                      <option value="physiotherapist">ព្យាបាលដោយចលនាមឌ្យម</option>
                      <option value="it-specialist">ព័ត៌មានវិទ្យា</option>
                      <option value="accountant">គណនេយ្យករ</option>
                      <option value="public-admin">រឌ្ጶបាល​សាធារណៈ</option>
                      <option value="electrical-engineer">វិស្វកម្មអគ្គិសនី</option>
                      <option value="business">អាជីវក</option>
                      <option value="trader">លក់ដូរ</option>
                      <option value="caregiver">អ្នកថែទាំ</option>
                      <option value="mid-doctor">គ្រូពេត្យមឌ្យម</option>
                      <option value="farmer">កសិករ</option>
                      <option value="worker">កម្មករ</option>
                      <option value="student">និស្សិត</option>
                      <option value="retired">រាជការនិវត្ត</option>
                      <option value="unemployed">គ្មានការងារ</option>
                      <option value="housewife">មេផ្ទះ</option>
                      <option value="other">ផ្សេងៗ</option>
                    </select>
                  </div>
                </div>

                <div class="subsection-title">ទីកន្លែងកំណើតម្តាយ</div>

                <div class="form-row">
                  <div class="form-group">
                    <label>រាជធានី/ខេត្ត</label>
                    <input v-model="formData.motherBirthProvince" type="text" placeholder="រាជធានី/ខេត្ត" />
                  </div>
                  <div class="form-group">
                    <label>ស្រុក/ខណ្ឌ</label>
                    <input v-model="formData.motherBirthDistrict" type="text" placeholder="ស្រុក/ខណ្ឌ" />
                  </div>
                  <div class="form-group">
                    <label>ឃុំ/សង្កាត់</label>
                    <input v-model="formData.motherBirthCommune" type="text" placeholder="ឃុំ/សង្កាត់" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>ភូមិ</label>
                    <input v-model="formData.motherBirthVillage" type="text" placeholder="ភូមិ" />
                  </div>
                  <div class="form-group">
                    <label>ផ្ទះលេខ</label>
                    <input v-model="formData.motherBirthHouseNumber" type="text" placeholder="ផ្ទះលេខ" />
                  </div>
                  <div class="form-group">
                    <label>ផ្លូវលេខ</label>
                    <input v-model="formData.motherBirthStreetNumber" type="text" placeholder="ផ្លូវលេខ" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>លេខទូរស័ព្ទ</label>
                    <input v-model="formData.motherPhone" type="tel" placeholder="+855 12 345 678" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab 2: Spouse Information -->
            <div v-show="activeIconTab === 2">
              <!-- Spouse Basic Information Block -->
              <div class="form-block general-info-block">
                <div class="form-section-header">
                  <i class="pi pi-heart"></i>
                  <h4>ព័ត៌មានសហព័ទ្ធ</h4>
                </div>
                
                <div class="form-row">
                  <div class="form-group full-width">
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="formData.spouseWorksHere" />
                      <span>ប្រពន្ធ/ប្តីធ្វើការដែរ</span>
                    </label>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>លេខសំបុត្ររៀបការ</label>
                    <input v-model="formData.marriageCertificateNo" type="text" placeholder="លេខសំបុត្ររៀបការ" />
                  </div>
                  <div class="form-group">
                    <label>លេខអត្តសញ្ញាណប័ណ្ណសហព័ទ្ធ</label>
                    <input v-model="formData.spouseNationalId" type="text" placeholder="លេខអត្តសញ្ញាណប័ណ្ណ" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>គោត្តនាម និងនាម</label>
                    <input v-model="formData.spouseName" type="text" placeholder="គោត្តនាម និងនាម" />
                  </div>
                  <div class="form-group">
                    <label>គោត្តនាម និងនាមឡាតាំង</label>
                    <input v-model="formData.spouseLatinName" type="text" placeholder="Latin Name" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>ថ្ងៃខែឆ្នាំកំណើត</label>
                    <div class="date-picker-group">
                      <select v-model="formData.spouseBirthDay" class="date-select">
                        <option value="">ថ្ងៃ</option>
                        <option v-for="day in 31" :key="day" :value="day">{{ day }}</option>
                      </select>
                      <select v-model="formData.spouseBirthMonth" class="date-select">
                        <option value="">ខែ</option>
                        <option value="1">មករា</option>
                        <option value="2">កុម្ភៈ</option>
                        <option value="3">មីនា</option>
                        <option value="4">មេសា</option>
                        <option value="5">ឧសភា</option>
                        <option value="6">មិថុនា</option>
                        <option value="7">កក្កដា</option>
                        <option value="8">សីហា</option>
                        <option value="9">កញ្ញា</option>
                        <option value="10">តុលា</option>
                        <option value="11">វិច្ឆិកា</option>
                        <option value="12">ធ្នូ</option>
                      </select>
                      <select v-model="formData.spouseBirthYear" class="date-select">
                        <option value="">ឆ្នាំ</option>
                        <option v-for="year in 100" :key="year" :value="2026 - year">{{ 2026 - year }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>ស្ថានភាព</label>
                    <div class="radio-group">
                      <label class="radio-label">
                        <input type="radio" v-model="formData.spouseStatus" value="alive" />
                        <span>រស់</span>
                      </label>
                      <label class="radio-label">
                        <input type="radio" v-model="formData.spouseStatus" value="deceased" />
                        <span>ស្លាប់</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>មុខរបរ</label>
                    <select v-model="formData.spouseOccupation">
                      <option value="">ជ្រើសរើស</option>
                      <option value="civil-servant">មន្ត្រីរាជការ</option>
                      <option value="teacher">គ្រូបង្រៀន</option>
                      <option value="professor">សាស្ត្រាចារ្យមហាបរិញ្ញា</option>
                      <option value="associate-professor">សាស្ដ្រាចារ្យរង</option>
                      <option value="assistant-professor">សាស្ដ្រាចារ្យជំនួយ</option>
                      <option value="medical-specialist">វេជ្ជបណ្ខិតឯកទេស</option>
                      <option value="medical-master">វេជ្ជបណ្ខិត(ជំនាញ/អនុបណ្ឌិត)</option>
                      <option value="medical-doctor">វេជ្ជបណ្ឌិត</option>
                      <option value="dentist">ទន្ដបណ្ឌិត</option>
                      <option value="pharmacist">ឱសថការី</option>
                      <option value="nurse-bachelor">គិលានុបដ្ឋាក(បរិញ្ញាបត្រ)</option>
                      <option value="midwife-bachelor">ឆ្មប(បរិញ្ញាបត្រ)</option>
                      <option value="nurse-secondary">គិលានុបដ្ឋាកមធ្យម</option>
                      <option value="midwife-secondary">ឆ្មបមធ្យម</option>
                      <option value="nurse-primary">គិលានុបដ្ឋាកបឋម</option>
                      <option value="dental-nurse">ទន្តគិលានុបដ្ឋាកមធ្យម</option>
                      <option value="lab-technician">អ្នកបច្ចេកទេសមន្ទីរពិសោធន៍មធ្យម</option>
                      <option value="radiologist">អ្នកបច្ចេកទេសវិទ្យុសាស្រ្ត</option>
                      <option value="physiotherapist">ព្យាបាលដោយចលនាមធ្យម</option>
                      <option value="it-specialist">ព័ត៌មានវិទ្យា</option>
                      <option value="accountant">គណនេយ្យករ</option>
                      <option value="public-admin">រដ្ឋបាល​សាធារណៈ</option>
                      <option value="electrical-engineer">វិស្វកម្មអគ្គិសនី</option>
                      <option value="business">អាជីវក</option>
                      <option value="trader">លក់ដូរ</option>
                      <option value="caregiver">អ្នកថែទាំ</option>
                      <option value="mid-doctor">គ្រូពេទ្យមធ្យម</option>
                      <option value="farmer">កសិករ</option>
                      <option value="worker">កម្មករ</option>
                      <option value="student">និស្សិត</option>
                      <option value="retired">រាជការនិវត្ត</option>
                      <option value="unemployed">គ្មានការងារ</option>
                      <option value="housewife">មេផ្ទះ</option>
                      <option value="other">ផ្សេងៗ</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>ទីកន្លែងបំពេញការងារ</label>
                    <input v-model="formData.spouseWorkplace" type="text" placeholder="ទីកន្លែងបំពេញការងារ" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>ជនជាតិ</label>
                    <select v-model="formData.spouseEthnicity">
                      <option value="">ជ្រើសរើស</option>
                      <option value="khmer">ខ្មែរ</option>
                      <option value="chinese">ចិន</option>
                      <option value="vietnamese">វៀតណាម</option>
                      <option value="cham">ចាម</option>
                      <option value="other">ផ្សេងៗ</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>សញ្ជាតិ</label>
                    <select v-model="formData.spouseNationality">
                      <option value="">ជ្រើសរើស</option>
                      <option value="khmer">ខ្មែរ</option>
                      <option value="foreigner">បរទេស</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Spouse Birth Place Block -->
              <div class="form-block birthplace-block">
                <div class="form-section-header">
                  <i class="pi pi-map-marker"></i>
                  <h4>ទីកន្លែងកំណើតសហព័ទ្ធ</h4>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>រាជធានី/ខេត្ត</label>
                    <input v-model="formData.spouseBirthProvince" type="text" placeholder="រាជធានី/ខេត្ត" />
                  </div>
                  <div class="form-group">
                    <label>ស្រុក/ខណ្ឌ</label>
                    <input v-model="formData.spouseBirthDistrict" type="text" placeholder="ស្រុក/ខណ្ឌ" />
                  </div>
                  <div class="form-group">
                    <label>ឃុំ/សង្កាត់</label>
                    <input v-model="formData.spouseBirthCommune" type="text" placeholder="ឃុំ/សង្កាត់" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>ភូមិ</label>
                    <input v-model="formData.spouseBirthVillage" type="text" placeholder="ភូមិ" />
                  </div>
                  <div class="form-group">
                    <label>ផ្ទះលេខ</label>
                    <input v-model="formData.spouseBirthHouseNumber" type="text" placeholder="ផ្ទះលេខ" />
                  </div>
                  <div class="form-group">
                    <label>ផ្លូវលេខ</label>
                    <input v-model="formData.spouseBirthStreetNumber" type="text" placeholder="ផ្លូវលេខ" />
                  </div>
                </div>
              </div>

              <!-- Spouse Current Address Block -->
              <div class="form-block address-block">
                <div class="form-section-header">
                  <i class="pi pi-home"></i>
                  <h4>អាសយដ្ឋានសហព័ទ្ធ</h4>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>រាជធានី/ខេត្ត</label>
                    <input v-model="formData.spouseAddressProvince" type="text" placeholder="រាជធានី/ខេត្ត" />
                  </div>
                  <div class="form-group">
                    <label>ស្រុក/ខណ្ឌ</label>
                    <input v-model="formData.spouseAddressDistrict" type="text" placeholder="ស្រុក/ខណ្ឌ" />
                  </div>
                  <div class="form-group">
                    <label>ឃុំ/សង្កាត់</label>
                    <input v-model="formData.spouseAddressCommune" type="text" placeholder="ឃុំ/សង្កាត់" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>ភូមិ</label>
                    <input v-model="formData.spouseAddressVillage" type="text" placeholder="ភូមិ" />
                  </div>
                  <div class="form-group">
                    <label>ផ្ទះលេខ</label>
                    <input v-model="formData.spouseAddressHouseNumber" type="text" placeholder="ផ្ទះលេខ" />
                  </div>
                  <div class="form-group">
                    <label>ផ្លូវលេខ</label>
                    <input v-model="formData.spouseAddressStreetNumber" type="text" placeholder="ផ្លូវលេខ" />
                  </div>
                </div>
              </div>

              <!-- Spouse Contact Information Block -->
              <div class="form-block emergency-block">
                <div class="form-section-header">
                  <i class="pi pi-phone"></i>
                  <h4>លេខទំនាក់ទំនង</h4>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>លេខទូរស័ព្ទ</label>
                    <input v-model="formData.spousePhone" type="tel" placeholder="+855 12 345 678" />
                  </div>
                  <div class="form-group">
                    <label>អ៊ីម៉ែល</label>
                    <input v-model="formData.spouseEmail" type="email" placeholder="email@example.com" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 4: Children Information -->
          <div v-show="activeIconTab === 3" class="tab-content">
            <div class="form-block">
              <div class="form-section-header">
                <i class="pi pi-users"></i>
                <h4>ព័ត៌មានកូន</h4>
                <button type="button" class="btn-add-child" @click="addChild">
                  <i class="pi pi-user-plus"></i> បន្ថែមកូនថ្មី
                </button>
              </div>

              <div v-if="formData.children && formData.children.length > 0" class="children-table-container">
                <table class="children-table">
                  <thead>
                    <tr>
                      <th>ល.រ</th>
                      <th>លេខសំបុត្រកំណើត</th>
                      <th>គោត្តនាម និងនាម</th>
                      <th>ភេទ</th>
                      <th>ថ្ងៃខែឆ្នាំកំណើត</th>
                      <th>មុខរបរ</th>
                      <th>គណនា</th>
                      <th>សម្ភាសន៍</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(child, index) in formData.children" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td>{{ child.birthCertificateNo }}</td>
                      <td>{{ child.khmerName }}</td>
                      <td>{{ child.gender }}</td>
                      <td>{{ child.birthDay }}/{{ child.birthMonth }}/{{ child.birthYear }}</td>
                      <td>{{ child.occupation }}</td>
                      <td>
                        <span v-if="child.supportStatus === 'applied'" class="status-indicator active">
                          <i class="pi pi-check-circle"></i> មាន
                        </span>
                        <span v-else class="status-indicator inactive">
                          <i class="pi pi-circle"></i> គ្មាន
                        </span>
                      </td>
                      <td>
                        <div class="action-buttons">
                          <button type="button" class="btn-edit" @click="editChild(index)" title="កែប្រែ">
                            <i class="pi pi-pencil"></i>
                          </button>
                          <button type="button" class="btn-delete-child" @click="deleteChild(index)" title="លុប">
                            <i class="pi pi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-else class="empty-state">
                <i class="pi pi-inbox"></i>
                <p>មិនមាននិទ្ទេស/កូនទេ</p>
              </div>
            </div>

            <!-- Child Form Modal -->
            <div v-if="childFormVisible" class="child-form-overlay">
              <div class="child-form-modal">
                <div class="child-form-header">
                  <h4 class="siemreap-font-13">{{ editingChildIndex !== null ? 'កែប្រែទិន្នន័យកូន' : 'បន្ថែមកូនថ្មី' }}</h4>
                  <button type="button" class="btn-close" @click="closeChildForm">
                    <i class="pi pi-times"></i>
                  </button>
                </div>

                <div class="child-form-body">
                  <!-- Row 1: Birth Certificate, Khmer Name, Latin Name (3 columns) -->
                  <div class="form-row-3col">
                    <div class="form-group">
                      <label>លេខសំបុត្រកំណើត</label>
                      <input v-model="currentChild.birthCertificateNo" type="text" placeholder="លេខសំបុត្រកំណើត" />
                    </div>
                    <div class="form-group">
                      <label>គោត្តនាម និងនាម</label>
                      <input v-model="currentChild.khmerName" type="text" placeholder="គោត្តនាម និងនាម" />
                    </div>
                    <div class="form-group">
                      <label>គោត្តនាម និងនាមឡាតាំង</label>
                      <input v-model="currentChild.latinName" type="text" placeholder="គោត្តនាម និងនាមឡាតាំង" />
                    </div>
                  </div>

                  <!-- Row 2: Gender, Birth Date, Occupation (3 columns) -->
                  <div class="form-row-3col">
                    <div class="form-group">
                      <label>ភេទ</label>
                      <select v-model="currentChild.gender">
                        <option value="">ជ្រើសរើស</option>
                        <option value="ប្រុស">ប្រុស</option>
                        <option value="ស្រី">ស្រី</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>ថ្ងៃខែឆ្នាំកំណើត</label>
                      <div class="date-inputs-compact">
                        <input v-model="currentChild.birthDay" type="number" placeholder="ថ្ងៃ" min="1" max="31" />
                        <input v-model="currentChild.birthMonth" type="number" placeholder="ខែ" min="1" max="12" />
                        <input v-model="currentChild.birthYear" type="number" placeholder="ឆ្នាំ" min="1900" />
                      </div>
                    </div>
                    <div class="form-group">
                      <label>មុខរបរ</label>
                      <select v-model="currentChild.occupation">
                        <option value="">ជ្រើសរើស</option>
                        <option value="government-employee">មន្ត្រីរាជការ</option>
                        <option value="teacher">គ្រូបង្រៀន</option>
                        <option value="loading">ក្នុងបន្ទុក</option>
                        <option value="high-school">សិស្ស</option>
                        <option value="university">និស្សិត</option>
                        <option value="professor">សាស្ត្រាចារ្យមហាបរិញ្ញា</option>
                        <option value="associate-professor">សាស្ដ្រាចារ្យរង</option>
                        <option value="assistant-professor">សាស្ដ្រាចារ្យជំនួយ</option>
                        <option value="medical-specialist">វេជ្ជបណ្ខិតឯកទេស</option>
                        <option value="medical-master">វេជ្ជបណ្ខិត(ជំនាญ/អនុបណ្ឌិត)</option>
                        <option value="medical-doctor">វេជ្ជបណ្ឌិត</option>
                        <option value="dentist">ទន្ដបណ្ឌិត</option>
                        <option value="pharmacist">ឱសថការី</option>
                        <option value="nurse-bachelor">គិលានុបដ្ឋាក(បរិញ្ញាបត្រ)</option>
                        <option value="midwife-bachelor">ឆ្មប(បរិញ្ញាបត្រ)</option>
                        <option value="nurse-secondary">គិលានុបដ្ឋាកមធ្យម</option>
                        <option value="midwife-secondary">ឆ្មបមធ្យម</option>
                        <option value="nurse-primary">គិលានុបដ្ឋាកបឋម</option>
                        <option value="dental-nurse">ទន្តគិលានុបដ្ឋាកមធ្យម</option>
                        <option value="lab-technician">អ្នកបច្ចេកទេសមន្ទីរពិសោធន៍មធ្យម</option>
                        <option value="radiologist">អ្នកបច្ចេកទេសវិទ្យុសាស្រ្ត</option>
                        <option value="physiotherapist">ព្យាបាលដោយចលនាមធ្យម</option>
                        <option value="it-specialist">ព័ត៌មានវិទ្យា</option>
                        <option value="accountant">គណនេយ្យករ</option>
                        <option value="public-admin">រដ្ឋបាល​សាធារណៈ</option>
                        <option value="electrical-engineer">វិស្វកម្មអគ្គិសនី</option>
                        <option value="business">អាជីវក</option>
                        <option value="trader">លក់ដូរ</option>
                        <option value="caregiver">អ្នកថែទាំ</option>
                        <option value="mid-doctor">គ្រូពេទ្យមធ្យម</option>
                        <option value="farmer">កសិករ</option>
                        <option value="worker">កម្មករ</option>
                        <option value="retired">រាជការនិវត្ត</option>
                        <option value="unemployed">គ្មានការងារ</option>
                        <option value="housewife">មេផ្ទះ</option>
                        <option value="other">ផ្សេងៗ</option>
                      </select>
                    </div>
                  </div>

                  <!-- Row 3: Radio buttons and Remarks (3 columns) -->
                  <div class="form-row-3col">
                    <div class="form-group">
                      <label>ការគាំទ្រ</label>
                      <div class="radio-group">
                        <label class="radio-label">
                          <input type="radio" v-model="currentChild.supportStatus" value="applied" />
                          <span>បានស្នើសុំប្រាក់ឧបត្ថម្ភ</span>
                        </label>
                        <label class="radio-label">
                          <input type="radio" v-model="currentChild.supportStatus" value="not-applied" />
                          <span>មិនទាន់បានស្នើប្រាក់ឧបត្ថម្ភ</span>
                        </label>
                      </div>
                    </div>
                    <div class="form-group full-width-2col">
                      <label>ផ្សេងៗ</label>
                      <textarea v-model="currentChild.remarks" placeholder="ផ្សេងៗ" rows="2"></textarea>
                    </div>
                  </div>

                  <!-- File Upload Block -->
                  <div class="attachment-block">
                    <div class="block-header">
                      <i class="pi pi-paperclip"></i>
                      <h5 class="siemreap-font-12">ឯកសារកូនដែលកើត</h5>
                    </div>
                    <div class="file-upload-area">
                      <input 
                        type="file" 
                        @change="handleChildFileUpload" 
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        class="file-input"
                        ref="childFileInput"
                      />
                      <label for="childFileInput" class="file-upload-label siemreap-font-12">
                        <i class="pi pi-cloud-upload"></i>
                        <span>ចុចដើម្បីយក​ឯកសារ ឬ Drag & Drop</span>
                        <small>ឯកសារដែលទទួលយក: PDF, JPG, PNG, DOC, DOCX (5 Megabyte)</small>
                      </label>
                    </div>
                    <div v-if="currentChild.attachmentFile" class="file-info">
                      <i class="pi pi-check-circle"></i>
                      <span>{{ currentChild.attachmentFile.name }} ({{ formatFileSize(currentChild.attachmentFile.size) }})</span>
                      <button type="button" class="btn-remove-file" @click="removeChildFile">
                        <i class="pi pi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="child-form-footer">
                  <button type="button" class="btn-cancel" @click="closeChildForm">
                    <i class="pi pi-times"></i> បោះបង់
                  </button>
                  <button type="button" class="btn-submit" @click="saveChild">
                    <i class="pi pi-check"></i> រក្សាទុក
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 5: Education/Culture Information -->
          <div v-show="activeIconTab === 4" class="tab-content">
            <!-- Cultural Level Block -->
            <div class="form-block">
              <div class="form-section-header">
                <i class="pi pi-graduation-cap"></i>
                <h4>កម្រិតវប្បធម៌</h4>
                <button type="button" class="btn-add-child" @click="addEducation">
                  <i class="pi pi-plus"></i> បញ្ចូលកម្រិតវប្បធម៌
                </button>
              </div>

              <div v-if="formData.educationRecords && formData.educationRecords.length > 0" class="children-table-container">
                <table class="children-table">
                  <thead>
                    <tr>
                      <th>ល.រ</th>
                      <th>វគ្គសិក្សា</th>
                      <th>កម្រិតសិក្សា</th>
                      <th>ប្រភេទសញ្ញាបត្រ</th>
                      <th>គ្រឹះស្ថានសិក្សា</th>
                      <th>ជំនាញ</th>
                      <th>ឆ្នាំចូល-បញ្ចប់</th>
                      <th>សកម្មភាព</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(edu, index) in formData.educationRecords" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td>{{ edu.courseType }}</td>
                      <td>{{ edu.educationLevel }}</td>
                      <td>{{ edu.certificateType }}</td>
                      <td>{{ edu.institution }}</td>
                      <td>{{ edu.major }}</td>
                      <td>{{ edu.educationStartYear }} - {{ edu.educationEndYear }}</td>
                      <td>
                        <div class="action-buttons">
                          <button type="button" class="btn-edit" @click="editEducation(index)" title="កែប្រែ">
                            <i class="pi pi-pencil"></i>
                          </button>
                          <button type="button" class="btn-delete-child" @click="deleteEducation(index)" title="លុប">
                            <i class="pi pi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-else class="empty-state">
                <i class="pi pi-graduation-cap"></i>
                <p>មិនទាន់មានកម្រិតវប្បធម៌។ សូមចុចប៊ូតុង "បញ្ចូលកម្រិតវប្បធម៌" ដើម្បីបន្ថែម។</p>
              </div>

              <!-- Education Form Modal -->
              <div v-if="educationFormVisible" class="modal-overlay" @click.self="closeEducationForm">
                <div class="modal-content-large">
                  <div class="modal-header">
                    <h3>{{ editingEducationIndex !== null ? 'កែប្រែកម្រិតវប្បធម៌' : 'បញ្ចូលកម្រិតវប្បធម៌' }}</h3>
                    <button type="button" class="btn-close-modal" @click="closeEducationForm">
                      <i class="pi pi-times"></i>
                    </button>
                  </div>

                  <div class="modal-body">
                    <div class="form-row">
                      <div class="form-group">
                        <label>វគ្គសិក្សា <span class="required">*</span></label>
                        <select v-model="currentEducation.courseType" class="form-input">
                          <option value="">-- ជ្រើសរើស --</option>
                          <option value="មត្តេយ្យសិក្សា">មត្តេយ្យសិក្សា</option>
                          <option value="បឋមសិក្សា">បឋមសិក្សា</option>
                          <option value="អនុវិទ្យាល័យ">អនុវិទ្យាល័យ</option>
                          <option value="វិទ្យាល័យ">វិទ្យាល័យ</option>
                          <option value="មហាវិទ្យាល័យ">មហាវិទ្យាល័យ</option>
                          <option value="បរិញ្ញាបត្រ">បរិញ្ញាបត្រ</option>
                          <option value="អនុបណ្ឌិត">អនុបណ្ឌិត</option>
                          <option value="បណ្ឌិត">បណ្ឌិត</option>
                          <option value="ផ្សេងៗ">ផ្សេងៗ</option>
                        </select>
                      </div>

                      <div class="form-group">
                        <label>កម្រិតសិក្សា <span class="required">*</span></label>
                        <select v-model="currentEducation.educationLevel" class="form-input">
                          <option value="">-- ជ្រើសរើស --</option>
                          <option value="មិនចេះអក្សរ">មិនចេះអក្សរ</option>
                          <option value="បឋមសិក្សា">បឋមសិក្សា</option>
                          <option value="អនុវិទ្យាល័យ">អនុវិទ្យាល័យ</option>
                          <option value="វិទ្យាល័យ">វិទ្យាល័យ</option>
                          <option value="បរិញ្ញាបត្រ">បរិញ្ញាបត្រ</option>
                          <option value="បរិញ្ញាបត្ររង">បរិញ្ញាបត្ររង</option>
                          <option value="អនុបណ្ឌិត">អនុបណ្ឌិត</option>
                          <option value="បណ្ឌិត">បណ្ឌិត</option>
                        </select>
                      </div>
                    </div>

                    <div class="form-row">
                      <div class="form-group">
                        <label>ប្រភេទសញ្ញាបត្រ</label>
                        <select v-model="currentEducation.certificateType" class="form-input">
                          <option value="">-- ជ្រើសរើស --</option>
                          <option value="សញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិ">សញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិ</option>
                          <option value="សញ្ញាបត្របរិញ្ញាបត្រ">សញ្ញាបត្របរិញ្ញាបត្រ</option>
                          <option value="សញ្ញាបត្រអនុបណ្ឌិត">សញ្ញាបត្រអនុបណ្ឌិត</option>
                          <option value="សញ្ញាបត្របណ្ឌិត">សញ្ញាបត្របណ្ឌិត</option>
                          <option value="វិញ្ញាបនប័ត្រវិជ្ជាជីវៈ">វិញ្ញាបនប័ត្រវិជ្ជាជីវៈ</option>
                          <option value="ផ្សេងៗ">ផ្សេងៗ</option>
                        </select>
                      </div>

                      <div class="form-group">
                        <label>គ្រឹះស្ថានសិក្សា</label>
                        <input v-model="currentEducation.institution" type="text" class="form-input" placeholder="បញ្ចូលឈ្មោះគ្រឹះស្ថានសិក្សា" />
                      </div>
                    </div>

                    <div class="form-row">
                      <div class="form-group">
                        <label>ជំនាញ</label>
                        <input v-model="currentEducation.major" type="text" class="form-input" placeholder="ជំនាញ / ឯកទេស" />
                      </div>

                      <div class="form-group">
                        <label>ថ្ងៃខែឆ្នាំចូលសិក្សា</label>
                        <div class="date-inputs">
                          <select v-model="currentEducation.educationStartDay" class="form-input-small">
                            <option value="">ថ្ងៃ</option>
                            <option v-for="d in 31" :key="d" :value="d">{{ d }}</option>
                          </select>
                          <select v-model="currentEducation.educationStartMonth" class="form-input-small">
                            <option value="">ខែ</option>
                            <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
                          </select>
                          <select v-model="currentEducation.educationStartYear" class="form-input-small">
                            <option value="">ឆ្នាំ</option>
                            <option v-for="y in 100" :key="y" :value="2026 - y">{{ 2026 - y }}</option>
                          </select>
                        </div>
                      </div>

                      <div class="form-group">
                        <label>ថ្ងៃខែឆ្នាំបញ្ចប់សិក្សា</label>
                        <div class="date-inputs">
                          <select v-model="currentEducation.educationEndDay" class="form-input-small">
                            <option value="">ថ្ងៃ</option>
                            <option v-for="d in 31" :key="d" :value="d">{{ d }}</option>
                          </select>
                          <select v-model="currentEducation.educationEndMonth" class="form-input-small">
                            <option value="">ខែ</option>
                            <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
                          </select>
                          <select v-model="currentEducation.educationEndYear" class="form-input-small">
                            <option value="">ឆ្នាំ</option>
                            <option v-for="y in 100" :key="y" :value="2026 - y">{{ 2026 - y }}</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div class="form-row">
                      <div class="form-group full-width">
                        <label>វគ្គបណ្តុះបណ្តាលផ្សេងៗ</label>
                        <textarea v-model="currentEducation.otherTraining" class="form-input" rows="3" placeholder="វគ្គបណ្តុះបណ្តាលផ្សេងៗ"></textarea>
                      </div>
                    </div>

                    <div class="form-row">
                      <div class="form-group full-width">
                        <label>ទីកន្លែងសិក្សា</label>
                        <textarea v-model="currentEducation.studyLocation" class="form-input" rows="2" placeholder="ទីកន្លែងសិក្សា"></textarea>
                      </div>
                    </div>
                  </div>

                  <div class="child-form-footer">
                    <button type="button" class="btn-cancel" @click="closeEducationForm">
                      <i class="pi pi-times"></i> បោះបង់
                    </button>
                    <button type="button" class="btn-submit" @click="saveEducation">
                      <i class="pi pi-check"></i> រក្សាទុក
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Foreign Language Block -->
            <div class="form-block" style="margin-top: 1.5rem;">
              <div class="form-section-header">
                <i class="pi pi-comments"></i>
                <h4>កម្រិតភាសារបរទេស</h4>
                <button type="button" class="btn-add-child" @click="addLanguage">
                  <i class="pi pi-plus"></i> បញ្ចូលភាសារបរទេស
                </button>
              </div>

              <div v-if="formData.languageRecords && formData.languageRecords.length > 0" class="children-table-container">
                <table class="children-table">
                  <thead>
                    <tr>
                      <th>ល.រ</th>
                      <th>ភាសាបរទេស</th>
                      <th>ការអាន</th>
                      <th>ការសន្ទនា</th>
                      <th>ការសរសេរ</th>
                      <th>សកម្មភាព</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(lang, index) in formData.languageRecords" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td>{{ lang.foreignLanguage }}</td>
                      <td>{{ lang.readingLevel }}</td>
                      <td>{{ lang.speakingLevel }}</td>
                      <td>{{ lang.writingLevel }}</td>
                      <td>
                        <div class="action-buttons">
                          <button type="button" class="btn-edit" @click="editLanguage(index)" title="កែប្រែ">
                            <i class="pi pi-pencil"></i>
                          </button>
                          <button type="button" class="btn-delete-child" @click="deleteLanguage(index)" title="លុប">
                            <i class="pi pi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-else class="empty-state">
                <i class="pi pi-comments"></i>
                <p>មិនទាន់មានភាសារបរទេស។ សូមចុចប៊ូតុង "បញ្ចូលភាសារបរទេស" ដើម្បីបន្ថែម។</p>
              </div>

              <!-- Language Form Modal -->
              <div v-if="languageFormVisible" class="modal-overlay" @click.self="closeLanguageForm">
                <div class="modal-content-large">
                  <div class="modal-header">
                    <h3>{{ editingLanguageIndex !== null ? 'កែប្រែភាសារបរទេស' : 'បញ្ចូលភាសារបរទេស' }}</h3>
                    <button type="button" class="btn-close-modal" @click="closeLanguageForm">
                      <i class="pi pi-times"></i>
                    </button>
                  </div>

                  <div class="modal-body">
                    <div class="form-row">
                      <div class="form-group">
                        <label>ភាសាបរទេស <span class="required">*</span></label>
                        <select v-model="currentLanguage.foreignLanguage" class="form-input">
                          <option value="">-- ជ្រើសរើស --</option>
                          <option value="អង់គ្លេស">អង់គ្លេស</option>
                          <option value="បារាំង">បារាំង</option>
                          <option value="ចិន">ចិន</option>
                          <option value="ជប៉ុន">ជប៉ុន</option>
                          <option value="កូរ៉េ">កូរ៉េ</option>
                          <option value="វៀតណាម">វៀតណាម</option>
                          <option value="ថៃ">ថៃ</option>
                          <option value="ឡាវ">ឡាវ</option>
                          <option value="ផ្សេងៗ">ផ្សេងៗ</option>
                        </select>
                      </div>

                      <div class="form-group">
                        <label>ការអាន <span class="required">*</span></label>
                        <select v-model="currentLanguage.readingLevel" class="form-input">
                          <option value="">-- ជ្រើសរើស --</option>
                          <option value="ពូកែ">ពូកែ</option>
                          <option value="ល្អ">ល្អ</option>
                          <option value="មធ្យម">មធ្យម</option>
                          <option value="ខ្សោយ">ខ្សោយ</option>
                        </select>
                      </div>
                    </div>

                    <div class="form-row">
                      <div class="form-group">
                        <label>ការសន្ទនា <span class="required">*</span></label>
                        <select v-model="currentLanguage.speakingLevel" class="form-input">
                          <option value="">-- ជ្រើសរើស --</option>
                          <option value="ពូកែ">ពូកែ</option>
                          <option value="ល្អ">ល្អ</option>
                          <option value="មធ្យម">មធ្យម</option>
                          <option value="ខ្សោយ">ខ្សោយ</option>
                        </select>
                      </div>

                      <div class="form-group">
                        <label>ការសរសេរ <span class="required">*</span></label>
                        <select v-model="currentLanguage.writingLevel" class="form-input">
                          <option value="">-- ជ្រើសរើស --</option>
                          <option value="ពូកែ">ពូកែ</option>
                          <option value="ល្អ">ល្អ</option>
                          <option value="មធ្យម">មធ្យម</option>
                          <option value="ខ្សោយ">ខ្សោយ</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div class="child-form-footer">
                    <button type="button" class="btn-cancel" @click="closeLanguageForm">
                      <i class="pi pi-times"></i> បោះបង់
                    </button>
                    <button type="button" class="btn-submit" @click="saveLanguage">
                      <i class="pi pi-check"></i> រក្សាទុក
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 6: Work/Official Information -->
          <div v-show="activeIconTab === 5" class="tab-content">
            <!-- Position and Rank Block -->
            <div class="form-block">
              <div class="form-section-header">
                <i class="pi pi-briefcase"></i>
                <h4>ព័ត៌មានការងារ និងឋានៈ</h4>
              </div>

              <!-- Employment Basic Info -->
              <div class="form-row">
                <div class="form-group">
                  <label>លេខមន្រ្តីរាជការ <span class="required">*</span></label>
                  <input v-model="formData.civilServantId" type="text" placeholder="លេខមន្រ្តីរាជការ" />
                </div>
                <div class="form-group">
                  <label>ថ្ងៃចូលបម្រើការងារ</label>
                  <input v-model="formData.startWorkDate" type="date" />
                </div>
                <div class="form-group">
                  <label>ថ្ងៃតែងតាំង</label>
                  <input v-model="formData.appointmentDate" type="date" />
                </div>
              </div>

              <!-- Position Information -->
              <div class="form-block general-info-block">
                <div class="form-section-header">
                  <i class="pi pi-sitemap"></i>
                  <h4>ឋានន្តរស័ក្តិ (Position)</h4>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>ឋានន្តរស័ក្តិបច្ចុប្បន្ន <span class="required">*</span></label>
                    <SearchableSelect 
                      v-model="formData.position"
                      :options="positionOptions"
                      placeholder="ជ្រើសរើសឬស្វែងរកមុខតំណែង"
                    />
                  </div>
                  <div class="form-group">
                    <label>ក្រសួង/ស្ថាប័ន</label>
                    <input v-model="formData.ministry" type="text" placeholder="ក្រសួង/ស្ថាប័ន" />
                  </div>
                  <div class="form-group">
                    <label>នាយកដ្ឋាន/អង្គភាព</label>
                    <SearchableSelect 
                      v-model="formData.department"
                      :options="departmentOptions"
                      placeholder="ជ្រើសរើសឬស្វែងរកអង្គភាព"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>លេខអនុក្រឹត្យ/សេចក្តីសម្រេចតែងតាំង</label>
                    <input v-model="formData.appointmentLetterNo" type="text" placeholder="លេខអនុក្រឹត្យ/សេចក្តីសម្រេច" />
                  </div>
                  <div class="form-group">
                    <label>ថ្ងៃចុះហត្ថលេខា</label>
                    <input v-model="formData.appointmentSignatureDate" type="date" />
                  </div>
                  <div class="form-group">
                    <label>ថ្ងៃផុតកំណត់</label>
                    <input v-model="formData.appointmentEndDate" type="date" />
                  </div>
                </div>
              </div>

              <!-- Rank and Grade Information -->
              <div class="form-block general-info-block">
                <div class="form-section-header">
                  <i class="pi pi-star"></i>
                  <h4>ថ្នាក់និងជំហាន (Rank and Grade)</h4>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>ថ្នាក់និងជំហាន <span class="required">*</span></label>
                    <select v-model="formData.rankAndGrade">
                      <option value="">ជ្រើសរើស</option>
                      <option value="ថ្នាក់ខ ជំហាន១">ថ្នាក់ខ ជំហាន១</option>
                      <option value="ថ្នាក់ខ ជំហាន២">ថ្នាក់ខ ជំហាន២</option>
                      <option value="ថ្នាក់ខ ជំហាន៣">ថ្នាក់ខ ជំហាន៣</option>
                      <option value="ថ្នាក់ខ ជំហាន៤">ថ្នាក់ខ ជំហាន៤</option>
                      <option value="ថ្នាក់គ ជំហាន១">ថ្នាក់គ ជំហាន១</option>
                      <option value="ថ្នាក់គ ជំហាន២">ថ្នាក់គ ជំហាន២</option>
                      <option value="ថ្នាក់គ ជំហាន៣">ថ្នាក់គ ជំហាន៣</option>
                      <option value="ថ្នាក់គ ជំហាន៤">ថ្នាក់គ ជំហាន៤</option>
                      <option value="ថ្នាក់គ ជំហាន៥">ថ្នាក់គ ជំហាន៥</option>
                      <option value="ថ្នាក់គ ជំហាន៦">ថ្នាក់គ ជំហាន៦</option>
                      <option value="ថ្នាក់គ ជំហាន៧">ថ្នាក់គ ជំហាន៧</option>
                      <option value="ថ្នាក់ឃ ជំហាន១">ថ្នាក់ឃ ជំហាន១</option>
                      <option value="ថ្នាក់ឃ ជំហាន២">ថ្នាក់ឃ ជំហាន២</option>
                      <option value="ថ្នាក់ឃ ជំហាន៣">ថ្នាក់ឃ ជំហាន៣</option>
                      <option value="ថ្នាក់ឃ ជំហាន៤">ថ្នាក់ឃ ជំហាន៤</option>
                      <option value="ថ្នាក់ឃ ជំហាន៥">ថ្នាក់ឃ ជំហាន៥</option>
                      <option value="ថ្នាក់ឃ ជំហាន៦">ថ្នាក់ឃ ជំហាន៦</option>
                      <option value="ថ្នាក់ឃ ជំហាន៧">ថ្នាក់ឃ ជំហាន៧</option>
                      <option value="ថ្នាក់ឃ ជំហាន៨">ថ្នាក់ឃ ជំហាន៨</option>
                      <option value="ថ្នាក់ង ជំហាន១">ថ្នាក់ង ជំហាន១</option>
                      <option value="ថ្នាក់ង ជំហាន២">ថ្នាក់ង ជំហាន២</option>
                      <option value="ថ្នាក់ង ជំហាន៣">ថ្នាក់ង ជំហាន៣</option>
                      <option value="ថ្នាក់ង ជំហាន៤">ថ្នាក់ង ជំហាន៤</option>
                      <option value="ថ្នាក់ង ជំហាន៥">ថ្នាក់ង ជំហាន៥</option>
                      <option value="ថ្នាក់ង ជំហាន៦">ថ្នាក់ង ជំហាន៦</option>
                      <option value="ថ្នាក់ង ជំហាន៧">ថ្នាក់ង ជំហាន៧</option>
                      <option value="ថ្នាក់ង ជំហាន៨">ថ្នាក់ង ជំហាន៨</option>
                      <option value="ថ្នាក់ង ជំហាន៩">ថ្នាក់ង ជំហាន៩</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>មាត្រដ្ឋានប្រាក់ខែ (Pay Scale)</label>
                    <select v-model="formData.payScale">
                      <option value="">ជ្រើសរើស</option>
                      <option value="CC១">CC១</option>
                      <option value="CC២">CC២</option>
                      <option value="CC៣">CC៣</option>
                      <option value="CC៤">CC៤</option>
                      <option value="CS១">CS១</option>
                      <option value="CS២">CS២</option>
                      <option value="CS៣">CS៣</option>
                      <option value="CS៤">CS៤</option>
                      <option value="CS៥">CS៥</option>
                      <option value="CS៦">CS៦</option>
                      <option value="CS៧">CS៧</option>
                      <option value="PE១">PE១</option>
                      <option value="PE២">PE២</option>
                      <option value="PE៣">PE៣</option>
                      <option value="PE៤">PE៤</option>
                      <option value="PE៥">PE៥</option>
                      <option value="PE៦">PE៦</option>
                      <option value="PE៧">PE៧</option>
                      <option value="PE៨">PE៨</option>
                      <option value="S១">S១</option>
                      <option value="S២">S២</option>
                      <option value="S៣">S៣</option>
                      <option value="S៤">S៤</option>
                      <option value="S៥">S៥</option>
                      <option value="S៦">S៦</option>
                      <option value="S៧">S៧</option>
                      <option value="S៨">S៨</option>
                      <option value="S៩">S៩</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>ក្របខ័ណ្ឌ (Framework)</label>
                    <input v-model="formData.framework" type="text" placeholder="ក្របខ័ណ្ឌ" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>លេខយោង</label>
                    <input v-model="formData.rankReferenceNo" type="text" placeholder="លេខយោង" />
                  </div>
                  <div class="form-group">
                    <label>ប្រភេទបទប្បញ្ញត្តិ</label>
                    <select v-model="formData.regulationType">
                      <option value="">ជ្រើសរើស</option>
                      <option value="អនុក្រឹត្យ">អនុក្រឹត្យ</option>
                      <option value="សេចក្តីសម្រេច">សេចក្តីសម្រេច</option>
                      <option value="ប្រកាស">ប្រកាស</option>
                      <option value="សារាចរ">សារាចរ</option>
                      <option value="ផ្សេងៗ">ផ្សេងៗ</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>ថ្ងៃមានប្រសិទ្ធភាព</label>
                    <input v-model="formData.rankEffectiveDate" type="date" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group full-width">
                    <label>កំណត់សម្គាល់</label>
                    <textarea v-model="formData.civilServantNotes" rows="2" placeholder="កំណត់សម្គាល់"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <div class="form-actions-left">
              <button type="button" class="btn-back" @click="prevTab" v-if="activeIconTab > 0">
                <i class="pi pi-chevron-left"></i> ត្រឡប់ក្រោយ
              </button>
            </div>
            <div class="form-actions-right">
              <button type="button" class="btn-cancel" @click="closeDialog">
                <i class="pi pi-times"></i> បោះបង់
              </button>
              <button type="button" class="btn-next" @click="nextTab" v-if="activeIconTab < iconTabs.length - 1">
                បន្ទាប់ <i class="pi pi-chevron-right"></i>
              </button>
              <button type="submit" class="btn-submit">
                <i class="pi pi-check"></i> រក្សាទុក
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div v-if="deleteDialogVisible" class="modal-overlay" @click.self="deleteDialogVisible = false">
      <div class="modal-content-small">
        <h3>បញ្ជាក់ការលុប</h3>
        <div class="confirmation-content">
          <i class="pi pi-exclamation-triangle" style="font-size: 3rem; color: #f59e0b;"></i>
          <p v-if="selectedEmployee">
            តើអ្នកពិតជាចង់លុបបុគ្គលិក <strong>{{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</strong>?
          </p>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="deleteDialogVisible = false">
            <i class="pi pi-times"></i> បោះបង់
          </button>
          <button class="btn-delete" @click="deleteEmployee">
            <i class="pi pi-trash"></i> លុប
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';
import SearchableSelect from '../components/SearchableSelect.vue';

const router = useRouter();
const employees = ref([]);
const dialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const selectedEmployee = ref(null);
const dialogMode = ref('create');
const activeIconTab = ref(0);
const childFormVisible = ref(false);
const editingChildIndex = ref(null);
const currentChild = ref({
  birthCertificateNo: '',
  khmerName: '',
  latinName: '',
  gender: '',
  birthDay: '',
  birthMonth: '',
  birthYear: '',
  occupation: '',
  supportStatus: 'not-applied',
  remarks: '',
  attachmentFile: null
});

const educationFormVisible = ref(false);
const editingEducationIndex = ref(null);
const currentEducation = ref({
  courseType: '',
  educationLevel: '',
  certificateType: '',
  institution: '',
  major: '',
  educationStartDay: '',
  educationStartMonth: '',
  educationStartYear: '',
  educationEndDay: '',
  educationEndMonth: '',
  educationEndYear: '',
  otherTraining: '',
  studyLocation: ''
});

const languageFormVisible = ref(false);
const editingLanguageIndex = ref(null);
const currentLanguage = ref({
  foreignLanguage: '',
  readingLevel: '',
  speakingLevel: '',
  writingLevel: ''
});

const formData = ref({
  employeeId: '',
  khmerSurname: '',
  khmerGivenName: '',
  latinSurname: '',
  latinGivenName: '',
  gender: '',
  birthDay: '',
  birthMonth: '',
  birthYear: '',
  bloodType: '',
  civilServantId: '',
  birthCertificateNo: '',
  nationalIdNo: '',
  idValidFrom: null,
  idExpiryDate: null,
  passportNo: '',
  citizenship: '',
  ethnicity: '',
  phone1: '',
  phone2: '',
  email: '',
  otherInfo: '',
  maritalStatus: '',
  physicalAttributes: '',
  photo: null,
  // Birth Place
  birthProvince: '',
  birthDistrict: '',
  birthCommune: '',
  birthVillage: '',
  birthHouseNumber: '',
  birthStreetNumber: '',
  // Current Address
  addressProvince: '',
  addressDistrict: '',
  addressCommune: '',
  addressVillage: '',
  addressHouseNumber: '',
  addressStreetNumber: '',
  // Emergency Contact
  emergencySurname: '',
  emergencyGivenName: '',
  emergencyGender: '',
  emergencyRelationship: '',
  emergencyOccupation: '',
  emergencyProvince: '',
  emergencyDistrict: '',
  emergencyCommune: '',
  emergencyVillage: '',
  emergencyHouseNumber: '',
  emergencyStreetNumber: '',
  emergencyPhone: '',
  emergencyEmail: '',
  // Father Information
  fatherName: '',
  fatherLatinName: '',
  fatherBirthDay: '',
  fatherBirthMonth: '',
  fatherBirthYear: '',
  fatherStatus: '',
  fatherEthnicity: '',
  fatherNationality: '',
  fatherOccupation: '',
  fatherBirthProvince: '',
  fatherBirthDistrict: '',
  fatherBirthCommune: '',
  fatherBirthVillage: '',
  // Mother Information
  motherName: '',
  motherLatinName: '',
  motherBirthDay: '',
  motherBirthMonth: '',
  motherBirthYear: '',
  motherStatus: '',
  motherEthnicity: '',
  motherNationality: '',
  motherOccupation: '',
  motherBirthProvince: '',
  motherBirthDistrict: '',
  motherBirthCommune: '',
  motherBirthVillage: '',
  // Spouse Information
  spouseWorksHere: false,
  marriageCertificateNo: '',
  spouseNationalId: '',
  spouseName: '',
  spouseLatinName: '',
  spouseBirthDay: '',
  spouseBirthMonth: '',
  spouseBirthYear: '',
  spouseStatus: '',
  spouseOccupation: '',
  spouseWorkplace: '',
  spouseEthnicity: '',
  spouseNationality: '',
  spouseBirthProvince: '',
  spouseBirthDistrict: '',
  spouseBirthCommune: '',
  spouseBirthVillage: '',
  spouseBirthHouseNumber: '',
  spouseBirthStreetNumber: '',
  spouseAddressProvince: '',
  spouseAddressDistrict: '',
  spouseAddressCommune: '',
  spouseAddressVillage: '',
  spouseAddressHouseNumber: '',
  spouseAddressStreetNumber: '',
  spousePhone: '',
  spouseEmail: '',
  // Children Information
  children: [],
  // Education/Culture Information
  courseType: '',
  educationLevel: '',
  certificateType: '',
  institution: '',
  major: '',
  educationStartDay: '',
  educationStartMonth: '',
  educationStartYear: '',
  educationEndDay: '',
  educationEndMonth: '',
  educationEndYear: '',
  otherTraining: '',
  studyLocation: '',
  foreignLanguage: '',
  readingLevel: '',
  speakingLevel: '',
  writingLevel: '',
  // Legacy fields (keeping for backward compatibility)
  schoolName: '',
  startYear: '',
  endYear: '',
  certificate: '',
  khmerLanguage: '',
  englishLanguage: '',
  frenchLanguage: '',
  otherLanguage: '',
  training: '',
  certifications: '',
  culturalSkills: '',
  educationRecords: [],
  languageRecords: [],
  culturalRecords: [],
  // Work/Official Information
  position: '',
  ministry: '',
  department: '',
  appointmentLetterNo: '',
  appointmentSignatureDate: null,
  appointmentEndDate: null,
  rankAndGrade: '',
  payScale: '',
  framework: '',
  rankReferenceNo: '',
  regulationType: '',
  rankEffectiveDate: null,
  startWorkDate: null,
  appointmentDate: null,
  civilServantNotes: ''
});

// Position options for searchable dropdown
const positionOptions = [
  'អនុរដ្ឋលេខាធិការ',
  'អគ្គនាយក',
  'អគ្គនាយករង',
  'អគ្គប្រធាន',
  'អគ្គប្រធានរង',
  'នាយក',
  'នាយករង',
  'ប្រធាន',
  'ប្រធានរង',
  'ប្រធានការិយាល័យ',
  'អនុប្រធានការិយាល័យ',
  'ប្រធានផ្នែក',
  'អនុប្រធានផ្នែក',
  'ប្រធានកុម្មង',
  'អនុប្រធានកុម្មង',
  'អ្នកឯកទេស',
  'អ្នកជំនាញ',
  'អនុប្រធានក្រុម',
  'មន្រ្តីបច្ចេកទេស',
  'មន្រ្តីរដ្ឋបាល',
  'ផ្សេងៗ'
];

// Department options for searchable dropdown
const departmentOptions = [
  'អគ្គនាយកដ្ឋាន រដ្ឋបាល-ហិរញ្ញវត្ថុ',
  'អគ្គនាយកដ្ឋាន បច្ចេកទេសសុខាភិបាល',
  'អគ្គនាយកដ្ឋាន គ្រឹះស្ថានព្យាបាល',
  'អគ្គនាយកដ្ឋាន អាហារូបត្ថម្ភ',
  'អគ្គនាយកដ្ឋាន អប់រំសុខាភិបាល',
  'នាយកដ្ឋាន រដ្ឋបាលទូទៅ',
  'នាយកដ្ឋាន ហិរញ្ញវត្ថុនិងគណនេយ្យ',
  'នាយកដ្ឋាន ធនធានមនុស្ស',
  'នាយកដ្ឋាន ផែនការនិងសហប្រតិបត្តិការ',
  'នាយកដ្ឋាន គ្រឿងឧបភោគបរិក្ខារ',
  'នាយកដ្ឋាន ព្យាបាល',
  'នាយកដ្ឋាន បង្ការនិងគ្រប់គ្រងជំងឺ',
  'នាយកដ្ឋាន អនាម័យមាតាកូននិងដ្ឋានីយកម្ម',
  'នាយកដ្ឋាន បច្ចេកវិទ្យាព័ត៌មានសុខាភិបាល',
  'នាយកដ្ឋាន ធានាគុណភាពសេវាសុខាភិបាល',
  'នាយកដ្ឋាន គ្រឹះស្ថានមន្ទីរពេទ្យ',
  'នាយកដ្ឋាន សុខភាពសហគមន៍',
  'នាយកដ្ឋាន ស្តង់ដារនិងបទដ្ឋានគ្លីនិក',
  'មន្ទីរពេទ្យ',
  'មណ្ឌលសុខភាព',
  'ការិយាល័យ',
  'ផ្នែក',
  'កុម្មង',
  'ក្រុម',
  'ផ្សេងៗ'
];

// Occupation options for searchable dropdown
const occupationOptions = [
  'មន្ត្រីរាជការ',
  'គ្រូបង្រៀន',
  'សាស្ត្រាចារ្យមហាបរិញ្ញា',
  'សាស្ដ្រាចារ្យរង',
  'សាស្ដ្រាចារ្យជំនួយ',
  'វេជ្ជបណ្ខិតឯកទេស',
  'វេជ្ជបណ្ខិត(ជំនាញ/អនុបណ្ឌិត)',
  'វេជ្ជបណ្ឌិត',
  'ទន្ដបណ្ឌិត',
  'ឱសថការី',
  'គិលានុបដ្ឋាក(បរិញ្ញាបត្រ)',
  'ឆ្មប(បរិញ្ញាបត្រ)',
  'គិលានុបដ្ឋាកមធ្យម',
  'ឆ្មបមធ្យម',
  'គិលានុបដ្ឋាកបឋម',
  'ទន្តគិលានុបដ្ឋាកមធ្យម',
  'អ្នកបច្ចេកទេសមន្ទីរពិសោធន៍មធ្យម',
  'អ្នកបច្ចេកទេសវិទ្យុសាស្រ្ត',
  'ព្យាបាលដោយចលនាមធ្យម',
  'ព័ត៌មានវិទ្យា',
  'គណនេយ្យករ',
  'រដ្ឋបាល​សាធារណៈ',
  'វិស្វកម្មអគ្គិសនី',
  'អាជីវក',
  'លក់ដូរ',
  'អ្នកថែទាំ',
  'គ្រូពេទ្យមធ្យម',
  'កសិករ',
  'កម្មករ',
  'និស្សិត',
  'រាជការនិវត្ត',
  'គ្មានការងារ',
  'មេផ្ទះ',
  'ផ្សេងៗ'
];

// Rank and Grade options
const rankAndGradeOptions = [
  'ថ្នាក់ខ ជំហាន១',
  'ថ្នាក់ខ ជំហាន២',
  'ថ្នាក់ខ ជំហាន៣',
  'ថ្នាក់ខ ជំហាន៤',
  'ថ្នាក់គ ជំហាន១',
  'ថ្នាក់គ ជំហាន២',
  'ថ្នាក់គ ជំហាន៣',
  'ថ្នាក់គ ជំហាន៤',
  'ថ្នាក់គ ជំហាន៥',
  'ថ្នាក់គ ជំហាន៦',
  'ថ្នាក់គ ជំហាន៧',
  'ថ្នាក់ឃ ជំហាន១',
  'ថ្នាក់ឃ ជំហាន២',
  'ថ្នាក់ឃ ជំហាន៣',
  'ថ្នាក់ឃ ជំហាន៤',
  'ថ្នាក់ឃ ជំហាន៥',
  'ថ្នាក់ឃ ជំហាន៦',
  'ថ្នាក់ឃ ជំហាន៧',
  'ថ្នាក់ឃ ជំហាន៨',
  'ថ្នាក់ង ជំហាន១',
  'ថ្នាក់ង ជំហាន២',
  'ថ្នាក់ង ជំហាន៣',
  'ថ្នាក់ង ជំហាន៤',
  'ថ្នាក់ង ជំហាន៥',
  'ថ្នាក់ង ជំហាន៦',
  'ថ្នាក់ង ជំហាន៧',
  'ថ្នាក់ង ជំហាន៨',
  'ថ្នាក់ង ជំហាន៩'
];

// Pay Scale options
const payScaleOptions = [
  'CC១', 'CC២', 'CC៣', 'CC៤',
  'CS១', 'CS២', 'CS៣', 'CS៤', 'CS៥', 'CS៦', 'CS៧',
  'PE១', 'PE២', 'PE៣', 'PE៤', 'PE៥', 'PE៦', 'PE៧', 'PE៨',
  'S១', 'S២', 'S៣', 'S៤', 'S៥', 'S៦', 'S៧', 'S៨', 'S៩'
];

const iconTabs = [
  { icon: 'pi pi-id-card', label: 'ព័ត៌មានផ្ទាល់ខ្លួន' },
  { icon: 'pi pi-home', label: 'ព័ត៌មានឪពុកម្តាយ' },
  { icon: 'pi pi-heart', label: 'ព័ត៌មានសហព័ទ្ធ' },
  { icon: 'pi pi-users', label: 'ព័ត៌មានកូន' },
  { icon: 'pi pi-book', label: 'ព័ត៌មានកម្រិតវប្បធម៌' },
  { icon: 'pi pi-briefcase', label: 'ព័ត៌មានការងារ' }
];

const progressPercentage = computed(() => {
  const fields = ['employeeId', 'nationalIdNo', 'khmerSurname', 'khmerGivenName', 'gender', 'phone1', 'maritalStatus', 'citizenship', 'ethnicity'];
  const filled = fields.filter(f => formData.value[f]).length;
  return Math.round((filled / fields.length) * 100);
});

const loadEmployees = async () => {
  try {
    const response = await api.get('/employees');
    // Backend returns { employees: [...], total, page, ... }
    employees.value = response.data.employees || response.data;
    console.log('Loaded employees:', employees.value);
    if (employees.value.length > 0) {
      console.log('First employee:', employees.value[0]);
      console.log('First employee ID:', employees.value[0]._id);
    }
  } catch (error) {
    console.error('Error loading employees:', error);
  }
};

const openDialog = (employee = null) => {
  if (employee) {
    dialogMode.value = 'edit';
    formData.value = { ...employee };
    selectedEmployee.value = employee;
  } else {
    dialogMode.value = 'create';
    formData.value = {
      employeeId: '',
      khmerSurname: '',
      khmerGivenName: '',
      latinSurname: '',
      latinGivenName: '',
      latinFullName: '',
      gender: '',
      birthDay: '',
      birthMonth: '',
      birthYear: '',
      bloodType: '',
      civilServantId: '',
      birthCertificateNo: '',
      nationalIdNo: '',
      idValidFrom: null,
      idExpiryDate: null,
      passportNo: '',
      citizenship: '',
      ethnicity: '',
      province: '',
      phone1: '',
      phone2: '',
      email: '',
      otherInfo: '',
      maritalStatus: '',
      physicalAttributes: '',
      photo: null
    };
    selectedEmployee.value = null;
  }
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  formData.value = {
    employeeId: '',
    khmerSurname: '',
    khmerGivenName: '',
    latinSurname: '',
    latinGivenName: '',
    latinFullName: '',
    gender: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    bloodType: '',
    civilServantId: '',
    birthCertificateNo: '',
    nationalIdNo: '',
    idValidFrom: null,
    idExpiryDate: null,
    passportNo: '',
    citizenship: '',
    ethnicity: '',
    province: '',
    phone1: '',
    phone2: '',
    email: '',
    otherInfo: '',
    maritalStatus: '',
    physicalAttributes: '',
    photo: null
  };
};

const handleSubmit = async () => {
  try {
    if (dialogMode.value === 'create') {
      await api.post('/employees', formData.value);
    } else {
      await api.put(`/employees/${formData.value._id}`, formData.value);
    }
    await loadEmployees();
    closeDialog();
  } catch (error) {
    console.error('Error saving employee:', error);
    alert('កំហុសក្នុងការរក្សាទុក');
  }
};

const viewEmployee = (id) => {
  console.log('Viewing employee with ID:', id);
  router.push(`/employees/${id}`);
};

const editEmployee = (employee) => {
  openDialog(employee);
};

const nextTab = () => {
  if (activeIconTab.value < iconTabs.length - 1) {
    activeIconTab.value++;
  }
};

const prevTab = () => {
  if (activeIconTab.value > 0) {
    activeIconTab.value--;
  }
};

const addChild = () => {
  currentChild.value = {
    birthCertificateNo: '',
    khmerName: '',
    latinName: '',
    gender: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    occupation: '',
    supportStatus: 'not-applied',
    remarks: '',
    attachmentFile: null
  };
  editingChildIndex.value = null;
  childFormVisible.value = true;
};

const editChild = (index) => {
  currentChild.value = { ...formData.value.children[index] };
  editingChildIndex.value = index;
  childFormVisible.value = true;
};

const saveChild = () => {
  if (!formData.value.children) {
    formData.value.children = [];
  }
  
  if (editingChildIndex.value !== null) {
    formData.value.children[editingChildIndex.value] = { ...currentChild.value };
  } else {
    formData.value.children.push({ ...currentChild.value });
  }
  
  closeChildForm();
};

const deleteChild = (index) => {
  if (confirm('តើអ្នកពិតជាចង់លុបមនុស្សលើនេះ?')) {
    formData.value.children.splice(index, 1);
  }
};

const closeChildForm = () => {
  childFormVisible.value = false;
  editingChildIndex.value = null;
  currentChild.value = {
    birthCertificateNo: '',
    khmerName: '',
    latinName: '',
    gender: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    occupation: '',
    supportStatus: 'not-applied',
    remarks: '',
    attachmentFile: null
  };
};

// Education methods
const addEducation = () => {
  currentEducation.value = {
    courseType: '',
    educationLevel: '',
    certificateType: '',
    institution: '',
    major: '',
    educationStartDay: '',
    educationStartMonth: '',
    educationStartYear: '',
    educationEndDay: '',
    educationEndMonth: '',
    educationEndYear: '',
    otherTraining: '',
    studyLocation: ''
  };
  editingEducationIndex.value = null;
  educationFormVisible.value = true;
};

const editEducation = (index) => {
  currentEducation.value = { ...formData.value.educationRecords[index] };
  editingEducationIndex.value = index;
  educationFormVisible.value = true;
};

const saveEducation = () => {
  if (!formData.value.educationRecords) {
    formData.value.educationRecords = [];
  }
  
  if (editingEducationIndex.value !== null) {
    formData.value.educationRecords[editingEducationIndex.value] = { ...currentEducation.value };
  } else {
    formData.value.educationRecords.push({ ...currentEducation.value });
  }
  
  closeEducationForm();
};

const deleteEducation = (index) => {
  if (confirm('តើអ្នកពិតជាចង់លុបកម្រិតវប្បធម៌នេះ?')) {
    formData.value.educationRecords.splice(index, 1);
  }
};

const closeEducationForm = () => {
  educationFormVisible.value = false;
  editingEducationIndex.value = null;
  currentEducation.value = {
    courseType: '',
    educationLevel: '',
    certificateType: '',
    institution: '',
    major: '',
    educationStartDay: '',
    educationStartMonth: '',
    educationStartYear: '',
    educationEndDay: '',
    educationEndMonth: '',
    educationEndYear: '',
    otherTraining: '',
    studyLocation: ''
  };
};

// Language methods
const addLanguage = () => {
  currentLanguage.value = {
    foreignLanguage: '',
    readingLevel: '',
    speakingLevel: '',
    writingLevel: ''
  };
  editingLanguageIndex.value = null;
  languageFormVisible.value = true;
};

const editLanguage = (index) => {
  currentLanguage.value = { ...formData.value.languageRecords[index] };
  editingLanguageIndex.value = index;
  languageFormVisible.value = true;
};

const saveLanguage = () => {
  if (!formData.value.languageRecords) {
    formData.value.languageRecords = [];
  }
  
  if (editingLanguageIndex.value !== null) {
    formData.value.languageRecords[editingLanguageIndex.value] = { ...currentLanguage.value };
  } else {
    formData.value.languageRecords.push({ ...currentLanguage.value });
  }
  
  closeLanguageForm();
};

const deleteLanguage = (index) => {
  if (confirm('តើអ្នកពិតជាចង់លុបភាសារបរទេសនេះ?')) {
    formData.value.languageRecords.splice(index, 1);
  }
};

const closeLanguageForm = () => {
  languageFormVisible.value = false;
  editingLanguageIndex.value = null;
  currentLanguage.value = {
    foreignLanguage: '',
    readingLevel: '',
    speakingLevel: '',
    writingLevel: ''
  };
};

const confirmDelete = (employee) => {
  selectedEmployee.value = employee;
  deleteDialogVisible.value = true;
};

const deleteEmployee = async () => {
  try {
    await api.delete(`/employees/${selectedEmployee.value._id}`);
    await loadEmployees();
    deleteDialogVisible.value = false;
    selectedEmployee.value = null;
  } catch (error) {
    console.error('Error deleting employee:', error);
    alert('កំហុសក្នុងការលុប');
  }
};

const handleChildFileUpload = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('ឯកសារមានទំហំធំពេក។ ដែនកំណត់អតិបរមា: 5MB');
      return;
    }
    currentChild.value.attachmentFile = file;
  }
};

const removeChildFile = () => {
  currentChild.value.attachmentFile = null;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

onMounted(() => {
  loadEmployees();
});
</script>

<style scoped>
.employees-container {
  padding: 1.5rem;
  background: #f8fafc;
  min-height: 100vh;
}

.header {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-section h1 {
  margin: 0;
  font-family: 'Siemreap', cursive;
  font-size: 16px;
  font-weight: bold;
  color: #1e293b;
}

.subtitle {
  margin: 0.25rem 0 0 0;
  color: #64748b;
  font-family: 'Siemreap', cursive;
  font-size: 11px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #4f46e5;
  transform: translateY(-1px);
}

.table-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.simple-table {
  width: 100%;
  border-collapse: collapse;
}

.simple-table thead {
  background: #f1f5f9;
}

.simple-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #475569;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.simple-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.photo-cell {
  width: 48px;
  height: 48px;
}

.photo-cell img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.photo-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 1.5rem;
}

.name-cell .name-en {
  font-weight: 600;
  color: #1e293b;
}

.name-cell .name-kh {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
}

.btn-icon.view {
  color: #0288D1;
}

.btn-icon.view:hover {
  background: #e0f2fe;
}

.btn-icon.edit {
  color: #6366f1;
}

.btn-icon.edit:hover {
  background: #eef2ff;
}

.btn-icon.delete {
  color: #ef4444;
}

.btn-icon.delete:hover {
  background: #fee2e2;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.modal-overlay {
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
  animation: fadeIn 0.2s;
}

.modal-content-large {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: calc(100vw - 320px);
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s;
  border: none;
  margin-left: 280px;
  margin-right: auto;
}

.modal-content-small {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 450px;
  width: 90%;
  animation: slideUp 0.3s;
}

.modal-content-large h3,
.modal-content-small h3 {
  margin: 0 0 1.5rem 0;
  font-family: 'Noto Serif Khmer', serif;
  font-size: 18px;
  color: #1e293b;
}

.top-icon-tabs {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.icon-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
}

.icon-circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #64748b;
  font-size: 1.75rem;
  transition: all 0.3s;
}

.icon-tab.active .icon-circle {
  background: #6366f1;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.icon-label {
  font-family: 'Noto Serif Khmer', serif;
  font-size: 18px;
  color: #64748b;
  text-align: center;
  max-width: 120px;
}

.icon-tab.active .icon-label {
  font-family: 'Noto Serif Khmer', serif;
  color: #6366f1;
  font-weight: 600;
}

.progress-section {
  margin-bottom: 2rem;
}

.progress-bar-container {
  background: #e2e8f0;
  height: 8px;
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  height: 100%;
  transition: width 0.3s;
  border-radius: 9999px;
}

.progress-text {
  font-size: 0.875rem;
  color: #6366f1;
  font-weight: 600;
}

.form-content {
  margin-bottom: 2rem;
}

.general-info-layout {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e2e8f0;
}

.photo-upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.general-info-fields {
  flex: 1;
}

.general-info-fields .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.photo-preview {
  width: 180px;
  height: 200px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #cbd5e1;
  font-size: 4rem;
}

.photo-buttons {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  justify-content: center;
}

.btn-photo {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Siemreap', sans-serif;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-photo.upload {
  background: #10b981;
  color: white;
}

.btn-photo.upload:hover {
  background: #059669;
}

.btn-photo.delete {
  background: #ef4444;
  color: white;
}

.btn-photo.delete:hover {
  background: #dc2626;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-block {
  padding: 1.5rem;
  margin-bottom: 2.5rem;
  border-radius: 12px;
  border: 2px solid;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.general-info-block {
  border-color: #3b82f6;
}

.birthplace-block {
  border-color: #10b981;
}

.address-block {
  border-color: #f59e0b;
}

.emergency-block {
  border-color: #ef4444;
}

.form-section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid currentColor;
}

.form-section-header i {
  font-size: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
}

.section-header i {
  font-size: 1.25rem;
}

.section-header h5 {
  margin: 0;
  font-size: 1rem;
  color: #1f2937;
  font-weight: 600;
  font-family: 'Noto Serif Khmer', serif;
}

.form-block-section {
  margin-bottom: 2rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.form-block-section:last-child {
  border-bottom: none;
}

.general-info-block .form-section-header {
  color: #1e40af;
}

.birthplace-block .form-section-header {
  color: #047857;
}

.address-block .form-section-header {
  color: #d97706;
}

.emergency-block .form-section-header {
  color: #dc2626;
}

.subsection-title {
  font-family: 'Noto Serif Khmer', serif;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-section-header h4 {
  font-family: 'Noto Serif Khmer', serif;
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-family: 'Siemreap', sans-serif;
  font-weight: 600;
  color: #475569;
  font-size: 12px;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-family: 'Siemreap', sans-serif;
  font-size: 12px;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.radio-group {
  display: flex;
  gap: 1.5rem;
  padding-top: 0.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-family: 'Siemreap', sans-serif;
  font-size: 12px;
  color: #475569;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-family: 'Siemreap', sans-serif;
  font-size: 13px;
  color: #1f2937;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.date-picker-group {
  display: flex;
  gap: 0.5rem;
}

.date-select {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-family: 'Siemreap', sans-serif;
  font-size: 12px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.form-actions-left {
  display: flex;
  gap: 1rem;
}

.form-actions-right {
  display: flex;
  gap: 1rem;
}

.btn-cancel,
.btn-submit,
.btn-next,
.btn-back,
.btn-delete {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Siemreap', sans-serif;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-back {
  background: #64748b;
  color: white;
}

.btn-back:hover {
  background: #475569;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-next {
  background: #0ea5e9;
  color: white;
}

.btn-next:hover {
  background: #0284c7;
}

.btn-submit {
  background: #6366f1;
  color: white;
}

.btn-submit:hover {
  background: #4f46e5;
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover {
  background: #dc2626;
}

.confirmation-content {
  text-align: center;
  padding: 2rem 0;
}

.confirmation-content p {
  margin-top: 1rem;
  color: #475569;
}

.dialog-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

/* Children Table Styles */
.children-table-container {
  overflow-x: auto;
  margin-top: 1.5rem;
}

.children-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.children-table thead {
  background: #f1f5f9;
}

.children-table th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #475569;
  font-size: 0.875rem;
  border-bottom: 2px solid #e2e8f0;
}

.children-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  color: #475569;
}

.children-table tbody tr:hover {
  background: #f8fafc;
}

.children-table .action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-edit, .btn-delete-child {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
}

.btn-edit {
  background: #3b82f6;
  color: white;
}

.btn-edit:hover {
  background: #2563eb;
}

.btn-delete-child {
  background: #ef4444;
  color: white;
}

.btn-delete-child:hover {
  background: #dc2626;
}

.btn-add-child {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  margin-left: auto;
  transition: all 0.2s;
}

.btn-add-child:hover {
  background: #059669;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #cbd5e1;
}

/* Child Form Styles */
.child-form-overlay {
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
}

.child-form-modal {
  background: white;
  border-radius: 12px;
  width: 95%;
  max-width: 900px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease-out;
}

.child-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.child-form-header h4 {
  margin: 0;
  font-size: 1.25rem;
  color: #1e293b;
}

.siemreap-font-13 {
  font-family: 'Siemreap', serif;
  font-size: 13px;
}

.siemreap-font-12 {
  font-family: 'Siemreap', serif;
  font-size: 12px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #94a3b8;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #475569;
}

.child-form-body {
  padding: 1.5rem;
  max-height: 500px;
  overflow-y: auto;
}

.child-form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.status-indicator.alive {
  background: #d1fae5;
  color: #065f46;
}

.status-indicator.deceased {
  background: #fee2e2;
  color: #7f1d1d;
}

.form-section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.form-section-header h4 {
  margin: 0;
  color: #1e293b;
  flex: 1;
}

/* Date Inputs */
.date-inputs {
  display: flex;
  gap: 0.5rem;
}

.date-inputs input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.875rem;
}

.date-inputs input::placeholder {
  color: #94a3b8;
}

/* Compact Date Inputs for 3-column layout */
.date-inputs-compact {
  display: flex;
  gap: 0.3rem;
}

.date-inputs-compact input {
  flex: 1;
  padding: 0.4rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.8rem;
}

.date-inputs-compact input:nth-child(3) {
  flex: 1.3;
}

.date-inputs-compact input::placeholder {
  color: #94a3b8;
}

.form-input-small {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.875rem;
  background: white;
  color: #1e293b;
}

.form-input-small:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 3-Column Form Row */
.form-row-3col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row-3col .form-group {
  display: flex;
  flex-direction: column;
}

.form-row-3col label {
  margin-bottom: 0.4rem;
  color: #475569;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-row-3col select,
.form-row-3col input {
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #475569;
}

.form-row-3col select:focus,
.form-row-3col input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Full Width 2 Column */
.form-group.full-width-2col {
  grid-column: 2 / 4;
}

/* Attachment Block */
.attachment-block {
  margin-top: 1.5rem;
  padding: 1.5rem;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
}

.block-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.block-header i {
  color: #0ea5e9;
  font-size: 1.25rem;
}

.block-header h5 {
  margin: 0;
  color: #1e293b;
  font-size: 1rem;
}

.file-upload-area {
  position: relative;
  margin-bottom: 1rem;
}

.file-input {
  display: none;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  border: 2px dashed #cbd5e1;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.file-upload-label:hover {
  border-color: #0ea5e9;
  background: #eff6ff;
}

.file-upload-label i {
  font-size: 2rem;
  color: #0ea5e9;
}

.file-upload-label span {
  color: #475569;
  font-weight: 500;
  font-size: 0.9rem;
}

.file-upload-label small {
  color: #94a3b8;
  font-size: 0.8rem;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #d1fae5;
  border: 1px solid #6ee7b7;
  border-radius: 6px;
  color: #065f46;
}

.file-info i {
  font-size: 1.2rem;
}

.file-info span {
  flex: 1;
  font-size: 0.875rem;
  word-break: break-all;
}

.btn-remove-file {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-remove-file:hover {
  background: #dc2626;
}

/* Checkbox Label */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #475569;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.checkbox-label span {
  margin-top: 0.25rem;
}

.radio-group {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
  flex-direction: column;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.radio-label input[type="radio"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.radio-label span {
  font-size: 0.95rem;
  color: #475569;
}

/* Full Width Form Group */
.form-group.full-width {
  grid-column: 1 / -1;
}

/* Textarea */
textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  color: #475569;
}

textarea::placeholder {
  color: #94a3b8;
}

textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Status Indicator for Checkbox */
.status-indicator.active {
  background: #d1fae5;
  color: #065f46;
}

.status-indicator.inactive {
  background: #f3f4f6;
  color: #6b7280;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

