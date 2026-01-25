import mongoose from 'mongoose';

const commissionSchema = new mongoose.Schema({
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },

    orderAmount: { type: Number, required: true },

    // Calculated at Payout Time
    percentageApplied: { type: Number, default: null },
    commissionAmount: { type: Number, default: null },

    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },

    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'PAID', 'REVERSED'],
        default: 'PENDING'
    },
    paidAt: { type: Date }

}, { timestamps: true });

export default mongoose.model('Commission', commissionSchema);
