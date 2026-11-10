import { useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { escenas } from '../content/escenas';
import { areas, profileQuestions } from '../content/profile';
import { Drawing } from '../drawing/Drawing';
import type { Scene } from '../drawing/scene';
import { findOption } from '../engine/scoring';
import type { AnswerOption, AreaId, Escena, Level, Question } from '../engine/types';
import type { AppState } from './useAppState';
import { LevelMark, LevelTag, RefList, ScreenTitle } from './parts';
import { WIDE, closeView, useRoom } from './Room';

const LETTERS = 'abcdefghij';

type Parte = 'manana' | 'mediodia' | 'tarde' | 'cierre';

interface Props {
  app: AppState;
  scene: Scene;
  statuses: Partial<Record<AreaId, Level>>;
  index: number;
  /** Si viene, se profundiza en esa área; si no, es el día completo. */
  deepArea?: AreaId;
}

/** "14:45" -> { reloj: "2:45", sufijo: "p. m.", parte } */
function leerHora(hora: string): { reloj: string; sufijo: string; parte: Parte } {
  const [hh = '12', mm = '00'] = hora.split(':');
  const h = Number(hh);
  const parte: Parte = h < 11 ? 'manana' : h < 15 ? 'mediodia' : h < 17 ? 'tarde' : 'cierre';
  return { reloj: `${h > 12 ? h - 12 : h}:${mm}`, sufijo: h < 12 ? 'a. m.' : 'p. m.', parte };
}

/** Lo que se aprende al elegir una opción: el efecto de la escena o, si no hay, la nota o la recomendación. */
function efectoDe(q: Question, o: AnswerOption, e: Escena | undefined): string {
  const propio = e?.opciones[o.id]?.efecto ?? o.note;
  if (propio) return propio;
  if (o.level === 'na') return 'No aplica a tu negocio. Seguimos.';
  if (o.level === 'buena') return 'Así está bien. Mantenlo.';
  return q.recommendation;
}

interface Pendiente {
  id: string;
  level: Level;
  text: string;
}

/** Un día en tu negocio: cada pregunta es algo que pasa en el local, y el usuario decide qué hace. */
export function Recorrido({ app, scene, statuses, index, deepArea }: Props) {
  const { stageRef, topRef, dockRef, geo } = useRoom();
  const list = deepArea ? app.deep(deepArea) : app.core;
  const total = list.length;
  const i = Math.min(Math.max(0, index), total - 1);
  const q = list[i];
  if (!q) return null;

  const wide = (geo?.w ?? 0) >= WIDE;
  const framing = geo ? closeView(scene, q.area, geo, wide) : null;
  const callout = scene.callouts.find((c) => c.area === q.area);
  const area = areas.find((a) => a.id === q.area);
  const e = escenas[q.id];
  const hora = e ? leerHora(e.hora) : null;

  // El resultado se arma a la vista: cuenta del día y lo que queda para mañana.
  const tally: Record<Level, number> = { buena: 0, mejorable: 0, atender: 0 };
  const pendientes: Pendiente[] = [];
  for (const x of list) {
    const lvl = findOption(x, app.answers[x.id])?.level;
    if (!lvl || lvl === 'na') continue;
    tally[lvl] += 1;
    if (lvl !== 'buena') pendientes.push({ id: x.id, level: lvl, text: escenas[x.id]?.tarea ?? areas.find((a) => a.id === x.area)?.title ?? '' });
  }

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

  const says = (
    <div className={`says${e?.habla ? ' says--voz' : ''}`} key={`s-${q.id}`}>
      <p className="says__who">{e?.quien ?? callout?.place ?? area?.title}</p>
      <ScreenTitle focusKey={`q-${q.id}`} className="says__t">
        {e?.texto ?? q.prompt}
      </ScreenTitle>
    </div>
  );

  const anchor = framing?.anchor;
  const bubbleW = geo ? Math.min(460, geo.w - 32) : 0;
  const bubbleX = anchor && geo ? Math.min(Math.max(anchor.x, bubbleW / 2 + 16), geo.w - bubbleW / 2 - 16) : 0;

  return (
    <section className={`room room--day${wide ? ' room--wide' : ''}`} data-parte={hora?.parte ?? 'mediodia'} aria-label={deepArea ? 'Profundizar' : 'Un día en tu negocio'}>
      <div className="room__stage" ref={stageRef}>
        {framing && (
          <Drawing scene={scene} statuses={statuses} active={q.area} view={framing.view} intro={false} bare label={`Tu negocio: ${callout?.place ?? ''}, de cerca`} />
        )}
        {wide && anchor && geo && (
          <>
            <svg key={`l-${q.id}`} className="day__lead" width={geo.w} height={geo.h} aria-hidden="true">
              <path pathLength={1} d={`M${bubbleX.toFixed(1)} ${(anchor.y - 34).toFixed(1)}L${anchor.x.toFixed(1)} ${anchor.y.toFixed(1)}`} />
              <circle cx={anchor.x} cy={anchor.y} r={4} />
            </svg>
            <div className="day__says" style={{ left: bubbleX, bottom: geo.h - anchor.y + 34, width: bubbleW }}>
              {says}
            </div>
          </>
        )}
      </div>

      <div className="room__top" ref={topRef}>
        <div className="day__bar">
          {hora ? (
            <p className="day__clock" aria-label={`Son las ${hora.reloj} ${hora.sufijo}`}>
              <span className="day__h" key={hora.reloj}>
                {hora.reloj}
              </span>
              <span className="day__ampm">{hora.sufijo}</span>
            </p>
          ) : (
            <p className="day__deep">
              Profundizar
              <b>{area?.title}</b>
            </p>
          )}
          <div className="track" aria-hidden="true">
            {list.map((x, k) => {
              const lvl = findOption(x, app.answers[x.id])?.level;
              return <span key={x.id} className="track__tick" data-s={lvl ?? 'pending'} data-here={k === i || undefined} />;
            })}
            <span className="track__sun" style={{ '--p': total > 1 ? i / (total - 1) : 0 } as CSSProperties} />
          </div>
          <p className="day__count">
            {i + 1} de {total}
          </p>
        </div>
      </div>

      <div className="room__dock" ref={dockRef}>
        <Manana tally={tally} pendientes={pendientes} wide={wide} deep={!!deepArea} />
        <Dock key={`d-${q.id}`} app={app} q={q} escena={e} says={wide ? null : says} onNext={next} onBack={back} isLast={i === total - 1} deep={!!deepArea} />
      </div>
    </section>
  );
}

/** La cuenta del día y la lista para mañana, que crece con cada respuesta. */
function Manana({ tally, pendientes, wide, deep }: { tally: Record<Level, number>; pendientes: Pendiente[]; wide: boolean; deep: boolean }) {
  const [open, setOpen] = useState(false);
  const answered = tally.buena + tally.mejorable + tally.atender;
  const showList = wide || open;
  return (
    <aside className={`manana${wide ? ' manana--wide' : ''}`} aria-label="Lo que va del día">
      <div className="manana__head">
        <p className="manana__tally" aria-live="polite">
          {answered === 0 ? (
            <span className="manana__empty">{deep ? 'Aún sin respuestas' : 'El día recién empieza'}</span>
          ) : (
            <>
              <span>
                <LevelMark level="buena" /> {tally.buena}
                <span className="manana__lbl"> bien</span>
              </span>
              <span>
                <LevelMark level="mejorable" /> {tally.mejorable}
                <span className="manana__lbl"> por mejorar</span>
              </span>
              <span>
                <LevelMark level="atender" /> {tally.atender}
                <span className="manana__lbl"> por atender</span>
              </span>
            </>
          )}
        </p>
        {!wide && pendientes.length > 0 && (
          <button type="button" className="manana__toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            Para mañana · {pendientes.length}
          </button>
        )}
      </div>
      {showList && (
        <div className="manana__list">
          {wide && <p className="manana__h">Para mañana</p>}
          {pendientes.length === 0 ? (
            wide && <p className="manana__none">Aquí se anota lo que conviene arreglar.</p>
          ) : (
            <ol>
              {pendientes.map((p) => (
                <li key={p.id} data-s={p.level}>
                  <LevelMark level={p.level} />
                  <span>{p.text}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </aside>
  );
}

interface DockProps {
  app: AppState;
  q: Question;
  escena: Escena | undefined;
  /** En pantallas angostas la escena se lee aquí, arriba de las opciones. */
  says: ReactNode;
  onNext: () => void;
  onBack: () => void;
  isLast: boolean;
  deep: boolean;
}

/** Las reacciones posibles y, al elegir una, lo que pasa. */
function Dock({ app, q, escena, says, onNext, onBack, isLast, deep }: DockProps) {
  const selectedId = app.answers[q.id];
  const selected = findOption(q, selectedId);

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    if (selected) onNext();
  };

  return (
    <form className="sheet dock" onSubmit={onSubmit}>
      {says}
      <fieldset className="dock__set">
        <legend className="dock__q">{escena ? '¿Qué haces?' : 'Tu respuesta'}</legend>
        <div className="acts" style={{ '--n': q.options.length } as CSSProperties}>
          {q.options.map((o, k) => {
            const on = o.id === selectedId;
            return (
              <label key={o.id} className={`act${on ? ' is-on' : ''}${selected && !on ? ' is-off' : ''}`}>
                <input type="radio" name={q.id} value={o.id} checked={on} onChange={() => app.setAnswer(q.id, o.id)} />
                <span className="act__k" aria-hidden="true">
                  {LETTERS[k]}
                </span>
                <span className="act__t">{escena?.opciones[o.id]?.accion ?? o.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="dock__foot">
        <div className="fx" aria-live="polite">
          {selected ? (
            <div className="fx__in" key={selected.id}>
              {selected.level === 'na' ? <span className="lvl lvl--na">No aplica</span> : <LevelTag level={selected.level} />}
              <p className="fx__t">{efectoDe(q, selected, escena)}</p>
              <RefList refs={q.refs} />
            </div>
          ) : (
            <p className="fx__hint">Elige lo que más se parece a lo que pasaría hoy en tu negocio.</p>
          )}
        </div>
        <div className="dock__nav">
          <button type="button" className="link" onClick={onBack}>
            ← Atrás
          </button>
          {selected ? (
            <button type="submit" className="btn">
              {isLast ? (deep ? 'Volver a mi negocio' : 'Cerrar el día') : 'Seguir'} <i aria-hidden="true">→</i>
            </button>
          ) : (
            <button type="button" className="link" onClick={onNext}>
              Saltar
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
