// src/v1/v1.routes.js
import express from 'express';

const router = express.Router();

router.get('/health', (req, res) => {
    res.json({ status: 'API V1 is active', timestamp: new Date() });
});

// Module Routes will be mounted here
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import commissionRoutes from './routes/commission.routes.js';
import cartRoutes from './routes/cart.routes.js';
import userRoutes from './routes/user.routes.js';
import paymentRoutes from './routes/payment.routes.js';

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/commissions', commissionRoutes);
router.use('/cart', cartRoutes);
router.use('/users', userRoutes);
router.use('/payments', paymentRoutes);

export default router;
