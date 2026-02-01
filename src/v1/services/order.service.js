// src/v1/services/order.service.js
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { ObjectId } from 'mongodb';

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

        // Check inventory
        if (typeof product.inventoryCount === 'number' && product.inventoryCount < item.quantity) {
            throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.inventoryCount}`);
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

        // Decrement inventory and update status
        if (typeof product.inventoryCount === 'number') {
            const before = product.inventoryCount;
            product.inventoryCount = product.inventoryCount - item.quantity;
            if (product.inventoryCount <= 0) {
                product.inventoryCount = 0;
                product.status = 'OUT_OF_STOCK';
            }
            await product.save();
            console.log(`Inventory updated for ${product.name}: ${before} -> ${product.inventoryCount}`);
        }
    }

    // 2. Calculate Totals
    const taxRate = 0.05; // 5% flat tax for simplicity
    const tax = subtotal * taxRate;
    const shippingCost = subtotal > 50 ? 0 : 10; // Free shipping over $50
    const total = subtotal + tax + shippingCost;

    // 3. Determine agent if provided by payload or referral code
    let agentId = null;
    if (orderData.agentId) {
        // If agentId provided directly (from checkout dropdown), validate existence
        const maybeAgent = await User.findById(orderData.agentId);
        if (maybeAgent && maybeAgent.role === 'AGENT') {
            agentId = maybeAgent._id;
        }
    } else if (referralCode) {
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
        shippingAddress: shippingAddress || null,
        paymentMethod: paymentMethod || 'card',
        paymentStatus: 'UNPAID',
        timeline: [{ status: 'PENDING', note: `Order created - Payment Method: ${paymentMethod || 'card'}` }]
    });

    return order;
};

export const getMyOrders = async (userId, filters = {}) => {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    const query = { customerId: userId };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
        .populate('agentId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return { value: orders, Count: total };
};

export const getAssignedOrders = async (agentId, filters = {}) => {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    const query = { agentId };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
        .populate('customerId', 'firstName lastName email')
        .populate('agentId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return { value: orders, Count: total };
};

export const assignAgent = async (orderId, agentId) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    order.agentId = agentId || null;
    order.timeline.push({ status: 'AGENT_ASSIGNED', note: `Agent assigned: ${agentId}` });

    await order.save();
    return order;
};

export const getAllOrders = async (filters = {}) => {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;

    // Build query excluding pagination params
    const query = { ...filters };
    delete query.page;
    delete query.limit;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
        .populate('customerId', 'firstName lastName email')
        .populate('agentId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return { value: orders, Count: total };
};

export const updateOrderStatus = async (orderId, status) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    const prevStatus = order.status;
    order.status = status;
    order.timeline.push({ status, note: `Status updated to ${status}` });

    console.log(`[order] Updating status for order ${order.orderNumber}: ${prevStatus} -> ${status}`);

    // If status is COMPLETED or DELIVERED, trigger commission calculation
    if (status === 'COMPLETED' || status === 'DELIVERED') {
        const commissionService = await import('./commission.service.js');
        const commission = await commissionService.calculateCommission(order);

        if (commission && !order.commissionCalculated) {
            order.commissionCalculated = true;
            order.timeline.push({ status: 'COMMISSION_CALCULATED', note: `Commission ${commission._id} created` });
        }
    }

    await order.save();
    console.log(`[order] Order ${order.orderNumber} saved with status ${order.status}`);
    return order;
};
