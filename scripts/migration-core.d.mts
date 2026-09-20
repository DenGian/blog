export type MigrationMode =
  "MIGRATION_DRY_RUN" | "MIGRATION_APPLY" | "INDEX_DRY_RUN" | "INDEX_APPLY";
export function parseMigrationArgs(argv: string[]): {
  mode: MigrationMode;
  backupPath?: string;
};
export function sha256(content: string): string;
export function validateBackupPayload(
  payload: unknown,
  options: {
    database: string;
    collection: string;
    targetPosts: Record<string, unknown>[];
  },
): unknown;
export function readVerifiedBackup(
  file: string,
  options: {
    database: string;
    collection: string;
    targetPosts: Record<string, unknown>[];
  },
): Promise<unknown>;
