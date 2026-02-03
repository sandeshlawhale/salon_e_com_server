import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create-order', protect, paymentController.createRazorpayOrder);
router.post('/verify', protect, paymentController.verifyPayment);

export default router;
