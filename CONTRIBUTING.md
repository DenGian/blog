# Contributing

This is a personal portfolio and journal, but focused bug fixes and accessibility or security improvements are welcome.

1. Use Node.js 22 and run `npm ci`.
2. Copy `.env.example` to `.env.local`; never commit real values.
3. Use an isolated development or test database. Never mutate the existing content database during tests.
4. Create a focused branch and keep article wording, dates, slugs, tags, and media unchanged unless the author explicitly requests an editorial change.
5. Run `npm run check` and the isolated `npm run test:e2e` before proposing a change.
6. Respect the code/content license boundary in `LICENSE` and `CONTENT_LICENSE.md`.

Do not include exports from `.local-backups`, personal data, generated reports, deployment credentials, or screenshots that reveal private content. Security reports should follow `SECURITY.md`, not a public issue.
