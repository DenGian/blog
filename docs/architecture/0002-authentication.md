# ADR 0002: Single-admin encrypted cookie session

Status: accepted (2026-09-19)

The CMS has no registration or roles. A bcrypt hash in `ADMIN_PASSWORD_HASH` is verified only on the server. Iron Session stores an encrypted, authenticated session in an `HttpOnly`, `SameSite=Strict` cookie that becomes `Secure` in production and expires after eight hours.

Protected server layouts guard pages; every write handler independently checks the session and request origin. Login uses a local bounded fallback in development. Production login fails closed until Upstash Redis REST credentials provide durable cross-instance throttling. Logout destroys the cookie. The legacy public password and `localStorage` flag are removed entirely.
