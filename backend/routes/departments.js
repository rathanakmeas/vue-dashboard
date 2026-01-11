import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats,
  initializeDepartments
} from '../controllers/departmentController.js';
import {
  exportToExcel,
  importFromExcel,
  exportOrgChartPDF,
  bulkUpdate,
  bulkDelete,
  reorderDepartments,
  getAnalytics,
  saveSearch,
  getSavedSearches,
  deleteSavedSearch
} from '../controllers/departmentEnhancements.js';
import {
  getDepartmentStaff,
  assignStaff,
  updateAssignment,
  removeStaff,
  transferStaff,
  getUserDepartments
} from '../controllers/staffAssignmentController.js';
import {
  getDepartmentBudget,
  createTransaction,
  approveTransaction,
  getBudgetAnalytics,
  exportBudgetReport
} from '../controllers/budgetController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateToken);

// Analytics & Reports
router.get('/analytics', getAnalytics);
router.get('/export/excel', exportToExcel);
router.get('/export/orgchart', exportOrgChartPDF);
router.post('/import/excel', upload.single('file'), importFromExcel);

// Saved Searches
router.get('/searches', getSavedSearches);
router.post('/searches', saveSearch);
router.delete('/searches/:id', deleteSavedSearch);

// Bulk Operations
router.post('/bulk/update', bulkUpdate);
router.post('/bulk/delete', bulkDelete);
router.post('/reorder', reorderDepartments);

// Budget Management
router.get('/budget/analytics', getBudgetAnalytics);
router.get('/:code/budget', getDepartmentBudget);
router.get('/:code/budget/export', exportBudgetReport);
router.post('/budget/transaction', createTransaction);
router.put('/budget/transaction/:id/approve', approveTransaction);

// Staff Assignment
router.get('/:code/staff', getDepartmentStaff);
router.get('/user/:userId/departments', getUserDepartments);
router.post('/staff/assign', assignStaff);
router.post('/staff/transfer', transferStaff);
router.put('/staff/:id', updateAssignment);
router.delete('/staff/:id', removeStaff);

// Core CRUD
router.post('/initialize', initializeDepartments);
router.get('/stats', getDepartmentStats);
router.get('/', getDepartments);
router.get('/:code', getDepartment);
router.post('/', createDepartment);
router.put('/:code', updateDepartment);
router.delete('/:code', deleteDepartment);

export default router;
