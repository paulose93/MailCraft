import { Router } from 'express';
import { getBrandKit, updateBrandKit } from './brandkit.controller';
import { authenticate } from '../../middleware/authenticate';
import { orgOwnerOrAbove } from '../../middleware/authorize';

const router = Router();

router.get('/', authenticate, getBrandKit);
router.put('/', authenticate, orgOwnerOrAbove, updateBrandKit);

export default router;
