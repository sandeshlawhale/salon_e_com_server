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
        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body);
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
