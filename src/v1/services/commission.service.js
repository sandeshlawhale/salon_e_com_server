import Commission from '../models/Commission.js';
import CommissionSlab from '../models/CommissionSlab.js';
import AgentWallet from '../models/AgentWallet.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

export const createPendingCommission = async (order) => {
    if (!order.agentId) return null;

    const orderDate = new Date(order.createdAt);
    const month = orderDate.getMonth() + 1; // 1-12
    const year = orderDate.getFullYear();

    const commission = await Commission.create({
        agentId: order.agentId,
        orderId: order._id,
        orderAmount: order.subtotal, // Assuming commission on subtotal
        month,
        year,
        status: 'PENDING',
        percentageApplied: null,
        commissionAmount: null
    });

    return commission;
};

export const calculateMonthlyPayout = async (agentId, month, year) => {
    // 1. Find all PENDING commissions for this agent/period
    const commissions = await Commission.find({
        agentId,
        month,
        year,
        status: 'PENDING'
    });

    if (!commissions.length) {
        throw new Error('No pending commissions found for this period.');
    }

    // 2. Calculate Total Monthly Sales
    const totalSales = commissions.reduce((sum, comm) => sum + comm.orderAmount, 0);

    // 3. Determine Applicable Slab
    // Sort slabs descending by minSales to find the highest matching slab
    const slabs = await CommissionSlab.find({ isActive: true }).sort({ minSales: -1 });
    let applicableSlab = slabs.find(slab => totalSales >= slab.minSales);

    // Default to lowest if no match found (or handle error)
    // Requirement says "Sales 0 to 50000 -> 5%". So we should have a 0 slab.
    if (!applicableSlab) {
        // Fallback or throw? Let's assume there's always a base slab.
        // For safety, let's look for the one with minSales 0
        applicableSlab = await CommissionSlab.findOne({ minSales: 0 });
        if (!applicableSlab) throw new Error("No applicable commission slab found.");
    }

    const percentage = applicableSlab.percentage;

    // 4. Update Commissions and Calculate Total Payout
    let totalPayout = 0;
    const updatedIds = [];

    for (const comm of commissions) {
        const amount = (comm.orderAmount * percentage) / 100;
        comm.percentageApplied = percentage;
        comm.commissionAmount = amount;
        comm.status = 'PAID';
        comm.paidAt = new Date();
        await comm.save();

        totalPayout += amount;
        updatedIds.push(comm._id);
    }

    // 5. Credit Agent Wallet
    let wallet = await AgentWallet.findOne({ agentId });
    if (!wallet) {
        wallet = await AgentWallet.create({ agentId });
    }
    wallet.balance += totalPayout;
    await wallet.save();

    // 6. Create Transaction
    await Transaction.create({
        userId: agentId,
        walletType: 'AGENT_WALLET',
        type: 'CREDIT',
        amount: totalPayout,
        status: 'COMPLETED',
        sourceType: 'MonthlyPayout',
        description: `Commission Payout for ${month}/${year}. Sales: ${totalSales}. Slab: ${percentage}%`
        // We could link to commissions if needed, but it's Many-to-One
    });

    return {
        totalSales,
        percentageApplied: percentage,
        totalPayout,
        commissionsProcessed: commissions.length
    };
};

export const reverseCommission = async (orderId) => {
    const commission = await Commission.findOne({ orderId });
    if (!commission) return null;

    if (commission.status === 'REVERSED') return commission; // Already reversed

    const originalStatus = commission.status;

    // Mark as Reversed
    commission.status = 'REVERSED';
    await commission.save();

    // If it was already PAID, we need to Clawback
    if (originalStatus === 'PAID' || originalStatus === 'APPROVED') {
        const amountToDeduct = commission.commissionAmount;

        const wallet = await AgentWallet.findOne({ agentId: commission.agentId });
        if (wallet) {
            wallet.balance = Math.max(0, wallet.balance - amountToDeduct); // Prevent negative? Or allow?
            // Usually agents can go negative. Let's allowing negative for debt tracking or clamp to 0?
            // "Deduct the commission amount from AgentWallet" - implying simple deduction.
            // Let's assume allow negative or check. For now, simple math.
            await wallet.save();

            await Transaction.create({
                userId: commission.agentId,
                walletType: 'AGENT_WALLET',
                type: 'DEBIT',
                amount: amountToDeduct,
                status: 'COMPLETED',
                sourceType: 'CommissionReversal',
                sourceId: commission._id,
                description: `Reversal for Order ${orderId}`
            });
        }
    }

    return commission;
};
