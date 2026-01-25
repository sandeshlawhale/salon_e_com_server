import express from 'express';
import * as rewardController from '../controllers/reward.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/me', protect, rewardController.getMyRewards);
router.post('/redeem', protect, rewardController.redeemRewards);

export default router;
