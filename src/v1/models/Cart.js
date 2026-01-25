import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: String,  // Can be ObjectId string, slug (product-1), or numeric ID
        required: true
    },
    productName: String,
    productImage: String,
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    totalPrice: {
        type: Number,
        default: 0
    },
    totalItems: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Middleware to calculate totals before saving
cartSchema.pre('save', function(next) {
    this.totalItems = this.items.length; // Count of unique items, not sum of quantities
    this.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    next();
});

export default mongoose.model('Cart', cartSchema);
