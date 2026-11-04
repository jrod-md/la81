import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { areas, profileQuestions } from '../content/profile';
import { Drawing } from '../drawing/Drawing';
import { AREA_ORDER, frameOn, type Scene } from '../drawing/scene';
import { findOption } from '../engine/scoring';
import type { AreaId, Level, Question } from '../engine/types';
import type { AppState } from './useAppState';
import { LevelMark, LevelTag, RefList, ScreenTitle } from './parts';

const LETTERS = 'abcdefghij';
/** Ancho desde el que la ficha flota sobre el dibujo; debajo va como hoja bajo el dibujo. */
const WIDE = 880;
/** Pausa antes de pasar solo al siguiente lugar, para ver la reacción del dibujo. */
const ADVANCE_MS = 1300;

interface Props {
  app: AppState;
  scene: Scene;
  statuses: Partial<Record<AreaId, Level>>;
  index: number;
  /** Si viene, se profundiza en esa área; si no, es el recorrido esencial. */
  deepArea?: AreaId;
}

/** Recorrido guiado: la cámara viaja a cada lugar y la pregunta aparece como una ficha junto a él. */
export function Recorrido({ app, scene, statuses, index, deepArea }: Props) {
  const list = deepArea ? app.deep(deepArea) : app.core;
  const total = list.length;
  const i = Math.min(Math.max(0, index), total - 1);
  const q = list[i];

  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!q) return null;
  const wide = (size?.w ?? 0) >= WIDE;
  // En pantallas angostas la ficha va debajo y el dibujo tiene proporción fija de 4:3.
  const aspect = wide && size ? size.w / Math.max(1, size.h) : 4 / 3;
  const drawH = wide && size ? size.h : (size?.w ?? 0) * 0.75;
  const view = frameOn(scene, q.area, aspect, wide ? 0.66 : 0.4, wide ? 0.3 : 0.5, 0.52);
  const callout = scene.callouts.find((c) => c.area === q.area);

  // Posición del lugar en pantalla, para la línea que une la ficha con el dibujo.
  const anchorPx =
    size && callout ? { x: ((callout.anchor.x - view[0]) / view[2]) * size.w, y: ((callout.anchor.y - view[1]) / view[3]) * drawH } : null;
  const cardLeft = size ? size.w - Math.min(400, size.w * 0.42) - 24 : 0;

  const go = (n: number) => {
    if (deepArea) app.go({ name: 'profundizar', area: deepArea, index: n });
    else app.go({ name: 'cuestionario', index: n });
  };
  const next = () => (i < total - 1 ? go(i + 1) : app.go({ name: 'resultados' }));
  const back = () => {
    if (i > 0) go(i - 1);
    else if (deepArea) app.go({ name: 'resultados' });
    else app.go({ name: 'perfil', step: profileQuestions.length - 1 });
  };
  const area = areas.find((a) => a.id === q.area);

  const strip = (
    <>
      {deepArea ? (
        <p className="tour__deep">
          <span>
            Profundizar · {area?.title} · {i + 1} de {total}
          </span>
          <button type="button" className="link" onClick={() => app.go({ name: 'resultados' })}>
            Volver a mi negocio
          </button>
        </p>
      ) : (
        <nav className="places" aria-label="Lugares del recorrido">
          {AREA_ORDER.map((a) => {
            const c = scene.callouts.find((x) => x.area === a);
            const first = app.core.findIndex((x) => x.area === a);
            const s = statuses[a];
            const here = a === q.area;
            return (
              <button
                key={a}
                type="button"
                className={`place${here ? ' is-here' : ''}`}
                data-s={s ?? 'pending'}
                aria-current={here ? 'step' : undefined}
                aria-label={`${c?.n}. ${c?.place}${s ? '' : ', sin revisar'}`}
                onClick={() => first >= 0 && go(first)}
              >
                <span className="place__n">{c?.n}</span>
                <span className="place__t">{c?.place}</span>
                </button>
              );
            })}
          </nav>
        )}
      </>
  );

  return (
    <section className={`tour${wide ? ' tour--wide' : ''}`} aria-label="Recorrido por tu negocio">
      <div className="tour__stage" ref={stageRef}>
        <Drawing scene={scene} statuses={statuses} active={q.area} view={view} intro={false} label={`Dibujo de tu negocio: ${callout?.place ?? ''}, de cerca`} />
        {wide && anchorPx && (
          <svg key={q.id} className="tour__lead" width={size!.w} height={size!.h} aria-hidden="true">
            <path pathLength={1} d={`M${cardLeft} ${size!.h / 2}H${cardLeft - 28}L${anchorPx.x.toFixed(1)} ${anchorPx.y.toFixed(1)}`} />
            <circle cx={anchorPx.x} cy={anchorPx.y} r={3.5} />
          </svg>
        )}
        {!wide && strip}
        <Card key={q.id} app={app} q={q} place={callout?.place ?? area?.title ?? ''} n={callout?.n ?? 0} areaTitle={area?.title ?? ''} onNext={next} onBack={back} isLast={i === total - 1} deep={!!deepArea} />
      </div>

    </section>
  );
}

interface CardProps {
  app: AppState;
  q: Question;
  place: string;
  n: number;
  areaTitle: string;
  onNext: () => void;
  onBack: () => void;
  isLast: boolean;
  deep: boolean;
}

function Card({ app, q, place, n, areaTitle, onNext, onBack, isLast, deep }: CardProps) {
  const selectedId = app.answers[q.id];
  const selected = findOption(q, selectedId);
  const [picked, setPicked] = useState(false);
  const nextRef = useRef(onNext);
  nextRef.current = onNext;

  // Al elegir, el dibujo reacciona y se pasa solo al siguiente lugar, salvo que haya una nota que leer.
  const hasNote = !!selected?.note;
  useEffect(() => {
    if (!picked || !selectedId || hasNote) return;
    const t = window.setTimeout(() => nextRef.current(), ADVANCE_MS);
    return () => window.clearTimeout(t);
  }, [picked, selectedId, hasNote]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selected) onNext();
  };

  return (
    <form className="card" onSubmit={onSubmit}>
      <p className="card__place">
        <span className="card__n" aria-hidden="true">
          {n}
        </span>
        <span>
          <b>{place}</b>
          {areaTitle !== place && <span className="card__area"> · {areaTitle}</span>}
        </span>
      </p>
      <fieldset className="ask__set">
        <legend>
          <ScreenTitle focusKey={`q-${q.id}`} className="card__q">
            {q.prompt}
          </ScreenTitle>
        </legend>
        <div className="rows rows--card">
          {q.options.map((o, k) => {
            const checked = o.id === selectedId;
            return (
              <label key={o.id} className={`row${checked ? ' is-on' : ''}`}>
                <input
                  type="radio"
                  name={q.id}
                  value={o.id}
                  checked={checked}
                  onChange={() => {
                    app.setAnswer(q.id, o.id);
                    setPicked(true);
                  }}
                />
                <span className="row__k" aria-hidden="true">
                  {LETTERS[k]}.
                </span>
                <span className="row__t">{o.label}</span>
                <span className="row__lvl">{checked && (o.level === 'na' ? <span className="lvl lvl--na">No aplica</span> : <LevelTag level={o.level} />)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="ask__note" aria-live="polite">
        {selected?.note && <p>{selected.note}</p>}
        {picked && selected && !selected.note && (
          <p className="card__auto">
            {selected.level !== 'na' && <LevelMark level={selected.level} />} {isLast ? 'Listo. Armando tu resultado…' : 'Pasando al siguiente lugar…'}
          </p>
        )}
      </div>

      <details className="why">
        <summary>¿Por qué importa?</summary>
        <div className="why__body">
          <p>{q.help}</p>
          <RefList refs={q.refs} />
        </div>
      </details>

      <div className="ask__nav">
        <button type="button" className="link" onClick={onBack}>
          ← Atrás
        </button>
        <span className="ask__nav-r">
          {!selected && (
            <button type="button" className="link" onClick={onNext}>
              Saltar
            </button>
          )}
          {selected && (
            <button type="submit" className="btn btn--sm">
              {isLast ? (deep ? 'Volver a mi negocio' : 'Ver mi negocio') : 'Seguir'} <i aria-hidden="true">→</i>
            </button>
          )}
        </span>
      </div>
    </form>
  );
}
