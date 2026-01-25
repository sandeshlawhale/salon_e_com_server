import express from 'express';
import * as commissionController from '../controllers/commission.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

router.get('/me', protect, authorize('AGENT'), commissionController.getAgentWallet);

export default router;
