# ADR 0005: Incremental legacy migration

Status: accepted (2026-09-19)

The Pages Router implementation is replaced after a verified read-only export. URLs `/`, `/blog`, `/blog/[slug]`, `/about`, `/contact`, and `/admin` are retained. Legacy posts without status are treated as published until the manual migration runs.

`npm run content:migrate` is always a dry-run. Writes require both `--apply` and a valid `--backup` path. Index creation additionally requires `--apply-indexes`; application startup never creates indexes. Production execution remains a manual maintenance-window procedure with restore guidance in the deployment runbook.
