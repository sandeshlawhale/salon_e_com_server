// src/v1/services/product.service.js
import Product from '../models/Product.js';

export const listProducts = async (filters = {}) => {
    // Basic filtering
    const query = {};
    if (filters.category) {
        query.category = filters.category;
    }
    if (filters.status) {
        query.status = filters.status;
    } else {
        query.status = 'ACTIVE'; // Default to ACTIVE for public listing
    }

    console.log('[listProducts] Query:', query);
    const products = await Product.find(query);
    console.log(`[listProducts] Found ${products.length} products`);
    return products;
};

export const getProductById = async (id) => {
    // First try to find by MongoDB ObjectId
    let product = await Product.findById(id);
    
    // If not found, try to find by slug (for string IDs that aren't ObjectIds)
    if (!product) {
        product = await Product.findOne({ slug: id });
    }
    
    // If still not found, try numeric ID matching slug pattern
    if (!product && !isNaN(id)) {
        product = await Product.findOne({ slug: `product-${id}` });
    }
    
    return product;
};

export const createProduct = async (productData) => {
    // Validate slug uniqueness checks are usually handled by Mongoose unique index, 
    // but we can add check here if we want custom error message.

    // Ensure slug is generated if not provided? Schema says required.
    // Assuming partial slug generation or frontend sends it.

    const product = await Product.create(productData);
    return product;
};

export const updateProduct = async (id, updateData) => {
    const product = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    });

    if (!product) {
        throw new Error('Product not found');
    }

    return product;
};

export const deleteProduct = async (id) => {
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
        throw new Error('Product not found');
    }

    return product;
};
