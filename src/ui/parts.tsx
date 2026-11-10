import { useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { areas } from '../content/profile';
import { questions } from '../content/questions';
import { computeResults } from '../engine/scoring';
import type { Answers, AreaId, LegalRef, Level, Profile, Results } from '../engine/types';
import { LEVEL_SHORT, formatRef } from './labels';

/** Título de pantalla que recibe el foco al cambiar de paso (lectores de pantalla y teclado). */
export function ScreenTitle({ children, focusKey, className }: { children: ReactNode; focusKey: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, [focusKey]);
  return (
    <h1 ref={ref} tabIndex={-1} className={className}>
      {children}
    </h1>
  );
}

const GLYPH: Record<Level, string> = { buena: '●', mejorable: '◐', atender: '○' };

export function LevelMark({ level }: { level: Level }) {
  return (
    <span className={`glyph glyph--${level}`} aria-hidden="true">
      {GLYPH[level]}
    </span>
  );
}

export function LevelTag({ level, text }: { level: Level; text?: string }) {
  return (
    <span className={`lvl lvl--${level}`}>
      <LevelMark level={level} />
      {text ?? LEVEL_SHORT[level]}
    </span>
  );
}

export function RefList({ refs }: { refs: LegalRef[] }) {
  return (
    <ul className="refs" aria-label="Fuentes">
      {refs.map((r) => (
        <li key={`${r.norma}-${r.articulo}`}>{formatRef(r)}</li>
      ))}
    </ul>
  );
}

export function Disclaimer({ onMetodo }: { onMetodo?: () => void }) {
  return (
    <footer className="site-foot">
      <p>
        La 81 es una autoevaluación orientativa basada en la Ley 81 de 2019 y el Decreto Ejecutivo 285 de 2021. No es
        asesoría legal ni una auditoría, y no certifica cumplimiento.
      </p>
      <p>Tus respuestas se quedan en este dispositivo. No se envían a ningún servidor.</p>
      {onMetodo && (
        <p>
          <button type="button" className="link" onClick={onMetodo}>
            Metodología y matriz de controles
          </button>
        </p>
      )}
    </footer>
  );
}

/** Resultados y estado por área a partir del perfil y las respuestas. */
export function useResults(profile: Profile, answers: Answers): { results: Results; statuses: Partial<Record<AreaId, Level>> } {
  return useMemo(() => {
    const results = computeResults(questions, areas, answers, profile);
    const statuses: Partial<Record<AreaId, Level>> = {};
    for (const a of results.areas) if (a.level) statuses[a.area.id] = a.level;
    return { results, statuses };
  }, [profile, answers]);
}
