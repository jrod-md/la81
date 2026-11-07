import { areas, profileQuestions } from '../content/profile';
import { Drawing } from '../drawing/Drawing';
import type { Scene } from '../drawing/scene';
import type { AreaId, Level, Results } from '../engine/types';
import type { AppState } from './useAppState';
import { EFFORT_LABEL, formatDate, formatRef } from './labels';
import { LevelMark, LevelTag } from './parts';

const HEADLINE: Record<Level, string> = {
  buena: 'Tu negocio va bien encaminado',
  mejorable: 'Vas por buen camino, y hay cosas por mejorar',
  atender: 'Hay puntos importantes que conviene atender',
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

interface Props {
  app: AppState;
  results: Results;
  scene: Scene;
  statuses: Partial<Record<AreaId, Level>>;
  today: Date;
}

/** Reporte para imprimir o guardar como PDF (tamaño carta). En pantalla no se ve. */
export function Reporte({ app, results, scene, statuses, today }: Props) {
  const label = (q: string) => {
    const pq = profileQuestions.find((p) => p.id === q);
    const ids = app.profile[q] ?? [];
    return pq?.options.filter((o) => ids.includes(o.id)).map((o) => o.label) ?? [];
  };
  const tipo = label('tipo')[0];
  const tamano = label('tamano')[0];
  const nAtender = results.priorities.filter((f) => f.level === 'atender').length;
  const nMejorable = results.priorities.length - nAtender;
  const pendingDeep = Object.values(app.deepPending).reduce((a, b) => a + b, 0);
  const placeOf = (a: AreaId) => scene.callouts.find((c) => c.area === a);

  return (
    <article className="report print-only">
      <header className="rp-head">
        <p className="rp-brand">
          La 81<sup>PA</sup>
        </p>
        <p className="rp-meta">
          <span>Reporte de autoevaluación · Protección de datos personales</span>
          <span>
            {formatDate(today)} · {app.quick ? 'Revisión rápida' : 'Revisión completa'}
          </span>
        </p>
      </header>

      <section className="rp-cover">
        {(tipo || tamano) && (
          <p className="rp-kicker">
            {tipo}
            {tipo && tamano ? ' · ' : ''}
            {tamano && `${tamano} ${tamano === 'Solo yo' ? '' : 'personas'}`.trim()}
          </p>
        )}
        <h1 className="rp-title">{results.overallLevel ? HEADLINE[results.overallLevel] : 'Todavía no hay suficientes respuestas'}</h1>
        <p className="rp-counts">
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

        <figure className="rp-fig">
          <Drawing scene={scene} statuses={statuses} intro={false} label="Dibujo del negocio con el estado de cada área" />
          <figcaption>
            <b>Fig. 1</b> Tu negocio, área por área. Cada número marca el lugar donde vive ese tema.
          </figcaption>
        </figure>

        <table className="rp-areas">
          <thead>
            <tr>
              <th scope="col">Punto</th>
              <th scope="col">Área</th>
              <th scope="col">Estado</th>
              <th scope="col">Respondidas</th>
            </tr>
          </thead>
          <tbody>
            {results.areas.map((a) => {
              const c = placeOf(a.area.id);
              return (
                <tr key={a.area.id}>
                  <td>
                    <span className="rp-n" data-s={a.level ?? 'pending'}>
                      {c?.n}
                    </span>
                  </td>
                  <td>
                    <b>{a.area.title}</b>
                    {c && c.place !== a.area.title && <span className="rp-place"> · {c.place}</span>}
                  </td>
                  <td>{a.level ? <LevelTag level={a.level} /> : <span className="lvl lvl--na">Sin respuestas</span>}</td>
                  <td className="rp-num">
                    {a.answered} de {a.visible}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {results.priorities.length > 0 && (
        <section className="rp-plan">
          <h2 className="rp-h2">Tu plan de acción</h2>
          <p className="rp-lede">
            {plural(results.priorities.length, 'punto', 'puntos')}, del más urgente al menos urgente. Dentro de cada nivel, lo que se resuelve
            rápido va primero.
          </p>
          <ol>
            {results.priorities.map((f, i) => {
              const area = areas.find((a) => a.id === f.question.area);
              const c = placeOf(f.question.area);
              return (
                <li key={f.question.id} className="rp-step">
                  <span className="rp-step__n">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="rp-step__rec">{f.question.recommendation}</p>
                    <p className="rp-step__meta">
                      <LevelTag level={f.level} />
                      <span>{EFFORT_LABEL[f.question.effort]}</span>
                      {area && <span>{area.title}</span>}
                      {c && <span>Punto {c.n}</span>}
                    </p>
                    <p className="rp-step__ctx">
                      <b>Situación:</b> {f.question.prompt} <b>Tu respuesta:</b> {f.option.label}
                    </p>
                    <p className="rp-step__refs">Fuentes: {f.question.refs.map(formatRef).join('; ')}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {results.strengths.length > 0 && (
        <section className="rp-good">
          <h2 className="rp-h2">Lo que ya haces bien</h2>
          <ul>
            {results.strengths.map((f) => (
              <li key={f.question.id}>
                <LevelMark level="buena" />
                <span>
                  {f.question.prompt} <span className="rp-muted">{f.option.label}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rp-next">
        <h2 className="rp-h2">Próximos pasos</h2>
        <ol>
          <li>Empieza por los primeros puntos del plan: son los que más riesgo reducen.</li>
          {app.quick && pendingDeep > 0 && (
            <li>
              Esta fue una revisión rápida. Responde las {pendingDeep} preguntas restantes en «Profundizar» para tener un resultado completo.
            </li>
          )}
          <li>Repite la evaluación en unos seis meses para ver tu avance.</li>
          <li>Si tienes dudas sobre un caso concreto, consulta a un abogado o escribe a la ANTAI: protecciondedatos@antai.gob.pa.</li>
        </ol>
      </section>

      <section className="rp-profile">
        <h2 className="rp-h2">Perfil del negocio</h2>
        <dl>
          {profileQuestions.map((pq) => {
            const v = label(pq.id);
            return (
              <div key={pq.id}>
                <dt>{pq.prompt}</dt>
                <dd>{v.length > 0 ? v.join(', ') : 'Ninguna de las opciones'}</dd>
              </div>
            );
          })}
        </dl>
      </section>

      <footer className="rp-foot">
        Autoevaluación orientativa basada en la Ley 81 de 2019 y el Decreto Ejecutivo 285 de 2021. No es asesoría legal ni una auditoría, y no
        certifica cumplimiento. Las respuestas se procesaron solo en el navegador de quien completó la evaluación.
      </footer>
    </article>
  );
}
