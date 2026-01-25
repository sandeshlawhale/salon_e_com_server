import * as userService from '../services/user.service.js';

export const getProfile = async (req, res) => {
    try {
        const user = await userService.getUserProfile(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const user = await userService.updateUserProfile(req.user.id, req.body);
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAgents = async (req, res) => {
    try {
        const User = await import('../models/User.js').then(m => m.default);
        const agents = await User.find({ role: 'AGENT' })
            .select('-passwordHash')
            .sort({ createdAt: -1 });
        res.json(agents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
