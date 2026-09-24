#!/usr/bin/env node
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import net from "node:net";
import process from "node:process";
import { MongoClient } from "mongodb";
import { hash } from "bcryptjs";
import {
  cleanupE2EResources,
  createE2EMongoTarget,
  startChild,
  waitForExit,
} from "./e2e-core.mjs";

const appPort = 3100;
const password = "isolated-e2e-admin-password";
const children = [];
const target = createE2EMongoTarget();
let client;
let databaseProcess;
let dataDir;
let primaryError;
let interruptionError;

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function assertStillRunning(child, label) {
  if (interruptionError) throw interruptionError;
  if (child.exitCode !== null)
    throw new Error(
      `${label} exited before it became ready (code ${child.exitCode ?? 1}).`,
    );
}

async function waitForPort(port, child, timeout = 30_000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    assertStillRunning(child, "mongod");
    const ready = await new Promise((resolve) => {
      const socket = net.connect(port, "127.0.0.1", () => {
        socket.destroy();
        resolve(true);
      });
      socket.once("error", () => resolve(false));
    });
    if (ready) return;
    await delay(200);
  }
  throw new Error(`Timed out waiting for loopback port ${port}.`);
}

async function waitForHttp(url, child, timeout = 120_000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    assertStillRunning(child, "Next.js");
    try {
      if (
        (await fetch(url, { signal: AbortSignal.timeout(2_000) })).status < 500
      )
        return;
    } catch {}
    await delay(500);
  }
  throw new Error(`Timed out waiting for the E2E application at ${url}.`);
}

async function seedFixtures() {
  await client
    .db(target.database)
    .collection("posts")
    .insertMany([
      {
        title: "Docker fundamentals",
        slug: "docker-fundamentals",
        excerpt: "Deterministic published fixture for browser testing.",
        content: "<p>Published fixture content.</p>",
        tags: ["Docker", "Testing"],
        status: "published",
        publishedAt: new Date("2025-01-02T10:00:00Z"),
        date: new Date("2025-01-02T10:00:00Z"),
        createdAt: new Date("2025-01-02T10:00:00Z"),
        updatedAt: new Date("2025-01-02T10:00:00Z"),
        schemaVersion: 2,
      },
      {
        title: "Legacy refactoring",
        slug: "legacy-refactoring",
        excerpt: "Deterministic legacy fixture for compatibility testing.",
        content: "<p>Legacy fixture content.</p>",
        tags: ["Refactoring"],
        author: { name: "Ian Mondelaers", image: "/profile.png" },
        date: new Date("2025-01-01T10:00:00Z"),
        createdAt: new Date("2025-01-01T10:00:00Z"),
        updatedAt: new Date("2025-01-01T10:00:00Z"),
      },
    ]);
}

for (const signal of ["SIGINT", "SIGTERM"])
  process.once(signal, () => {
    interruptionError = new Error(`E2E run interrupted by ${signal}.`);
    for (const child of children) child.kill("SIGTERM");
    if (target.ownsMongoProcess) databaseProcess?.kill("SIGTERM");
  });

try {
  if (target.mode === "local") {
    dataDir = await mkdtemp(path.join(tmpdir(), "journal-e2e-"));
    databaseProcess = await startChild(
      "mongod",
      [
        "--quiet",
        "--dbpath",
        dataDir,
        "--port",
        String(target.port),
        "--bind_ip",
        "127.0.0.1",
        "--logpath",
        path.join(dataDir, "mongod.log"),
      ],
      { stdio: "inherit", env: process.env },
      [],
    );
    await waitForPort(target.port, databaseProcess);
  }

  client = new MongoClient(target.uri, {
    serverSelectionTimeoutMS: 8_000,
    connectTimeoutMS: 8_000,
    socketTimeoutMS: 10_000,
  });
  await client.connect();
  if (target.ownsMongoProcess) {
    const status = await client.db("admin").command({ serverStatus: 1 });
    if (status.pid !== databaseProcess.pid)
      throw new Error("E2E refused a MongoDB process it did not start.");
  }
  await seedFixtures();

  const env = {
    ...process.env,
    MONGODB_URI: target.uri,
    MONGODB_DATABASE: target.database,
    SITE_URL: `http://127.0.0.1:${appPort}`,
    ADMIN_PASSWORD_HASH: await hash(password, 4),
    SESSION_SECRET: "e2e-only-session-secret-with-32-characters",
    E2E_ADMIN_PASSWORD: password,
  };
  const application = await startChild(
    "npm",
    ["run", "dev", "--", "-p", String(appPort)],
    { stdio: "inherit", env },
    children,
  );
  await waitForHttp(`http://127.0.0.1:${appPort}`, application);

  const runner = await startChild(
    "npx",
    ["playwright", "test"],
    {
      stdio: "inherit",
      env: { ...env, E2E_BASE_URL: `http://127.0.0.1:${appPort}` },
    },
    children,
  );
  const exitCode = await waitForExit(runner, "Playwright");
  if (interruptionError) throw interruptionError;
  if (exitCode !== 0)
    throw new Error(`Playwright exited with code ${exitCode}.`);
} catch (error) {
  primaryError = error;
} finally {
  try {
    await cleanupE2EResources({
      client,
      database: target.database,
      children,
      databaseProcess,
      ownsMongoProcess: target.ownsMongoProcess,
      dataDir,
    });
  } catch (cleanupError) {
    if (!primaryError) primaryError = cleanupError;
    else console.error(cleanupError);
  }
}

if (primaryError) {
  console.error(
    primaryError instanceof Error ? primaryError.message : "E2E run failed.",
  );
  process.exitCode = 1;
}
