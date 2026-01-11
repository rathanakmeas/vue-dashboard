// Hospital Departments Structure - Ordered as per organizational hierarchy
export const DEPARTMENTS = [
  // 1. Board of Directors
  { code: 'BOD', name: 'Board of Directors', category: 'Leadership', parent: null, status: 'active', description: 'Executive leadership and strategic direction', order: 1 },
  
  // 2. Administrative Office with sub-units
  { code: 'ADM', name: 'Administrative Office', category: 'Administrative', parent: null, status: 'active', description: 'Comprising General Affairs, Engineering, Food Services, Housekeeping, Security, and Sanitation', order: 2 },
  { code: 'ADM-GA', name: 'General Affairs', category: 'Administrative', parent: 'ADM', status: 'active', description: 'General administrative support services', order: 3 },
  { code: 'ADM-ENG', name: 'Engineering/Workshop Unit', category: 'Administrative', parent: 'ADM', status: 'active', description: 'Facility maintenance and engineering', order: 4 },
  { code: 'ADM-FOOD', name: 'Food Services and Laundry Unit', category: 'Administrative', parent: 'ADM', status: 'active', description: 'Patient meals and linen services', order: 5 },
  { code: 'ADM-HSK', name: 'Housekeeping Unit', category: 'Administrative', parent: 'ADM', status: 'active', description: 'Facility cleaning and housekeeping', order: 6 },
  { code: 'ADM-SEC', name: 'Security and Public Order Unit', category: 'Administrative', parent: 'ADM', status: 'active', description: 'Hospital security and safety', order: 7 },
  { code: 'ADM-SAN', name: 'Sanitation Unit', category: 'Administrative', parent: 'ADM', status: 'active', description: 'Waste management and sanitation', order: 8 },
  
  // 3-4. Office Departments
  { code: 'TECH', name: 'Technical Office', category: 'Administrative', parent: null, status: 'active', description: 'Technical support and systems', order: 9 },
  { code: 'ACCT', name: 'Accounting Office', category: 'Administrative', parent: null, status: 'active', description: 'Financial management and accounting', order: 10 },
  
  // 5-7. Clinical Support
  { code: 'PHARM', name: 'Pharmacy Department', category: 'Clinical Support', parent: null, status: 'active', description: 'Medication dispensing and pharmaceutical care', order: 11 },
  { code: 'RADIOL', name: 'Medical Imaging and Ultrasonography Department', category: 'Clinical Support', parent: null, status: 'active', description: 'Diagnostic imaging services', order: 12 },
  { code: 'LAB', name: 'Laboratory Department', category: 'Clinical Support', parent: null, status: 'active', description: 'Including the Tissue Analysis Unit', order: 13 },
  { code: 'LAB-TISSUE', name: 'Tissue Analysis Unit', category: 'Clinical Support', parent: 'LAB', status: 'active', description: 'Histopathology and tissue analysis', order: 14 },
  
  // 8-10. Emergency and Cardiology
  { code: 'ER', name: '24-Hour Emergency Department', category: 'Emergency & Critical Care', parent: null, status: 'active', description: 'Emergency medical services 24/7', order: 15 },
  { code: 'CARDIO', name: 'Cardiology and Vascular Department', category: 'Medical', parent: null, status: 'active', description: 'Heart and vascular disease treatment', order: 16 },
  { code: 'ANESTH', name: 'Anesthesiology Department', category: 'Surgical Support', parent: null, status: 'active', description: 'Anesthesia and pain management', order: 17 },
  
  // 11. Nephrology Intervention
  { code: 'NEPHRO-INT', name: 'Nephrology Intervention Department', category: 'Medical', parent: null, status: 'active', description: 'Kidney disease interventions', order: 18 },
  
  // 12-13. Operating Theatres
  { code: 'OR', name: 'Operating Theatre Complex', category: 'Surgical', parent: null, status: 'active', description: 'Surgical operating rooms', order: 19 },
  { code: 'ANESTH-UNIT', name: 'Anesthesia Unit', category: 'Surgical Support', parent: 'ANESTH', status: 'active', description: 'Anesthesia support unit', order: 20 },
  
  // 14-19. Surgical Buildings and Departments
  { code: 'ORTHO', name: 'Orthopedic Surgery and Trauma Building', category: 'Surgical', parent: null, status: 'active', description: 'Bone and joint surgery', order: 21 },
  { code: 'PLASTIC', name: 'Plastic Surgery and Burn Care Building', category: 'Surgical', parent: null, status: 'active', description: 'Reconstructive and burn treatment', order: 22 },
  { code: 'THORACIC', name: 'Thoracic Surgery and Gynecology Department', category: 'Surgical', parent: null, status: 'active', description: 'Chest surgery and women\'s health', order: 23 },
  { code: 'NEURO', name: 'Neurosurgery Building', category: 'Surgical', parent: null, status: 'active', description: 'Brain and nervous system surgery', order: 24 },
  { code: 'URO', name: 'Urology Surgery Department', category: 'Surgical', parent: null, status: 'active', description: 'Urinary system surgery', order: 25 },
  { code: 'OPHTHAL', name: 'Ophthalmology Department', category: 'Surgical', parent: null, status: 'active', description: 'Eye care and surgery', order: 26 },
  { code: 'ENT', name: 'Otorhinolaryngology (ENT) Department', category: 'Surgical', parent: null, status: 'active', description: 'Ear, nose, and throat treatment', order: 27 },
  
  // 20-28. Medical Specialties and Outpatient
  { code: 'OPD', name: 'Outpatient Consultation Department', category: 'Outpatient', parent: null, status: 'active', description: 'Outpatient medical consultations', order: 28 },
  { code: 'DIABETES', name: 'Cambodia–Korea Diabetes Center', category: 'Medical', parent: null, status: 'active', description: 'Diabetes care and management', order: 29 },
  { code: 'DERM', name: 'Dermatology and Sexually Transmitted Diseases Department', category: 'Medical', parent: null, status: 'active', description: 'Skin and STD treatment', order: 30 },
  { code: 'PSYCH', name: 'Psychiatry Department', category: 'Medical', parent: null, status: 'active', description: 'Mental health services', order: 31 },
  { code: 'GENMED', name: 'General Medicine Department', category: 'Medical', parent: null, status: 'active', description: 'General medical care', order: 32 },
  { code: 'PULMO', name: 'Pulmonology and Infectious Diseases Department', category: 'Medical', parent: null, status: 'active', description: 'Lung and infectious disease treatment', order: 33 },
  { code: 'GASTRO', name: 'Gastroenterology and Hepatology Department', category: 'Medical', parent: null, status: 'active', description: 'Digestive system and liver care', order: 34 },
  { code: 'NEPHRO', name: 'Nephrology Department', category: 'Medical', parent: null, status: 'active', description: 'Kidney disease treatment', order: 35 },
  { code: 'DIALYSIS', name: 'Hemodialysis Department', category: 'Medical', parent: 'NEPHRO', status: 'active', description: 'Kidney dialysis services', order: 36 },
  
  // 29-30. Rehabilitation and Dental
  { code: 'PHYSIO', name: 'Physical Therapy and Rehabilitation Department', category: 'Rehabilitation', parent: null, status: 'active', description: 'Physical therapy and rehab services', order: 37 },
  { code: 'DENTAL', name: 'Dental Department', category: 'Dental', parent: null, status: 'active', description: 'Dental care and oral surgery', order: 38 }
];

export const DEPARTMENT_CATEGORIES = [
  'Leadership',
  'Administrative',
  'Clinical Support',
  'Emergency & Critical Care',
  'Medical',
  'Surgical',
  'Surgical Support',
  'Outpatient',
  'Rehabilitation',
  'Dental'
];

export const getDepartmentByCode = (code) => {
  return DEPARTMENTS.find(d => d.code === code);
};

export const getDepartmentsByCategory = (category) => {
  return DEPARTMENTS.filter(d => d.category === category);
};

export const getChildDepartments = (parentCode) => {
  return DEPARTMENTS.filter(d => d.parent === parentCode);
};

export const buildDepartmentTree = () => {
  const tree = [];
  const lookup = {};
  
  // Create lookup
  DEPARTMENTS.forEach(dept => {
    lookup[dept.code] = { ...dept, children: [] };
  });
  
  // Build tree
  DEPARTMENTS.forEach(dept => {
    if (dept.parent) {
      if (lookup[dept.parent]) {
        lookup[dept.parent].children.push(lookup[dept.code]);
      }
    } else {
      tree.push(lookup[dept.code]);
    }
  });
  
  return tree;
};

export default DEPARTMENTS;
