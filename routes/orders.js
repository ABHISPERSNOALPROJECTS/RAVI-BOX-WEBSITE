const express = require('express');
const router = express.Router();
const { getLocalData, saveLocalData } = require('../dbService');

/**
 * GET /api/orders
 * Get all orders (for Admin Dashboard)
 */
router.get('/', async (req, res) => {
  try {
    const local = getLocalData();
    return res.json({ success: true, source: 'local', orders: local.orders });
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/orders
 * Submit custom packaging or standard product order
 */
router.post('/', async (req, res) => {
  try {
    const orderData = {
      product_id: req.body.product_id || 'custom',
      product_title: req.body.product_title || 'Custom Box Order',
      length: Number(req.body.length) || 0,
      width: Number(req.body.width) || 0,
      height: Number(req.body.height) || 0,
      quantity: Number(req.body.quantity) || 100,
      board_type: req.body.board_type || '3-ply',
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    const local = getLocalData();
    orderData.id = Date.now();
    local.orders.unshift(orderData);
    saveLocalData(local);
    return res.json({ success: true, source: 'local', order: orderData });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/orders/:id/status
 * Update order status
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const local = getLocalData();
    const order = local.orders.find(o => String(o.id) === String(orderId));
    if (order) {
      order.status = status;
      saveLocalData(local);
      return res.json({ success: true, source: 'local', order });
    }
    return res.status(404).json({ error: 'Order not found' });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
