// src/v1/routes/order.routes.js
import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

// Public/User routes
router.post('/', protect, orderController.createOrder); // Customer or Agent can buy
router.get('/me', protect, orderController.getMyOrders);

// Admin routes
router.get('/', protect, authorize('ADMIN'), orderController.getAllOrders);
router.patch('/:id/status', protect, authorize('ADMIN'), orderController.updateStatus);

export default router;
