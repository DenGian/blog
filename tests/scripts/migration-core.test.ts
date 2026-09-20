import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  parseMigrationArgs,
  readVerifiedBackup,
  sha256,
  validateBackupPayload,
} from "../../scripts/migration-core.mjs";
const posts = [
  {
    _id: "1",
    slug: "one",
    title: "One",
    content: "<p>x</p>",
    date: "2025-01-01T00:00:00Z",
  },
];
const payload = {
  metadata: {
    mode: "read-only-primary-majority",
    database: "journal_test",
    collection: "posts",
    count: 1,
  },
  posts,
};
describe("migration integrity", () => {
  it.each([
    [[], "MIGRATION_DRY_RUN"],
    [["--apply", "--backup", "x.json"], "MIGRATION_APPLY"],
    [["--indexes"], "INDEX_DRY_RUN"],
    [["--indexes", "--apply", "--backup", "x.json"], "INDEX_APPLY"],
  ])("reports the true mode", (args, mode) =>
    expect(parseMigrationArgs(args).mode).toBe(mode),
  );
  it("rejects ambiguous and backup-less apply arguments", () => {
    expect(() => parseMigrationArgs(["--apply"])).toThrow(/backup/);
    expect(() =>
      parseMigrationArgs(["--apply", "--apply-indexes", "--backup", "x"]),
    ).toThrow(/Contradictory/);
  });
  it("validates matching backup identities", () =>
    expect(
      validateBackupPayload(payload, {
        database: "journal_test",
        collection: "posts",
        targetPosts: posts,
      }),
    ).toBe(payload));
  it("rejects wrong metadata, duplicates, empty and target mismatch", () => {
    expect(() =>
      validateBackupPayload(
        { ...payload, metadata: { ...payload.metadata, database: "wrong" } },
        { database: "journal_test", collection: "posts", targetPosts: posts },
      ),
    ).toThrow(/metadata/);
    expect(() =>
      validateBackupPayload(
        {
          ...payload,
          metadata: { ...payload.metadata, count: 2 },
          posts: [posts[0], posts[0]],
        },
        { database: "journal_test", collection: "posts", targetPosts: posts },
      ),
    ).toThrow();
    expect(() =>
      validateBackupPayload(
        { ...payload, metadata: { ...payload.metadata, count: 0 }, posts: [] },
        { database: "journal_test", collection: "posts", targetPosts: posts },
      ),
    ).toThrow(/Empty/);
    expect(() =>
      validateBackupPayload(payload, {
        database: "journal_test",
        collection: "posts",
        targetPosts: [{ ...posts[0], slug: "other" }],
      }),
    ).toThrow(/identities/);
  });
  it("produces deterministic SHA-256", () =>
    expect(sha256("journal")).toMatch(/^[a-f0-9]{64}$/));
  it("rejects a checksum mismatch before target validation", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "migration-test-"));
    const file = path.join(directory, "backup.json");
    await writeFile(file, JSON.stringify(payload));
    await writeFile(`${file}.sha256`, `${"0".repeat(64)}  backup.json\n`);
    await expect(
      readVerifiedBackup(file, {
        database: "journal_test",
        collection: "posts",
        targetPosts: posts,
      }),
    ).rejects.toThrow(/checksum/);
    await rm(directory, { recursive: true, force: true });
  });
});
