import { Router } from 'express';
import {
  generateNewsletter,
  rewriteContent,
  improveGrammar,
  changeTone,
  generateSubjectLine,
  generateCTA,
  chatUnlayer,
} from './ai.controller';
import { authenticate } from '../../middleware/authenticate';
import { anyAuthenticated } from '../../middleware/authorize';
import { aiLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.post('/generate', authenticate, anyAuthenticated, aiLimiter, generateNewsletter);
router.post('/rewrite', authenticate, anyAuthenticated, aiLimiter, rewriteContent);
router.post('/grammar', authenticate, anyAuthenticated, aiLimiter, improveGrammar);
router.post('/tone', authenticate, anyAuthenticated, aiLimiter, changeTone);
router.post('/subject', authenticate, anyAuthenticated, aiLimiter, generateSubjectLine);
router.post('/cta', authenticate, anyAuthenticated, aiLimiter, generateCTA);
router.post('/chat', authenticate, anyAuthenticated, aiLimiter, chatUnlayer);

export default router;
