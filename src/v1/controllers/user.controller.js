import User from '../models/User.js';

export const getUsers = async (req, res) => {
    try {
        const { role, isActive } = req.query;
        const query = {};
        if (role) query.role = role.toUpperCase();
        if (typeof isActive !== 'undefined') query.isActive = (isActive === 'true' || isActive === true);

        // Return limited fields for privacy
        const users = await User.find(query).select('firstName lastName email role isActive agentProfile customerProfile createdAt');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Public list of active agents (no auth required)
export const getPublicAgents = async (req, res) => {
    try {
        const agents = await User.find({ role: 'AGENT', isActive: true }).select('firstName lastName email agentProfile');
        res.json(agents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-passwordHash');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
