import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    walletType: {
        type: String,
        enum: ['AGENT_WALLET', 'CUSTOMER_REWARD'],
        required: true
    },
    type: {
        type: String,
        enum: ['CREDIT', 'DEBIT'],
        required: true
    },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'COMPLETED'
    },
    sourceId: { type: mongoose.Schema.Types.ObjectId }, // e.g., Commission ID, Order ID
    sourceType: { type: String }, // 'Commission', 'Order', 'Payout'
    description: String

}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
