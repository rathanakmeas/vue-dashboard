import mongoose from 'mongoose';
import Folder from '../models/Folder.js';
import { logActivity } from '../utils/activityLogger.js';
import { buildSearchFilter } from '../middleware/search.js';

const ensureOwner = (folder, userId) =>
  folder && folder.userId.toString() === userId.toString();

export const createFolder = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Folder name required' });
    }

    const folder = await Folder.create({
      name: name.trim(),
      description,
      userId: req.userId,
    });

    await logActivity(req.userId, 'FOLDER_CREATE', 'FOLDER', folder._id, {
      name: folder.name,
    }, req.ip, req.headers['user-agent']);

    res.status(201).json({ message: 'Folder created', folder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getFolders = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(parseInt(req.query.pageSize, 10) || 20, 100);
    const sharedOnly = req.query.sharedOnly === true || req.query.sharedOnly === 'true';
    const ownedOnly = req.query.ownedOnly === true || req.query.ownedOnly === 'true';
    const search = req.query.search?.trim();

    let filter;
    if (sharedOnly && !ownedOnly) {
      filter = { sharedWith: req.userId };
    } else if (!sharedOnly && ownedOnly) {
      filter = { userId: req.userId };
    } else {
      filter = { $or: [{ userId: req.userId }, { sharedWith: req.userId }] };
    }

    // Add search filter
    if (search) {
      const searchFilter = buildSearchFilter(search, ['name', 'description']);
      filter = { $and: [filter, searchFilter] };
    }

    const [folders, total] = await Promise.all([
      Folder.find(filter)
        .populate('sharedWith', 'username email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      Folder.countDocuments(filter),
    ]);

    res.json({ data: folders, page, pageSize, total });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getFolder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const folder = await Folder.findById(id).populate('sharedWith', 'username email');
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    const canAccess =
      ensureOwner(folder, req.userId) ||
      folder.sharedWith.some((u) => u._id.toString() === req.userId);
    if (!canAccess) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(folder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const folder = await Folder.findById(id);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    if (!ensureOwner(folder, req.userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, description } = req.body;
    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ message: 'Folder name required' });
    }

    folder.name = name ?? folder.name;
    folder.description = description ?? folder.description;
    folder.updatedAt = Date.now();
    await folder.save();

    await logActivity(req.userId, 'FOLDER_UPDATE', 'FOLDER', folder._id, {
      name: folder.name,
    }, req.ip, req.headers['user-agent']);

    res.json({ message: 'Folder updated', folder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const folder = await Folder.findById(id);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    if (!ensureOwner(folder, req.userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Soft delete
    folder.isDeleted = true;
    folder.deletedAt = new Date();
    await folder.save();

    await logActivity(req.userId, 'FOLDER_DELETE', 'FOLDER', folder._id, {
      name: folder.name,
      soft: true
    }, req.ip, req.headers['user-agent']);
    res.json({ message: 'Folder deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const shareFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const folder = await Folder.findById(id);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    if (!ensureOwner(folder, req.userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    folder.sharedWith = [...new Set([...folder.sharedWith.map(String), userId])];
    folder.isShared = folder.sharedWith.length > 0;
    folder.updatedAt = Date.now();
    await folder.save();

    await folder.populate('sharedWith', 'username email');

    await logActivity(req.userId, 'FOLDER_SHARE', 'FOLDER', folder._id, {
      sharedWith: folder.sharedWith,
    }, req.ip, req.headers['user-agent']);
    res.json({ message: 'Folder shared', folder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const unshareFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const folder = await Folder.findById(id);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    if (!ensureOwner(folder, req.userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    folder.sharedWith = folder.sharedWith.filter(
      (u) => u.toString() !== userId.toString()
    );
    folder.isShared = folder.sharedWith.length > 0;
    folder.updatedAt = Date.now();
    await folder.save();

    await folder.populate('sharedWith', 'username email');

    await logActivity(req.userId, 'FOLDER_UNSHARE', 'FOLDER', folder._id, {
      userId,
    }, req.ip, req.headers['user-agent']);
    res.json({ message: 'Folder unshared', folder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};