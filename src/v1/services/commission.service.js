// src/v1/services/commission.service.js
import Commission from '../models/Commission.js';
import User from '../models/User.js';

export const calculateCommission = async (order) => {
    // Only calculate if agent exists and commission not already calculated
    if (!order.agentId || order.commissionCalculated) {
        return null;
    }

    const agent = await User.findById(order.agentId);
    if (!agent || agent.role !== 'AGENT') {
        return null; // Should not happen if data integrity is good
    }

    const rate = agent.agentProfile.commissionRate || 0.10;
    const amountEarned = order.subtotal * rate; // Commission usually on subtotal

    const commission = await Commission.create({
        agentId: agent._id,
        orderId: order._id,
        orderAmount: order.subtotal,
        commissionRate: rate,
        amountEarned,
        status: 'PENDING'
    });

    // Update agent's total earnings
    agent.agentProfile.totalEarnings += amountEarned;

    // Award points to agent (1 point per ₹1 of commission rounded)
    agent.agentProfile.points = (agent.agentProfile.points || 0) + Math.round(amountEarned);

    await agent.save();

    console.log(`[commission] Created commission ${commission._id} for agent ${agent.email}: ₹${amountEarned}`);

    return commission;
};

export const listCommissions = async (userId, role) => {
    // Admin sees all, Agent sees own
    const query = {};
    if (role === 'AGENT') {
        query.agentId = userId;
    }

    return await Commission.find(query)
        .populate('orderId', 'orderNumber total')
        .populate('agentId', 'firstName lastName email');
};
