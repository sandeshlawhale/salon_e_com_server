import * as commissionService from '../services/commission.service.js';
import CommissionSlab from '../models/CommissionSlab.js';

// --- Slab Management ---
export const createSlab = async (req, res) => {
    try {
        const slab = await CommissionSlab.create(req.body);
        res.status(201).json(slab);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSlabs = async (req, res) => {
    try {
        const slabs = await CommissionSlab.find().sort({ minSales: 1 });
        res.json(slabs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSlab = async (req, res) => {
    try {
        const slab = await CommissionSlab.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(slab);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteSlab = async (req, res) => {
    try {
        await CommissionSlab.findByIdAndDelete(req.params.id);
        res.json({ message: 'Slab deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Commissions & Payouts ---

export const getCommissions = async (req, res) => {
    try {
        // Admin sees all, Agent sees own
        const filter = {};
        if (req.user.role === 'AGENT') {
            filter.agentId = req.user.id;
        }
        // Support status filter
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const commissions = await import('../models/Commission.js').then(m => m.default.find(filter)
            .populate('orderId', 'orderNumber')
            .populate('agentId', 'firstName lastName')
            .sort({ createdAt: -1 }));

        res.json(commissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const approveMonthlyPayout = async (req, res) => {
    // Expected Body: { agentId, month, year }
    const { agentId, month, year } = req.body;
    try {
        const result = await commissionService.calculateMonthlyPayout(agentId, month, year);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAgentWallet = async (req, res) => {
    try {
        const AgentWallet = await import('../models/AgentWallet.js').then(m => m.default);
        const wallet = await AgentWallet.findOne({ agentId: req.user.id });
        res.json(wallet || { balance: 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
