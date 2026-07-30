# Project Rules - BoxCraft Website

1. **Cloudflare R2 Primary Storage Rule**:
   - All uploaded files (images, videos, documents) and catalog database updates MUST be stored and persisted directly in Cloudflare R2 Object Storage (`raviboxwebsiteimage` bucket).
   - NEVER rely on browser `localStorage` or local ephemeral disk as the primary storage mechanism for catalog products or media uploads.
   - Browser `localStorage` may only be used as a read-only offline fallback cache when API is unreachable.
