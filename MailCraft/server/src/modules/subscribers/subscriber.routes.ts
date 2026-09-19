import { Router } from 'express';
import multer from 'multer';
import {
  getSubscribers,
  createSubscriber,
  updateSubscriber,
  deleteSubscriber,
  importCSV,
} from './subscriber.controller';
import { authenticate } from '../../middleware/authenticate';
import { anyAuthenticated } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createSubscriberSchema, updateSubscriberSchema } from './subscriber.validation';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authenticate, anyAuthenticated, getSubscribers);
router.post('/', authenticate, anyAuthenticated, validate(createSubscriberSchema), createSubscriber);
router.put('/:id', authenticate, anyAuthenticated, validate(updateSubscriberSchema), updateSubscriber);
router.delete('/:id', authenticate, anyAuthenticated, deleteSubscriber);
router.post('/import', authenticate, anyAuthenticated, upload.single('file'), importCSV);

export default router;
