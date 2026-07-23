const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const crypto = require('crypto');

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const publicUrlBase = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';

let r2Client = null;

if (accountId && accessKeyId && secretAccessKey) {
  r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });
}

/**
 * Checks if Cloudflare R2 is configured
 */
function isR2Configured() {
  return Boolean(accountId && accessKeyId && secretAccessKey && bucketName);
}

/**
 * Uploads a file buffer to Cloudflare R2 bucket.
 * @param {Buffer} fileBuffer 
 * @param {string} originalName 
 * @param {string} mimeType 
 * @returns {Promise<string>} Public URL of uploaded file
 */
async function uploadToR2(fileBuffer, originalName, mimeType) {
  if (!isR2Configured()) {
    throw new Error("Cloudflare R2 storage is not configured in .env. Please set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, and CLOUDFLARE_R2_BUCKET_NAME.");
  }

  const ext = path.extname(originalName) || '.png';
  const fileHash = crypto.randomBytes(8).toString('hex');
  const filename = `uploads/${Date.now()}-${fileHash}${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: filename,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await r2Client.send(command);

  // Return public CDN/R2 URL
  const baseUrl = publicUrlBase.replace(/\/$/, '');
  if (baseUrl) {
    return `${baseUrl}/${filename}`;
  }
  return `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${filename}`;
}

module.exports = {
  r2Client,
  isR2Configured,
  uploadToR2,
};
