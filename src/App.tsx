import { useMemo } from 'react';
import { areas } from './content/profile';
import { Drawing } from './drawing/Drawing';
import { buildScene, featuresFromProfile } from './drawing/scene';
import { Cuestionario } from './ui/Cuestionario';
import { Inicio } from './ui/Inicio';
import { Disclaimer, useResults } from './ui/parts';
import { Perfil } from './ui/Perfil';
import { Resultados } from './ui/Resultados';
import { useAppState } from './ui/useAppState';

export function App() {
  const app = useAppState();
  const { screen } = app;
  const scene = useMemo(() => buildScene(featuresFromProfile(app.profile)), [app.profile]);
  const { statuses } = useResults(app.profile, app.answers);

  const inFlow = screen.name === 'perfil' || screen.name === 'cuestionario';
  const currentQ = screen.name === 'cuestionario' ? app.visible[Math.min(Math.max(0, screen.index), app.visible.length - 1)] : undefined;
  const area = currentQ ? areas.find((a) => a.id === currentQ.area) : undefined;
  const place = currentQ ? scene.callouts.find((c) => c.area === currentQ.area)?.place : undefined;

  return (
    <div className="shell">
      <header className="mast no-print">
        <span className="mast__issue">Autoevaluación · Ley 81 de 2019</span>
        <button
          type="button"
          className="logo"
          onClick={() => screen.name !== 'inicio' && app.go({ name: 'inicio' })}
          aria-label="La 81, ir al inicio"
        >
          La 81<sup>PA</sup>
        </button>
        <span className="mast__right">Hecho en Panamá para negocios pequeños</span>
      </header>

      <main className={`main main--${screen.name}`}>
        {screen.name === 'inicio' && <Inicio app={app} />}
        {inFlow && (
          <div className="split">
            <div className="split__main">
              {screen.name === 'perfil' && <Perfil key={`p${screen.step}`} app={app} step={screen.step} />}
              {screen.name === 'cuestionario' && <Cuestionario key={`q${screen.index}`} app={app} index={screen.index} />}
            </div>
            <figure className="plate plate--flow">
              <Drawing
                scene={scene}
                statuses={screen.name === 'cuestionario' ? statuses : {}}
                active={currentQ?.area ?? null}
                focus={currentQ?.area ?? null}
                label="Dibujo de tu negocio"
              />
              <figcaption>
                <b>{currentQ ? `Fig. ${areas.findIndex((a) => a.id === currentQ.area) + 1}` : 'Fig. 1'}</b>
                <span>
                  {currentQ && area && place
                    ? `${place}, de cerca. ${area.title}.`
                    : 'Tu negocio se dibuja con lo que nos cuentas.'}
                </span>
              </figcaption>
            </figure>
          </div>
        )}
        {screen.name === 'resultados' && <Resultados app={app} />}
      </main>

      <Disclaimer />
    </div>
  );
}
