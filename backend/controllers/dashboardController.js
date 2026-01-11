import Folder from '../models/Folder.js';
import File from '../models/File.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';

export const getDashboard = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get folder statistics
    const totalFolders = await Folder.countDocuments({ $or: [{ userId }, { sharedWith: userId }] });
    const ownedFolders = await Folder.countDocuments({ userId });
    const sharedFolders = await Folder.countDocuments({ sharedWith: userId });
    
    // Get file statistics
    const totalFiles = await File.countDocuments({
      $or: [
        { userId },
        { folderId: { $in: await Folder.find({ sharedWith: userId }).select('_id').lean().then(docs => docs.map(d => d._id)) } }
      ]
    });
    
    // Get recent activities
    const recentActivities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    // Get activity count by action
    const activityStats = await Activity.aggregate([
      { $match: { userId } },
      { $group: { _id: '$action', count: { $sum: 1 } } }
    ]);
    
    // Get folder size (count files in each)
    const folderStats = await Folder.aggregate([
      { $match: { $or: [{ userId }, { sharedWith: userId }] } },
      { $lookup: {
          from: 'files',
          localField: '_id',
          foreignField: 'folderId',
          as: 'files'
        }
      },
      { $project: {
          name: 1,
          fileCount: { $size: '$files' },
          totalSize: { $sum: '$files.fileSize' },
          isShared: { $cond: [{ $in: [userId, '$sharedWith'] }, false, true] }
        }
      },
      { $sort: { fileCount: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      statistics: {
        totalFolders,
        ownedFolders,
        sharedFolders,
        totalFiles
      },
      activityStats,
      recentActivities,
      topFolders: folderStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    if (period === '7d') startDate.setDate(now.getDate() - 7);
    else if (period === '30d') startDate.setDate(now.getDate() - 30);
    else if (period === '90d') startDate.setDate(now.getDate() - 90);
    else startDate.setFullYear(now.getFullYear() - 1);
    
    // Activity timeline
    const activityTimeline = await Activity.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Top resources accessed
    const topResources = await Activity.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: '$resourceId',
          count: { $sum: 1 },
          resourceType: { $first: '$resourceType' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      activityTimeline,
      topResources,
      period
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
