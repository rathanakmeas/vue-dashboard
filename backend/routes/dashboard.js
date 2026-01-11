import express from 'express';
import { getDashboard, getStats } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', authenticateToken, getDashboard);
router.get('/stats', authenticateToken, getStats);

export default router;
