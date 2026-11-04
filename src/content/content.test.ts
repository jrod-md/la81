import { describe, it, expect } from 'vitest';
import { questions } from './questions';
import { areas, profileQuestions } from './profile';

describe('contenido: preguntas', () => {
  it('los ids de las preguntas son únicos', () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cada pregunta pertenece a un área existente', () => {
    const areaIds = new Set(areas.map((a) => a.id));
    for (const q of questions) {
      expect(areaIds.has(q.area), `pregunta ${q.id} usa el área ${q.area}`).toBe(true);
    }
  });

  it('cada pregunta tiene al menos 2 opciones, ids únicos y una opción buena', () => {
    for (const q of questions) {
      expect(q.options.length, `pregunta ${q.id} tiene menos de 2 opciones`).toBeGreaterThanOrEqual(
        2,
      );
      const optionIds = q.options.map((o) => o.id);
      expect(new Set(optionIds).size, `pregunta ${q.id} repite ids de opción`).toBe(
        optionIds.length,
      );
      expect(
        q.options.some((o) => o.level === 'buena'),
        `pregunta ${q.id} no tiene ninguna opción buena`,
      ).toBe(true);
    }
  });

  it('cada pregunta tiene al menos una referencia con artículo no vacío', () => {
    for (const q of questions) {
      expect(q.refs.length, `pregunta ${q.id} no tiene referencias`).toBeGreaterThanOrEqual(1);
      for (const ref of q.refs) {
        expect(ref.articulo.trim().length, `referencia de ${q.id} sin artículo`).toBeGreaterThan(0);
      }
    }
  });

  it('prompt, help y recommendation no están vacíos', () => {
    for (const q of questions) {
      expect(q.prompt.trim().length, `prompt vacío en ${q.id}`).toBeGreaterThan(0);
      expect(q.help.trim().length, `help vacío en ${q.id}`).toBeGreaterThan(0);
      expect(q.recommendation.trim().length, `recommendation vacía en ${q.id}`).toBeGreaterThan(0);
    }
  });

  it('showIf apunta a una pregunta de perfil y a opciones existentes', () => {
    const profileById = new Map(profileQuestions.map((p) => [p.id, p] as const));
    for (const q of questions) {
      const showIf = q.showIf;
      if (!showIf) continue;
      const profileQuestion = profileById.get(showIf.profile);
      expect(profileQuestion, `showIf de ${q.id} apunta a ${showIf.profile}`).toBeDefined();
      if (!profileQuestion) continue;
      expect(showIf.anyOf.length, `showIf de ${q.id} no tiene anyOf`).toBeGreaterThan(0);
      const optionIds = new Set(profileQuestion.options.map((o) => o.id));
      for (const id of showIf.anyOf) {
        expect(optionIds.has(id), `showIf de ${q.id} usa la opción ${id}`).toBe(true);
      }
    }
  });

  it('cada área tiene al menos una pregunta sin showIf', () => {
    for (const area of areas) {
      const hasUnconditional = questions.some((q) => q.area === area.id && !q.showIf);
      expect(hasUnconditional, `área ${area.id} solo tiene preguntas condicionales`).toBe(true);
    }
  });

  it('weight y effort tienen valores válidos', () => {
    const weights = new Set<number>([1, 2, 3]);
    const efforts = new Set<string>(['rapido', 'medio', 'proyecto']);
    for (const q of questions) {
      expect(weights.has(q.weight), `weight inválido en ${q.id}`).toBe(true);
      expect(efforts.has(q.effort), `effort inválido en ${q.id}`).toBe(true);
    }
  });

  it('cada área tiene al menos una pregunta esencial sin showIf', () => {
    for (const area of areas) {
      const hasCore = questions.some((q) => q.area === area.id && q.core === true && !q.showIf);
      expect(hasCore, `área ${area.id} no tiene pregunta esencial sin showIf`).toBe(true);
    }
  });

  it('las preguntas esenciales tienen weight 2 o 3', () => {
    for (const q of questions) {
      if (q.core !== true) continue;
      expect(q.weight === 2 || q.weight === 3, `weight inválido en la esencial ${q.id}`).toBe(true);
    }
  });
});

describe('contenido: perfil y áreas', () => {
  it('los ids de las áreas son únicos', () => {
    const ids = areas.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('los ids de profileQuestions son únicos', () => {
    const ids = profileQuestions.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('los ids de opción son únicos dentro de cada pregunta de perfil', () => {
    for (const p of profileQuestions) {
      const optionIds = p.options.map((o) => o.id);
      expect(new Set(optionIds).size, `pregunta de perfil ${p.id} repite ids de opción`).toBe(
        optionIds.length,
      );
    }
  });
});
