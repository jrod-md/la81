import { useMemo, useState } from 'react';
import { CATALOGO, FUERA_DE_ALCANCE, MARCOS, controls } from '../content/controls';
import { areas, profileQuestions } from '../content/profile';
import { questions } from '../content/questions';
import { MATRIX_HEADERS, buildMatrix, matrixToCsv, refText } from '../engine/matrix';
import type { AreaId, Exigencia, Marco, MatrixRow, Question, Weight } from '../engine/types';
import type { AppState } from './useAppState';
import { ScreenTitle } from './parts';

const EXIGENCIA: Record<Exigencia, { label: string; text: string }> = {
  expresa: { label: 'Expresa', text: 'La norma lo pide en esos términos.' },
  derivada: {
    label: 'Derivada',
    text: 'Medida concreta para cumplir un deber general, como el de seguridad. La norma no la nombra.',
  },
  voluntaria: { label: 'Voluntaria', text: 'La norma la sugiere sin obligar al sector privado.' },
};
const EXIGENCIAS: Exigencia[] = ['expresa', 'derivada', 'voluntaria'];
const CRITICIDAD: Record<Weight, string> = { 3: 'Alta', 2: 'Media', 1: 'Baja' };
const TIPO = { preventivo: 'Preventivo', detectivo: 'Detectivo', correctivo: 'Correctivo' } as const;
const MARCO_ORDER: Marco[] = ['iso27001', 'iso27701', 'nist'];
const FILE_NAME = 'la81-matriz-de-controles.csv';

/** Condición de perfil en palabras: a qué negocios se les hace la pregunta. */
function appliesTo(q: Question): string {
  if (!q.showIf) return 'Todos los negocios';
  const pq = profileQuestions.find((p) => p.id === q.showIf?.profile);
  const labels = pq?.options.filter((o) => q.showIf?.anyOf.includes(o.id)).map((o) => o.label) ?? [];
  return `Solo si en «${pq?.prompt ?? ''}» se marcó: ${labels.join('; ')}`;
}

function download(rows: MatrixRow[]) {
  const url = URL.createObjectURL(new Blob([matrixToCsv(rows)], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = FILE_NAME;
  a.click();
  URL.revokeObjectURL(url);
}

/** Metodología: la matriz de controles detrás del cuestionario, cómo se califica y qué no cubre. */
export function Metodologia({ app }: { app: AppState }) {
  const rows = useMemo(() => buildMatrix(controls, questions, areas), []);
  const [filter, setFilter] = useState<AreaId | null>(null);
  const shown = filter ? rows.filter((r) => r.area.id === filter) : rows;
  const count = (e: Exigencia) => rows.filter((r) => r.control.exigencia === e).length;
  const nCore = rows.filter((r) => r.question.core === true).length;

  return (
    <article className="metodo">
      <header className="metodo__open">
        <p className="kicker">Metodología · Cómo se construyó la evaluación</p>
        <ScreenTitle focusKey="metodologia" className="display display--results">
          Matriz de controles
        </ScreenTitle>
        <div className="metodo__row">
          <p className="deck">
            Cada pregunta de La 81 evalúa un control. Aquí está de qué artículo sale cada uno, cómo lo comprobaría un tercero y dónde
            vive ese mismo tema en ISO 27001, ISO 27701 y el NIST Privacy Framework.
          </p>
          <div className="cta">
            <button type="button" className="btn" onClick={() => download(rows)}>
              Descargar la matriz <i aria-hidden="true">↓</i>
            </button>
            <span className="micro">
              Archivo CSV, se abre en Excel. {rows.length} controles, {MATRIX_HEADERS.length} columnas.
            </span>
          </div>
        </div>
        <dl className="facts">
          <div>
            <dt>Controles</dt>
            <dd>
              {rows.length} en {areas.length} áreas
            </dd>
          </div>
          <div>
            <dt>Exigencia</dt>
            <dd>
              {count('expresa')} expresa · {count('derivada')} derivada · {count('voluntaria')} voluntaria
            </dd>
          </div>
          <div>
            <dt>Recorrido</dt>
            <dd>
              {nCore} esenciales · {rows.length - nCore} para profundizar
            </dd>
          </div>
          <div>
            <dt>Fuentes</dt>
            <dd>Ley 81 de 2019 · DE 285 de 2021 · Guía de la ANTAI</dd>
          </div>
        </dl>
      </header>

      <section className="metodo__sec" aria-labelledby="m-leer">
        <h2 id="m-leer" className="rubric">
          Cómo leerla
        </h2>
        <dl className="defs">
          <div>
            <dt>Fuente legal</dt>
            <dd>Artículo y numeral de la Ley 81 o del Decreto Ejecutivo 285 que sustenta el control. «33.8» es el numeral 8 del artículo 33.</dd>
          </div>
          <div>
            <dt>Exigencia</dt>
            <dd>
              {EXIGENCIAS.map((e) => (
                <span key={e} className="defs__line">
                  <b>{EXIGENCIA[e].label}.</b> {EXIGENCIA[e].text}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt>Criticidad</dt>
            <dd>Peso del control en el puntaje. Alta: obligación central de la ley. Baja: buena práctica complementaria.</dd>
          </div>
          <div>
            <dt>Prueba y evidencia</dt>
            <dd>
              Cómo comprobaría el control alguien de afuera y qué pediría ver. La herramienta no hace esa comprobación: registra lo que
              el negocio declara.
            </dd>
          </div>
        </dl>
      </section>

      <section className="metodo__sec" aria-labelledby="m-ctl">
        <h2 id="m-ctl" className="rubric">
          Los {rows.length} controles
        </h2>
        <div className="mfilter" role="group" aria-label="Filtrar por área">
          <button type="button" className="mfilter__b" aria-pressed={filter === null} onClick={() => setFilter(null)}>
            Todas
          </button>
          {areas.map((a) => (
            <button key={a.id} type="button" className="mfilter__b" aria-pressed={filter === a.id} onClick={() => setFilter(a.id)}>
              {a.title}
            </button>
          ))}
        </div>
        <div className="ctl-head" aria-hidden="true">
          <span>ID</span>
          <span>Objetivo de control</span>
          <span>Fuente legal</span>
          <span>Exigencia</span>
          <span>Criticidad</span>
        </div>
        <ul className="ctls">
          {shown.map(({ control: c, question: q, area }) => (
            <li key={c.id}>
              <details className="ctl">
                <summary>
                  <span className="ctl__id">{c.id}</span>
                  <span className="ctl__obj">{c.objetivo}</span>
                  <span className="ctl__src">{q.refs.map(refText).join(' · ')}</span>
                  <span className="ctl__exi" data-e={c.exigencia}>
                    {EXIGENCIA[c.exigencia].label}
                  </span>
                  <span className="ctl__cri">
                    <span className="ctl__cri-l">Criticidad </span>
                    {CRITICIDAD[q.weight]}
                  </span>
                </summary>
                <dl className="ctl__body">
                  <div>
                    <dt>Pregunta de evaluación</dt>
                    <dd>{q.prompt}</dd>
                  </div>
                  <div>
                    <dt>Procedimiento de prueba</dt>
                    <dd>{c.prueba}</dd>
                  </div>
                  <div>
                    <dt>Evidencia esperada</dt>
                    <dd>
                      <ul>
                        {c.evidencia.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div>
                    <dt>Recomendación</dt>
                    <dd>{q.recommendation}</dd>
                  </div>
                  <div>
                    <dt>Clasificación</dt>
                    <dd>
                      {area.title} · {TIPO[c.tipo]} · {q.core === true ? 'Recorrido esencial' : 'Profundizar'}
                      <span className="defs__line">{appliesTo(q)}</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Otros marcos</dt>
                    <dd>
                      {MARCO_ORDER.map((m) => (
                        <span key={m} className="defs__line">
                          <b>
                            {MARCOS[m].nombre}:{MARCOS[m].version}
                          </b>{' '}
                          {c[m].map((code) => `${m === 'iso27001' ? 'A.' : ''}${code} ${CATALOGO[m][code] ?? ''}`).join(' · ')}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <section className="metodo__sec" aria-labelledby="m-cal">
        <h2 id="m-cal" className="rubric">
          Cómo se califica
        </h2>
        <ol className="steps">
          <li>
            <p>
              <b>Cada respuesta vale 1, 0.5 o 0.</b> Buena práctica, puede mejorar o atender pronto. «No aplica» no entra en la cuenta.
            </p>
          </li>
          <li>
            <p>
              <b>Cada control pesa según su criticidad.</b> Alta 3, media 2, baja 1.
            </p>
          </li>
          <li>
            <p>
              <b>El resultado de un área es el promedio ponderado, de 0 a 100.</b> Desde 80, bien encaminado. De 50 a 79, puede mejorar.
              Menos de 50, atender pronto. El resultado general usa la misma cuenta con todas las respuestas.
            </p>
          </li>
          <li>
            <p>
              <b>El plan de acción se ordena por riesgo y luego por esfuerzo.</b> Primero lo que hay que atender pronto; dentro de cada
              nivel, la criticidad más alta; a igual criticidad, lo más rápido de hacer.
            </p>
          </li>
          <li>
            <p>
              <b>Solo se preguntan los controles que aplican.</b> El perfil del negocio decide cuáles: sin cámaras no se pregunta por el
              letrero, sin proveedores no se pregunta por contratos.
            </p>
          </li>
        </ol>
      </section>

      <section className="metodo__sec" aria-labelledby="m-marcos">
        <h2 id="m-marcos" className="rubric">
          Relación con otros marcos
        </h2>
        <p className="metodo__p">
          Las referencias son orientativas. Indican dónde trata ese marco un tema parecido, para quien ya trabaja con él. No expresan
          equivalencia ni conformidad con la norma citada.
        </p>
        <ul className="marcos">
          {MARCO_ORDER.map((m) => (
            <li key={m}>
              <b>
                {MARCOS[m].nombre}:{MARCOS[m].version}
              </b>
              <span>
                {MARCOS[m].nivel} · {Object.keys(CATALOGO[m]).length} referencias distintas
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="metodo__sec" aria-labelledby="m-fuera">
        <h2 id="m-fuera" className="rubric">
          Lo que no cubre
        </h2>
        <ul className="fuera">
          {FUERA_DE_ALCANCE.map((f) => (
            <li key={f.tema}>
              <b>{f.tema}</b>
              <span className="fuera__src">{f.fuente}</span>
              <span>{f.razon}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="metodo__sec" aria-labelledby="m-lim">
        <h2 id="m-lim" className="rubric">
          Límites
        </h2>
        <ul className="limits">
          <li>Es una autoevaluación. El resultado refleja lo que el negocio declara; nadie revisa la evidencia.</li>
          <li>No es una auditoría ni asesoría legal, no certifica cumplimiento y no sustituye la revisión de un abogado.</li>
          <li>La clasificación de exigencia es una lectura del texto de la norma, no un criterio de la ANTAI.</li>
          <li>Los pesos y los umbrales de 80 y 50 son una decisión de diseño, no un estándar.</li>
        </ul>
        <button type="button" className="link" onClick={() => app.go({ name: 'inicio' })}>
          ← Volver al inicio
        </button>
      </section>
    </article>
  );
}
