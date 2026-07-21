import { Router } from 'express';
import { loginUser, verifyCurrentSession } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/login', loginUser);
router.get('/me', authenticateJWT, verifyCurrentSession);

export default router;
