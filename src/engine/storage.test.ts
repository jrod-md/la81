import { describe, it, expect } from 'vitest';
import {
  STORAGE_KEY,
  getDefaultStorage,
  loadState,
  saveState,
  clearState,
  isSavedState,
} from './storage';
import type { StorageLike } from './storage';
import type { Answers, Profile } from './types';

/** Storage falso en memoria. */
class MemoryStorage implements StorageLike {
  private readonly map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }
}

/** Storage que lanza en todos sus métodos. */
const throwingStorage: StorageLike = {
  getItem(): string | null {
    throw new Error('getItem falla');
  },
  setItem(): void {
    throw new Error('setItem falla');
  },
  removeItem(): void {
    throw new Error('removeItem falla');
  },
};

describe('storage', () => {
  it('guarda y carga el mismo perfil y respuestas', () => {
    const storage = new MemoryStorage();
    const profile: Profile = { tamano: ['2-10'], personas: ['clientes', 'empleados'] };
    const answers: Answers = { 'inv-lista': 'escrito', 'seg-2fa': 'todas' };
    const now = new Date('2024-01-02T03:04:05.000Z');

    expect(saveState(profile, answers, storage, now)).toBe(true);

    const loaded = loadState(storage);
    expect(loaded).not.toBeNull();
    expect(loaded?.profile).toEqual(profile);
    expect(loaded?.answers).toEqual(answers);
    expect(loaded?.updatedAt).toBe(now.toISOString());
  });

  it('loadState devuelve null con el storage vacío', () => {
    expect(loadState(new MemoryStorage())).toBeNull();
  });

  it('loadState devuelve null con datos inválidos', () => {
    const cases: Array<[string, string]> = [
      ['JSON inválido', '{no es json'],
      ['version 2', JSON.stringify({ version: 2, profile: {}, answers: {}, updatedAt: 'x' })],
      [
        'answers con un valor numérico',
        JSON.stringify({ version: 1, profile: {}, answers: { a: 1 }, updatedAt: 'x' }),
      ],
      [
        'profile con un valor que no es arreglo',
        JSON.stringify({ version: 1, profile: { a: 'x' }, answers: {}, updatedAt: 'x' }),
      ],
      [
        'profile con un arreglo que contiene un número',
        JSON.stringify({ version: 1, profile: { a: [1] }, answers: {}, updatedAt: 'x' }),
      ],
      ['un arreglo en la raíz', JSON.stringify([])],
      ['null en la raíz', JSON.stringify(null)],
    ];

    for (const [name, raw] of cases) {
      const storage = new MemoryStorage();
      storage.setItem(STORAGE_KEY, raw);
      expect(loadState(storage), name).toBeNull();
    }
  });

  it('no propaga excepciones con un storage que lanza', () => {
    expect(loadState(throwingStorage)).toBeNull();
    expect(saveState({}, {}, throwingStorage)).toBe(false);
    expect(clearState(throwingStorage)).toBe(false);
  });

  it('con storage null devuelve null, false y false', () => {
    expect(loadState(null)).toBeNull();
    expect(saveState({}, {}, null)).toBe(false);
    expect(clearState(null)).toBe(false);
  });

  it('sin localStorage (node) getDefaultStorage y loadState devuelven null', () => {
    expect(getDefaultStorage()).toBeNull();
    expect(loadState()).toBeNull();
  });

  it('clearState elimina el dato guardado', () => {
    const storage = new MemoryStorage();
    expect(saveState({ tamano: ['solo'] }, { 'inv-lista': 'no' }, storage)).toBe(true);
    expect(loadState(storage)).not.toBeNull();
    expect(clearState(storage)).toBe(true);
    expect(loadState(storage)).toBeNull();
  });

  it('isSavedState acepta claves extra', () => {
    const value = {
      version: 1,
      profile: { tamano: ['2-10'] },
      answers: { 'inv-lista': 'escrito' },
      updatedAt: '2024-01-01T00:00:00.000Z',
      extra: 'algo',
    };
    expect(isSavedState(value)).toBe(true);
  });
});
