#!/usr/bin/env node
import { access, readFile } from "node:fs/promises";
import process from "node:process";
import { MongoClient } from "mongodb";
import sanitizeHtml from "sanitize-html";

const apply = process.argv.includes("--apply");
const createIndexes = process.argv.includes("--apply-indexes");
const backupIndex = process.argv.indexOf("--backup");
const backupPath = backupIndex >= 0 ? process.argv[backupIndex + 1] : undefined;
if ((apply || createIndexes) && !backupPath) {
  console.error(
    "Refusing to write: pass --backup <verified-export.json> after running npm run content:export.",
  );
  process.exit(1);
}
if (backupPath) {
  try {
    await access(backupPath);
    const backup = JSON.parse(await readFile(backupPath, "utf8"));
    if (!Array.isArray(backup.posts) || backup.metadata?.mode !== "read-only")
      throw new Error();
  } catch {
    console.error("Refusing to continue: backup is missing or invalid.");
    process.exit(1);
  }
}
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Migration failed: MONGODB_URI is not configured.");
  process.exit(1);
}
const client = new MongoClient(uri, {
  appName: "internship-journal-migration",
  readPreference: apply || createIndexes ? "primary" : "secondaryPreferred",
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
  const operations = [];
  const report = [];
  for (const post of posts) {
    const status = post.status === "draft" ? "draft" : "published";
    const content = clean(String(post.content ?? ""));
    const valid =
      typeof post.title === "string" &&
      typeof post.slug === "string" &&
      content.replace(/<[^>]+>/g, "").trim().length > 0 &&
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
    };
    const changed =
      post.schemaVersion !== 2 ||
      post.status !== status ||
      post.content !== content ||
      (status === "published" && !post.publishedAt);
    report.push({
      id: post._id.toString(),
      slug: post.slug,
      changed,
      contentSanitized: post.content !== content,
    });
    if (changed)
      operations.push({
        updateOne: {
          filter: {
            _id: post._id,
            $or: [
              { schemaVersion: { $ne: 2 } },
              { status: { $exists: false } },
            ],
          },
          update: { $set: changes },
        },
      });
  }
  console.log(
    JSON.stringify(
      {
        mode: apply ? "APPLY" : "DRY_RUN",
        posts: posts.length,
        proposedUpdates: operations.length,
        report,
      },
      null,
      2,
    ),
  );
  if (apply && operations.length) {
    const result = await collection.bulkWrite(operations, { ordered: true });
    console.log(`Applied ${result.modifiedCount} idempotent post updates.`);
  }
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
