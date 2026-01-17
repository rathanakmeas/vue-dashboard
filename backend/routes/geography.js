import express from 'express';
import Geography from '../models/Geography.js';
import { syncGeographyData } from '../utils/syncGeography.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all geography data from database (fast, works offline)
router.get('/data', async (req, res) => {
  try {
    const data = await Geography.find({}).select('-_id -createdAt -updatedAt').lean();
    
    res.json({
      items: data,
      total: data.length,
      source: 'database'
    });
  } catch (error) {
    console.error('Error fetching geography data from database:', error);
    res.status(500).json({ 
      error: 'Failed to fetch geography data',
      message: error.message 
    });
  }
});

// Get hierarchical data (provinces only, districts only, etc.)
router.get('/provinces', async (req, res) => {
  try {
    const provinces = await Geography.aggregate([
      {
        $group: {
          _id: '$province_code',
          province_kh: { $first: '$province_kh' },
          province_en: { $first: '$province_en' }
        }
      },
      {
        $project: {
          _id: 0,
          code: '$_id',
          name_kh: '$province_kh',
          name_en: '$province_en'
        }
      },
      { $sort: { name_kh: 1 } }
    ]);
    
    res.json(provinces);
  } catch (error) {
    console.error('Error fetching provinces:', error);
    res.status(500).json({ error: 'Failed to fetch provinces' });
  }
});

// Get districts by province
router.get('/districts/:provinceCode', async (req, res) => {
  try {
    const districts = await Geography.aggregate([
      { $match: { province_code: req.params.provinceCode } },
      {
        $group: {
          _id: '$district_code',
          district_kh: { $first: '$district_kh' },
          district_en: { $first: '$district_en' }
        }
      },
      {
        $project: {
          _id: 0,
          code: '$_id',
          name_kh: '$district_kh',
          name_en: '$district_en'
        }
      },
      { $sort: { name_kh: 1 } }
    ]);
    
    res.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

// Get communes by district
router.get('/communes/:districtCode', async (req, res) => {
  try {
    const communes = await Geography.aggregate([
      { $match: { district_code: req.params.districtCode } },
      {
        $group: {
          _id: '$commune_code',
          commune_kh: { $first: '$commune_kh' },
          commune_en: { $first: '$commune_en' }
        }
      },
      {
        $project: {
          _id: 0,
          code: '$_id',
          name_kh: '$commune_kh',
          name_en: '$commune_en'
        }
      },
      { $sort: { name_kh: 1 } }
    ]);
    
    res.json(communes);
  } catch (error) {
    console.error('Error fetching communes:', error);
    res.status(500).json({ error: 'Failed to fetch communes' });
  }
});

// Get villages by commune
router.get('/villages/:communeCode', async (req, res) => {
  try {
    const villages = await Geography.find({ commune_code: req.params.communeCode })
      .select('village_code village_kh village_en -_id')
      .lean();
    
    const formatted = villages.map(v => ({
      code: v.village_code,
      name_kh: v.village_kh,
      name_en: v.village_en
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching villages:', error);
    res.status(500).json({ error: 'Failed to fetch villages' });
  }
});

// Admin: Sync geography data from MEF API (protected route)
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (you can add role check here)
    const result = await syncGeographyData();
    res.json(result);
  } catch (error) {
    console.error('Error syncing geography data:', error);
    res.status(500).json({ 
      error: 'Failed to sync geography data',
      message: error.message 
    });
  }
});

// Get sync status
router.get('/status', async (req, res) => {
  try {
    const count = await Geography.countDocuments();
    const lastUpdated = await Geography.findOne().sort('-updatedAt').select('updatedAt');
    
    res.json({
      total_records: count,
      last_updated: lastUpdated?.updatedAt || null,
      is_initialized: count > 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get status' });
  }
});

export default router;
