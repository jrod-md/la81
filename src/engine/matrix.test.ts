import { describe, it, expect } from 'vitest';
import type { Area, Control, MatrixRow, Question } from './types';
import {
  MATRIX_HEADERS,
  appliesText,
  buildMatrix,
  matrixCells,
  matrixToCsv,
  refText,
} from './matrix';

const areas: Area[] = [
  { id: 'inventario', title: 'Conoce tus datos', summary: 'Qué datos guardas.' },
  { id: 'seguridad', title: 'Seguridad del día a día', summary: 'Claves y accesos.' },
];

const questions: Question[] = [
  {
    id: 'inv-lista',
    area: 'inventario',
    prompt: '¿Tienes un inventario de datos?',
    help: 'Ayuda de prueba.',
    options: [
      { id: 'si', label: 'Sí', level: 'buena' },
      { id: 'no', label: 'No', level: 'atender' },
    ],
    refs: [{ norma: 'Ley 81', articulo: '16' }],
    recommendation: 'Haz un inventario.',
    weight: 3,
    effort: 'rapido',
    core: true,
  },
  {
    id: 'inv-finalidad',
    area: 'inventario',
    prompt: '¿Cada dato tiene una finalidad?',
    help: 'Ayuda de prueba.',
    options: [
      { id: 'si', label: 'Sí', level: 'buena' },
      { id: 'no', label: 'No', level: 'atender' },
    ],
    refs: [{ norma: 'DE 285', articulo: '33.8' }],
    recommendation: 'Documenta la finalidad.',
    weight: 2,
    effort: 'medio',
    showIf: { profile: 'personas', anyOf: ['clientes', 'empleados'] },
  },
  {
    id: 'seg-acceso',
    area: 'seguridad',
    prompt: '¿Limitas el acceso a los datos?',
    help: 'Ayuda de prueba.',
    options: [
      { id: 'si', label: 'Sí', level: 'buena' },
      { id: 'no', label: 'No', level: 'atender' },
    ],
    refs: [{ norma: 'Guía ANTAI', articulo: 'Hoja de ruta' }],
    recommendation: 'Limita el acceso.',
    weight: 1,
    effort: 'proyecto',
  },
];

const controls: Control[] = [
  {
    id: 'INV-01',
    question: 'inv-lista',
    objetivo: 'Mantener un inventario de datos.',
    prueba: 'Pedir el inventario.',
    evidencia: ['Inventario con fecha'],
    tipo: 'preventivo',
    exigencia: 'expresa',
    iso27001: ['5.9'],
    iso27701: ['7.2.8'],
    nist: ['ID.IM-P'],
  },
  {
    id: 'INV-02',
    question: 'inv-finalidad',
    objetivo: 'Asignar una finalidad a cada dato.',
    prueba: 'Revisar cinco campos.',
    evidencia: ['Columna de finalidad', 'Formularios vigentes'],
    tipo: 'detectivo',
    exigencia: 'derivada',
    iso27001: ['5.34'],
    iso27701: ['7.2.1'],
    nist: ['ID.IM-P', 'CT.PO-P'],
  },
  {
    id: 'SEG-01',
    question: 'seg-acceso',
    objetivo: 'Limitar el acceso a quien lo necesita.',
    prueba: 'Listar los permisos.',
    evidencia: ['Captura de permisos'],
    tipo: 'correctivo',
    exigencia: 'voluntaria',
    iso27001: ['5.15'],
    iso27701: ['6.6'],
    nist: ['PR.AC-P'],
  },
];

function questionById(id: string): Question {
  const question = questions.find((item) => item.id === id);
  if (!question) throw new Error(`pregunta de prueba no encontrada: ${id}`);
  return question;
}

function areaById(id: string): Area {
  const area = areas.find((item) => item.id === id);
  if (!area) throw new Error(`área de prueba no encontrada: ${id}`);
  return area;
}

function rowFor(id: string): MatrixRow {
  const row = buildMatrix(controls, questions, areas).find((item) => item.control.id === id);
  if (!row) throw new Error(`fila de prueba no encontrada: ${id}`);
  return row;
}

describe('buildMatrix', () => {
  it('une control, pregunta y área y conserva el orden de controls', () => {
    const rows = buildMatrix(controls, questions, areas);
    expect(rows.map((row) => row.control.id)).toEqual(['INV-01', 'INV-02', 'SEG-01']);
    expect(rows[0]?.question.id).toBe('inv-lista');
    expect(rows[0]?.area.id).toBe('inventario');
    expect(rows[2]?.question.id).toBe('seg-acceso');
    expect(rows[2]?.area.id).toBe('seguridad');
  });

  it('omite un control cuya pregunta no existe', () => {
    const huerfano: Control = {
      id: 'INV-99',
      question: 'no-existe',
      objetivo: 'Control huérfano.',
      prueba: 'No aplica.',
      evidencia: ['Ninguna'],
      tipo: 'preventivo',
      exigencia: 'expresa',
      iso27001: ['5.9'],
      iso27701: ['7.2.8'],
      nist: ['ID.IM-P'],
    };
    const rows = buildMatrix([...controls, huerfano], questions, areas);
    expect(rows.map((row) => row.control.id)).toEqual(['INV-01', 'INV-02', 'SEG-01']);
  });
});

describe('refText', () => {
  it('formatea las tres normas', () => {
    expect(refText({ norma: 'Ley 81', articulo: '16' })).toBe('Ley 81, art. 16');
    expect(refText({ norma: 'DE 285', articulo: '33.8' })).toBe('DE 285, art. 33.8');
    expect(refText({ norma: 'Guía ANTAI', articulo: 'Hoja de ruta' })).toBe(
      'Guía ANTAI: Hoja de ruta',
    );
  });
});

describe('appliesText', () => {
  it('sin showIf devuelve "Todos los negocios"', () => {
    expect(appliesText(questionById('inv-lista'))).toBe('Todos los negocios');
  });

  it('con showIf describe el perfil y las opciones', () => {
    expect(appliesText(questionById('inv-finalidad'))).toBe('Perfil personas: clientes, empleados');
  });
});

describe('matrixCells', () => {
  it('devuelve una celda por encabezado', () => {
    for (const control of controls) {
      expect(matrixCells(rowFor(control.id)).length).toBe(MATRIX_HEADERS.length);
    }
  });

  it('calcula criticidad, recorrido, ISO y mayúsculas', () => {
    const inv01 = matrixCells(rowFor('INV-01'));
    expect(inv01[7]).toBe('Alta');
    expect(inv01[8]).toBe('Esencial');
    expect(inv01[5]).toBe('Expresa');
    expect(inv01[6]).toBe('Preventivo');
    expect(inv01[13]).toBe('A.5.9');

    const inv02 = matrixCells(rowFor('INV-02'));
    expect(inv02[7]).toBe('Media');
    expect(inv02[8]).toBe('Profundizar');
    expect(inv02[5]).toBe('Derivada');
    expect(inv02[6]).toBe('Detectivo');

    const seg01 = matrixCells(rowFor('SEG-01'));
    expect(seg01[7]).toBe('Baja');
    expect(seg01[8]).toBe('Profundizar');
    expect(seg01[5]).toBe('Voluntaria');
    expect(seg01[6]).toBe('Correctivo');
  });
});

describe('matrixToCsv', () => {
  it('empieza con BOM y la primera línea son los encabezados', () => {
    const csv = matrixToCsv([]);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe(`\uFEFF${MATRIX_HEADERS.join(',')}`);
  });

  it('tiene una línea por fila más los encabezados', () => {
    const rows = buildMatrix(controls, questions, areas);
    const csv = matrixToCsv(rows);
    const lines = csv.split('\r\n');
    expect(lines[lines.length - 1]).toBe('');
    expect(lines.length - 1).toBe(rows.length + 1);
  });

  it('con rows vacío devuelve solo los encabezados', () => {
    const csv = matrixToCsv([]);
    const lines = csv.split('\r\n');
    expect(lines.length - 1).toBe(1);
    expect(lines[0]).toBe(`\uFEFF${MATRIX_HEADERS.join(',')}`);
  });

  it('escapa comas, comillas dobles y fórmulas', () => {
    const control: Control = {
      id: 'INV-01',
      question: 'inv-lista',
      objetivo: 'Inventario, con coma',
      prueba: '=SUM(A1)',
      evidencia: ['Dice "hola"'],
      tipo: 'preventivo',
      exigencia: 'expresa',
      iso27001: ['5.9'],
      iso27701: ['7.2.8'],
      nist: ['ID.IM-P'],
    };
    const csv = matrixToCsv([
      { control, question: questionById('inv-lista'), area: areaById('inventario') },
    ]);
    expect(csv).toContain('"Inventario, con coma"');
    expect(csv).toContain("'=SUM(A1)");
    expect(csv).toContain('"Dice ""hola"""');
  });
});
