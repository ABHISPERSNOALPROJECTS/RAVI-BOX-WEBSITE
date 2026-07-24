const express = require('express');
const router = express.Router();
const { getLocalData, saveLocalData } = require('../dbService');

/**
 * GET /api/products
 * Fetch all products
 */
router.get('/', async (req, res) => {
  try {
    const local = getLocalData();
    return res.json({ success: true, source: 'local', products: local.products });
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/products/:id
 * Fetch single product by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const local = getLocalData();
    const product = local.products.find(p => p.id === productId);
    if (!product) {
      return res.json({ success: false, product: null, message: 'Product not found in server DB' });
    }
    return res.json({ success: true, source: 'local', product });
  } catch (err) {
    console.error('Fetch product detail error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/products
 * Add a new product
 */
router.post('/', async (req, res) => {
  try {
    const newProduct = {
      id: req.body.id || `prod_${Date.now()}`,
      title: req.body.title,
      tag: req.body.tag || 'Custom box',
      size_category: req.body.size_category || 'medium',
      dims: req.body.dims || '300 × 200 × 100 mm',
      price: req.body.price ? (req.body.price.startsWith('₹') ? req.body.price : `₹${req.body.price}`) : '₹25',
      min_order: Number(req.body.min_order) || 50,
      default_thickness: req.body.default_thickness || '3-Ply Standard',
      desc: req.body.desc || '',
      specs: Array.isArray(req.body.specs) ? req.body.specs : (req.body.specs ? req.body.specs.split('\n').filter(Boolean) : []),
      images: Array.isArray(req.body.images) ? req.body.images : (req.body.images ? [req.body.images] : []),
      videos: Array.isArray(req.body.videos) ? req.body.videos : (req.body.videos ? [req.body.videos] : []),
      created_at: new Date().toISOString()
    };

    if (!newProduct.title) {
      return res.status(400).json({ error: 'Product title is required.' });
    }

    const local = getLocalData();
    // Update if existing or add new
    const existingIndex = local.products.findIndex(p => p.id === newProduct.id);
    if (existingIndex >= 0) {
      local.products[existingIndex] = newProduct;
    } else {
      local.products.unshift(newProduct);
    }
    saveLocalData(local);
    return res.json({ success: true, source: 'local', product: newProduct });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/products/:id
 * Delete product by ID
 */
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const local = getLocalData();
    local.products = local.products.filter(p => p.id !== productId);
    saveLocalData(local);
    return res.json({ success: true, message: `Product ${productId} deleted.` });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
