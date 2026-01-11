import { getActivityLog, getAllActivityLog, getActivityStats } from '../utils/activityLogger.js';

export const getMyActivities = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = parseInt(req.query.skip) || 0;

    const result = await getActivityLog(req.userId, limit, skip);

    res.json({
      success: true,
      activities: result.activities,
      pagination: {
        total: result.total,
        limit: result.limit,
        skip: result.skip,
        pages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllActivities = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const skip = parseInt(req.query.skip) || 0;
    const action = req.query.action || null;

    const result = await getAllActivityLog(limit, skip, action);

    res.json({
      success: true,
      activities: result.activities,
      pagination: {
        total: result.total,
        limit: result.limit,
        skip: result.skip,
        pages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const stats = await getActivityStats();
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
