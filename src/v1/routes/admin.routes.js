import express from 'express';
import * as commissionController from '../controllers/commission.controller.js';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

// Slabs
router.post('/commission-slabs', protect, authorize('ADMIN'), commissionController.createSlab);
router.get('/commission-slabs', protect, authorize('ADMIN'), commissionController.getSlabs);
router.patch('/commission-slabs/:id', protect, authorize('ADMIN'), commissionController.updateSlab);
router.delete('/commission-slabs/:id', protect, authorize('ADMIN'), commissionController.deleteSlab);

// Commissions & Agents
router.get('/agents', protect, authorize('ADMIN'), userController.getAgents); // Need to make sure this exists
router.get('/commissions', protect, authorize('ADMIN'), commissionController.getCommissions);

// Payout Approval (Monthly Bulk)
router.post('/payouts/approve', protect, authorize('ADMIN'), commissionController.approveMonthlyPayout);

export default router;
