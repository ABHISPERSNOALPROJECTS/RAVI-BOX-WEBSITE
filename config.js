// BoxCraft Configuration
const API_BASE_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? "http://localhost:5000/api"
  : "/api";

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
