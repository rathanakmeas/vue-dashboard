# Database Seeder - Quick Reference

## ✅ Successfully Seeded!

The database has been populated with **38 departments** and demo data.

## 📊 What Was Created

### Departments (38 total)
All departments from the hospital configuration:
- Board of Directors (BOD)
- Administrative Office (ADM) + 6 child departments
- Technical Office (TECH)
- Accounting Office (ACCT)
- Clinical departments (PHARM, RADIOL, LAB, etc.)
- Emergency departments (ER, CARDIO, ANESTH)
- Surgical departments (OR, ORTHO, PLASTIC, NEURO, etc.)
- Specialized medical departments
- Rehabilitation and Dental

### Demo Users (3)
| Email | Password | Name |
|-------|----------|------|
| admin@example.com | password123 | Admin User |
| john@example.com | password123 | John Doe |
| jane@example.com | password123 | Jane Smith |

### Demo Data
- 5 folders
- 10 files
- Activity logs

## 🚀 How to Run Seeder

### First Time Setup
1. **Update MongoDB Connection** (Already done ✅)
   ```env
   MONGODB_URI=mongodb://admin:password@localhost:27017/vue-dashboard?authSource=admin
   ```

2. **Run Seeder**
   ```bash
   cd backend
   node seeder.js
   ```

3. **Restart Backend**
   ```bash
   docker-compose restart backend
   ```

### Re-seed Database
To clear and re-populate:
```bash
cd backend
node seeder.js
```

**⚠️ Warning**: This will DELETE all existing data!

## 📁 Files Updated

- ✅ [backend/.env](backend/.env) - Updated MongoDB URI with credentials
- ✅ [backend/seeder.js](backend/seeder.js) - Added Department seeding

## 🔍 Verify in MongoDB

### Using MongoDB Compass
1. Connect to: `mongodb://admin:password@localhost:27017`
2. Database: `vue-dashboard`
3. Collections:
   - `departments` (38 documents)
   - `users` (3 documents)
   - `folders` (5 documents)
   - `files` (10 documents)
   - `activities` (logs)

### Using MongoDB Shell
```bash
docker exec -it vue-dashboard-mongodb mongosh -u admin -p password

use vue-dashboard
db.departments.countDocuments()  // Should return 38
db.departments.find().pretty()
```

## 🌳 Department Structure

### Parent Departments (No parent)
```
BOD - Board of Directors
ADM - Administrative Office
  ├── ADM-GA - General Affairs
  ├── ADM-ENG - Engineering/Workshop
  ├── ADM-FOOD - Food Services
  ├── ADM-HSK - Housekeeping
  ├── ADM-SEC - Security
  └── ADM-SAN - Sanitation
TECH - Technical Office
ACCT - Accounting Office
PHARM - Pharmacy
RADIOL - Medical Imaging
LAB - Laboratory
  └── LAB-TISSUE - Tissue Analysis
ER - Emergency Department
CARDIO - Cardiology
ANESTH - Anesthesiology
  └── ANESTH-UNIT - Anesthesia Unit
OR - Operating Theatre
ORTHO - Orthopedic Surgery
PLASTIC - Plastic Surgery
THORACIC - Thoracic Surgery
NEURO - Neurosurgery
URO - Urology
OPHTHAL - Ophthalmology
ENT - Otorhinolaryngology
NEPHRO-INT - Nephrology Intervention
OPD - Outpatient Consultation
DIABETES - Diabetes Center
DERM - Dermatology
PSYCH - Psychiatry
GENMED - General Medicine
PULMO - Pulmonology
GASTRO - Gastroenterology
NEPHRO - Nephrology
  └── DIALYSIS - Hemodialysis
PHYSIO - Physical Therapy
DENTAL - Dental Department
```

### Categories
1. Leadership
2. Administrative
3. Clinical Support
4. Emergency & Critical Care
5. Medical
6. Surgical
7. Surgical Support
8. Outpatient
9. Rehabilitation
10. Dental

## 🎯 Next Steps

1. **Login to Application**
   - URL: http://localhost:5174/auth/login
   - Email: admin@example.com
   - Password: password123

2. **View Departments**
   - Navigate to: `/departments`
   - See all 38 departments in tree view
   - Test search, filters, CRUD operations

3. **View Analytics**
   - Navigate to: `/departments/analytics`
   - See charts and statistics

4. **View Org Chart**
   - Navigate to: `/departments/orgchart`
   - See hierarchical structure

## 🔧 Troubleshooting

### "Command delete requires authentication"
**Fix**: Update `.env` with credentials:
```env
MONGODB_URI=mongodb://admin:password@localhost:27017/vue-dashboard?authSource=admin
```

### "Cannot connect to MongoDB"
**Fix**: Ensure Docker containers are running:
```bash
docker-compose up -d
docker ps  # Verify containers are up
```

### "Departments collection is empty"
**Fix**: Run seeder again:
```bash
cd backend
node seeder.js
```

## 📊 Statistics

After successful seeding:
- **Departments**: 38
- **Parent Departments**: 28
- **Child Departments**: 10
- **Categories**: 10
- **Users**: 3
- **Demo Folders**: 5
- **Demo Files**: 10

## ✨ Features Ready to Test

All 10 enhancements are now ready:
1. ✅ Bulk Operations (select, activate, delete)
2. ✅ Import/Export (Excel with 38 departments)
3. ✅ Saved Searches
4. ✅ Analytics Dashboard (charts populated)
5. ✅ Org Chart (hierarchy visible)
6. ✅ CRUD Operations
7. ✅ Tree View
8. ✅ Search & Filter
9. ✅ Pagination
10. ✅ Department Details

**Database is ready! Start testing!** 🚀
