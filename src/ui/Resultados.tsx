import { useMemo, useRef, useState } from 'react';
import { areas, profileQuestions } from '../content/profile';
import { Drawing } from '../drawing/Drawing';
import { buildScene, featuresFromProfile } from '../drawing/scene';
import type { AreaId, Level } from '../engine/types';
import type { AppState } from './useAppState';
import { EFFORT_LABEL, formatDate, formatRef } from './labels';
import { LevelMark, LevelTag, RefList, ScreenTitle, useResults } from './parts';

const HEADLINE: Record<Level, string> = {
  buena: 'Tu negocio va bien encaminado',
  mejorable: 'Vas por buen camino, y hay cosas por mejorar',
  atender: 'Hay puntos importantes que conviene atender',
};

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export function Resultados({ app }: { app: AppState }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [hot, setHot] = useState<AreaId | null>(null);
  const [focus, setFocus] = useState<AreaId | null>(null);
  const [showAll, setShowAll] = useState(false);
  const plateRef = useRef<HTMLElement>(null);
  const show = (a: AreaId) => {
    setFocus(a);
    plateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  const FIRST = 5;
  const { results, statuses } = useResults(app.profile, app.answers);
  const scene = useMemo(() => buildScene(featuresFromProfile(app.profile), false), [app.profile]);
  const today = useMemo(() => new Date(), []);

  const nAtender = results.priorities.filter((f) => f.level === 'atender').length;
  const nMejorable = results.priorities.length - nAtender;
  const skipped = results.visible - results.answered;
  const placeOf = (area: AreaId) => scene.callouts.find((c) => c.area === area);

  const profileSummary = profileQuestions.map((pq) => {
    const ids = app.profile[pq.id] ?? [];
    const labels = pq.options.filter((o) => ids.includes(o.id)).map((o) => o.label);
    return { id: pq.id, prompt: pq.prompt, value: labels.length > 0 ? labels.join(', ') : 'Ninguna de las opciones' };
  });

  return (
    <div className="resultados">
      <header className="print-only report-head">
        <p>La 81 · Reporte de autoevaluación de protección de datos</p>
        <p>{formatDate(today)}</p>
      </header>

      <section className="open open--results">
        <p className="kicker">Tu negocio, revisado</p>
        <ScreenTitle focusKey="resultados" className="display display--results">
          {results.overallLevel ? HEADLINE[results.overallLevel] : 'Todavía no hay suficientes respuestas'}
        </ScreenTitle>
        <div className="open__row">
          {results.overallLevel ? (
            <p className="counts">
              <span>
                <LevelMark level="buena" /> {plural(results.strengths.length, 'buena práctica', 'buenas prácticas')}
              </span>
              <span>
                <LevelMark level="mejorable" /> {plural(nMejorable, 'punto por mejorar', 'puntos por mejorar')}
              </span>
              <span>
                <LevelMark level="atender" /> {plural(nAtender, 'punto para atender pronto', 'puntos para atender pronto')}
              </span>
            </p>
          ) : (
            <p className="deck">Responde algunas preguntas para ver cómo va tu negocio.</p>
          )}
          <div className="cta no-print">
            <button type="button" className="btn" onClick={() => window.print()}>
              Descargar reporte (PDF) <i aria-hidden="true">↓</i>
            </button>
            <span className="micro">Se abre la ventana de impresión: elige «Guardar como PDF».</span>
            <button type="button" className="link" onClick={() => app.go({ name: 'cuestionario', index: 0 })}>
              Revisar mis respuestas
            </button>
          </div>
        </div>
        {skipped > 0 && (
          <p className="micro skipped">
            {plural(skipped, 'pregunta sin responder', 'preguntas sin responder')}; no cuentan en el resultado.{' '}
            <button
              type="button"
              className="link no-print"
              onClick={() => app.go({ name: 'cuestionario', index: Math.max(0, app.firstPending) })}
            >
              Responderlas
            </button>
          </p>
        )}
      </section>

      <section className="spread" aria-label="Tu negocio por área">
        <figure className="plate plate--spread" ref={plateRef}>
          <Drawing
            scene={scene}
            statuses={statuses}
            hot={hot}
            onHot={setHot}
            focus={focus}
            onSelect={(a) => setFocus((f) => (f === a ? null : a))}
            label="Dibujo de tu negocio con el estado de cada área"
          />
          <figcaption>
            <b>Fig. 1</b>
            <span>Tu negocio, área por área. Toca un número para verlo de cerca.</span>
            {focus && (
              <button type="button" className="link no-print" onClick={() => setFocus(null)}>
                Ver todo
              </button>
            )}
          </figcaption>
        </figure>

        <div className="notes">
          <p className="rubric">Por área</p>
          <ol>
            {results.areas.map((a) => {
              const c = placeOf(a.area.id);
              const top = results.priorities.find((f) => f.question.area === a.area.id);
              return (
                <li
                  key={a.area.id}
                  className={`note${hot === a.area.id || focus === a.area.id ? ' hot' : ''}`}
                  onPointerEnter={() => setHot(a.area.id)}
                  onPointerLeave={() => setHot(null)}
                >
                  <span className="note__n">{c?.n}</span>
                  <h2 className="note__t">
                    <button type="button" className="note__btn" onClick={() => show(a.area.id)} aria-label={`${a.area.title}: ver en el dibujo`}>
                      {a.area.title}
                    </button>
                  </h2>
                  <p className="note__p">
                    {c && c.place !== a.area.title && <span className="note__place">{c.place}. </span>}
                    {top ? top.question.recommendation : a.level ? 'Aquí vas bien. Mantén lo que haces.' : a.area.summary}
                  </p>
                  {a.level ? <LevelTag level={a.level} /> : <span className="lvl lvl--na">Sin respuestas</span>}
                  {a.score !== null && <span className="visually-hidden"> ({a.score} de 100)</span>}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="print-only report-profile" aria-label="Perfil del negocio">
        <h2 className="rubric">Perfil del negocio</h2>
        <dl>
          {profileSummary.map((p) => (
            <div key={p.id}>
              <dt>{p.prompt}</dt>
              <dd>{p.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {results.priorities.length > 0 && (
        <section className={`plansec${showAll ? ' is-all' : ''}`} aria-labelledby="h-plan">
          <div className="plansec__head">
            <h2 id="h-plan" className="plansec__title">
              Tu plan de acción
            </h2>
            <p className="micro">Empieza por estos {Math.min(FIRST, results.priorities.length)}: son los más urgentes, y lo rápido de hacer va primero.</p>
          </div>
          <ol>
            {results.priorities.map((f, i) => {
              const area = areas.find((a) => a.id === f.question.area);
              const c = placeOf(f.question.area);
              return (
                <li key={f.question.id} className={`step${i >= FIRST ? ' step--rest' : ''}`}>
                  <span className="step__n" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="step__body">
                    <p className="step__rec">{f.question.recommendation}</p>
                    <p className="step__meta">
                      <LevelTag level={f.level} />
                      <span>{EFFORT_LABEL[f.question.effort]}</span>
                      {area && <span>{area.title}</span>}
                      {c && <span>Punto {c.n}</span>}
                    </p>
                    <details className="why no-print">
                      <summary>Detalle y fuentes</summary>
                      <div className="why__body">
                        <p>
                          <b>Situación:</b> {f.question.prompt}
                        </p>
                        <p>
                          <b>Tu respuesta:</b> {f.option.label}
                        </p>
                        <p>{f.question.help}</p>
                        <RefList refs={f.question.refs} />
                      </div>
                    </details>
                    <p className="print-only step__print">
                      Tu respuesta: {f.option.label}. Fuentes: {f.question.refs.map(formatRef).join('; ')}.
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
          {results.priorities.length > FIRST && (
            <button type="button" className="link plansec__more no-print" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
              {showAll ? 'Mostrar solo los primeros 5' : `Ver los otros ${results.priorities.length - FIRST} puntos`}
            </button>
          )}
        </section>
      )}

      {results.strengths.length > 0 && (
        <section className="strengths" aria-labelledby="h-strengths">
          <h2 id="h-strengths" className="rubric">
            Lo que ya haces bien
          </h2>
          <ul>
            {results.strengths.map((f) => (
              <li key={f.question.id}>
                <LevelMark level="buena" />
                <span>
                  {f.question.prompt} <span className="muted">{f.option.label}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="after">
        <h2 className="rubric">¿Y ahora?</h2>
        <p>
          Guarda este reporte y repite la evaluación en unos meses para ver tu avance. Si tienes dudas sobre un caso
          concreto, consulta a un abogado o escribe a la ANTAI: protecciondedatos@antai.gob.pa.
        </p>
        <div className="no-print">
          {confirmReset ? (
            <span className="confirm" role="group" aria-label="Confirmar">
              <span>Se borrarán tus respuestas de este dispositivo.</span>
              <button type="button" className="link link--danger" onClick={app.reset}>
                Sí, borrar todo
              </button>
              <button type="button" className="link" onClick={() => setConfirmReset(false)}>
                Cancelar
              </button>
            </span>
          ) : (
            <button type="button" className="link" onClick={() => setConfirmReset(true)}>
              Borrar mis respuestas
            </button>
          )}
        </div>
      </section>

      <footer className="print-only report-foot">
        <p>
          Autoevaluación orientativa basada en la Ley 81 de 2019 y el Decreto Ejecutivo 285 de 2021. No es asesoría
          legal ni una auditoría, y no certifica cumplimiento. Las respuestas se procesaron solo en el navegador de
          quien completó la evaluación.
        </p>
      </footer>
    </div>
  );
}
