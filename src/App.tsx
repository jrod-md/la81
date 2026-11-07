import { useMemo } from 'react';
import { Drawing } from './drawing/Drawing';
import { buildScene, featuresFromProfile } from './drawing/scene';
import { Inicio } from './ui/Inicio';
import { Disclaimer, useResults } from './ui/parts';
import { Perfil } from './ui/Perfil';
import { Recorrido } from './ui/Recorrido';
import { Resultados } from './ui/Resultados';
import { useAppState } from './ui/useAppState';

export function App() {
  const app = useAppState();
  const { screen } = app;
  const scene = useMemo(() => buildScene(featuresFromProfile(app.profile)), [app.profile]);
  const { statuses } = useResults(app.profile, app.answers);

  const inTour = screen.name === 'cuestionario' || screen.name === 'profundizar';
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
        {screen.name === 'perfil' && (
          <div className="split">
            <div className="split__main">
              <Perfil key={`p${screen.step}`} app={app} step={screen.step} />
            </div>
            <figure className="plate plate--flow">
              <Drawing scene={scene} statuses={{}} label="Dibujo de tu negocio" />
            </figure>
          </div>
        )}
        {inTour && (
          <Recorrido
            app={app}
            scene={scene}
            statuses={statuses}
            index={screen.index}
            deepArea={screen.name === 'profundizar' ? screen.area : undefined}
          />
        )}
        {screen.name === 'resultados' && <Resultados app={app} />}
      </main>

      <Disclaimer />
    </div>
  );
}
