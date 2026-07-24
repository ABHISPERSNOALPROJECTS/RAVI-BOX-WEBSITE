const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { isR2Configured, uploadToR2 } = require('../r2Service');

// Multer memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Writable directory path (safe for both local and Vercel serverless environment)
const localUploadsDir = process.env.VERCEL ? path.join(os.tmpdir(), 'uploads') : path.join(__dirname, '../uploads');

function ensureUploadDir() {
  try {
    if (!fs.existsSync(localUploadsDir)) {
      fs.mkdirSync(localUploadsDir, { recursive: true });
    }
  } catch (e) {
    console.warn("Could not create local upload directory, using Base64 data URL fallback.");
  }
}

/**
 * POST /api/upload
 * Upload single image or video file
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
      // Fallback local or Base64 storage
      ensureUploadDir();
      const ext = path.extname(req.file.originalname) || '.png';
      const localFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
      const filePath = path.join(localUploadsDir, localFilename);

      let finalUrl = "";
      try {
        fs.writeFileSync(filePath, req.file.buffer);
        finalUrl = `${req.protocol}://${req.get('host')}/uploads/${localFilename}`;
      } catch (writeErr) {
        // Fallback to Base64 data URL if disk write is not available
        const mime = req.file.mimetype || 'image/png';
        const base64Data = req.file.buffer.toString('base64');
        finalUrl = `data:${mime};base64,${base64Data}`;
      }

      return res.json({
        success: true,
        storage: 'fallback',
        url: finalUrl,
        filename: localFilename,
      });
    }
  } catch (err) {
    console.error('Upload Error:', err);
    // Safe Base64 fallback so upload request NEVER crashes with 500 error
    if (req.file && req.file.buffer) {
      const mime = req.file.mimetype || 'image/png';
      const base64Data = req.file.buffer.toString('base64');
      return res.json({
        success: true,
        storage: 'base64-fallback',
        url: `data:${mime};base64,${base64Data}`,
        filename: req.file.originalname || 'file'
      });
    }
    res.status(500).json({ error: err.message || 'File upload failed.' });
  }
});

module.exports = router;
