import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    costPerItem: { type: Number },
    sku: { type: String },
    inventoryCount: { type: Number, default: 0 }, // -1 for infinite services
    category: { type: String, required: true },
    tags: [String],
    images: [String],
    status: {
        type: String,
        enum: ['ACTIVE', 'DRAFT', 'ARCHIVED'],
        default: 'DRAFT'
    }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
