import type { Answers, Profile } from './types';

export const STORAGE_KEY = 'la81:v1';

export interface SavedState {
  version: 1;
  profile: Profile;
  answers: Answers;
  /** Fecha ISO 8601 del último guardado. */
  updatedAt: string;
}

/** Subconjunto de Storage que usamos (facilita los tests). */
export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Devuelve localStorage si existe y se puede acceder; si no, null. */
export function getDefaultStorage(): StorageLike | null {
  try {
    const storage = globalThis.localStorage;
    return storage ?? null;
  } catch {
    return null;
  }
}

/** Resuelve el storage a usar: el pasado, o el del navegador si es undefined. */
function resolveStorage(storage: StorageLike | null | undefined): StorageLike | null {
  return storage === undefined ? getDefaultStorage() : storage;
}

/** true si value es un objeto plano (no nulo, no arreglo). */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** true si value es un objeto plano cuyos valores son arreglos de strings. */
function isProfile(value: unknown): value is Profile {
  if (!isPlainObject(value)) return false;
  return Object.values(value).every(
    (entry) => Array.isArray(entry) && entry.every((item) => typeof item === 'string'),
  );
}

/** true si value es un objeto plano cuyos valores son strings. */
function isAnswers(value: unknown): value is Answers {
  if (!isPlainObject(value)) return false;
  return Object.values(value).every((entry) => typeof entry === 'string');
}

/** Valida la forma de un estado guardado. Se permiten claves extra. */
export function isSavedState(value: unknown): value is SavedState {
  if (!isPlainObject(value)) return false;
  if (value.version !== 1) return false;
  if (typeof value.updatedAt !== 'string') return false;
  if (!isProfile(value.profile)) return false;
  if (!isAnswers(value.answers)) return false;
  return true;
}

/** Carga el estado guardado; null si no hay, es inválido o falla el acceso. */
export function loadState(storage?: StorageLike | null): SavedState | null {
  const store = resolveStorage(storage);
  if (!store) return null;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return isSavedState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Guarda el estado; false si no se pudo escribir. */
export function saveState(
  profile: Profile,
  answers: Answers,
  storage?: StorageLike | null,
  now?: Date,
): boolean {
  const store = resolveStorage(storage);
  if (!store) return false;
  try {
    const state: SavedState = {
      version: 1,
      profile,
      answers,
      updatedAt: (now ?? new Date()).toISOString(),
    };
    store.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** Borra el estado guardado; false si no se pudo. */
export function clearState(storage?: StorageLike | null): boolean {
  const store = resolveStorage(storage);
  if (!store) return false;
  try {
    store.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
