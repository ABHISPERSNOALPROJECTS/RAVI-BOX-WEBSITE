// BoxCraft Configuration
const API_BASE_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? "http://localhost:5000/api"
  : "/api";

const WHATSAPP_NUMBER = "919978822762";
const PHONE_DISPLAY = "+91 99788 22762";

/**
 * Validate phone number (Reject fake / invalid numbers)
 * Must be a valid 10-digit Indian mobile number (starts with 6-9)
 */
function validatePhoneNumber(phone) {
  if (!phone) return false;
  var clean = String(phone).replace(/[\s\-\+\(\)]/g, "");
  if (clean.length === 12 && clean.startsWith("91")) {
    clean = clean.substring(2);
  } else if (clean.length === 11 && clean.startsWith("0")) {
    clean = clean.substring(1);
  }
  
  if (!/^[6-9]\d{9}$/.test(clean)) {
    return false;
  }
  if (/^(\d)\1{9}$/.test(clean)) return false;
  if (clean === "1234567890" || clean === "0123456789" || clean === "9876543210") return false;

  return clean;
}

// Upload file to backend (Cloudflare R2 storage / Local fallback)
async function uploadFileToBackend(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload file to backend.');
  }

  return await response.json();
}
