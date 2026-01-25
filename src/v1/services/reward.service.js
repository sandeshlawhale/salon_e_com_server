import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

export const processOrderRewards = async (order) => {
    if (!order.customerId) return;

    const user = await User.findById(order.customerId);
    if (!user) return;

    // 1. Establish Eligibility Date if not set
    if (!user.customerProfile.firstOrderDate) {
        user.customerProfile.firstOrderDate = new Date();

        // +3 Months
        const eligibilityDate = new Date(user.customerProfile.firstOrderDate);
        eligibilityDate.setMonth(eligibilityDate.getMonth() + 3);
        user.customerProfile.rewardEligibleFromDate = eligibilityDate;
    }

    // 2. Calculate Rewards (10% of total)
    const pointsEarned = Math.floor(order.total * 0.10); // Assuming integer points? Or float? Using floor for points usually.
    // "Customer Reward Percentage is 10 percent... Reward coins". 
    // Let's stick to simple number.

    user.customerProfile.rewardPoints = (user.customerProfile.rewardPoints || 0) + pointsEarned;
    await user.save();

    // Optional: Log accumulation transaction? "Reward Accumulation: ... Coins are stored"
    // Requirement says "Rewards are accumulated ... Coins are stored but marked as locked". 
    // We are storing them in rewardPoints. The "locking" is enforced by the date check at redemption.
};

export const redeemRewards = async (userId, pointsToRedeem) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const now = new Date();

    // 1. Check Eligibility
    if (!user.customerProfile.rewardEligibleFromDate || now < user.customerProfile.rewardEligibleFromDate) {
        throw new Error('Rewards are locked. You are not eligible to redeem yet.'); // Strict enforcement
    }

    // 2. Check Balance
    if (user.customerProfile.rewardPoints < pointsToRedeem) {
        throw new Error('Insufficient reward points.');
    }

    // 3. Deduct Points
    user.customerProfile.rewardPoints -= pointsToRedeem;
    await user.save();

    // 4. Create Transaction
    await Transaction.create({
        userId: user._id,
        walletType: 'CUSTOMER_REWARD',
        type: 'DEBIT', // Redeemed = Debit from points balance
        amount: pointsToRedeem,
        status: 'COMPLETED',
        sourceType: 'RewardRedemption',
        description: `Redeemed ${pointsToRedeem} points`
    });

    return {
        redeemed: pointsToRedeem,
        remainingBalance: user.customerProfile.rewardPoints
    };
};

export const getRewardBalance = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Calculate Is Locked
    const now = new Date();
    const isLocked = !user.customerProfile.rewardEligibleFromDate || now < user.customerProfile.rewardEligibleFromDate;

    return {
        points: user.customerProfile.rewardPoints || 0,
        isLocked,
        eligibleFrom: user.customerProfile.rewardEligibleFromDate
    };
};
