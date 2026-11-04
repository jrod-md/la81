import { describe, it, expect } from 'vitest';
import type { Area, Answers, Effort, Level, Profile, Question, Weight } from './types';
import {
  computeResults,
  coreQuestions,
  deepQuestions,
  findOption,
  isVisible,
  levelForScore,
  visibleQuestions,
} from './scoring';
import { questions as contentQuestions } from '../content/questions';
import { areas as contentAreas } from '../content/profile';

const areas: Area[] = [
  { id: 'inventario', title: 'Inventario', summary: 'Qué datos guardas.' },
  { id: 'licitud', title: 'Licitud', summary: 'Con qué base los tratas.' },
];

const q1: Question = {
  id: 'q1',
  area: 'inventario',
  prompt: '¿Sabes qué datos personales guardas?',
  help: 'Ayuda 1',
  options: [
    { id: 'q1-buena', label: 'Sí', level: 'buena' },
    { id: 'q1-mejorable', label: 'Más o menos', level: 'mejorable' },
    { id: 'q1-atender', label: 'No', level: 'atender' },
  ],
  refs: [],
  recommendation: 'Haz un inventario.',
  weight: 3,
  effort: 'rapido',
};

const q2: Question = {
  id: 'q2',
  area: 'inventario',
  prompt: '¿Actualizas el inventario?',
  help: 'Ayuda 2',
  options: [
    { id: 'q2-buena', label: 'Sí', level: 'buena' },
    { id: 'q2-atender', label: 'No', level: 'atender' },
  ],
  refs: [],
  recommendation: 'Actualízalo.',
  weight: 1,
  effort: 'medio',
};

const q3: Question = {
  id: 'q3',
  area: 'licitud',
  prompt: '¿Tienes base legal para tratar datos de clientes?',
  help: 'Ayuda 3',
  options: [
    { id: 'q3-buena', label: 'Sí', level: 'buena' },
    { id: 'q3-mejorable', label: 'Más o menos', level: 'mejorable' },
    { id: 'q3-na', label: 'No trato datos de clientes', level: 'na' },
  ],
  refs: [],
  recommendation: 'Define la base legal.',
  weight: 2,
  effort: 'proyecto',
  showIf: { profile: 'trata', anyOf: ['clientes'] },
};

const q4: Question = {
  id: 'q4',
  area: 'licitud',
  prompt: '¿Pides consentimiento?',
  help: 'Ayuda 4',
  options: [
    { id: 'q4-buena', label: 'Sí', level: 'buena' },
    { id: 'q4-atender', label: 'No', level: 'atender' },
  ],
  refs: [],
  recommendation: 'Pide consentimiento.',
  weight: 2,
  effort: 'rapido',
  showIf: { profile: 'trata', anyOf: ['clientes'] },
};

const q5: Question = {
  id: 'q5',
  area: 'inventario',
  prompt: '¿Vendes en línea?',
  help: 'Ayuda 5',
  options: [
    { id: 'q5-buena', label: 'Sí', level: 'buena' },
    { id: 'q5-atender', label: 'No', level: 'atender' },
  ],
  refs: [],
  recommendation: 'Revisa el canal.',
  weight: 1,
  effort: 'rapido',
  showIf: { profile: 'canal', anyOf: ['online'] },
};

const questions: Question[] = [q1, q2, q3, q4, q5];

const conTrata: Profile = { trata: ['clientes'] };

describe('isVisible', () => {
  it('sin showIf siempre es visible', () => {
    expect(isVisible(q1, {})).toBe(true);
  });

  it('con showIf cumplido es visible', () => {
    expect(isVisible(q3, conTrata)).toBe(true);
  });

  it('con la clave de perfil ausente no es visible', () => {
    expect(isVisible(q3, {})).toBe(false);
  });

  it('con un arreglo vacío no es visible', () => {
    expect(isVisible(q3, { trata: [] })).toBe(false);
  });
});

describe('visibleQuestions', () => {
  it('filtra y conserva el orden original', () => {
    const visibles = visibleQuestions(questions, conTrata);
    expect(visibles.map((q) => q.id)).toEqual(['q1', 'q2', 'q3', 'q4']);
  });
});

describe('findOption', () => {
  it('devuelve la opción con ese id', () => {
    expect(findOption(q1, 'q1-buena')?.id).toBe('q1-buena');
  });

  it('devuelve undefined si el id no existe', () => {
    expect(findOption(q1, 'nope')).toBeUndefined();
  });

  it('devuelve undefined si el id es undefined', () => {
    expect(findOption(q1, undefined)).toBeUndefined();
  });
});

describe('levelForScore', () => {
  it('respeta los límites', () => {
    expect(levelForScore(100)).toBe('buena');
    expect(levelForScore(80)).toBe('buena');
    expect(levelForScore(79.9)).toBe('mejorable');
    expect(levelForScore(50)).toBe('mejorable');
    expect(levelForScore(49.9)).toBe('atender');
    expect(levelForScore(0)).toBe('atender');
  });
});

describe('computeResults', () => {
  it('ignora las respuestas a preguntas ocultas', () => {
    const answers: Answers = { q1: 'q1-buena', q3: 'q3-buena' };
    const r = computeResults(questions, areas, answers, {});
    expect(r.visible).toBe(2);
    expect(r.answered).toBe(1);
    expect(r.overall).toBe(100);
  });

  it('un id de opción inválido cuenta como no respondida', () => {
    const r = computeResults(questions, areas, { q1: 'nope' }, {});
    expect(r.answered).toBe(0);
    expect(r.overall).toBeNull();
  });

  it("'na' cuenta en answered pero no en puntaje, prioridades ni fortalezas", () => {
    const r = computeResults(questions, areas, { q3: 'q3-na' }, conTrata);
    expect(r.visible).toBe(4);
    expect(r.answered).toBe(1);
    expect(r.overall).toBeNull();
    expect(r.priorities).toEqual([]);
    expect(r.strengths).toEqual([]);
    const licitud = r.areas.find((a) => a.area.id === 'licitud');
    expect(licitud?.answered).toBe(1);
    expect(licitud?.score).toBeNull();
  });

  it('calcula el puntaje ponderado', () => {
    const r = computeResults(questions, areas, { q1: 'q1-buena', q2: 'q2-atender' }, conTrata);
    expect(r.overall).toBe(75);
    const inventario = r.areas.find((a) => a.area.id === 'inventario');
    expect(inventario?.score).toBe(75);
  });

  it('una sola respuesta de peso 2 en mejorable da 50', () => {
    const r = computeResults(questions, areas, { q3: 'q3-mejorable' }, conTrata);
    expect(r.overall).toBe(50);
  });

  it('overall es ponderado global y difiere del promedio de áreas', () => {
    const r = computeResults(
      questions,
      areas,
      { q1: 'q1-buena', q2: 'q2-atender', q3: 'q3-mejorable' },
      conTrata,
    );
    expect(r.overall).toBe(67);
    const inventario = r.areas.find((a) => a.area.id === 'inventario');
    const licitud = r.areas.find((a) => a.area.id === 'licitud');
    expect(inventario?.score).toBe(75);
    expect(licitud?.score).toBe(50);
    const promedio = ((inventario?.score ?? 0) + (licitud?.score ?? 0)) / 2;
    expect(promedio).toBe(62.5);
    expect(r.overall).not.toBe(promedio);
  });

  it('devuelve null cuando no hay respuestas puntuables', () => {
    const r = computeResults(questions, areas, {}, conTrata);
    expect(r.overall).toBeNull();
    expect(r.overallLevel).toBeNull();
    for (const a of r.areas) {
      expect(a.score).toBeNull();
      expect(a.level).toBeNull();
    }
  });

  it('incluye un área sin preguntas visibles', () => {
    const r = computeResults(questions, areas, {}, {});
    expect(r.areas.map((a) => a.area.id)).toEqual(['inventario', 'licitud']);
    const licitud = r.areas.find((a) => a.area.id === 'licitud');
    expect(licitud?.visible).toBe(0);
    expect(licitud?.answered).toBe(0);
    expect(licitud?.score).toBeNull();
    expect(licitud?.level).toBeNull();
  });

  it('strengths respeta el orden original', () => {
    const r = computeResults(questions, areas, { q2: 'q2-buena', q1: 'q1-buena' }, conTrata);
    expect(r.strengths.map((f) => f.question.id)).toEqual(['q1', 'q2']);
  });

  it('no muta sus entradas', () => {
    const answers: Answers = { q1: 'q1-buena', q3: 'q3-mejorable' };
    const before = structuredClone({ questions, areas, answers, profile: conTrata });
    computeResults(questions, areas, answers, conTrata);
    expect({ questions, areas, answers, profile: conTrata }).toEqual(before);
  });
});

describe('priorities', () => {
  function makeQuestion(id: string, weight: Weight, effort: Effort, level: Level): Question {
    return {
      id,
      area: 'inventario',
      prompt: id,
      help: '',
      options: [{ id: `${id}-opt`, label: id, level }],
      refs: [],
      recommendation: '',
      weight,
      effort,
    };
  }

  it('ordena por los cuatro criterios de desempate', () => {
    const qs: Question[] = [
      makeQuestion('p1', 2, 'medio', 'mejorable'),
      makeQuestion('p2', 2, 'rapido', 'mejorable'),
      makeQuestion('p3', 3, 'proyecto', 'mejorable'),
      makeQuestion('p4', 1, 'rapido', 'atender'),
      makeQuestion('p5', 3, 'rapido', 'atender'),
      makeQuestion('p6', 3, 'rapido', 'atender'),
    ];
    const answers: Answers = {
      p1: 'p1-opt',
      p2: 'p2-opt',
      p3: 'p3-opt',
      p4: 'p4-opt',
      p5: 'p5-opt',
      p6: 'p6-opt',
    };
    const r = computeResults(qs, areas, answers, {});
    expect(r.priorities.map((f) => f.question.id)).toEqual(['p5', 'p6', 'p4', 'p3', 'p2', 'p1']);
  });
});

describe('recorrido esencial', () => {
  const perfilVacio: Profile = {};
  const perfilCompleto: Profile = {
    terceros: ['contador'],
    personas: ['pacientes', 'menores'],
    canales: ['biometria'],
  };

  it('con perfil vacío devuelve las esenciales sin showIf, en orden', () => {
    expect(coreQuestions(contentQuestions, perfilVacio).map((q) => q.id)).toEqual([
      'inv-lista',
      'lic-marketing',
      'tra-aviso',
      'der-acceso',
      'seg-acceso',
      'seg-respaldo',
      'ter-compartir',
      'inc-plan',
      'cul-confidencialidad',
    ]);
  });

  it('con perfil completo incluye las esenciales condicionales', () => {
    const ids = coreQuestions(contentQuestions, perfilCompleto).map((q) => q.id);
    expect(ids).toHaveLength(13);
    for (const id of ['ter-contrato', 'lic-sensibles', 'lic-biometria', 'lic-menores']) {
      expect(ids).toContain(id);
    }
  });

  it('esenciales y profundizar forman una partición de las visibles', () => {
    for (const profile of [perfilVacio, perfilCompleto]) {
      const visibles = visibleQuestions(contentQuestions, profile).map((q) => q.id);
      const core = coreQuestions(contentQuestions, profile).map((q) => q.id);
      const deep = contentAreas.flatMap((area) =>
        deepQuestions(contentQuestions, profile, area.id).map((q) => q.id),
      );
      const todas = [...core, ...deep];
      expect(new Set(todas).size, 'hay preguntas repetidas').toBe(todas.length);
      expect(new Set(todas)).toEqual(new Set(visibles));
    }
  });

  it('profundizar en seguridad excluye las esenciales e incluye seg-2fa', () => {
    const ids = deepQuestions(contentQuestions, perfilVacio, 'seguridad').map((q) => q.id);
    expect(ids).not.toContain('seg-acceso');
    expect(ids).not.toContain('seg-respaldo');
    expect(ids).toContain('seg-2fa');
  });

  it('con datos sintéticos: core undefined va a profundizar y showIf no cumplido no aparece', () => {
    const sinteticas: Question[] = [
      { ...q1, id: 's-core', core: true },
      { ...q1, id: 's-deep' },
      { ...q3, id: 's-oculta' },
    ];
    expect(coreQuestions(sinteticas, {}).map((q) => q.id)).toEqual(['s-core']);
    expect(deepQuestions(sinteticas, {}, 'inventario').map((q) => q.id)).toEqual(['s-deep']);
    expect(deepQuestions(sinteticas, {}, 'licitud')).toEqual([]);
  });
});
