import type { ChildProcess, SpawnOptions } from "node:child_process";
import type { MongoClient } from "mongodb";

export type E2EMongoTarget = {
  mode: "local" | "external";
  database: string;
  uri: string;
  port: number;
  ownsMongoProcess: boolean;
};

export function assertDisposableDatabaseName(name: string): void;
export function createE2EMongoTarget(
  source?: Record<string, string | undefined>,
  uniqueSuffix?: string,
): E2EMongoTarget;
export function startChild(
  command: string,
  args: string[],
  options: SpawnOptions,
  registry: ChildProcess[],
  spawnImplementation?: typeof import("node:child_process").spawn,
): Promise<ChildProcess>;
export function waitForExit(
  child: ChildProcess,
  label: string,
  timeout?: number,
): Promise<number>;
export function terminateChild(
  child: ChildProcess,
  timeout?: number,
): Promise<void>;
export function dropAndVerifyDatabase(
  client: MongoClient,
  database: string,
): Promise<void>;
export function cleanupE2EResources(options: {
  client?: MongoClient;
  database: string;
  children?: ChildProcess[];
  databaseProcess?: ChildProcess;
  ownsMongoProcess: boolean;
  dataDir?: string;
}): Promise<void>;
