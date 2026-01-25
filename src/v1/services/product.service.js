// src/v1/services/product.service.js
import Product from '../models/Product.js';

export const listProducts = async (filters = {}) => {
    // Basic filtering
    const query = {};
    if (filters.category) {
        query.category = filters.category;
    }
    // Only show ACTIVE products to public unless specified otherwise (handled in controller usually, but safe default)
    // For now, let's assume this returns all for flexibility, or filter by status if passed.
    if (filters.status) {
        query.status = filters.status;
    } else {
        query.status = 'ACTIVE'; // Default to ACTIVE for public listing
    }

    const products = await Product.find(query);
    return products;
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

export const getProductById = async (id) => {
    const product = await Product.findById(id);
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
    return { message: 'Product deleted successfully' };
};
