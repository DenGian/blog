# ADR 0003: Legacy HTML with restrictive server sanitization

Status: accepted (2026-09-19)

The fifteen articles remain HTML to avoid a lossy automatic rewrite. All HTML is treated as untrusted and sanitized on server reads and writes using a small formatting allowlist. Scripts, event handlers, forms, iframes, styles, protocol-relative URLs, and unsafe schemes are removed. TipTap edits the same HTML representation.

Migration to schema version 2 is deterministic and defaults to dry-run. It adds publication state, sanitized content, and the local legacy-cover path without changing stable identifiers, slugs, dates, tags, or excerpts. Apply requires a primary/majority export whose SHA-256 sidecar, metadata, required content/dates, unique IDs/slugs, and target identities verify before writes.
