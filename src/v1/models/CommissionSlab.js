import mongoose from 'mongoose';

const commissionSlabSchema = new mongoose.Schema({
    minSales: { type: Number, required: true },
    maxSales: { type: Number, required: true }, // Use a very large number for "above X"
    percentage: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('CommissionSlab', commissionSlabSchema);
