import type { FormEvent } from 'react';
import { profileQuestions } from '../content/profile';
import type { AppState } from './useAppState';
import { ScreenTitle } from './parts';

const LETTERS = 'abcdefghij';

export function Perfil({ app, step }: { app: AppState; step: number }) {
  const total = profileQuestions.length;
  const safeStep = Math.min(Math.max(0, step), total - 1);
  const pq = profileQuestions[safeStep];
  if (!pq) return null;

  const selected = app.profile[pq.id] ?? [];
  const canContinue = pq.multi || selected.length > 0;
  const isLast = safeStep === total - 1;

  const toggle = (optionId: string, exclusive: boolean) => {
    if (!pq.multi) {
      app.setProfileAnswer(pq.id, [optionId]);
      return;
    }
    if (selected.includes(optionId)) {
      app.setProfileAnswer(pq.id, selected.filter((id) => id !== optionId));
      return;
    }
    // Una opción exclusiva ("Nadie") no se combina con las demás.
    const exclusiveIds = pq.options.filter((o) => o.exclusive).map((o) => o.id);
    const next = exclusive ? [optionId] : [...selected.filter((id) => !exclusiveIds.includes(id)), optionId];
    app.setProfileAnswer(pq.id, next);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;
    // Las preguntas multi sin respuesta quedan registradas como "ninguna" (arreglo vacío).
    if (pq.multi && app.profile[pq.id] === undefined) app.setProfileAnswer(pq.id, []);
    if (isLast) app.go({ name: 'cuestionario', index: Math.max(0, app.firstPending) });
    else app.go({ name: 'perfil', step: safeStep + 1 });
  };

  const back = () => (safeStep === 0 ? app.go({ name: 'inicio' }) : app.go({ name: 'perfil', step: safeStep - 1 }));

  return (
    <form className="ask" onSubmit={onSubmit}>
      <div className="ask__meta">
        <span>Tu negocio</span>
        <span>
          {safeStep + 1} de {total}
        </span>
      </div>
      <div className="ticks" aria-hidden="true">
        {profileQuestions.map((q, i) => (
          <i key={q.id} className={i < safeStep ? 'on' : i === safeStep ? 'now' : undefined} />
        ))}
      </div>

      <fieldset className="ask__set">
        <legend>
          <p className="ask__num" aria-hidden="true">
            {String(safeStep + 1).padStart(2, '0')}
          </p>
          <ScreenTitle focusKey={`perfil-${pq.id}`} className="ask__q">
            {pq.prompt}
          </ScreenTitle>
        </legend>
        <p className="ask__hint">
          {pq.help ? `${pq.help} ` : ''}
          {pq.multi ? 'Marca todas las que apliquen.' : 'Elige una.'}
        </p>
        <div className="rows">
          {pq.options.map((o, i) => {
            const checked = selected.includes(o.id);
            return (
              <label key={o.id} className={`row${checked ? ' is-on' : ''}`}>
                <input
                  type={pq.multi ? 'checkbox' : 'radio'}
                  name={pq.id}
                  value={o.id}
                  checked={checked}
                  onChange={() => toggle(o.id, o.exclusive === true)}
                />
                <span className="row__k" aria-hidden="true">
                  {LETTERS[i]}.
                </span>
                <span className="row__t">{o.label}</span>
                <span className={`row__box row__box--${pq.multi ? 'check' : 'radio'}`} aria-hidden="true" />
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="ask__nav">
        <button type="button" className="link" onClick={back}>
          ← Atrás
        </button>
        <button type="submit" className="btn" disabled={!canContinue}>
          {isLast ? 'Empezar el recorrido' : 'Continuar'} <i aria-hidden="true">→</i>
        </button>
      </div>
    </form>
  );
}
