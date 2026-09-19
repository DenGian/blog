# ADR 0003: Legacy HTML with restrictive server sanitization

Status: accepted (2026-09-19)

The fifteen articles remain HTML to avoid a lossy automatic rewrite. All HTML is treated as untrusted and sanitized on server reads and writes using a small formatting allowlist. Scripts, event handlers, forms, iframes, styles, protocol-relative URLs, and unsafe schemes are removed. TipTap edits the same HTML representation.

Migration to schema version 2 is deterministic and defaults to dry-run. It adds publication state and sanitized content without changing stable identifiers, slugs, dates, tags, excerpts, or cover URLs. The export is a mandatory prerequisite for writes.
