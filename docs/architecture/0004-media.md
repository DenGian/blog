# ADR 0004: Cloudinary for production media

Status: accepted (2026-09-19)

Existing local and HTTPS cover images remain supported. New production uploads pass through an authenticated same-origin route and use server-only Cloudinary signing because Vercel storage is ephemeral. Both client and server enforce JPEG, PNG, WebP, or AVIF and a 5 MB limit; the server also checks file signatures before forwarding bytes.

When Cloudinary is absent the public site remains functional and the CMS explains that URL entry is the fallback. This project does not automatically delete remote assets: an image may be shared by multiple articles, so provider deletion requires a future reference-aware asset registry.
