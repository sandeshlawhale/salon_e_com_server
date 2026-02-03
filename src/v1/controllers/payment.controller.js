import razorpay from '../../config/razorpay.js';
import crypto from 'crypto';
import Order from '../models/Order.js';
import { updateOrderStatus } from '../services/order.service.js';

/**
 * Create a Razorpay order
 * POST /api/v1/payments/create-order
 */
export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency,
            receipt,
        };

        const response = await razorpay.orders.create(options);
        res.status(200).json({
            id: response.id,
            currency: response.currency,
            amount: response.amount,
        });
    } catch (error) {
        console.error('Razorpay Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Verify Razorpay payment signature
 * POST /api/v1/payments/verify
 */
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId // Our internal order ID
        } = req.body;

        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            // Payment verified
            if (orderId) {
                const order = await Order.findById(orderId);
                if (order) {
                    order.paymentStatus = 'PAID';
                    order.paymentDetails = {
                        razorpay_order_id,
                        razorpay_payment_id,
                        razorpay_signature
                    };
                    await order.save();

                    // Update order status to CONFIRMED or similar
                    await updateOrderStatus(orderId, 'CONFIRMED');
                }
            }
            return res.status(200).json({ message: 'Payment verified successfully', status: 'success' });
        } else {
            return res.status(400).json({ message: 'Invalid signature', status: 'failure' });
        }
    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ message: error.message });
    }
};
