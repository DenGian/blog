#!/usr/bin/env node

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { sha256 } from "./migration-core.mjs";
import path from "node:path";
import process from "node:process";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DATABASE ?? "blog_portfolio";

if (!uri) {
  console.error("Export failed: MONGODB_URI is not configured.");
  process.exitCode = 1;
} else {
  const client = new MongoClient(uri, {
    appName: "internship-journal-read-only-export",
    readPreference: "primary",
  });

  try {
    await client.connect();

    const posts = await client
      .db(databaseName)
      .collection("posts")
      .find(
        {},
        {
          readConcern: { level: "majority" },
          projection: {
            _id: 1,
            title: 1,
            slug: 1,
            content: 1,
            excerpt: 1,
            coverImage: 1,
            date: 1,
            tags: 1,
            author: 1,
            readingTime: 1,
            status: 1,
            publishedAt: 1,
            createdAt: 1,
            updatedAt: 1,
            seoTitle: 1,
            seoDescription: 1,
            schemaVersion: 1,
          },
        },
      )
      .sort({ date: 1, _id: 1 })
      .toArray();

    const exportedAt = new Date();
    const timestamp = exportedAt
      .toISOString()
      .replaceAll(":", "-")
      .replace(".", "-");
    const outputDirectory = path.resolve(process.cwd(), ".local-backups");
    const outputPath = path.join(outputDirectory, `posts-${timestamp}.json`);
    const payload = {
      metadata: {
        exportedAt: exportedAt.toISOString(),
        database: databaseName,
        collection: "posts",
        count: posts.length,
        mode: "read-only-primary-majority",
        identities: posts.map((post) => ({
          id: post._id.toString(),
          slug: post.slug,
        })),
      },
      posts,
    };

    await mkdir(outputDirectory, { recursive: true, mode: 0o700 });
    const content = `${JSON.stringify(payload, null, 2)}\n`;
    const temporary = `${outputPath}.tmp`;
    await writeFile(temporary, content, {
      encoding: "utf8",
      mode: 0o600,
      flag: "wx",
    });

    const valid = JSON.parse(await readFile(temporary, "utf8"));
    if (
      !Array.isArray(valid.posts) ||
      valid.posts.length !== posts.length ||
      new Set(valid.posts.map((post) => String(post._id))).size !==
        posts.length ||
      new Set(valid.posts.map((post) => post.slug)).size !== posts.length
    ) {
      throw new Error("Backup verification failed");
    }
    await rename(temporary, outputPath);
    const checksum = `${sha256(content)}  ${path.basename(outputPath)}\n`;
    const checksumPath = `${outputPath}.sha256`,
      checksumTemporary = `${checksumPath}.tmp`;
    await writeFile(checksumTemporary, checksum, {
      encoding: "utf8",
      mode: 0o600,
      flag: "wx",
    });
    await rename(checksumTemporary, checksumPath);

    console.log(
      `Read-only export complete: ${posts.length} posts written to ${path.relative(process.cwd(), outputPath)}`,
    );
  } catch {
    console.error(
      "Export failed. Check the server-only MongoDB configuration and network access; connection details were suppressed.",
    );
    process.exitCode = 1;
  } finally {
    await client.close().catch(() => undefined);
  }
}
