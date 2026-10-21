import type { SQLiteDatabase } from 'expo-sqlite';

import { LetterExplanationSchema, type LetterExplanation } from '@/explainer/schema';

export const letterSources = ['scan', 'photo', 'pdf', 'sample'] as const;
export type LetterSource = (typeof letterSources)[number];

export type LetterSummary = {
  id: number;
  createdAt: Date;
  source: LetterSource;
  explanation: LetterExplanation | null;
};

export type Letter = LetterSummary & {
  originalText: string;
};

export type NewLetter = {
  source: LetterSource;
  originalText: string;
  explanation: LetterExplanation | null;
  createdAt?: Date;
};

export type LetterRow = {
  id: number;
  created_at: number;
  source: string;
  explanation_json: string | null;
};

type LetterDetailRow = LetterRow & { original_text: string };

function isLetterSource(value: string): value is LetterSource {
  return (letterSources as readonly string[]).includes(value);
}

/** Returns null for a missing or unreadable explanation instead of failing the whole history list. */
export function parseExplanation(json: string | null): LetterExplanation | null {
  if (json === null) {
    return null;
  }
  try {
    const parsed = LetterExplanationSchema.safeParse(JSON.parse(json));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function toLetterSummary(row: LetterRow): LetterSummary {
  return {
    id: row.id,
    createdAt: new Date(row.created_at),
    source: isLetterSource(row.source) ? row.source : 'scan',
    explanation: parseExplanation(row.explanation_json),
  };
}

export async function listLetters(db: SQLiteDatabase): Promise<LetterSummary[]> {
  const rows = await db.getAllAsync<LetterRow>(
    'SELECT id, created_at, source, explanation_json FROM letters ORDER BY created_at DESC, id DESC',
  );
  return rows.map(toLetterSummary);
}

export async function getLetter(db: SQLiteDatabase, id: number): Promise<Letter | null> {
  const row = await db.getFirstAsync<LetterDetailRow>(
    'SELECT id, created_at, source, explanation_json, original_text FROM letters WHERE id = ?',
    id,
  );
  return row ? { ...toLetterSummary(row), originalText: row.original_text } : null;
}

export async function insertLetter(db: SQLiteDatabase, letter: NewLetter): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO letters (created_at, source, original_text, explanation_json) VALUES (?, ?, ?, ?)',
    (letter.createdAt ?? new Date()).getTime(),
    letter.source,
    letter.originalText,
    letter.explanation ? JSON.stringify(letter.explanation) : null,
  );
  return result.lastInsertRowId;
}

export async function countLetters(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM letters');
  return row?.count ?? 0;
}

export async function deleteAllLetters(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM letters');
  // Letters are private documents: rebuild the file and empty the WAL so deleted pages don't linger on disk.
  await db.execAsync('VACUUM; PRAGMA wal_checkpoint(TRUNCATE);');
}
