import type { Effort, LegalRef, Level } from '../engine/types';

export const LEVEL_LABEL: Record<Level, string> = {
  buena: 'Buena práctica',
  mejorable: 'Puedes mejorar esto',
  atender: 'Te recomendamos atender esto pronto',
};

/** Etiqueta corta para barras y espacios reducidos. */
export const LEVEL_SHORT: Record<Level, string> = {
  buena: 'Bien encaminado',
  mejorable: 'Puede mejorar',
  atender: 'Atender pronto',
};

export const EFFORT_LABEL: Record<Effort, string> = {
  rapido: 'Rápido de hacer',
  medio: 'Toma algo de tiempo',
  proyecto: 'Es un proyecto',
};

export function formatRef(ref: LegalRef): string {
  if (ref.norma === 'Guía ANTAI') return `Guía ANTAI · ${ref.articulo}`;
  return `${ref.norma} · art. ${ref.articulo}`;
}

const dateFormat = new Intl.DateTimeFormat('es-PA', { day: 'numeric', month: 'long', year: 'numeric' });

export function formatDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return Number.isNaN(d.getTime()) ? '' : dateFormat.format(d);
}
