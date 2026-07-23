// BoxCraft Configuration
const API_BASE_URL = "http://localhost:5000/api";
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

// Check if direct Supabase is configured
function isSupabaseConfigured() {
  return SUPABASE_URL && 
         SUPABASE_ANON_KEY && 
         SUPABASE_URL !== "YOUR_SUPABASE_URL" && 
         SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";
}

// Upload file to backend (Cloudflare R2 storage)
async function uploadFileToBackend(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload image to backend.');
  }

  return await response.json();
}
