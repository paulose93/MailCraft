import { Router } from 'express';
import { getDashboardAnalytics, getCampaignAnalytics } from './analytics.controller';
import { authenticate } from '../../middleware/authenticate';
import { anyAuthenticated } from '../../middleware/authorize';

const router = Router();

router.get('/dashboard', authenticate, anyAuthenticated, getDashboardAnalytics);
router.get('/campaigns/:id', authenticate, anyAuthenticated, getCampaignAnalytics);

export default router;
