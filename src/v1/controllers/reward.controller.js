import * as rewardService from '../services/reward.service.js';

export const getMyRewards = async (req, res) => {
    try {
        const data = await rewardService.getRewardBalance(req.user.id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const redeemRewards = async (req, res) => {
    const { points } = req.body;
    try {
        const result = await rewardService.redeemRewards(req.user.id, points);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
