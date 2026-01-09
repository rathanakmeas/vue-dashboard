import express from 'express';
import { 
  createFolder, 
  getFolders, 
  getFolder, 
  updateFolder, 
  deleteFolder,
  shareFolder 
} from '../controllers/folderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createFolder);
router.get('/', getFolders);
router.get('/:id', getFolder);
router.put('/:id', updateFolder);
router.delete('/:id', deleteFolder);
router.post('/:id/share', shareFolder);

export default router;
