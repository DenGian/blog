#!/usr/bin/env node
import process from "node:process";
import { MongoClient } from "mongodb";
import sanitizeHtml from "sanitize-html";
import { parseMigrationArgs, readVerifiedBackup } from "./migration-core.mjs";
import { legacyCovers } from "./legacy-covers.mjs";

let options;
try {
  options = parseMigrationArgs(process.argv.slice(2));
} catch (error) {
  console.error(`Refusing to continue: ${error.message}`);
  process.exit(1);
}
const apply = options.mode === "MIGRATION_APPLY";
const createIndexes = options.mode === "INDEX_APPLY";
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Migration failed: MONGODB_URI is not configured.");
  process.exit(1);
}
const client = new MongoClient(uri, {
  appName: "internship-journal-migration",
  readPreference: apply || createIndexes ? "primary" : "primaryPreferred",
});
const clean = (html) =>
  sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "s",
      "blockquote",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "pre",
      "code",
      "a",
      "img",
      "hr",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      code: ["class"],
    },
    allowedClasses: { code: [/^language-[a-z0-9-]+$/] },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    enforceHtmlBoundary: true,
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: "a",
        attribs: {
          ...attributes,
          rel: "noopener noreferrer",
          ...(attributes.target === "_blank" ? { target: "_blank" } : {}),
        },
      }),
      img: (_tagName, attributes) => ({
        tagName: "img",
        attribs: {
          ...attributes,
          loading: "lazy",
          alt: attributes.alt ?? "",
        },
      }),
    },
  });
try {
  await client.connect();
  const collection = client
    .db(process.env.MONGODB_DATABASE ?? "blog_portfolio")
    .collection("posts");
  const posts = await collection.find({}).sort({ date: 1, _id: 1 }).toArray();
  if (options.backupPath)
    await readVerifiedBackup(options.backupPath, {
      database: process.env.MONGODB_DATABASE ?? "blog_portfolio",
      collection: "posts",
      targetPosts: posts,
    });
  const operations = [];
  const report = [];
  for (const post of posts) {
    const status = post.status === "draft" ? "draft" : "published";
    const content = clean(String(post.content ?? ""));
    const valid =
      typeof post.title === "string" &&
      typeof post.slug === "string" &&
      sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} }).trim()
        .length > 0 &&
      Array.isArray(post.tags);
    if (!valid) throw new Error("validation");
    const changes = {
      status,
      publishedAt:
        status === "published"
          ? (post.publishedAt ?? post.date ?? post.createdAt)
          : null,
      content,
      schemaVersion: 2,
      ...(legacyCovers[post.slug]
        ? { coverImage: legacyCovers[post.slug] }
        : {}),
    };
    const changed =
      post.schemaVersion !== 2 ||
      post.status !== status ||
      post.content !== content ||
      (status === "published" && !post.publishedAt);
    const coverChanged = Boolean(
      legacyCovers[post.slug] && post.coverImage !== legacyCovers[post.slug],
    );
    report.push({
      id: post._id.toString(),
      slug: post.slug,
      changed: changed || coverChanged,
      contentSanitized: post.content !== content,
    });
    if (changed || coverChanged)
      operations.push({
        updateOne: {
          filter: {
            _id: post._id,
            $or: [
              { schemaVersion: { $ne: 2 } },
              { status: { $exists: false } },
              ...(legacyCovers[post.slug]
                ? [{ coverImage: { $ne: legacyCovers[post.slug] } }]
                : []),
            ],
          },
          update: { $set: changes },
        },
      });
  }
  console.log(
    JSON.stringify(
      {
        mode: options.mode,
        posts: posts.length,
        proposedUpdates: operations.length,
        report,
      },
      null,
      2,
    ),
  );
  if (options.mode === "MIGRATION_APPLY" && operations.length) {
    const result = await collection.bulkWrite(operations, { ordered: true });
    console.log(`Applied ${result.modifiedCount} idempotent post updates.`);
  }
  if (options.mode === "INDEX_DRY_RUN")
    console.log("Index definitions validated; no indexes were written.");
  if (createIndexes) {
    await collection.createIndex(
      { slug: 1 },
      { unique: true, name: "slug_unique" },
    );
    await collection.createIndex(
      { status: 1, publishedAt: -1 },
      { name: "publication_order" },
    );
    await collection.createIndex({ tags: 1 }, { name: "tags_filter" });
    console.log(
      "Indexes created after explicit --apply-indexes authorization.",
    );
  }
} catch {
  console.error(
    "Migration failed. Details were suppressed to avoid leaking database configuration. No rollback was attempted; restore using the verified export if an apply run partially completed.",
  );
  process.exitCode = 1;
} finally {
  await client.close().catch(() => undefined);
}
