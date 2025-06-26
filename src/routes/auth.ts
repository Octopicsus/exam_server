import { Router } from 'express';
import { 
    register, 
    login, 
    refreshToken as refreshTokenHandler, 
    logout,
    verify
} from '../api/auth';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshTokenHandler);
router.post('/logout', logout);
router.get('/verify', authenticateJWT, verify);

export default router;
