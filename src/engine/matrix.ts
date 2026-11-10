import type { Area, Control, LegalRef, MatrixRow, Question, Weight } from './types';

/** Une cada control con su pregunta y su área. Conserva el orden de `controls`. Omite los controles cuya pregunta o área no existe. */
export function buildMatrix(controls: Control[], questions: Question[], areas: Area[]): MatrixRow[] {
  const questionById = new Map(questions.map((question) => [question.id, question] as const));
  const areaById = new Map(areas.map((area) => [area.id, area] as const));
  const rows: MatrixRow[] = [];
  for (const control of controls) {
    const question = questionById.get(control.question);
    if (!question) continue;
    const area = areaById.get(question.area);
    if (!area) continue;
    rows.push({ control, question, area });
  }
  return rows;
}

/** "Ley 81, art. 16" | "DE 285, art. 33.8" | "Guía ANTAI: Hoja de ruta" */
export function refText(ref: LegalRef): string {
  if (ref.norma === 'Guía ANTAI') return `${ref.norma}: ${ref.articulo}`;
  return `${ref.norma}, art. ${ref.articulo}`;
}

/** Texto de la condición showIf para la columna "Aplica a". Sin showIf devuelve 'Todos los negocios'. */
export function appliesText(question: Question): string {
  const showIf = question.showIf;
  if (!showIf) return 'Todos los negocios';
  return `Perfil ${showIf.profile}: ${showIf.anyOf.join(', ')}`;
}

export const MATRIX_HEADERS: readonly string[] = [
  'ID',
  'Área',
  'Objetivo de control',
  'Pregunta de evaluación',
  'Fuente legal',
  'Exigencia',
  'Tipo',
  'Criticidad',
  'Recorrido',
  'Aplica a',
  'Procedimiento de prueba',
  'Evidencia esperada',
  'Recomendación',
  'ISO/IEC 27001:2022 (Anexo A)',
  'ISO/IEC 27701:2019',
  'NIST Privacy Framework 1.0',
];

/** Primera letra en mayúscula, el resto igual. */
function capitalize(text: string): string {
  if (text.length === 0) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Criticidad a partir del peso de la pregunta: 3 -> Alta, 2 -> Media, 1 -> Baja. */
function criticidad(weight: Weight): string {
  if (weight === 3) return 'Alta';
  if (weight === 2) return 'Media';
  return 'Baja';
}

/** Una fila de celdas de texto por control, en el orden de MATRIX_HEADERS. */
export function matrixCells(row: MatrixRow): string[] {
  const { control, question, area } = row;
  return [
    control.id,
    area.title,
    control.objetivo,
    question.prompt,
    question.refs.map(refText).join('; '),
    capitalize(control.exigencia),
    capitalize(control.tipo),
    criticidad(question.weight),
    question.core === true ? 'Esencial' : 'Profundizar',
    appliesText(question),
    control.prueba,
    control.evidencia.join('; '),
    question.recommendation,
    control.iso27001.map((code) => `A.${code}`).join('; '),
    control.iso27701.join('; '),
    control.nist.join('; '),
  ];
}

/** Escapa una celda según RFC 4180 y neutraliza fórmulas. */
function escapeCell(value: string): string {
  let cell = value;
  const first = cell.charAt(0);
  if (first === '=' || first === '+' || first === '-' || first === '@') {
    cell = `'${cell}`;
  }
  if (cell.includes(',') || cell.includes('"') || cell.includes('\n') || cell.includes('\r')) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

/** CSV completo: BOM, encabezados y una línea por fila. */
export function matrixToCsv(rows: MatrixRow[]): string {
  const lines: string[] = [MATRIX_HEADERS.map(escapeCell).join(',')];
  for (const row of rows) {
    lines.push(matrixCells(row).map(escapeCell).join(','));
  }
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}
