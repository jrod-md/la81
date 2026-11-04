import type { FormEvent } from 'react';
import { areas, profileQuestions } from '../content/profile';
import { findOption } from '../engine/scoring';
import type { AppState } from './useAppState';
import { LevelTag, RefList, ScreenTitle } from './parts';

const LETTERS = 'abcdefghij';

export function Cuestionario({ app, index }: { app: AppState; index: number }) {
  const total = app.visible.length;
  const safeIndex = Math.min(Math.max(0, index), total - 1);
  const q = app.visible[safeIndex];
  if (!q) return null;

  const area = areas.find((a) => a.id === q.area);
  const areaQs = app.visible.filter((x) => x.area === q.area);
  const firstOfArea = areaQs.indexOf(q) === 0;
  const areaNumber = areas.findIndex((a) => a.id === q.area) + 1;

  const selectedId = app.answers[q.id];
  const selected = findOption(q, selectedId);
  const isLast = safeIndex === total - 1;

  const next = () => (isLast ? app.go({ name: 'resultados' }) : app.go({ name: 'cuestionario', index: safeIndex + 1 }));
  const back = () => {
    if (safeIndex > 0) app.go({ name: 'cuestionario', index: safeIndex - 1 });
    else app.go({ name: 'perfil', step: profileQuestions.length - 1 });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selected) next();
  };

  return (
    <form className="ask" onSubmit={onSubmit}>
      <div className="ask__meta">
        <span>
          Área {areaNumber} de {areas.length} · {area?.title}
        </span>
        <span>
          {safeIndex + 1} de {total}
        </span>
      </div>
      <div className="ticks ticks--dense" aria-hidden="true">
        {app.visible.map((x, i) => (
          <i
            key={x.id}
            className={i === safeIndex ? 'now' : app.answers[x.id] !== undefined ? 'on' : i < safeIndex ? 'skip' : undefined}
          />
        ))}
      </div>

      {firstOfArea && area && <p className="ask__intro">{area.summary}</p>}

      <fieldset className="ask__set">
        <legend>
          <ScreenTitle focusKey={`q-${q.id}`} className="ask__q">
            {q.prompt}
          </ScreenTitle>
        </legend>
        <div className="rows">
          {q.options.map((o, i) => {
            const checked = o.id === selectedId;
            return (
              <label key={o.id} className={`row${checked ? ' is-on' : ''}`}>
                <input type="radio" name={q.id} value={o.id} checked={checked} onChange={() => app.setAnswer(q.id, o.id)} />
                <span className="row__k" aria-hidden="true">
                  {LETTERS[i]}.
                </span>
                <span className="row__t">{o.label}</span>
                <span className="row__lvl">
                  {checked && (o.level === 'na' ? <span className="lvl lvl--na">No aplica</span> : <LevelTag level={o.level} />)}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="ask__note" aria-live="polite">
        {selected?.note && <p>{selected.note}</p>}
      </div>

      <details className="why">
        <summary>¿Por qué importa?</summary>
        <div className="why__body">
          <p>{q.help}</p>
          <RefList refs={q.refs} />
        </div>
      </details>

      <div className="ask__nav">
        <button type="button" className="link" onClick={back}>
          ← Atrás
        </button>
        <span className="ask__nav-r">
          {!selected && (
            <button type="button" className="link" onClick={next}>
              Saltar
            </button>
          )}
          <button type="submit" className="btn" disabled={!selected}>
            {isLast ? 'Ver mi negocio' : 'Siguiente'} <i aria-hidden="true">→</i>
          </button>
        </span>
      </div>
    </form>
  );
}
