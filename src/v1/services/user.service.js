import User from '../models/User.js';

export const getUserProfile = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

export const updateUserProfile = async (userId, updateData) => {
    // Avoid updating sensitive fields like password or role directly through this method if not intended
    // For now, we assume controller filters safe fields or we handle it here.
    // Let's rely on Mongoose to handle schema validation, but be careful with role/password.

    // Explicitly exclude role and password from generic profile update to be safe
    delete updateData.role;
    delete updateData.passwordHash;

    const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true
    });

    if (!user) {
        throw new Error('User not found');
    }
    return user;
};
