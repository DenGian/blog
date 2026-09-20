import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { spawn } from "node:child_process";

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost"]);
const DISPOSABLE_NAME = /^[A-Za-z0-9_-]{3,63}$/;
const processGroups = new WeakSet();

export function assertDisposableDatabaseName(name) {
  if (
    !DISPOSABLE_NAME.test(name) ||
    !/(e2e|test|ci)/i.test(name) ||
    /(prod|production|live|blog_portfolio)/i.test(name)
  )
    throw new Error(
      "E2E refused an unsafe or production-like MongoDB database name.",
    );
}

export function createE2EMongoTarget(
  source = process.env,
  uniqueSuffix = randomUUID().replaceAll("-", "").slice(0, 12),
) {
  if (!source.E2E_MONGODB_URI) {
    const database = "journal_e2e_test";
    assertDisposableDatabaseName(database);
    return {
      mode: "local",
      database,
      uri: `mongodb://127.0.0.1:27028/${database}`,
      port: 27028,
      ownsMongoProcess: true,
    };
  }

  let parsed;
  try {
    parsed = new URL(source.E2E_MONGODB_URI);
  } catch {
    throw new Error("E2E_MONGODB_URI is not a valid MongoDB URI.");
  }
  if (
    parsed.protocol !== "mongodb:" ||
    !LOOPBACK_HOSTS.has(parsed.hostname) ||
    parsed.username ||
    parsed.password ||
    (parsed.pathname !== "" && parsed.pathname !== "/") ||
    parsed.search ||
    parsed.hash
  )
    throw new Error(
      "E2E_MONGODB_URI must be a credential-free loopback MongoDB server URI without a database or options.",
    );

  const database = `journal_e2e_ci_${uniqueSuffix}`;
  assertDisposableDatabaseName(database);
  parsed.pathname = `/${database}`;
  return {
    mode: "external",
    database,
    uri: parsed.toString(),
    port: Number(parsed.port || 27017),
    ownsMongoProcess: false,
  };
}

function spawnError(command, error) {
  const reason =
    error?.code === "ENOENT" ? "executable was not found" : "spawn failed";
  return new Error(`Unable to start ${command}: ${reason}.`, { cause: error });
}

export async function startChild(
  command,
  args,
  options,
  registry,
  spawnImplementation = spawn,
) {
  let child;
  try {
    const detached = process.platform !== "win32";
    child = spawnImplementation(command, args, { ...options, detached });
    if (detached) processGroups.add(child);
  } catch (error) {
    throw spawnError(command, error);
  }
  registry.push(child);
  return new Promise((resolve, reject) => {
    child.once("spawn", () => resolve(child));
    child.once("error", (error) => reject(spawnError(command, error)));
  });
}

export function waitForExit(child, label, timeout = 10 * 60_000) {
  if (child.exitCode !== null) return Promise.resolve(child.exitCode ?? 1);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`${label} exceeded its ${timeout}ms timeout.`));
    }, timeout);
    const onExit = (code) => {
      cleanup();
      resolve(code ?? 1);
    };
    const onError = (error) => {
      cleanup();
      reject(spawnError(label, error));
    };
    const cleanup = () => {
      clearTimeout(timer);
      child.off("exit", onExit);
      child.off("error", onError);
    };
    child.once("exit", onExit);
    child.once("error", onError);
  });
}

export async function terminateChild(child, timeout = 5_000) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise((resolve) => child.once("exit", resolve));
  signalChild(child, "SIGTERM");
  const stopped = await Promise.race([
    exited.then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), timeout)),
  ]);
  if (!stopped && child.exitCode === null && child.signalCode === null) {
    signalChild(child, "SIGKILL");
    await Promise.race([
      exited,
      new Promise((resolve) => setTimeout(resolve, timeout)),
    ]);
  }
}

function signalChild(child, signal) {
  if (processGroups.has(child) && child.pid) {
    try {
      process.kill(-child.pid, signal);
      return;
    } catch {}
  }
  child.kill(signal);
}

export async function dropAndVerifyDatabase(client, database) {
  assertDisposableDatabaseName(database);
  await client.db(database).dropDatabase();
  const result = await client
    .db("admin")
    .admin()
    .listDatabases({
      nameOnly: true,
      filter: { name: database },
    });
  if (result.databases.some((item) => item.name === database))
    throw new Error("E2E cleanup could not verify database removal.");
}

export async function cleanupE2EResources({
  client,
  database,
  children = [],
  databaseProcess,
  ownsMongoProcess,
  dataDir,
}) {
  const errors = [];
  if (client) {
    try {
      await dropAndVerifyDatabase(client, database);
    } catch (error) {
      errors.push(error);
    }
    try {
      await client.close();
    } catch (error) {
      errors.push(error);
    }
  }
  for (const child of [...children].reverse()) {
    try {
      await terminateChild(child);
    } catch (error) {
      errors.push(error);
    }
  }
  if (ownsMongoProcess && databaseProcess) {
    try {
      await terminateChild(databaseProcess);
    } catch (error) {
      errors.push(error);
    }
  }
  if (dataDir) {
    try {
      await rm(dataDir, { recursive: true, force: true });
    } catch (error) {
      errors.push(error);
    }
  }
  if (errors.length) throw new AggregateError(errors, "E2E cleanup failed.");
}
