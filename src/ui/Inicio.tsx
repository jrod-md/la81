import { useMemo, useRef, useState } from 'react';
import { profileQuestions } from '../content/profile';
import { Drawing } from '../drawing/Drawing';
import { DEMO_FEATURES, buildScene } from '../drawing/scene';
import type { AreaId, Level } from '../engine/types';
import type { AppState } from './useAppState';
import { LevelTag, ScreenTitle } from './parts';
import { formatDate } from './labels';

/** Notas del negocio de ejemplo: una farmacia de barrio. */
const DEMO: Record<AreaId, { text: string; level: Level }> = {
  inventario: { text: 'Recetas y expedientes: ¿sabes qué datos guardas y dónde están?', level: 'atender' },
  licitud: { text: 'Pedidos, fotos de cédulas y promociones. ¿Tienes permiso para escribirles?', level: 'mejorable' },
  transparencia: { text: '¿Le cuentas al cliente para qué usas sus datos?', level: 'atender' },
  derechos: { text: 'Si pide ver, corregir o borrar sus datos, ¿sabes qué hacer?', level: 'mejorable' },
  seguridad: { text: 'Una clave por persona y respaldos al día.', level: 'buena' },
  terceros: { text: 'Planilla al contador, respaldos a la nube, direcciones al delivery.', level: 'mejorable' },
  incidentes: { text: 'Saber qué hacer, y a quién avisar, si se llevan la computadora.', level: 'atender' },
  cultura: { text: 'Tu equipo sabe qué se comparte y qué no.', level: 'buena' },
};
const DEMO_STATUS = Object.fromEntries(Object.entries(DEMO).map(([k, v]) => [k, v.level])) as Record<AreaId, Level>;

export function Inicio({ app }: { app: AppState }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [hot, setHot] = useState<AreaId | null>(null);
  const [focus, setFocus] = useState<AreaId | null>(null);
  const scene = useMemo(() => buildScene(DEMO_FEATURES, false), []);
  const plateRef = useRef<HTMLElement>(null);
  const show = (a: AreaId) => {
    setFocus(a);
    plateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  const started = Object.keys(app.profile).length > 0 || Object.keys(app.answers).length > 0;
  const finished = app.profileDone && app.visible.length > 0 && app.firstPending === -1;

  const continueTo = () => {
    if (!app.profileDone) {
      const pending = profileQuestions.findIndex((pq) => app.profile[pq.id] === undefined);
      app.go({ name: 'perfil', step: Math.max(0, pending) });
    } else if (finished) {
      app.go({ name: 'resultados' });
    } else {
      app.go({ name: 'cuestionario', index: Math.max(0, app.firstPending) });
    }
  };

  return (
    <>
      <section className="open">
        <p className="kicker">Ley 81 de 2019 · Protección de datos personales</p>
        <ScreenTitle focusKey="inicio" className="display">
          Anatomía <span className="display__de">de tu</span> negocio
        </ScreenTitle>
        <div className="open__row">
          <p className="deck">
            Todo negocio guarda datos de personas en lugares que nadie mira:{' '}
            <em>la libreta, el WhatsApp, la gaveta de recetas.</em> Recórrelo con calma y descubre qué cuidas bien y qué
            conviene arreglar.
          </p>
          <div className="cta">
            {started ? (
              <>
                <button type="button" className="btn" onClick={continueTo}>
                  {finished ? 'Ver mi negocio' : 'Seguir donde quedé'} <i aria-hidden="true">→</i>
                </button>
                {confirmReset ? (
                  <span className="confirm" role="group" aria-label="Confirmar">
                    <span>Se borrarán tus respuestas.</span>
                    <button type="button" className="link link--danger" onClick={app.reset}>
                      Sí, empezar de cero
                    </button>
                    <button type="button" className="link" onClick={() => setConfirmReset(false)}>
                      Cancelar
                    </button>
                  </span>
                ) : (
                  <button type="button" className="link" onClick={() => setConfirmReset(true)}>
                    Empezar de nuevo
                  </button>
                )}
                {app.savedAt && <span className="micro">Guardado el {formatDate(app.savedAt)} en este dispositivo.</span>}
              </>
            ) : (
              <>
                <button type="button" className="btn" onClick={() => app.go({ name: 'perfil', step: 0 })}>
                  Dibujar mi negocio <i aria-hidden="true">→</i>
                </button>
                <span className="micro">5 minutos · Gratis · Nada sale de tu teléfono</span>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="spread" aria-label="Ejemplo: una farmacia de barrio">
        <figure className="plate plate--spread" ref={plateRef}>
          <Drawing
            scene={scene}
            statuses={DEMO_STATUS}
            hot={hot}
            onHot={setHot}
            focus={focus}
            onSelect={(a) => setFocus((f) => (f === a ? null : a))}
            label="Ejemplo: dibujo de una farmacia de barrio con ocho puntos numerados"
          />
          <figcaption>
            <b>Fig. 1</b>
            <span>Una farmacia de barrio en la Av. Obaldía, David. Ejemplo ilustrativo: tu dibujo se arma con tus respuestas.</span>
            {focus && (
              <button type="button" className="link" onClick={() => setFocus(null)}>
                Ver todo
              </button>
            )}
          </figcaption>
        </figure>

        <div className="notes">
          <p className="rubric">Ocho lugares donde viven datos</p>
          <ol>
            {scene.callouts.map((c) => {
              const d = DEMO[c.area];
              return (
                <li
                  key={c.area}
                  className={`note${hot === c.area || focus === c.area ? ' hot' : ''}`}
                  onPointerEnter={() => setHot(c.area)}
                  onPointerLeave={() => setHot(null)}
                >
                  <span className="note__n">{c.n}</span>
                  <h2 className="note__t">
                    <button type="button" className="note__btn" onClick={() => show(c.area)} aria-label={`${c.place}: ver en el dibujo`}>
                      {c.place}
                    </button>
                  </h2>
                  <p className="note__p">{d.text}</p>
                  <LevelTag level={d.level} />
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="how" aria-labelledby="h-how">
        <h2 id="h-how" className="rubric">Cómo funciona</h2>
        <ol>
          <li>
            <span className="how__n">01</span>
            <h3>Cuéntanos de tu negocio</h3>
            <p>Seis preguntas rápidas. Con cada respuesta se dibuja tu local: tus papeles, tu WhatsApp, tus proveedores.</p>
          </li>
          <li>
            <span className="how__n">02</span>
            <h3>Recorre cada lugar</h3>
            <p>Un recorrido corto por los ocho lugares donde viven datos. Cada respuesta se nota en el dibujo; después puedes profundizar en el área que quieras.</p>
          </li>
          <li>
            <span className="how__n">03</span>
            <h3>Llévate tu plan</h3>
            <p>Qué atender primero, qué ya haces bien y el artículo de la ley detrás de cada punto. En PDF.</p>
          </li>
        </ol>
      </section>
    </>
  );
}
