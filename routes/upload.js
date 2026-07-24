const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isR2Configured, uploadToR2 } = require('../r2Service');

// Multer memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for high quality photos and videos
});

// Ensure local fallback uploads dir exists
const localUploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

/**
 * POST /api/upload
 * Upload single image or file
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    if (isR2Configured()) {
      // Upload to Cloudflare R2
      const publicUrl = await uploadToR2(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      return res.json({
        success: true,
        storage: 'cloudflare-r2',
        url: publicUrl,
        filename: req.file.originalname,
      });
    } else {
      // Local fallback storage
      const ext = path.extname(req.file.originalname) || '.png';
      const localFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
      const filePath = path.join(localUploadsDir, localFilename);

      fs.writeFileSync(filePath, req.file.buffer);

      const localUrl = `${req.protocol}://${req.get('host')}/uploads/${localFilename}`;

      return res.json({
        success: true,
        storage: 'local-fallback',
        warning: 'Cloudflare R2 credentials not found in .env, saved locally.',
        url: localUrl,
        filename: localFilename,
      });
    }
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: err.message || 'File upload failed.' });
  }
});

module.exports = router;
