import mongoose from 'mongoose';

const agentWalletSchema = new mongoose.Schema({
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    }
}, { timestamps: true });

export default mongoose.model('AgentWallet', agentWalletSchema);
