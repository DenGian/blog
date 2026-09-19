# Software Engineering Internship Journal

A Dutch public internship journal and a protected single-admin CMS. Fifteen original weekly articles document Ian Mondelaers’ workplace learning at HolonCom; the application around them is a production-minded Next.js portfolio project.

The articles are intentionally kept in Dutch and are not rewritten by the platform.

## What is implemented

- App Router with server components by default and bounded dynamic MongoDB reads
- Dutch article index, safe search, tag filters, pagination, reading time, adjacent navigation, print styles, and resilient cover images
- Encrypted server-side admin session, bcrypt password verification, origin checks, and authorization on every mutation
- Draft, preview, publish, unpublish, edit, collision-safe slug, and explicit delete workflows
- Shared Zod validation and restrictive server-side rich HTML sanitization
- TipTap 3 editor with unsaved-change protection
- Cloudinary-ready media field with HTTPS URL fallback
- Canonical metadata, Open Graph article data, JSON-LD, sitemap, robots rules, and Atom feed
- Security headers, CSP, strict TypeScript, ESLint, Prettier, Vitest, Playwright specifications, and CI
- Read-only content export plus opt-in, dry-run-first migration tooling

## Architecture

The project uses Next.js 16, React 19, TypeScript 6, MongoDB/Mongoose, TipTap, Zod, sanitize-html, iron-session, and bcryptjs.

```text
src/app          routes, server-rendered pages, mutation handlers
src/auth         sessions, authorization, origin and rate-limit controls
src/data         bounded database queries and document-to-view mapping
src/domain       validation, sanitization, slugging, search and reading time
src/components   public and admin presentation
src/media        upload-provider boundary
scripts          export, credential hashing and manual migration
```

Important decisions are recorded in [`docs/architecture`](docs/architecture). Automatic Mongoose index creation is disabled. Legacy posts with no status remain public until the manual migration adds explicit publication state; all new posts default to draft.

## Security model

The browser never receives or compares the admin credential. `ADMIN_PASSWORD_HASH` and `SESSION_SECRET` are server-only. Iron Session issues an encrypted `HttpOnly`, `SameSite=Strict` cookie with an eight-hour lifetime; production cookies are `Secure`. Protected layouts guard pages, while every create, update, publish, unpublish, and delete route independently checks the session and request origin.

Production admin login is disabled until durable Upstash rate limiting is configured. The in-memory development fallback is intentionally not described as production-safe. Rich HTML is sanitized on both read and write. Search terms are escaped and capped; page sizes, identifiers, tags, fields, and request bodies are constrained.

The former `NEXT_PUBLIC_ADMIN_PASSWORD` must be treated as compromised if any legacy build was deployed. Never reuse it.

## Local setup

Requirements: Node.js 22 and access to a MongoDB database. Never point tests or E2E mutation runs at the existing production database.

```bash
nvm use
npm ci
cp .env.example .env.local
npm run auth:hash
npm run dev
```

`npm run auth:hash` reads a password from standard input and emits only its bcrypt hash. A shell can pass hidden input with `read -s` and a pipe. Generate `SESSION_SECRET` with a cryptographically secure generator and store it only in `.env.local` or the deployment secret manager.

### Environment variables

| Name                             | Scope  | Required       | Purpose                                                   |
| -------------------------------- | ------ | -------------- | --------------------------------------------------------- |
| `MONGODB_URI`                    | server | yes            | Least-privilege MongoDB connection string                 |
| `MONGODB_DATABASE`               | server | recommended    | Database name; defaults to `blog_portfolio`               |
| `SITE_URL`                       | server | production     | Canonical HTTPS origin; never set production to localhost |
| `ADMIN_PASSWORD_HASH`            | server | for CMS        | bcrypt hash for the sole administrator                    |
| `SESSION_SECRET`                 | server | for CMS        | At least 32 random characters for session encryption      |
| `UPSTASH_REDIS_REST_URL`         | server | production CMS | Durable login throttling endpoint                         |
| `UPSTASH_REDIS_REST_TOKEN`       | server | production CMS | Durable login throttling token                            |
| `CLOUDINARY_CLOUD_NAME`          | server | optional       | Cloudinary account name                                   |
| `CLOUDINARY_API_KEY`             | server | optional       | Signed upload API identifier                              |
| `CLOUDINARY_API_SECRET`          | server | optional       | Signed upload secret                                      |
| `NEXT_PUBLIC_GISCUS_REPO`        | public | optional       | Public `owner/repository` name                            |
| `NEXT_PUBLIC_GISCUS_REPO_ID`     | public | optional       | Giscus repository identifier                              |
| `NEXT_PUBLIC_GISCUS_CATEGORY`    | public | optional       | Discussions category                                      |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | public | optional       | Giscus category identifier                                |
| `NEXT_PUBLIC_GITHUB_URL`         | public | optional       | Verified author GitHub profile                            |
| `NEXT_PUBLIC_LINKEDIN_URL`       | public | optional       | Verified author LinkedIn profile                          |

Only values explicitly prefixed `NEXT_PUBLIC_` enter the browser bundle. Password hashes, session keys, database credentials, and rate-limit tokens must never use that prefix.

## Content safety and migration

Create a local, ignored, read-only export before any migration:

```bash
npm run content:export
npm run content:migrate
```

The second command is always a dry run. It reports proposed changes without writing. A future manual apply requires both an explicit flag and a verified backup:

```bash
npm run content:migrate -- --apply --backup .local-backups/posts-<timestamp>.json
```

Index creation remains a separate explicit operation with `--apply-indexes`. Do not run either apply command against the existing database until the owner has reviewed the dry-run report and scheduled a maintenance window. See [`docs/deployment-runbook.md`](docs/deployment-runbook.md).

## Quality commands

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

`npm run test:e2e` starts the local application. Its content-mutation scenario is skipped unless `E2E_ALLOW_MUTATION=1`, an isolated database, and a test-only admin password are deliberately provided.

## Optional integrations

Cloudinary and Giscus are disabled gracefully when not configured. Giscus needs a public repository, GitHub Discussions, the Giscus app, and the four public identifiers; this repository is currently private, so comments should remain disabled until that later manual setup. EmailJS was removed: a static contact page with verified GitHub and LinkedIn links is more credible than an unmonitored browser-side mail form.

The complete internship PDF was not present during the overhaul. Add the real document at `public/internship-journal.pdf` and then expose the download link; no fabricated placeholder is shipped.

## Deployment

The repository is prepared for Vercel but has not been deployed. Atlas network rules, a least-privilege application user, Upstash, Cloudinary, Giscus, production secrets, migration approval, and smoke tests all require manual setup. Follow the deployment runbook before making the repository public.

## Limitations and next steps

- Durable rate limiting, media uploads, and comments require external configuration.
- Existing third-party cover URLs can disappear; migrate owned/licensed images to the chosen media provider over time.
- The migration and index plan has only been dry-run against the existing database.
- Playwright mutation coverage requires an isolated test database and explicit opt-in.
- No analytics or contact-data collection is included.

## License and portfolio context

The application source code is available under the MIT License. Written internship articles, personal photographs, and other original personal media remain © Ian Mondelaers and are not licensed under MIT. See [`LICENSE.md`](LICENSE.md) for the exact boundary.
