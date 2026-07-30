require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const uploadRoutes = require('./routes/upload');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const bannerRoutes = require('./routes/banners');
const { isR2Configured } = require('./r2Service');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable proxy trust for HTTPS on Vercel
app.set('trust proxy', true);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files and local uploads fallback
app.use(express.static(path.join(__dirname)));
// Favicon 204 handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/banners', bannerRoutes);

/**
 * Health Check & Status Endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'BoxCraft API Server',
    services: {
      cloudflare_r2: isR2Configured() ? 'Cloudflare R2 Storage Connected ✅' : 'Local File Upload Fallback Active 📦',
      database: 'BoxCraft Database Engine Active 📦'
    },
    time: new Date().toISOString()
  });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 BoxCraft Backend Server running on port ${PORT}`);
    console.log(`📍 API Health check: http://localhost:${PORT}/api/health`);
    console.log(`☁️ Cloudflare R2: ${isR2Configured() ? 'READY ✅' : 'FALLBACK ACTIVE 📦'}`);
    console.log(`=================================================`);
  });
}

module.exports = app;
