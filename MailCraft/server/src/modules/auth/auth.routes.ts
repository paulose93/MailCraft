import { Router } from 'express';
import { register, login, getMe, refreshToken } from './auth.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema, refreshSchema } from './auth.validation';
import { authLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', authenticate, getMe);
router.post('/refresh', validate(refreshSchema), refreshToken);

export default router;
