import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getProfile, updateProfile, getAllUsers, deleteUser } from '../api/users';

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/', authenticateToken, getAllUsers);
router.delete('/:id', authenticateToken, deleteUser);

export default router;
