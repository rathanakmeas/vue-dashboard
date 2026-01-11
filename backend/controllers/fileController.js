import mongoose from 'mongoose';
import File from '../models/File.js';
import Folder from '../models/Folder.js';
import { logActivity } from '../utils/activityLogger.js';
import { buildSearchFilter } from '../middleware/search.js';
import DEPARTMENTS, { getDepartmentByCode } from '../config/departments.js';

const ensureOwnerOrShared = async (folder, userId) => {
  if (!folder) return false;
  return (
    folder.userId.toString() === userId.toString() ||
    folder.sharedWith.some((u) => u.toString() === userId.toString())
  );
};

export const uploadFile = async (req, res) => {
  try {
    const { folderId } = req.params;
    const uploadedFile = req.file;
    
    // Prioritize uploaded file data over body data
    const name = uploadedFile?.originalname || req.body.name?.trim();
    const fileUrl = uploadedFile
      ? `${req.protocol}://${req.get('host')}/uploads/${uploadedFile.filename}`
      : req.body.fileUrl?.trim();
    const fileSize = uploadedFile ? uploadedFile.size : (req.body.fileSize ? Number(req.body.fileSize) : 0);
    const fileType = uploadedFile ? uploadedFile.mimetype : (req.body.fileType || '');

    if (!name || !fileUrl) {
      return res.status(400).json({ message: 'File name and file data required', debug: { hasFile: !!uploadedFile, name, fileUrl, body: req.body } });
    }

    if (!mongoose.isValidObjectId(folderId)) {
      return res.status(400).json({ message: 'Invalid folder id' });
    }

    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    if (folder.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Parse metadata fields
    const metaTags = req.body.metaTags ? 
      (Array.isArray(req.body.metaTags) ? req.body.metaTags : req.body.metaTags.split(',').map(t => t.trim()).filter(Boolean)) 
      : [];
    
    const sharedWithRoles = req.body.sharedWithRoles ?
      (Array.isArray(req.body.sharedWithRoles) ? req.body.sharedWithRoles : req.body.sharedWithRoles.split(',').map(r => r.trim()).filter(Boolean))
      : [];
    
    const sharedWithUsers = req.body.sharedWithUsers ?
      (Array.isArray(req.body.sharedWithUsers) ? req.body.sharedWithUsers : req.body.sharedWithUsers.split(',').map(u => u.trim()).filter(Boolean))
      : [];

    // Parse department
    let departmentCode = '';
    let departmentName = req.body.department || '';
    
    if (req.body.departmentCode) {
      const dept = getDepartmentByCode(req.body.departmentCode);
      if (dept) {
        departmentCode = dept.code;
        departmentName = dept.name;
      }
    }

    const file = await File.create({
      name: name.trim(),
      folderId,
      userId: req.userId,
      fileUrl,
      fileSize: fileSize || 0,
      fileType: fileType || '',
      category: req.body.category || '',
      description: req.body.description || '',
      letterNo: req.body.letterNo || '',
      from: req.body.from || '',
      dateline: req.body.dateline || null,
      numberInNo: req.body.numberInNo || '',
      storage: req.body.storage || 'Local Disk',
      metaTags,
      sharedWithRoles,
      sharedWithUsers,
      department: departmentName,
      departmentCode: departmentCode,
      priority: req.body.priority || '',
      expiryDate: req.body.expiryDate || null,
      isShared: sharedWithRoles.length > 0 || sharedWithUsers.length > 0
    });

    await logActivity(
      req.userId,
      'FILE_UPLOAD',
      'FILE',
      file._id,
      { name: file.name, folderId, letterNo: file.letterNo },
      req.ip,
      req.headers['user-agent']
    );

    res.status(201).json({ message: 'File uploaded', file });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getFiles = async (req, res) => {
  try {
    const { folderId } = req.params;
    const search = req.query.search?.trim();

    if (!mongoose.isValidObjectId(folderId)) {
      return res.status(400).json({ message: 'Invalid folder id' });
    }

    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    const canAccess = await ensureOwnerOrShared(folder, req.userId);
    if (!canAccess) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    let filter = { folderId };
    if (search) {
      const searchFilter = buildSearchFilter(search, ['name', 'fileType']);
      filter = { ...filter, ...searchFilter };
    }

    const files = await File.find(filter).sort({ createdAt: -1 });
    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.isValidObjectId(fileId)) {
      return res.status(400).json({ message: 'Invalid file id' });
    }

    const file = await File.findById(fileId).populate('folderId');
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const canAccess = await ensureOwnerOrShared(file.folderId, req.userId);
    if (!canAccess) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ file });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { name } = req.body;

    if (!mongoose.isValidObjectId(fileId)) {
      return res.status(400).json({ message: 'Invalid file id' });
    }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ message: 'File name required' });
    }

    const file = await File.findById(fileId).populate('folderId');
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    file.name = name ?? file.name;
    file.updatedAt = Date.now();
    await file.save();

    await logActivity(
      req.userId,
      'FILE_UPDATE',
      'FILE',
      file._id,
      { name: file.name },
      req.ip,
      req.headers['user-agent']
    );

    res.json({ message: 'File updated', file });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.isValidObjectId(fileId)) {
      return res.status(400).json({ message: 'Invalid file id' });
    }

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Soft delete
    file.isDeleted = true;
    file.deletedAt = new Date();
    await file.save();

    await logActivity(
      req.userId,
      'FILE_DELETE',
      'FILE',
      file._id,
      { name: file.name, soft: true },
      req.ip,
      req.headers['user-agent']
    );

    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const archiveFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.isValidObjectId(fileId)) {
      return res.status(400).json({ message: 'Invalid file id' });
    }

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    file.isArchived = true;
    file.archivedAt = new Date();
    await file.save();

    await logActivity(
      req.userId,
      'FILE_ARCHIVE',
      'FILE',
      file._id,
      { name: file.name },
      req.ip,
      req.headers['user-agent']
    );

    res.json({ message: 'File archived', file });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const restoreFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.isValidObjectId(fileId)) {
      return res.status(400).json({ message: 'Invalid file id' });
    }

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    file.isArchived = false;
    file.archivedAt = null;
    file.isDeleted = false;
    file.deletedAt = null;
    await file.save();

    await logActivity(
      req.userId,
      'FILE_RESTORE',
      'FILE',
      file._id,
      { name: file.name },
      req.ip,
      req.headers['user-agent']
    );

    res.json({ message: 'File restored', file });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getArchivedFiles = async (req, res) => {
  try {
    const files = await File.find({
      userId: req.userId,
      $or: [{ isArchived: true }, { isDeleted: true }]
    }).sort({ archivedAt: -1, deletedAt: -1 });

    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
