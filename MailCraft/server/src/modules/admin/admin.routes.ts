import { Router } from 'express';
import {
  getPlatformStats,
  getAllOrganizations,
  suspendOrganization,
  restoreOrganization,
  deleteOrganization,
  reviewOrganization,
  approveOrganization,
  rejectOrganization,
  getAllCampaigns,
} from './admin.controller';
import { authenticate } from '../../middleware/authenticate';
import { adminOnly } from '../../middleware/authorize';

const router = Router();

router.get('/stats', authenticate, adminOnly, getPlatformStats);
router.get('/organizations', authenticate, adminOnly, getAllOrganizations);
router.post('/organizations/:id/review', authenticate, adminOnly, reviewOrganization);
router.post('/organizations/:id/approve', authenticate, adminOnly, approveOrganization);
router.post('/organizations/:id/reject', authenticate, adminOnly, rejectOrganization);
router.post('/organizations/:id/suspend', authenticate, adminOnly, suspendOrganization);
router.post('/organizations/:id/restore', authenticate, adminOnly, restoreOrganization);
router.delete('/organizations/:id', authenticate, adminOnly, deleteOrganization);
router.get('/campaigns', authenticate, adminOnly, getAllCampaigns);

export default router;
