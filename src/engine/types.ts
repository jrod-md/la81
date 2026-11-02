// Tipos del contenido y de los resultados. El contenido vive en src/content/,
// el motor (funciones puras) en src/engine/.

/** Nivel de una respuesta. 'na' = no aplica: no cuenta para el puntaje. */
export type Level = 'buena' | 'mejorable' | 'atender';
export type OptionLevel = Level | 'na';

export type AreaId =
  | 'inventario'
  | 'licitud'
  | 'transparencia'
  | 'derechos'
  | 'seguridad'
  | 'terceros'
  | 'incidentes'
  | 'cultura';

export type Norma = 'Ley 81' | 'DE 285' | 'Guía ANTAI';

export interface LegalRef {
  norma: Norma;
  /** Artículo o sección, p. ej. "16" o "2.5" o "Hoja de ruta". */
  articulo: string;
}

/** Esfuerzo estimado para mejorar: sirve para ordenar el plan de acción. */
export type Effort = 'rapido' | 'medio' | 'proyecto';

/** Importancia: 3 = obligación central de la ley, 1 = buena práctica complementaria. */
export type Weight = 1 | 2 | 3;

export interface Area {
  id: AreaId;
  title: string;
  /** Una línea en lenguaje sencillo. */
  summary: string;
}

export interface AnswerOption {
  id: string;
  label: string;
  level: OptionLevel;
  /** Comentario corto que se muestra al elegir esta opción (opcional). */
  note?: string;
}

/** Condición sobre el perfil: visible si la respuesta de perfil `profile` incluye alguno de `anyOf`. */
export interface ProfileCondition {
  profile: string;
  anyOf: string[];
}

export interface Question {
  id: string;
  area: AreaId;
  /** La pregunta o situación, en lenguaje sencillo. */
  prompt: string;
  /** Por qué importa (texto corto, sin jerga). */
  help: string;
  options: AnswerOption[];
  refs: LegalRef[];
  /** Qué hacer si la respuesta no es 'buena'. */
  recommendation: string;
  weight: Weight;
  effort: Effort;
  /** Si existe, la pregunta solo se muestra cuando se cumple. */
  showIf?: ProfileCondition;
}

export interface ProfileOption {
  id: string;
  label: string;
}

export interface ProfileQuestion {
  id: string;
  prompt: string;
  help?: string;
  multi: boolean;
  options: ProfileOption[];
}

/** Respuestas de perfil: id de pregunta de perfil -> ids de opciones elegidas. */
export type Profile = Record<string, string[]>;

/** Respuestas: id de pregunta -> id de opción elegida. */
export type Answers = Record<string, string>;

export interface Finding {
  question: Question;
  option: AnswerOption;
  level: Level;
}

export interface AreaResult {
  area: Area;
  /** 0–100, o null si no hay respuestas puntuables en el área. */
  score: number | null;
  level: Level | null;
  answered: number;
  visible: number;
}

export interface Results {
  areas: AreaResult[];
  /** 0–100, o null si no hay respuestas puntuables. */
  overall: number | null;
  overallLevel: Level | null;
  /** Hallazgos a mejorar, ya ordenados por prioridad. */
  priorities: Finding[];
  /** Buenas prácticas detectadas, en orden del cuestionario. */
  strengths: Finding[];
  answered: number;
  visible: number;
}
