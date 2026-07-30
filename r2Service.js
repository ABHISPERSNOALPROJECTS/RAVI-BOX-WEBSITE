const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const crypto = require('crypto');

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '4af13c7c5d106d4bbdf178019f246d21';
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || 'ab7fafb3689ac5b84664a6c70f55e834';
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '844c29bf34aaade500f4b3dfd9ededcb5966cfe5de844adbf826c75ddf1a4911';
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'raviboxwebsiteimage';
const publicUrlBase = process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-1e1b991b4067404595e4ab8a8c7f7b68.r2.dev';

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
    throw new Error("Cloudflare R2 storage is not configured.");
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

/**
 * Saves JSON object to Cloudflare R2
 */
async function saveJsonToR2(key, jsonData) {
  if (!isR2Configured() || !r2Client) return false;
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(jsonData, null, 2),
      ContentType: 'application/json',
    });
    await r2Client.send(command);
    return true;
  } catch (e) {
    console.warn(`Failed to save ${key} to Cloudflare R2:`, e.message);
    return false;
  }
}

/**
 * Reads JSON object from Cloudflare R2
 */
async function getJsonFromR2(key) {
  if (!isR2Configured()) return null;
  if (r2Client) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      const response = await r2Client.send(command);
      const streamToString = (stream) =>
        new Promise((resolve, reject) => {
          const chunks = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("error", reject);
          stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        });
      const str = await streamToString(response.Body);
      return JSON.parse(str);
    } catch (e) {
      console.warn(`R2 SDK GetObject for ${key} notice:`, e.message);
    }
  }

  // Public URL HTTP Fallback
  if (publicUrlBase) {
    try {
      const fetchUrl = `${publicUrlBase.replace(/\/$/, '')}/${key}`;
      const res = await fetch(fetchUrl);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {}
  }
  return null;
}

module.exports = {
  r2Client,
  isR2Configured,
  uploadToR2,
  saveJsonToR2,
  getJsonFromR2,
};
