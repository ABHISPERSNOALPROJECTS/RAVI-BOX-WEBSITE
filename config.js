// BoxCraft Supabase Configuration
// To make the Admin Panel and Database live, replace these placeholders with your actual Supabase URL and Anon Key.
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

// Helper function to check if Supabase is properly configured
function isSupabaseConfigured() {
  return SUPABASE_URL && 
         SUPABASE_ANON_KEY && 
         SUPABASE_URL !== "YOUR_SUPABASE_URL" && 
         SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";
}
