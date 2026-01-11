import express from 'express';
import { query } from 'express-validator';
import { getMyActivities, getAllActivities, getStats } from '../controllers/activityController.js';
import { authenticateToken } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

router.use(authenticateToken);

const paginationValidators = [
  query('limit').optional().isInt({ min: 1, max: 500 }).toInt(),
  query('skip').optional().isInt({ min: 0 }).toInt(),
  query('action').optional().isString().trim(),
];

router.get('/my-activities', paginationValidators, validateRequest, getMyActivities);
router.get('/all', paginationValidators, validateRequest, getAllActivities);
router.get('/stats', getStats);

export default router;
