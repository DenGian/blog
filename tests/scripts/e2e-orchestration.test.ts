import { EventEmitter } from "node:events";
import type { ChildProcess } from "node:child_process";
import { describe, expect, it, vi } from "vitest";
import {
  assertDisposableDatabaseName,
  cleanupE2EResources,
  createE2EMongoTarget,
  startChild,
} from "../../scripts/e2e-core.mjs";

function fakeChild() {
  const child = new EventEmitter() as EventEmitter & {
    exitCode: number | null;
    signalCode: NodeJS.Signals | null;
    kill: ReturnType<typeof vi.fn>;
  };
  child.exitCode = null;
  child.signalCode = null;
  child.kill = vi.fn((signal: NodeJS.Signals) => {
    child.signalCode = signal;
    child.emit("exit", null, signal);
    return true;
  });
  return child;
}

describe("isolated E2E orchestration", () => {
  it("selects a temporary local MongoDB by default", () => {
    expect(createE2EMongoTarget({})).toMatchObject({
      mode: "local",
      database: "journal_e2e_test",
      ownsMongoProcess: true,
      port: 27028,
    });
  });

  it("creates a unique disposable database for external CI MongoDB", () => {
    const target = createE2EMongoTarget(
      { E2E_MONGODB_URI: "mongodb://127.0.0.1:27017" },
      "abcdef123456",
    );
    expect(target).toMatchObject({
      mode: "external",
      database: "journal_e2e_ci_abcdef123456",
      ownsMongoProcess: false,
    });
    expect(target.uri).toContain("/journal_e2e_ci_abcdef123456");
  });

  it.each([
    "mongodb://database.example:27017",
    "mongodb://10.0.0.4:27017",
    "mongodb://user:password@127.0.0.1:27017",
    "mongodb://127.0.0.1:27017/blog_portfolio",
  ])("refuses unsafe external target %s", (E2E_MONGODB_URI) => {
    expect(() => createE2EMongoTarget({ E2E_MONGODB_URI })).toThrow(
      /credential-free loopback/,
    );
  });

  it.each(["blog_portfolio", "journal_production", "journal", "e2e/live"])(
    "refuses unsafe database name %s",
    (name) =>
      expect(() => assertDisposableDatabaseName(name)).toThrow(/unsafe/),
  );

  it("terminates application children but never an external MongoDB process", async () => {
    const application = fakeChild();
    const externalMongo = fakeChild();
    await cleanupE2EResources({
      database: "journal_e2e_ci_abcdef123456",
      children: [application as unknown as ChildProcess],
      databaseProcess: externalMongo as unknown as ChildProcess,
      ownsMongoProcess: false,
    });
    expect(application.kill).toHaveBeenCalledWith("SIGTERM");
    expect(externalMongo.kill).not.toHaveBeenCalled();
  });

  it("drops, verifies, and closes the disposable database during cleanup", async () => {
    const dropDatabase = vi.fn().mockResolvedValue(undefined);
    const listDatabases = vi.fn().mockResolvedValue({ databases: [] });
    const close = vi.fn().mockResolvedValue(undefined);
    const client = {
      db: vi.fn((name: string) =>
        name === "admin"
          ? { admin: () => ({ listDatabases }) }
          : { dropDatabase },
      ),
      close,
    };
    await cleanupE2EResources({
      client: client as never,
      database: "journal_e2e_ci_abcdef123456",
      ownsMongoProcess: false,
    });
    expect(dropDatabase).toHaveBeenCalledOnce();
    expect(listDatabases).toHaveBeenCalledWith({
      nameOnly: true,
      filter: { name: "journal_e2e_ci_abcdef123456" },
    });
    expect(close).toHaveBeenCalledOnce();
  });

  it("turns a missing executable into a controlled rejection", async () => {
    const child = fakeChild();
    const failure = Object.assign(new Error("spawn missing ENOENT"), {
      code: "ENOENT",
    });
    const spawnImplementation = vi.fn(() => {
      queueMicrotask(() => child.emit("error", failure));
      return child;
    });
    await expect(
      startChild("missing-command", [], {}, [], spawnImplementation as never),
    ).rejects.toThrow(
      "Unable to start missing-command: executable was not found.",
    );
  });
});
