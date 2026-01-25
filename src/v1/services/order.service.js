// src/v1/services/order.service.js
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { ObjectId } from 'mongodb';
import * as notificationService from './notification.service.js';

export const createOrder = async (userId, orderData) => {
    const { items, referralCode, shippingAddress, paymentMethod } = orderData;

    // 1. Validate Items & Calculate Prices
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
        let product;

        // Try by ObjectId only if it's a valid MongoDB ObjectId format
        if (ObjectId.isValid(item.productId) && typeof item.productId === 'string' && item.productId.length === 24) {
            product = await Product.findById(item.productId);
        }

        // If not found by ObjectId, try to find by slug
        if (!product) {
            product = await Product.findOne({ slug: item.productId });
        }

        // If still not found, try numeric ID matching slug pattern
        if (!product && !isNaN(item.productId)) {
            product = await Product.findOne({ slug: `product-${item.productId}` });
        }

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

    // 3. Find Agent
    let agentId = null;
    if (referralCode) {
        const agent = await User.findOne({
            'agentProfile.referralCode': referralCode,
            role: 'AGENT'
        });
        if (agent) {
            agentId = agent._id;
        }
    } else {
        // Check if user is linked to an agent
        const user = await User.findById(userId);
        if (user && user.customerProfile && user.customerProfile.assignedAgentId) {
            agentId = user.customerProfile.assignedAgentId;
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
        paymentMethod: paymentMethod || 'card',
        paymentStatus: 'UNPAID',
        timeline: [{ status: 'PENDING', note: `Order created - Payment Method: ${paymentMethod || 'card'}` }]
    });

    // Notify Customer
    await notificationService.createNotification({
        userId: userId,
        role: 'CUSTOMER',
        title: 'Order Created',
        message: `Your order ${order.orderNumber} has been successfully placed.`,
        type: 'ORDER'
    });

    // Notify Agent
    if (agentId) {
        await notificationService.createNotification({
            userId: agentId,
            role: 'AGENT',
            title: 'New Order Assigned',
            message: `New order ${order.orderNumber} has been placed.`,
            type: 'ORDER'
        });
    }

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

    const previousStatus = order.status;
    order.status = status;
    order.timeline.push({ status, note: `Status updated to ${status}` });

    // Notify Customer
    await notificationService.createNotification({
        userId: order.customerId,
        role: 'CUSTOMER',
        title: `Order ${status}`,
        message: `Your order ${order.orderNumber} status has been updated to ${status}.`,
        type: 'ORDER'
    });

    // Notify Agent if Cancelled
    if (status === 'CANCELLED' && order.agentId) {
        await notificationService.createNotification({
            userId: order.agentId,
            role: 'AGENT',
            title: 'Order Cancelled',
            message: `Order ${order.orderNumber} assigned to you has been cancelled.`,
            type: 'ORDER'
        });

        // Handle Refund/Reversal Logic
        const commissionService = await import('./commission.service.js');
        await commissionService.reverseCommission(orderId);
    }

    // Trigger Commission & Rewards on PAID or COMPLETED
    // Assuming PAID triggers the sales record.
    if ((status === 'PAID' || status === 'COMPLETED') && !order.commissionCalculated) {
        const commissionService = await import('./commission.service.js');
        const rewardService = await import('./reward.service.js');

        await commissionService.createPendingCommission(order);
        await rewardService.processOrderRewards(order);

        order.commissionCalculated = true;
    }

    await order.save();
    return order;
};
