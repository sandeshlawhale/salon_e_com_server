// src/v1/routes/product.routes.js
import express from 'express';
import * as productController from '../controllers/product.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Admin only routes
router.post('/', protect, authorize('ADMIN'), productController.createProduct);
router.patch('/:id', protect, authorize('ADMIN'), productController.updateProduct);
router.delete('/:id', protect, authorize('ADMIN'), productController.deleteProduct);

export default router;
