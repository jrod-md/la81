import { useCallback, useEffect, useMemo, useState } from 'react';
import { areas, profileQuestions } from '../content/profile';
import { questions } from '../content/questions';
import { coreQuestions, deepQuestions, visibleQuestions } from '../engine/scoring';
import { clearState, loadState, saveState } from '../engine/storage';
import type { Answers, AreaId, Profile, Question } from '../engine/types';

export type Screen =
  | { name: 'inicio' }
  | { name: 'perfil'; step: number }
  | { name: 'cuestionario'; index: number }
  | { name: 'profundizar'; area: AreaId; index: number }
  | { name: 'resultados' };

const INICIO: Screen = { name: 'inicio' };

function isScreen(value: unknown): value is Screen {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as { name?: unknown; step?: unknown; index?: unknown; area?: unknown };
  switch (s.name) {
    case 'inicio':
    case 'resultados':
      return true;
    case 'perfil':
      return typeof s.step === 'number';
    case 'cuestionario':
      return typeof s.index === 'number';
    case 'profundizar':
      return typeof s.index === 'number' && areas.some((area) => area.id === s.area);
    default:
      return false;
  }
}

/** Estado de la app: pantalla actual, perfil y respuestas. Guarda solo en este dispositivo. */
export function useAppState() {
  const saved = useMemo(() => loadState(), []);
  const [screen, setScreen] = useState<Screen>(INICIO);
  const [profile, setProfile] = useState<Profile>(saved?.profile ?? {});
  const [answers, setAnswers] = useState<Answers>(saved?.answers ?? {});
  const [savedAt, setSavedAt] = useState<string | null>(saved?.updatedAt ?? null);

  const visible: Question[] = useMemo(() => visibleQuestions(questions, profile), [profile]);
  const core: Question[] = useMemo(() => coreQuestions(questions, profile), [profile]);
  const deep = useCallback((area: AreaId) => deepQuestions(questions, profile, area), [profile]);

  // El botón "atrás" del navegador navega entre pantallas en lugar de salir del sitio.
  useEffect(() => {
    window.history.replaceState({ screen: INICIO }, '');
    const onPop = (event: PopStateEvent) => {
      const state: unknown = event.state;
      const next = typeof state === 'object' && state !== null ? (state as { screen?: unknown }).screen : undefined;
      setScreen(isScreen(next) ? next : INICIO);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const go = useCallback((next: Screen) => {
    window.history.pushState({ screen: next }, '');
    setScreen(next);
    window.scrollTo({ top: 0 });
  }, []);

  // Guardado automático cuando hay algo que guardar.
  useEffect(() => {
    const hasData = Object.keys(profile).length > 0 || Object.keys(answers).length > 0;
    if (!hasData) return;
    const now = new Date();
    if (saveState(profile, answers, undefined, now)) setSavedAt(now.toISOString());
  }, [profile, answers]);

  const setProfileAnswer = useCallback((id: string, values: string[]) => {
    setProfile((p) => ({ ...p, [id]: values }));
  }, []);

  const setAnswer = useCallback((questionId: string, optionId: string) => {
    setAnswers((a) => ({ ...a, [questionId]: optionId }));
  }, []);

  const reset = useCallback(() => {
    clearState();
    setProfile({});
    setAnswers({});
    setSavedAt(null);
    window.history.replaceState({ screen: INICIO }, '');
    setScreen(INICIO);
    window.scrollTo({ top: 0 });
  }, []);

  const answeredVisible = visible.filter((q) => answers[q.id] !== undefined).length;
  // Completo cuando cada pregunta de perfil fue respondida (las multi pueden quedar vacías a propósito).
  const profileDone = profileQuestions.every((pq) => {
    const v = profile[pq.id];
    return v !== undefined && (pq.multi || v.length > 0);
  });

  /** Primera pregunta esencial sin responder, para "Continuar". */
  const firstPending = core.findIndex((q) => answers[q.id] === undefined);

  /** Preguntas de profundizar sin responder, por área. */
  const deepPending: Record<AreaId, number> = useMemo(() => {
    const pending = {} as Record<AreaId, number>;
    for (const area of areas) {
      pending[area.id] = deepQuestions(questions, profile, area.id).filter(
        (q) => answers[q.id] === undefined,
      ).length;
    }
    return pending;
  }, [profile, answers]);

  /** Hay alguna pregunta visible no esencial sin responder. */
  const quick = visible.some((q) => q.core !== true && answers[q.id] === undefined);

  return {
    screen,
    go,
    profile,
    answers,
    visible,
    core,
    deep,
    deepPending,
    quick,
    savedAt,
    answeredVisible,
    profileDone,
    firstPending,
    setProfileAnswer,
    setAnswer,
    reset,
  };
}

export type AppState = ReturnType<typeof useAppState>;
