# Deployment and migration runbook

No external setup or deployment was performed as part of the local overhaul.

## 1. Rotate credentials

Before relaunch, rotate the old admin credential, MongoDB application credential, any EmailJS identifiers or keys retained in an old Vercel project, and every stale deployment secret. Do not reuse the password previously stored as `NEXT_PUBLIC_ADMIN_PASSWORD`. Remove that variable from all environments.

## 2. MongoDB Atlas

1. Create a dedicated application user with read/write access only to the journal database; do not use an Atlas owner or broad cluster-admin credential.
2. Use a separate database/user for preview and automated tests.
3. Restrict network access according to the Vercel/Atlas integration guidance. Avoid `0.0.0.0/0` where an integration or controlled egress option is available.
4. Set `MONGODB_URI` and `MONGODB_DATABASE` only in Vercel’s encrypted server environment. Preview and Production variables are separate: a Production-only `MONGODB_URI` is unavailable to pull-request Preview deployments, so configure isolated Preview credentials if Preview database-backed pages or CMS testing must work.
5. Do not run migration or index commands from an automatic build hook.

## 3. Review and migrate manually

1. Run `npm run content:export`; retain both the JSON and matching `.sha256` sidecar. The sidecar proves only that the local JSON has not changed since this command generated both files; it is not independent evidence of a safe external backup.
2. Verify the reported count and identities, store the ignored pair securely, and test restoration to an isolated database.
3. Run `npm run content:migrate` and review the `MIGRATION_DRY_RUN` report, including schema, sanitizer, publication, and local-cover changes. Do not rely on an old hard-coded change count.
4. Schedule a maintenance window.
5. Only after approval, run `npm run content:migrate:apply -- --backup <verified-file>`.
6. Verify all 15 slugs, dates, tags, covers, and article bodies.
7. Review `npm run content:indexes`, then separately run `npm run content:indexes:apply -- --backup <verified-file>` after checking duplicate slugs. Reports must say `INDEX_DRY_RUN` and `INDEX_APPLY` respectively.

If an apply fails, stop writes, retain logs that contain no credentials, restore the `posts` collection from the verified export into an isolated database first, verify it, and then follow the organization’s Atlas restore procedure. The script does not perform an automatic rollback.

## 4. Admin and rate limiting

1. Generate a new unique admin password and pipe it into `npm run auth:hash`.
2. Generate a random `SESSION_SECRET` of at least 32 characters.
3. Create an Upstash Redis database and configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` as server-only values.
4. Confirm repeated failed login attempts return `429`, while a rate-limit outage fails closed.
5. Confirm cookies are `HttpOnly`, `Secure`, `SameSite=Strict`, path `/`, and expire after eight hours.

## 5. Cloudinary

1. Create a Cloudinary API credential dedicated to this application and restrict the account/policy where supported.
2. Configure the cloud name, API key, and API secret as server-only variables. The API secret must never use a `NEXT_PUBLIC_` prefix.
3. Keep the application limit at JPEG, PNG, WebP, or AVIF and 5 MB; configure matching provider-side limits and appropriate transformations.
4. Test upload failure, invalid type, oversized file, successful cover rendering, and shared-asset behavior.
5. Do not enable automatic deletion; the current system deliberately avoids deleting possibly shared assets.

## 6. Giscus

1. Make the chosen repository public only after the complete repository review.
2. Enable GitHub Discussions and install/authorize the Giscus app for that repository.
3. Create or select an announcements/general category.
4. Obtain and set the four public Giscus identifiers.
5. Confirm comments are scoped by pathname and degrade to no section when configuration is absent.

## 7. Vercel checklist

1. Import the repository without changing its name or settings automatically.
2. Select Node.js 22 and the Next.js framework preset.
3. Enable Vercel’s automatic system environment variables so `VERCEL_ENV`, `VERCEL_URL`, and `VERCEL_PROJECT_PRODUCTION_URL` are present at build and runtime.
4. Set all required variables for Production; use isolated credentials for Preview. Never share the production database/user with Preview.
5. Set `SITE_URL` in Production to the final canonical HTTPS origin. Preview deliberately uses its deployment-specific HTTPS `VERCEL_URL`; Production falls back to `VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL`, if `SITE_URL` is absent. Local development defaults to `http://localhost:3000`. Never deploy Production with HTTP, localhost, `127.0.0.1`, `example.invalid`, credentials, a path, a query, or a fragment.
6. Keep server-only variables out of the `NEXT_PUBLIC_` namespace.
7. Run `npm run check` locally and in CI before deployment.
8. Deploy a preview, inspect response headers/CSP, and test without optional variables first.
9. Add the custom domain, verify DNS and HTTPS, update `SITE_URL`, and redeploy.
10. Do not enable production CMS login until durable rate limiting is verified.

### Exact Vercel environment-variable checklist

| Variable                         | Environments           | Requirement                                                                 | Safe setup                                                                                                                                  |
| -------------------------------- | ---------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`                    | Preview and Production | Required for database-backed routes                                         | Create separate least-privilege Atlas users/databases per environment; paste into Vercel as a sensitive server-only value.                  |
| `MONGODB_DATABASE`               | Preview and Production | Required operationally (code default exists)                                | Use distinct non-production and production database names; enter the name only.                                                             |
| `SITE_URL`                       | Production             | Recommended; optional when the production Vercel system URL is suitable     | Enter the verified canonical HTTPS origin, with no credentials, path, query, or fragment. Do not set it to a Preview URL.                   |
| `ADMIN_PASSWORD_HASH`            | Preview and Production | Optional; required to enable CMS login                                      | Generate from a unique password with `npm run auth:hash`; store only the resulting bcrypt hash. Never restore `NEXT_PUBLIC_ADMIN_PASSWORD`. |
| `SESSION_SECRET`                 | Preview and Production | Optional; required with `ADMIN_PASSWORD_HASH`                               | Generate at least 32 random bytes with a cryptographically secure password/secret generator; use a distinct value per environment.          |
| `UPSTASH_REDIS_REST_URL`         | Preview and Production | Optional generally; required to enable CMS login on each Vercel environment | Create separate durable rate-limit stores where practical and copy the provider HTTPS REST endpoint as server-only.                         |
| `UPSTASH_REDIS_REST_TOKEN`       | Preview and Production | Optional generally; required with the Upstash URL                           | Generate/use the matching restricted provider token and store it as sensitive server-only data.                                             |
| `CLOUDINARY_CLOUD_NAME`          | Preview and Production | Optional; all three Cloudinary values are required together                 | Use a dedicated/restricted Cloudinary account or environment and enter its cloud name.                                                      |
| `CLOUDINARY_API_KEY`             | Preview and Production | Optional; required with Cloudinary                                          | Create a dedicated restricted API credential and store the identifier server-side.                                                          |
| `CLOUDINARY_API_SECRET`          | Preview and Production | Optional; required with Cloudinary                                          | Store the matching secret as sensitive server-only data; never prefix it `NEXT_PUBLIC_`.                                                    |
| `NEXT_PUBLIC_GISCUS_REPO`        | Preview and Production | Optional; all four Giscus values are required together                      | Copy the public `owner/repository` identifier from Giscus setup.                                                                            |
| `NEXT_PUBLIC_GISCUS_REPO_ID`     | Preview and Production | Optional; required with Giscus                                              | Copy the public repository ID produced by Giscus setup.                                                                                     |
| `NEXT_PUBLIC_GISCUS_CATEGORY`    | Preview and Production | Optional; required with Giscus                                              | Enter the chosen public Discussions category name.                                                                                          |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | Preview and Production | Optional; required with Giscus                                              | Copy the public category ID produced by Giscus setup.                                                                                       |
| `NEXT_PUBLIC_GITHUB_URL`         | Preview and Production | Optional                                                                    | Enter the verified public HTTPS profile URL.                                                                                                |
| `NEXT_PUBLIC_LINKEDIN_URL`       | Preview and Production | Optional                                                                    | Enter the verified public HTTPS profile URL.                                                                                                |

Do not manually create `VERCEL_ENV`, `VERCEL_URL`, or `VERCEL_PROJECT_PRODUCTION_URL`; enable automatic exposure of Vercel system variables. Remove legacy `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_ADMIN_PASSWORD` from every environment. The latter exposed the old administrator password to browsers and must never be restored.

## 8. Verification status and commands

Code-level readiness requires `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`, and `npm audit`. Local E2E owns a temporary loopback `mongod`; CI supplies a loopback server through the dedicated `E2E_MONGODB_URI`, while the runner owns only its unique disposable database. Both modes seed deterministic fixtures and verify database removal.

Passing these checks is not evidence of deployment, penetration testing, an external audit, or production operation. Atlas connectivity, Vercel secrets/origin, Upstash durability, Cloudinary policy, Giscus repository settings, credential rotation, preview smoke tests, and production smoke tests remain manual external work.

## 9. Post-deployment smoke tests

- Homepage, article index, bounded search, tags, pagination, all 15 stable slugs, covers/fallbacks, previous/next links, print preview, sitemap, robots, and feed
- Canonical/Open Graph origin contains no localhost value
- Draft URL returns 404 publicly and opens only through protected preview
- Failed and successful login, expired session, direct protected-route access, logout, origin rejection, create/edit/draft/publish/unpublish/delete confirmation
- Missing Cloudinary and Giscus configuration does not crash public pages
- Mobile navigation, keyboard focus, editor toolbar, form errors, and reduced-motion behavior

## 10. Rollback

1. Use Vercel’s previous known-good deployment for application rollback.
2. Do not roll back code while leaving a partially applied schema change unexplained; the new reader supports both legacy and schema-version-2 documents, so investigate first.
3. For data rollback, use the verified pre-migration export and the approved Atlas restoration process. Never run an improvised overwrite against production.
4. Rotate any credential suspected of exposure and invalidate active sessions by rotating `SESSION_SECRET`.

## 11. Related PDF repository

After this application is public and the real PDF is available here, archive the separate PDF-only repository with a concise redirect to the live journal. If it has no inbound links or independent value, making it private is preferable. Do not modify that repository before confirming links and ownership.
