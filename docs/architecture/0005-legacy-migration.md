# ADR 0005: Incremental legacy migration

Status: accepted (2026-09-19)

The Pages Router implementation is replaced after a verified read-only export. URLs `/`, `/blog`, `/blog/[slug]`, `/about`, `/contact`, and `/admin` are retained. Legacy posts without status are treated as published until the manual migration runs.

`npm run content:migrate` and `npm run content:indexes` are dry runs. Their separate apply commands require a checksum-verified export path and report `MIGRATION_APPLY` or `INDEX_APPLY`; contradictory modes fail. Application startup never creates indexes. The self-generated checksum detects later file changes but is not independent evidence of off-site backup safety. Production execution remains a manual maintenance-window procedure.
