import express from 'express';
import * as employeeController from '../controllers/employeeController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload, optimizeImage } from '../middleware/upload.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Employee statistics
router.get('/stats', employeeController.getEmployeeStats);

// Get employees by department
router.get('/department/:departmentCode', employeeController.getEmployeesByDepartment);

// Photo upload routes
router.post('/:id/photo', upload.single('photo'), optimizeImage, employeeController.uploadEmployeePhoto);
router.delete('/:id/photo', employeeController.deleteEmployeePhoto);

// Bulk operations
router.put('/bulk', employeeController.bulkUpdateEmployees);

// CRUD operations
router.get('/', employeeController.getEmployees);
router.get('/:id', employeeController.getEmployee);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

export default router;
