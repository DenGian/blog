# ADR 0004: Cloudinary for production media

Status: accepted (2026-09-19)

The fifteen legacy covers are original, code-native 1200×630 SVGs created specifically for this project and served locally through a typed stable-slug map. The application never downloads or republishes the former remote images. Existing local and validated HTTPS cover values remain supported for new posts only when the publisher owns the media or has an appropriate licence.

New production uploads pass through an authenticated same-origin route and use server-only Cloudinary signing because Vercel storage is ephemeral. Both client and server enforce JPEG, PNG, WebP, or AVIF and a 5 MB limit; the server also checks file signatures before forwarding bytes.

When Cloudinary is absent the public site remains functional and the CMS explains that URL entry is the fallback. This project does not automatically delete remote assets: an image may be shared by multiple articles, so provider deletion requires a future reference-aware asset registry.
