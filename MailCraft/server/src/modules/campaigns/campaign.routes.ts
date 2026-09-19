import { Router } from 'express';
import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  sendCampaign,
} from './campaign.controller';
import { authenticate } from '../../middleware/authenticate';
import { anyAuthenticated } from '../../middleware/authorize';

const router = Router();

router.get('/', authenticate, anyAuthenticated, getCampaigns);
router.get('/:id', authenticate, anyAuthenticated, getCampaign);
router.post('/', authenticate, anyAuthenticated, createCampaign);
router.put('/:id', authenticate, anyAuthenticated, updateCampaign);
router.delete('/:id', authenticate, anyAuthenticated, deleteCampaign);
router.post('/:id/send', authenticate, anyAuthenticated, sendCampaign);

export default router;
