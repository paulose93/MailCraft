import { Router } from 'express';
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from './template.controller';
import { authenticate } from '../../middleware/authenticate';
import { anyAuthenticated } from '../../middleware/authorize';

const router = Router();

router.get('/', authenticate, anyAuthenticated, getTemplates);
router.get('/:id', authenticate, anyAuthenticated, getTemplate);
router.post('/', authenticate, anyAuthenticated, createTemplate);
router.put('/:id', authenticate, anyAuthenticated, updateTemplate);
router.delete('/:id', authenticate, anyAuthenticated, deleteTemplate);

export default router;
