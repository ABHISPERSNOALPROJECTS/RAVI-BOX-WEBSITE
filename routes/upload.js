const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { isR2Configured, uploadToR2 } = require('../r2Service');

// Multer memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for photos and videos
});

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
      // Upload to Cloudflare R2 Storage (returns live R2 CDN HTTPS URL)
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
      // HTTPS-safe Data URL fallback (Instant & persistent across Vercel serverless invocations)
      const mime = req.file.mimetype || 'image/jpeg';
      const base64Data = req.file.buffer.toString('base64');
      const dataUrl = `data:${mime};base64,${base64Data}`;

      return res.json({
        success: true,
        storage: 'data-url-fallback',
        warning: 'Cloudflare R2 credentials missing in .env, using inline data URL.',
        url: dataUrl,
        filename: req.file.originalname || 'uploaded_file',
      });
    }
  } catch (err) {
    console.error('Upload Error:', err);
    if (req.file && req.file.buffer) {
      const mime = req.file.mimetype || 'image/jpeg';
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
