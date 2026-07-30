const express = require('express');
const router = express.Router();
const { saveJsonToR2, getJsonFromR2 } = require('../r2Service');

const defaultBanners = [
  {
    id: 'white_box',
    title: 'WHITE KRAFT BOX',
    subtitle: 'Clean, elegant white corrugated mailer & gift boxes.',
    image: 'https://images.pexels.com/photos/8015700/pexels-photo-8015700.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: 'products.html'
  },
  {
    id: 'brown_box',
    title: 'BROWN KRAFT BOX',
    subtitle: 'Rustic, eco-friendly 3-ply & 5-ply corrugated shippers.',
    image: 'https://images.pexels.com/photos/6119143/pexels-photo-6119143.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: 'products.html'
  },
  {
    id: 'custom_box',
    title: 'CUSTOMIZE BOX',
    subtitle: 'Custom length, width, height & logo printing to order.',
    image: 'https://images.pexels.com/photos/7464209/pexels-photo-7464209.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: 'custom-order.html'
  }
];

let inMemoryBanners = defaultBanners;

/**
 * GET /api/banners
 * Fetch homepage category banners
 */
router.get('/', async (req, res) => {
  try {
    const r2Banners = await getJsonFromR2('homepage_banners.json');
    if (r2Banners && Array.isArray(r2Banners) && r2Banners.length > 0) {
      inMemoryBanners = r2Banners;
      return res.json({ success: true, banners: r2Banners });
    }
  } catch (e) {}
  return res.json({ success: true, banners: inMemoryBanners });
});

/**
 * POST /api/banners
 * Update homepage category banners
 */
router.post('/', async (req, res) => {
  try {
    const banners = req.body.banners;
    if (Array.isArray(banners)) {
      inMemoryBanners = banners;
      await saveJsonToR2('homepage_banners.json', banners);
      return res.json({ success: true, banners: inMemoryBanners });
    }
    return res.status(400).json({ error: 'Invalid banners array format' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
