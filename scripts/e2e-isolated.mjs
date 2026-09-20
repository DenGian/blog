#!/usr/bin/env node
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import net from "node:net";
import process from "node:process";
import { spawn } from "node:child_process";
import { MongoClient } from "mongodb";
import { hash } from "bcryptjs";
const port = 27028,
  appPort = 3100,
  database = "journal_e2e_test";
const uri = `mongodb://127.0.0.1:${port}/${database}`,
  password = "isolated-e2e-admin-password";
const children = [];
let client;
let databaseProcess;
let isolatedServerVerified = false;
function assertTestTarget(value, name) {
  const parsed = new URL(value);
  if (
    !["127.0.0.1", "localhost"].includes(parsed.hostname) ||
    !/(test|e2e|ci)/i.test(name)
  )
    throw new Error("E2E refused a non-loopback or non-test MongoDB target.");
}
function start(command, args, env = process.env) {
  const child = spawn(command, args, { stdio: "inherit", env });
  children.push(child);
  return child;
}
async function waitForPort(targetPort, timeout = 30000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (
      await new Promise((resolve) => {
        const socket = net.connect(targetPort, "127.0.0.1", () => {
          socket.destroy();
          resolve(true);
        });
        socket.on("error", () => resolve(false));
      })
    )
      return;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Timed out waiting for port ${targetPort}.`);
}
async function waitForHttp(url, timeout = 120000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    try {
      if ((await fetch(url)).status < 500) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${url}.`);
}
const dataDir = await mkdtemp(path.join(tmpdir(), "journal-e2e-"));
let exitCode = 1;
try {
  assertTestTarget(uri, database);
  databaseProcess = start("mongod", [
    "--quiet",
    "--dbpath",
    dataDir,
    "--port",
    String(port),
    "--bind_ip",
    "127.0.0.1",
    "--logpath",
    path.join(dataDir, "mongod.log"),
  ]);
  await waitForPort(port);
  client = new MongoClient(uri);
  await client.connect();
  const serverStatus = await client.db("admin").command({ serverStatus: 1 });
  if (serverStatus.pid !== databaseProcess.pid)
    throw new Error("E2E refused to use a MongoDB process it did not start.");
  isolatedServerVerified = true;
  await client
    .db(database)
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
        date: new Date("2025-01-01T10:00:00Z"),
        createdAt: new Date("2025-01-01T10:00:00Z"),
        updatedAt: new Date("2025-01-01T10:00:00Z"),
      },
    ]);
  const env = {
    ...process.env,
    MONGODB_URI: uri,
    MONGODB_DATABASE: database,
    SITE_URL: `http://127.0.0.1:${appPort}`,
    ADMIN_PASSWORD_HASH: await hash(password, 4),
    SESSION_SECRET: "e2e-only-session-secret-with-32-characters",
    E2E_ADMIN_PASSWORD: password,
  };
  start("npm", ["run", "dev", "--", "-p", String(appPort)], env);
  await waitForHttp(`http://127.0.0.1:${appPort}`);
  const runner = start("npx", ["playwright", "test"], {
    ...env,
    E2E_BASE_URL: `http://127.0.0.1:${appPort}`,
  });
  exitCode = await new Promise((resolve) =>
    runner.on("exit", (code) => resolve(code ?? 1)),
  );
} finally {
  if (client && isolatedServerVerified) {
    await client
      .db(database)
      .dropDatabase()
      .catch(() => undefined);
    const remaining = await client
      .db("admin")
      .admin()
      .listDatabases({ nameOnly: true })
      .then((result) => result.databases.some((item) => item.name === database))
      .catch(() => true);
    if (remaining) {
      console.error("E2E cleanup could not verify database removal.");
      exitCode = 1;
    }
  }
  if (client) {
    await client.close().catch(() => undefined);
  }
  for (const child of children.reverse()) child.kill("SIGTERM");
  if (databaseProcess?.exitCode === null)
    await new Promise((resolve) => databaseProcess.once("exit", resolve));
  await rm(dataDir, { recursive: true, force: true });
}
process.exitCode = exitCode;
