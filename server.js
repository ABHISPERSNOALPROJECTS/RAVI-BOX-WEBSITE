require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const uploadRoutes = require('./routes/upload');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const { isR2Configured } = require('./r2Service');
const { isSupabaseConfigured } = require('./dbService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files and local uploads fallback
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

/**
 * Health Check & Status Endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'BoxCraft API Server',
    services: {
      cloudflare_r2: isR2Configured() ? 'Connected' : 'Missing .env credentials (using local upload fallback)',
      database: isSupabaseConfigured() ? 'Supabase Connected' : 'Using local JSON database fallback'
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
    console.log(`☁️ Cloudflare R2: ${isR2Configured() ? 'READY ✅' : 'PENDING .ENV KEYS ⚠️ (Fallback Active)'}`);
    console.log(`🗄️ Database: ${isSupabaseConfigured() ? 'SUPABASE READY ✅' : 'LOCAL FALLBACK READY 📦'}`);
    console.log(`=================================================`);
  });
}

module.exports = app;
