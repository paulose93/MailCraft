import { Router } from 'express';
import { getSettings, updateProfile, changePassword, updateOrgSettings } from './settings.controller';
import { authenticate } from '../../middleware/authenticate';
import { orgOwnerOrAbove } from '../../middleware/authorize';

const router = Router();

router.get('/', authenticate, getSettings);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);
router.put('/organization', authenticate, orgOwnerOrAbove, updateOrgSettings);

export default router;
