// src/v1/services/order.service.js
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export const createOrder = async (userId, orderData) => {
    const { items, referralCode, shippingAddress } = orderData;

    // 1. Validate Items & Calculate Prices
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
            throw new Error(`Product ${item.productId} not found`);
        }

        const price = product.price; // Use backend price for security
        subtotal += price * item.quantity;

        orderItems.push({
            productId: product._id,
            name: product.name,
            quantity: item.quantity,
            priceAtPurchase: price,
            image: product.images?.[0]
        });
    }

    // 2. Calculate Totals
    const taxRate = 0.05; // 5% flat tax for simplicity
    const tax = subtotal * taxRate;
    const shippingCost = subtotal > 50 ? 0 : 10; // Free shipping over $50
    const total = subtotal + tax + shippingCost;

    // 3. Find Agent if Referral Code provided
    let agentId = null;
    if (referralCode) {
        const agent = await User.findOne({
            'agentProfile.referralCode': referralCode,
            role: 'AGENT'
        });
        if (agent) {
            agentId = agent._id;
        }
    }

    // 4. Generate Order Number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await Order.create({
        orderNumber,
        customerId: userId,
        agentId,
        items: orderItems,
        subtotal,
        tax,
        shippingCost,
        total,
        timeline: [{ status: 'PENDING', note: 'Order created' }]
    });

    return order;
};

export const getMyOrders = async (userId) => {
    return await Order.find({ customerId: userId }).sort({ createdAt: -1 });
};

export const getAgentOrders = async (agentId) => {
    return await Order.find({ agentId: agentId })
        .populate('customerId', 'firstName lastName email')
        .sort({ createdAt: -1 });
};

export const getAllOrders = async (filters = {}) => {
    return await Order.find(filters).populate('customerId', 'firstName lastName email').sort({ createdAt: -1 });
};

export const updateOrderStatus = async (orderId, status) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    order.status = status;
    order.timeline.push({ status, note: `Status updated to ${status}` });

    // If status is COMPLETED or DELIVERED, trigger commission calculation
    if (status === 'COMPLETED' || status === 'DELIVERED') {
        const commissionService = await import('./commission.service.js');
        await commissionService.calculateCommission(order);

        if (!order.commissionCalculated) {
            order.commissionCalculated = true;
        }
    }

    await order.save();
    return order;
};
