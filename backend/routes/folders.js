import express from 'express';
import { body, param, query } from 'express-validator';
import { 
  createFolder, 
  getFolders, 
  getFolder, 
  updateFolder, 
  deleteFolder,
  shareFolder,
  unshareFolder
} from '../controllers/folderController.js';
import { authenticateToken } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

router.use(authenticateToken);

const paginationValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sharedOnly').optional().isBoolean().toBoolean(),
  query('ownedOnly').optional().isBoolean().toBoolean(),
];

const createFolderValidators = [
  body('name').trim().notEmpty().withMessage('Folder name required'),
  body('description').optional().isString().withMessage('Description must be a string'),
];

const updateFolderValidators = [
  param('id').isMongoId().withMessage('Invalid id'),
  body('name').optional().trim().notEmpty().withMessage('Folder name required'),
  body('description').optional().isString().withMessage('Description must be a string'),
];

const idValidators = [param('id').isMongoId().withMessage('Invalid id')];

const shareValidators = [
  param('id').isMongoId().withMessage('Invalid id'),
  body('userId').isMongoId().withMessage('userId required'),
];

router.post('/', createFolderValidators, validateRequest, createFolder);
router.get('/', paginationValidators, validateRequest, getFolders);
router.get('/:id', idValidators, validateRequest, getFolder);
router.put('/:id', updateFolderValidators, validateRequest, updateFolder);
router.delete('/:id', idValidators, validateRequest, deleteFolder);
router.post('/:id/share', shareValidators, validateRequest, shareFolder);
router.post('/:id/unshare', shareValidators, validateRequest, unshareFolder);

export default router;
