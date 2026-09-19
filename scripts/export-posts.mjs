#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
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
    readPreference: "secondaryPreferred",
  });

  try {
    await client.connect();

    const posts = await client
      .db(databaseName)
      .collection("posts")
      .find(
        {},
        {
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
        mode: "read-only",
      },
      posts,
    };

    await mkdir(outputDirectory, { recursive: true, mode: 0o700 });
    await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, {
      encoding: "utf8",
      mode: 0o600,
      flag: "wx",
    });

    const valid = JSON.parse(
      await import("node:fs/promises").then(({ readFile }) =>
        readFile(outputPath, "utf8"),
      ),
    );
    if (!Array.isArray(valid.posts) || valid.posts.length !== posts.length) {
      throw new Error("Backup verification failed");
    }

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
