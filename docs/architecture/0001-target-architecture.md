# ADR 0001: App Router and layered server boundaries

Status: accepted (2026-09-19)

The application uses the Next.js App Router. Public pages are server components by default; only the editor, login, upload, deletion, comments, and image fallback behavior are client components. Route handlers are reserved for authenticated mutations.

Domain rules live under `src/domain`, MongoDB access under `src/data`, authentication under `src/auth`, and presentation under `src/app` and `src/components`. Database documents are converted to explicit UI models. MongoDB connections are cached for serverless reuse and automatic index creation is disabled.

Public database reads are dynamic and bounded. Legacy documents without a `status` field remain public for link compatibility. New documents default to `draft`; only `published` and the explicitly recognized legacy shape are publicly queryable.
