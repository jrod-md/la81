import type {
  Answers,
  AnswerOption,
  Area,
  AreaId,
  AreaResult,
  Effort,
  Finding,
  Level,
  Profile,
  Question,
  Results,
} from './types';

/** Puntos por nivel. 'na' no puntúa y por eso no aparece aquí. */
export const LEVEL_POINTS: Readonly<Record<Level, number>> = {
  buena: 1,
  mejorable: 0.5,
  atender: 0,
};

/** Orden de esfuerzo para desempatar prioridades: lo rápido primero. */
export const EFFORT_ORDER: Readonly<Record<Effort, number>> = {
  rapido: 0,
  medio: 1,
  proyecto: 2,
};

/** Visible si no hay condición o si el perfil cumple alguno de sus ids. */
export function isVisible(question: Question, profile: Profile): boolean {
  const condition = question.showIf;
  if (!condition) return true;
  const selected = profile[condition.profile];
  if (!selected || selected.length === 0) return false;
  return condition.anyOf.some((id) => selected.includes(id));
}

/** Preguntas visibles, conservando el orden original. */
export function visibleQuestions(questions: readonly Question[], profile: Profile): Question[] {
  return questions.filter((question) => isVisible(question, profile));
}

/** Preguntas del recorrido esencial visibles para el perfil, en el orden original. */
export function coreQuestions(questions: readonly Question[], profile: Profile): Question[] {
  return visibleQuestions(questions, profile).filter((question) => question.core === true);
}

/** Preguntas para profundizar en un área: visibles, del área y no esenciales, en el orden original. */
export function deepQuestions(
  questions: readonly Question[],
  profile: Profile,
  area: AreaId,
): Question[] {
  return visibleQuestions(questions, profile).filter(
    (question) => question.area === area && question.core !== true,
  );
}

/** Opción de una pregunta por id, o undefined si no existe. */
export function findOption(
  question: Question,
  optionId: string | undefined,
): AnswerOption | undefined {
  if (optionId === undefined) return undefined;
  return question.options.find((option) => option.id === optionId);
}

/** Nivel a partir de un puntaje 0–100. */
export function levelForScore(score: number): Level {
  if (score >= 80) return 'buena';
  if (score >= 50) return 'mejorable';
  return 'atender';
}

interface AnsweredItem {
  question: Question;
  option: AnswerOption;
  /** Posición en el arreglo original de preguntas. */
  index: number;
}

interface ScorableItem extends AnsweredItem {
  level: Level;
}

/** Promedio ponderado 0–100, o null si no hay preguntas puntuables. */
function weightedScore(items: readonly ScorableItem[]): number | null {
  if (items.length === 0) return null;
  let points = 0;
  let weight = 0;
  for (const item of items) {
    points += item.question.weight * LEVEL_POINTS[item.level];
    weight += item.question.weight;
  }
  return Math.round((points / weight) * 100);
}

export function computeResults(
  questions: readonly Question[],
  areas: readonly Area[],
  answers: Answers,
  profile: Profile,
): Results {
  const visible = visibleQuestions(questions, profile);

  // Respuestas válidas de preguntas visibles (incluye las de nivel 'na').
  const answeredItems: AnsweredItem[] = [];
  questions.forEach((question, index) => {
    if (!isVisible(question, profile)) return;
    const option = findOption(question, answers[question.id]);
    if (option) answeredItems.push({ question, option, index });
  });

  // Solo las puntuables: 'na' queda fuera.
  const scorable: ScorableItem[] = [];
  for (const item of answeredItems) {
    if (item.option.level !== 'na') {
      scorable.push({ ...item, level: item.option.level });
    }
  }

  const areaResults: AreaResult[] = areas.map((area) => {
    const areaVisible = visible.filter((question) => question.area === area.id);
    const areaAnswered = answeredItems.filter((item) => item.question.area === area.id);
    const areaScorable = scorable.filter((item) => item.question.area === area.id);
    const score = weightedScore(areaScorable);
    return {
      area,
      score,
      level: score === null ? null : levelForScore(score),
      answered: areaAnswered.length,
      visible: areaVisible.length,
    };
  });

  const overall = weightedScore(scorable);

  const priorities: Finding[] = scorable
    .filter((item) => item.level !== 'buena')
    .sort((a, b) => {
      if (a.level !== b.level) return a.level === 'atender' ? -1 : 1;
      if (a.question.weight !== b.question.weight) return b.question.weight - a.question.weight;
      const effortA = EFFORT_ORDER[a.question.effort];
      const effortB = EFFORT_ORDER[b.question.effort];
      if (effortA !== effortB) return effortA - effortB;
      return a.index - b.index;
    })
    .map((item) => ({ question: item.question, option: item.option, level: item.level }));

  const strengths: Finding[] = scorable
    .filter((item) => item.level === 'buena')
    .sort((a, b) => a.index - b.index)
    .map((item) => ({ question: item.question, option: item.option, level: item.level }));

  return {
    areas: areaResults,
    overall,
    overallLevel: overall === null ? null : levelForScore(overall),
    priorities,
    strengths,
    answered: answeredItems.length,
    visible: visible.length,
  };
}
