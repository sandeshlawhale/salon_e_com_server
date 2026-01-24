const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['ADMIN', 'AGENT', 'CUSTOMER'],
        default: 'CUSTOMER'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    avatarUrl: { type: String },

    // Agent Specific Data
    agentProfile: {
        commissionRate: { type: Number, default: 0.10 }, // 10% default
        referralCode: { type: String, unique: true, sparse: true },
        totalEarnings: { type: Number, default: 0 },
        bankDetails: {
            bankName: String,
            accountNumber: String
        }
    },

    // Customer Specific Data
    customerProfile: {
        assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        shippingAddresses: [{
            street: String,
            city: String,
            state: String,
            zip: String,
            isDefault: { type: Boolean, default: false }
        }]
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
