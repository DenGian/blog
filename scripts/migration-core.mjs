import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

export function parseMigrationArgs(argv) {
  const known = new Set([
    "--apply",
    "--indexes",
    "--apply-indexes",
    "--backup",
  ]);
  for (const arg of argv)
    if (arg.startsWith("--") && !known.has(arg))
      throw new Error(`Unknown argument: ${arg}`);
  const backupPosition = argv.indexOf("--backup");
  argv.forEach((arg, index) => {
    if (!arg.startsWith("--") && index !== backupPosition + 1)
      throw new Error(`Unexpected argument: ${arg}`);
  });
  const apply = argv.includes("--apply"),
    indexes = argv.includes("--indexes"),
    legacyIndexApply = argv.includes("--apply-indexes");
  if (legacyIndexApply && (apply || indexes))
    throw new Error("Contradictory index apply arguments.");
  const position = backupPosition;
  if (position >= 0 && !argv[position + 1])
    throw new Error("--backup requires a path.");
  const backupPath = position >= 0 ? argv[position + 1] : undefined;
  const mode =
    legacyIndexApply || (apply && indexes)
      ? "INDEX_APPLY"
      : indexes
        ? "INDEX_DRY_RUN"
        : apply
          ? "MIGRATION_APPLY"
          : "MIGRATION_DRY_RUN";
  if (mode.endsWith("APPLY") && !backupPath)
    throw new Error("Apply modes require --backup <export.json>.");
  return { mode, backupPath };
}
export function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}
function identity(post) {
  return `${String(post._id)}:${post.slug}`;
}
export function validateBackupPayload(
  payload,
  { database, collection, targetPosts },
) {
  if (
    !payload ||
    !Array.isArray(payload.posts) ||
    payload.metadata?.mode !== "read-only-primary-majority"
  )
    throw new Error("Malformed backup.");
  if (
    payload.metadata.database !== database ||
    payload.metadata.collection !== collection
  )
    throw new Error("Backup database or collection metadata mismatch.");
  if (payload.metadata.count !== payload.posts.length)
    throw new Error("Backup count mismatch.");
  if (targetPosts.length > 0 && payload.posts.length === 0)
    throw new Error("Empty backup cannot protect a non-empty target.");
  const ids = new Set(),
    slugs = new Set();
  for (const post of payload.posts) {
    const id = String(post?._id ?? "");
    if (
      !id ||
      typeof post.slug !== "string" ||
      typeof post.title !== "string" ||
      typeof post.content !== "string" ||
      !post.content.trim() ||
      !(post.publishedAt || post.date || post.createdAt)
    )
      throw new Error("Backup contains an unsafe post record.");
    if (ids.has(id) || slugs.has(post.slug))
      throw new Error("Backup contains duplicate IDs or slugs.");
    ids.add(id);
    slugs.add(post.slug);
  }
  const backupIdentities = payload.posts.map(identity).sort();
  const targetIdentities = targetPosts.map(identity).sort();
  if (JSON.stringify(backupIdentities) !== JSON.stringify(targetIdentities))
    throw new Error("Backup identities do not match the intended target.");
  return payload;
}
export async function readVerifiedBackup(file, options) {
  const content = await readFile(file, "utf8");
  const sidecar = await readFile(`${file}.sha256`, "utf8");
  const [expected, name] = sidecar.trim().split(/\s+/);
  if (
    !/^[a-f0-9]{64}$/.test(expected ?? "") ||
    name !== path.basename(file) ||
    sha256(content) !== expected
  )
    throw new Error("Backup checksum mismatch.");
  let payload;
  try {
    payload = JSON.parse(content);
  } catch {
    throw new Error("Malformed backup JSON.");
  }
  return validateBackupPayload(payload, options);
}
