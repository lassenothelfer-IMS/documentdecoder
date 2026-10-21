import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'brieflos.db';

const DATABASE_VERSION = 1;

export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  // Connection settings, not schema: they must run outside the migration transaction.
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;
  if (currentVersion > DATABASE_VERSION) {
    throw new Error(
      `The saved letters were written by a newer version of the app (database v${currentVersion}). Update the app to open them.`,
    );
  }
  if (currentVersion === DATABASE_VERSION) {
    return;
  }

  await db.withTransactionAsync(async () => {
    if (currentVersion < 1) {
      await db.execAsync(`
        CREATE TABLE letters (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at INTEGER NOT NULL,
          source TEXT NOT NULL,
          original_text TEXT NOT NULL,
          explanation_json TEXT
        );
        CREATE INDEX letters_created_at ON letters (created_at DESC);
      `);
    }
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  });
}
