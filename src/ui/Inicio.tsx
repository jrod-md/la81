import { useState } from 'react';
import { profileQuestions } from '../content/profile';
import { Drawing } from '../drawing/Drawing';
import type { Scene } from '../drawing/scene';
import type { AreaId, Level } from '../engine/types';
import type { AppState } from './useAppState';
import { formatDate } from './labels';
import { ScreenTitle } from './parts';
import { fitView, useRoom } from './Room';

interface Props {
  app: AppState;
  scene: Scene;
  statuses: Partial<Record<AreaId, Level>>;
}

/** Regreso: quien ya empezó ve su negocio tal como lo dejó y sigue desde ahí. Sin portada. */
export function Inicio({ app, scene, statuses }: Props) {
  const { stageRef, topRef, dockRef, geo } = useRoom();
  const [confirmReset, setConfirmReset] = useState(false);
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

  const title = !app.profileDone ? 'Tu negocio quedó a medio dibujar' : finished ? 'Tu día ya está cerrado' : 'Tu día quedó a medias';

  return (
    <section className="room room--inicio" aria-label="Tu negocio">
      <div className="room__stage" ref={stageRef}>
        {geo && <Drawing scene={scene} statuses={statuses} view={fitView(scene.viewBox, geo)} label="Dibujo de tu negocio" />}
      </div>
      <div className="room__top" ref={topRef} />
      <div className="room__dock" ref={dockRef}>
        <div className="sheet">
          <p className="sheet__hint">Hola de nuevo{app.savedAt ? ` · Guardado el ${formatDate(app.savedAt)} en este dispositivo` : ''}</p>
          <ScreenTitle focusKey="inicio" className="sheet__q">
            {title}
          </ScreenTitle>
          <div className="sheet__nav">
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
            <button type="button" className="btn" onClick={continueTo}>
              {finished ? 'Ver cómo cerró el día' : 'Seguir donde quedé'} <i aria-hidden="true">→</i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
