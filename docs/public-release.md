# Manual public-release checklist

This is a preparation checklist. Do not change repository visibility until the production database connection, admin login, and secret rotation have been verified.

## Production first

1. In the existing Vercel project, check the Production scope of `MONGODB_URI`, `MONGODB_DATABASE=blog_portfolio`, and `SITE_URL=https://holoncom-blog.vercel.app`. Inspect the deployment runtime log for the variable name or database connection category; never paste a URI into an issue or log.
2. If the URI is present but connection fails, check that the Atlas user can read `blog_portfolio.posts`, its credential has not expired, and Atlas network access admits the Vercel deployment. Use a least-privilege user. The local read-only export found all 15 legacy posts; a migration is not the connectivity fix.
3. Replace the old exposed admin password with a new password and set its bcrypt `ADMIN_PASSWORD_HASH`. Configure a distinct `SESSION_SECRET` and both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for production login.
4. Set optional Cloudinary credentials together only if uploads are needed. Check the public GitHub and LinkedIn URLs before setting `NEXT_PUBLIC_GITHUB_URL` and `NEXT_PUBLIC_LINKEDIN_URL`.
5. Redeploy after editing Vercel variables. Verify all 15 article URLs, sitemap entries, Atom entries, canonical URLs, covers, admin login and logout, then review runtime logs again.
6. Give Preview a separate database or a read-only production-data user. Preview must have no production CMS mutation access and must use a different session secret.

See [deployment-runbook.md](deployment-runbook.md) for the complete variable table and migration process.

## GitHub metadata after review

- Description: `Production-ready Next.js internship journal with a secure CMS, MongoDB content, automated testing and documented migration tooling.`
- Homepage: `https://holoncom-blog.vercel.app/`
- Topics: `nextjs`, `typescript`, `react`, `mongodb`, `cms`, `blog`, `portfolio`, `vercel`, `playwright`, `vitest`, `accessibility`, `software-engineering`.
- Keep Issues enabled for focused bug reports. Keep Discussions disabled until there is an active moderation plan; Giscus needs a public repository and Discussions, and should be enabled only by a separate manual decision.
- Protect `main` with pull requests and the Quality status check after public visibility. Do not allow force pushes or deletions.
- Review the full history and any old deployment bundles before changing visibility. The previous browser-side admin password must be rotated. If a real credential is ever found in Git history, rotate it and plan history cleanup before publication.

Only the owner should change GitHub metadata, branch protection, repository visibility, or Vercel/Atlas settings. The code branch can be pushed for review after the local release commit, but pushing, merging and deploying are separate manual actions.
