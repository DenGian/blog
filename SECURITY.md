# Security policy

## Reporting

Do not open a public issue for a suspected vulnerability. Contact the repository owner through the verified LinkedIn profile linked by the application and include reproduction steps without real credentials or production data.

## Supported version

Only the current default branch is supported. This portfolio project has not received a third-party security audit or penetration test.

## Operational expectations

- Keep database, session, password-hash, and rate-limit values server-only.
- Use a least-privilege MongoDB user and a separate isolated database for tests.
- Rotate the legacy admin credential, MongoDB application credential, old EmailJS values, and any stale deployment secrets before relaunch.
- Configure durable rate limiting before enabling production admin login.
- Treat Vercel's overwritten forwarding headers as the only configured client-IP trust boundary; self-hosted requests use a conservative shared bucket unless an equivalent trusted proxy boundary is implemented.
- Review the dry-run and verified backup before executing a migration.
- Apply dependency and framework security updates promptly, then rerun all quality gates.

The old `NEXT_PUBLIC_ADMIN_PASSWORD` design exposed its value to browser bundles. That credential must never be reused.
