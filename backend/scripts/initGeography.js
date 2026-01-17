import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import { syncGeographyData } from '../utils/syncGeography.js';

dotenv.config();

async function initGeography() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    await syncGeographyData();
    
    console.log('\n✅ Geography initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Geography initialization failed:', error);
    process.exit(1);
  }
}

initGeography();
