import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import File from '../models/File.js';
import Folder from '../models/Folder.js';

const router = express.Router();

// Upload file to folder
router.post('/:folderId/upload', authenticateToken, async (req, res) => {
  try {
    const { folderId } = req.params;
    const { fileName, fileSize, mimeType } = req.body;

    // Verify folder exists and user owns it
    const folder = await Folder.findById(folderId);
    if (!folder || folder.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access to folder' });
    }

    const file = new File({
      name: fileName,
      folder: folderId,
      owner: req.userId,
      fileSize,
      mimeType,
      uploadedAt: new Date()
    });

    await file.save();
    res.status(201).json({ message: 'File uploaded successfully', file });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Get files in folder
router.get('/:folderId/files', authenticateToken, async (req, res) => {
  try {
    const { folderId } = req.params;

    // Verify folder exists and user owns it
    const folder = await Folder.findById(folderId);
    if (!folder || folder.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access to folder' });
    }

    const files = await File.find({ folder: folderId }).sort({ uploadedAt: -1 });
    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching files', error: error.message });
  }
});

// Delete file
router.delete('/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);
    if (!file || file.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this file' });
    }

    await File.deleteOne({ _id: fileId });
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
});

// Get file details
router.get('/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);
    if (!file || file.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access to file' });
    }

    res.json({ file });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching file', error: error.message });
  }
});

export default router;
