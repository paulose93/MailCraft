import { Router } from 'express';
import multer from 'multer';
import { uploadImage, deleteImage } from './upload.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

router.post('/', authenticate, upload.single('image'), uploadImage);
router.delete('/', authenticate, deleteImage);

export default router;
