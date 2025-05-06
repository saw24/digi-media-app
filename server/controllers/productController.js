const Product = require('../models/ProduitModel');
const { Op } = require("sequelize");

class ProductController {
  // Get all products
  async getAllProducts(req, res) {
    try {
      const products = await Product.findAll({
        where: { si_obsolete: false }
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get a single product by ID
  async getProductById(req, res) {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Create a new product
  async createProduct(req, res) {
    try {
      const product = await Product.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update a product
  async updateProduct(req, res) {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      await product.update(req.body);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete a product (soft delete)
  async deleteProduct(req, res) {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      await product.update({ si_obsolete: true });
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Search products
  async searchProducts(req, res) {
    try {
      const { query } = req.query;
      const products = await Product.findAll({
        where: {
          si_obsolete: false,
          [Op.or]: [
            { Des_prdt: { [Op.iLike]: `%${query}%` } },
            { code_prdt: { [Op.iLike]: `%${query}%` } },
            { ref_prdt: { [Op.iLike]: `%${query}%` } }
          ]
        }
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get products by category
  async getProductsByCategory(req, res) {
    try {
      const { category } = req.params;
      const products = await Product.findAll({
        where: {
          Cat_prdt: category,
          si_obsolete: false
        }
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get low stock products
  async getLowStockProducts(req, res) {
    try {
      const products = await Product.findAll({
        where: {
          si_obsolete: false,
          Stock_prdt: {
            [Op.lte]: sequelize.col('seuil_prdt')
          }
        }
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get products by domain code
  async getProductsByDomain(req, res) {
    try {
      const { domainCode } = req.params;
      const products = await Product.findAll({
        where: {
          code_domaine: domainCode,
          si_obsolete: false
        },
        order: [['Des_prdt', 'ASC']]
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
}

module.exports = new ProductController();