// src/v1/controllers/product.controller.js
import * as productService from '../services/product.service.js';

export const getProducts = async (req, res) => {
    try {
        const filters = req.query;
        console.log('[getProducts] Request filters:', filters);

        const products = await productService.listProducts(filters);

        console.log(`[getProducts] Returning ${products.length} products`);
        if (products.length > 0) {
            console.log('[getProducts] Sample product:', {
                _id: products[0]._id,
                name: products[0].name,
                status: products[0].status
            });
        }

        res.json(products);
    } catch (error) {
        console.error('[getProducts] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const productData = req.body;

        // Handle image uploads
        if (req.files && req.files.length > 0) {
            productData.images = req.files.map(file => file.path);
        }

        const product = await productService.createProduct(productData);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const updateData = req.body;

        // Handle image uploads - Append or Replace? 
        // Typically replace for simplicity or append if logic allows. 
        // For now, let's assume if new images are sent, we add them to existing list or replace depending on frontend need.
        // Let's implement append logic effectively or just replace if "images" key is present but empty?
        // Simpler: If files are uploaded, use them. If we want to keep old ones, frontend should handle or we need more complex logic.
        // Let's assume replacement for the updated field, but usually we might want to merge. 
        // Let's just map new files if present.
        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => file.path);
        }

        const product = await productService.updateProduct(req.params.id, updateData);
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await productService.deleteProduct(req.params.id);
        res.json({ message: 'Product deleted successfully', product });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
