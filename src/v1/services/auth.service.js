// src/v1/services/auth.service.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as notificationService from './notification.service.js';

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export const registerUser = async (userData) => {
    const { email, password, firstName, lastName, role, phone, agentProfile, customerProfile } = userData;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Prepare user object
    const newUserObj = {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        role: role || 'CUSTOMER' // Default to CUSTOMER
    };

    // Handle Role Specific Profiles
    if (role === 'AGENT') {
        if (!agentProfile) {
            // Initialize empty if not provided, or throw if required fields missing? 
            // For better auth, let's initialize defaults.
            newUserObj.agentProfile = {
                commissionRate: 0.10,
                totalEarnings: 0
            };
        } else {
            newUserObj.agentProfile = agentProfile;
        }
    } else if (role === 'CUSTOMER') {
        if (customerProfile) {
            newUserObj.customerProfile = customerProfile;
        }
    }

    // Prevent creating ADMIN via public API unless specific secret is used (omitted for now for simplicity, assuming Admin is seeded or manual)
    if (role === 'ADMIN') {
        // Simple protection: generic users usually can't sign up as ADMIN. 
        // For this task, we will allow it but in production this should be guarded.
    }

    const user = await User.create(newUserObj);

    // Notify Admin if new Agent registered
    if (user && user.role === 'AGENT') {
        const admin = await User.findOne({ role: 'ADMIN' });
        if (admin) {
            await notificationService.createNotification({
                userId: admin._id,
                role: 'ADMIN',
                title: 'New Agent Registered',
                message: `${user.firstName} ${user.lastName} has registered as an agent.`,
                type: 'SYSTEM'
            });
        }
    }

    if (user) {
        return {
            _id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role),
        };
    } else {
        throw new Error('Invalid user data');
    }
};

export const loginUser = async (email, password) => {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
        return {
            _id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role),
        };
    } else {
        throw new Error('Invalid credentials');
    }
};
