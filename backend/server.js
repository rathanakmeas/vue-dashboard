import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import folderRoutes from './routes/folders.js';
import fileRoutes from './routes/files.js';
import activityRoutes from './routes/activity.js';
import User from './models/User.js';
import Folder from './models/Folder.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/activity', activityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Stats endpoint
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const folderCount = await Folder.countDocuments({ owner: req.userId });
    const recentFolders = await Folder.find({ owner: req.userId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      totalUsers: userCount,
      totalFolders: folderCount,
      recentActivity: recentFolders.map(f => ({
        id: f._id,
        name: f.name,
        action: 'Folder Created',
        time: f.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
