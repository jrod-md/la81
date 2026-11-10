import { describe, it, expect } from 'vitest';
import { controls, CONTROL_PREFIX, CATALOGO, FUERA_DE_ALCANCE } from './controls';
import { questions } from './questions';
import { areas } from './profile';

describe('contenido: controles', () => {
  it('los ids de control son únicos y tienen el formato esperado', () => {
    const ids = controls.map((control) => control.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const control of controls) {
      expect(/^[A-Z]{3}-\d{2}$/.test(control.id), `id inválido: ${control.id}`).toBe(true);
    }
  });

  it('cada control apunta a una pregunta existente', () => {
    const questionIds = new Set(questions.map((question) => question.id));
    for (const control of controls) {
      expect(
        questionIds.has(control.question),
        `control ${control.id} apunta a ${control.question}`,
      ).toBe(true);
    }
  });

  it('cada pregunta tiene exactamente un control', () => {
    const countByQuestion = new Map<string, number>();
    for (const control of controls) {
      countByQuestion.set(control.question, (countByQuestion.get(control.question) ?? 0) + 1);
    }
    for (const question of questions) {
      expect(countByQuestion.get(question.id) ?? 0, `pregunta ${question.id} sin control`).toBe(1);
    }
  });

  it('el prefijo del id coincide con el área de la pregunta', () => {
    const questionById = new Map(questions.map((question) => [question.id, question] as const));
    for (const control of controls) {
      const question = questionById.get(control.question);
      expect(question, `control ${control.id} apunta a ${control.question}`).toBeDefined();
      if (!question) continue;
      const prefix = CONTROL_PREFIX[question.area];
      expect(
        control.id.startsWith(`${prefix}-`),
        `control ${control.id} no usa el prefijo ${prefix}`,
      ).toBe(true);
    }
  });

  it('la numeración por área es consecutiva desde 01', () => {
    const questionById = new Map(questions.map((question) => [question.id, question] as const));
    const counters = new Map<string, number>();
    for (const control of controls) {
      const question = questionById.get(control.question);
      if (!question) continue;
      const next = (counters.get(question.area) ?? 0) + 1;
      counters.set(question.area, next);
      const expected = `${CONTROL_PREFIX[question.area]}-${String(next).padStart(2, '0')}`;
      expect(
        control.id,
        `control ${control.id} rompe la numeración de ${question.area}`,
      ).toBe(expected);
    }
  });

  it('el orden de controls sigue el orden de questions', () => {
    expect(controls.map((control) => control.question)).toEqual(
      questions.map((question) => question.id),
    );
  });

  it('objetivo, prueba y evidencia no están vacíos', () => {
    for (const control of controls) {
      expect(control.objetivo.trim().length, `objetivo vacío en ${control.id}`).toBeGreaterThan(0);
      expect(control.prueba.trim().length, `prueba vacía en ${control.id}`).toBeGreaterThan(0);
      expect(control.evidencia.length, `evidencia vacía en ${control.id}`).toBeGreaterThan(0);
      for (const item of control.evidencia) {
        expect(item.trim().length, `evidencia vacía en ${control.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('tipo y exigencia tienen valores válidos', () => {
    const tipos = new Set<string>(['preventivo', 'detectivo', 'correctivo']);
    const exigencias = new Set<string>(['expresa', 'derivada', 'voluntaria']);
    for (const control of controls) {
      expect(tipos.has(control.tipo), `tipo inválido en ${control.id}`).toBe(true);
      expect(exigencias.has(control.exigencia), `exigencia inválida en ${control.id}`).toBe(true);
    }
  });

  it('cada control tiene referencias sin duplicados en los tres marcos', () => {
    for (const control of controls) {
      const listas: [string, string[]][] = [
        ['iso27001', control.iso27001],
        ['iso27701', control.iso27701],
        ['nist', control.nist],
      ];
      for (const [marco, lista] of listas) {
        expect(lista.length, `${marco} vacío en ${control.id}`).toBeGreaterThan(0);
        expect(new Set(lista).size, `${marco} con duplicados en ${control.id}`).toBe(lista.length);
      }
    }
  });

  it('los códigos de referencia tienen el formato esperado', () => {
    const re27001 = /^[5-8]\.\d{1,2}$/;
    const re27701 = /^[67]\.\d{1,2}(\.\d{1,2})?$/;
    const reNist = /^[A-Z]{2}\.[A-Z]{2}-P$/;
    for (const control of controls) {
      for (const code of control.iso27001) {
        expect(re27001.test(code), `código ISO 27001 inválido en ${control.id}: ${code}`).toBe(true);
      }
      for (const code of control.iso27701) {
        expect(re27701.test(code), `código ISO 27701 inválido en ${control.id}: ${code}`).toBe(true);
      }
      for (const code of control.nist) {
        expect(reNist.test(code), `código NIST inválido en ${control.id}: ${code}`).toBe(true);
      }
    }
  });

  it('los códigos usados existen en CATALOGO y no hay entradas huérfanas', () => {
    const usados = {
      iso27001: new Set<string>(),
      iso27701: new Set<string>(),
      nist: new Set<string>(),
    };
    for (const control of controls) {
      for (const code of control.iso27001) usados.iso27001.add(code);
      for (const code of control.iso27701) usados.iso27701.add(code);
      for (const code of control.nist) usados.nist.add(code);
    }
    const marcos = ['iso27001', 'iso27701', 'nist'] as const;
    for (const marco of marcos) {
      const catalogo = CATALOGO[marco];
      for (const code of usados[marco]) {
        expect(code in catalogo, `código ${code} de ${marco} no está en CATALOGO`).toBe(true);
      }
      for (const code of Object.keys(catalogo)) {
        expect(usados[marco].has(code), `entrada huérfana ${code} en CATALOGO.${marco}`).toBe(true);
      }
    }
  });

  it('cada área tiene al menos un control', () => {
    const questionById = new Map(questions.map((question) => [question.id, question] as const));
    const areasConControl = new Set<string>();
    for (const control of controls) {
      const question = questionById.get(control.question);
      if (question) areasConControl.add(question.area);
    }
    for (const area of areas) {
      expect(areasConControl.has(area.id), `área ${area.id} sin control`).toBe(true);
    }
  });

  it('FUERA_DE_ALCANCE tiene tema, fuente y razón no vacíos', () => {
    for (const item of FUERA_DE_ALCANCE) {
      expect(item.tema.trim().length, `tema vacío en ${item.tema}`).toBeGreaterThan(0);
      expect(item.fuente.trim().length, `fuente vacía en ${item.tema}`).toBeGreaterThan(0);
      expect(item.razon.trim().length, `razón vacía en ${item.tema}`).toBeGreaterThan(0);
    }
  });

  it('ninguna pregunta se apoya solo en la Guía ANTAI', () => {
    for (const question of questions) {
      const tieneNorma = question.refs.some(
        (ref) => ref.norma === 'Ley 81' || ref.norma === 'DE 285',
      );
      expect(tieneNorma, `pregunta ${question.id} solo se apoya en la Guía ANTAI`).toBe(true);
    }
  });
});
