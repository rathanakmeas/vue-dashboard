import express from 'express';
import { body, param } from 'express-validator';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
  uploadFile,
  getFiles,
  getFile,
  updateFile,
  deleteFile,
  archiveFile,
  restoreFile,
  getArchivedFiles,
} from '../controllers/fileController.js';
import { authenticateToken } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

router.use(authenticateToken);

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadValidators = [
  param('folderId').isMongoId().withMessage('Invalid folder id'),
];

const folderIdValidators = [param('folderId').isMongoId().withMessage('Invalid folder id')];

const fileIdValidators = [param('fileId').isMongoId().withMessage('Invalid file id')];

const updateValidators = [
  param('fileId').isMongoId().withMessage('Invalid file id'),
  body('name').optional().trim().notEmpty().withMessage('File name required'),
];

router.post('/:folderId/upload', upload.single('file'), uploadFile);
router.get('/:folderId/files', folderIdValidators, validateRequest, getFiles);
router.get('/archived/all', getArchivedFiles);
router.get('/:fileId', fileIdValidators, validateRequest, getFile);
router.put('/:fileId', updateValidators, validateRequest, updateFile);
router.put('/:fileId/archive', fileIdValidators, validateRequest, archiveFile);
router.put('/:fileId/restore', fileIdValidators, validateRequest, restoreFile);
router.delete('/:fileId', fileIdValidators, validateRequest, deleteFile);

export default router;
