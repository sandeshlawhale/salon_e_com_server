import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

// Public endpoint: list active agents
router.get('/agents', userController.getPublicAgents);

// Admin and Agents can list users
router.get('/', protect, authorize('ADMIN', 'AGENT'), userController.getUsers);
router.get('/:id', protect, authorize('ADMIN', 'AGENT'), userController.getUserById);

export default router;
