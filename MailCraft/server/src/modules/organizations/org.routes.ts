import { Router } from 'express';
import { getOrganization, updateOrganization, getOrganizationMembers, createOrganization } from './org.controller';
import { authenticate } from '../../middleware/authenticate';
import { orgOwnerOrAbove } from '../../middleware/authorize';

const router = Router();

router.get('/', authenticate, getOrganization);
router.post('/', authenticate, createOrganization);
router.put('/', authenticate, orgOwnerOrAbove, updateOrganization);
router.get('/members', authenticate, getOrganizationMembers);

export default router;
