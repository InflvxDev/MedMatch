import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { ParsedWorkbook } from './types';

interface MedMatchDB extends DBSchema {
  workbook: {
    key: string;
    value: ParsedWorkbook;
  };
}

const DB_NAME = 'medmatch';
const STORE = 'workbook';
const CURRENT_KEY = 'current';

let dbPromise: Promise<IDBPDatabase<MedMatchDB>> | null = null;

function getDB(): Promise<IDBPDatabase<MedMatchDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MedMatchDB>(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      },
    });
  }
  return dbPromise;
}

/** Guarda el workbook parseado actual. */
export async function saveWorkbook(workbook: ParsedWorkbook): Promise<void> {
  const db = await getDB();
  await db.put(STORE, workbook, CURRENT_KEY);
}

/** Carga el workbook persistido, o null si no hay. */
export async function loadWorkbook(): Promise<ParsedWorkbook | null> {
  try {
    const db = await getDB();
    return (await db.get(STORE, CURRENT_KEY)) ?? null;
  } catch {
    return null;
  }
}

/** Elimina el workbook persistido. */
export async function clearWorkbook(): Promise<void> {
  const db = await getDB();
  await db.delete(STORE, CURRENT_KEY);
}
