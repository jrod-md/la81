import type { CSSProperties, FormEvent } from 'react';
import { profileQuestions } from '../content/profile';
import { Drawing } from '../drawing/Drawing';
import type { Scene } from '../drawing/scene';
import type { AppState } from './useAppState';
import { FichaDibujo, fichaTexto } from './Fichas';
import { ScreenTitle } from './parts';
import { fitView, useRoom } from './Room';

/** Las preguntas del perfil: el local se arma detrás mientras se responde. */
export function Perfil({ app, step, scene }: { app: AppState; step: number; scene: Scene }) {
  const { stageRef, topRef, dockRef, geo } = useRoom();
  const total = profileQuestions.length;
  const safeStep = Math.min(Math.max(0, step), total - 1);
  const pq = profileQuestions[safeStep];
  if (!pq) return null;

  const selected = app.profile[pq.id] ?? [];
  const canContinue = pq.multi || selected.length > 0;
  const isLast = safeStep === total - 1;
  const first = safeStep === 0;

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

  const back = first ? (app.started ? () => app.go({ name: 'inicio' }) : null) : () => app.go({ name: 'perfil', step: safeStep - 1 });
  const nextLabel = isLast ? 'Empezar el día' : pq.multi && selected.length === 0 ? 'Ninguna, seguir' : 'Seguir';

  return (
    <section className="room room--perfil" aria-label="Tu negocio">
      <div className="room__stage" ref={stageRef}>
        {geo && <Drawing scene={scene} statuses={{}} view={fitView(scene.viewBox, geo)} bare label="Dibujo de tu negocio, se arma con tus respuestas" />}
      </div>

      <div className="room__top" ref={topRef}>
        <p className="room__step">
          Tu negocio <b>{safeStep + 1}</b> de {total}
        </p>
        <div className="ticks" aria-hidden="true">
          {profileQuestions.map((q, i) => (
            <i key={q.id} className={i < safeStep ? 'on' : i === safeStep ? 'now' : undefined} />
          ))}
        </div>
      </div>

      <div className="room__dock" ref={dockRef}>
        <form className="sheet" onSubmit={onSubmit} key={pq.id}>
          {first && (
            <p className="sheet__intro">
              Revisa en cinco minutos cómo cuidas los datos de las personas en tu negocio, según la Ley 81 de Panamá. Tus respuestas
              no salen de este dispositivo.
            </p>
          )}
          <fieldset className="sheet__set">
            <legend>
              <ScreenTitle focusKey={`perfil-${pq.id}`} className="sheet__q">
                {pq.prompt}
              </ScreenTitle>
            </legend>
            <p className="sheet__hint">{pq.multi ? 'Marca todas las que apliquen.' : (pq.help ?? 'Elige una.')}</p>
            <div className="fichas" style={{ '--n': pq.options.length } as CSSProperties}>
              {pq.options.map((o) => {
                const checked = selected.includes(o.id);
                const [t, sub] = fichaTexto(pq.id, o.id, o.label);
                return (
                  <label key={o.id} className={`ficha${checked ? ' is-on' : ''}`} title={o.label}>
                    <input
                      type={pq.multi ? 'checkbox' : 'radio'}
                      name={pq.id}
                      value={o.id}
                      checked={checked}
                      onChange={() => toggle(o.id, o.exclusive === true)}
                    />
                    <FichaDibujo pregunta={pq.id} opcion={o.id} />
                    <span className="ficha__t">{t}</span>
                    {sub && <span className="ficha__s">{sub}</span>}
                    <span className={`ficha__mark ficha__mark--${pq.multi ? 'check' : 'radio'}`} aria-hidden="true" />
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="sheet__nav">
            {back ? (
              <button type="button" className="link" onClick={back}>
                ← Atrás
              </button>
            ) : (
              <span className="micro">Gratis · Sin registro</span>
            )}
            <button type="submit" className="btn" disabled={!canContinue}>
              {nextLabel} <i aria-hidden="true">→</i>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
