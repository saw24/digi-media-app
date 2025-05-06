const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

// Get all products
router.get('/', ProductController.getAllProducts);

// Search products
router.get('/search', ProductController.searchProducts);

// Get low stock products
router.get('/low-stock', ProductController.getLowStockProducts);

// Get products by category
router.get('/category/:category', ProductController.getProductsByCategory);

// Get products by domain code
router.get('/domain/:domainCode', ProductController.getProductsByDomain);

// Get a single product
router.get('/:id', ProductController.getProductById);

// Create a new product
router.post('/', ProductController.createProduct);

// Update a product
router.put('/:id', ProductController.updateProduct);

// Delete a product
router.delete('/:id', ProductController.deleteProduct);

module.exports = router;