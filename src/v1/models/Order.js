import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, for commission

    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },

    currency: { type: String, default: 'USD' },
    paymentStatus: {
        type: String,
        enum: ['UNPAID', 'PAID', 'FAILED'],
        default: 'UNPAID'
    },
    paymentMethod: { type: String }, // STRIPE, etc.

    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        quantity: { type: Number, required: true },
        priceAtPurchase: { type: Number, required: true },
        image: String
    }],

    status: {
        type: String,
        enum: ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'],
        default: 'PENDING'
    },

    shippingAddress: {
        name: String,
        street: String,
        city: String,
        state: String,
        zip: String,
        phone: String
    },

    timeline: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String
    }],

    commissionCalculated: { type: Boolean, default: false }

}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
