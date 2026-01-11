import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import folderRoutes from './routes/folders.js';
import fileRoutes from './routes/files.js';
import activityRoutes from './routes/activity.js';
import dashboardRoutes from './routes/dashboard.js';
import departmentRoutes from './routes/departments.js';
import employeeRoutes from './routes/employees.js';
import User from './models/User.js';
import Folder from './models/Folder.js';
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();

// Start server function
const startServer = async () => {
  console.log('Starting server...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  // Connect to MongoDB unless tests manage their own connection
  if (process.env.NODE_ENV !== 'test') {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('MongoDB connection complete');
  }
  
  const PORT = process.env.PORT || 5000;
  console.log('About to listen on port:', PORT);
  
  if (process.env.NODE_ENV !== 'test') {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Server is now accepting connections');
    });
    
    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });
    
    server.on('listening', () => {
      console.log('Server listening event fired');
    });
    
    // Keep the process alive
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
      });
    });
    
    console.log('Server setup complete');
  }
  
  console.log('startServer function complete');
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: (origin, callback) => {
    // Allow multiple localhost ports for development
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      process.env.CORS_ORIGIN
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Ensure uploads directory exists and is served statically
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 1000 requests per minute
  message: { message: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api', dashboardRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    name: 'Vue Dashboard API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      folders: '/api/folders',
      files: '/api/files',
      activity: '/api/activity',
      dashboard: '/api/dashboard'
    },
    frontend: process.env.CORS_ORIGIN || 'http://localhost:5173'
  });
});

// Root API ping
app.get('/api', (req, res) => {
  res.json({ status: 'ok' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Stats endpoint
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const folderCount = await Folder.countDocuments({ userId: req.userId });
    const recentFolders = await Folder.find({ userId: req.userId })
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

// Global error handler middleware
app.use(errorHandler);

// Export app for testing
export default app;

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
  
  // Keep process alive (shouldn't be necessary but something is causing early exit)
  setInterval(() => {
    // This keeps the event loop active
  }, 100000);
}
