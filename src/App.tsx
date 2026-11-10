import { useMemo } from 'react';
import { buildScene, featuresFromProfile } from './drawing/scene';
import { Inicio } from './ui/Inicio';
import { Metodologia } from './ui/Metodologia';
import { Disclaimer, useResults } from './ui/parts';
import { Perfil } from './ui/Perfil';
import { Recorrido } from './ui/Recorrido';
import { Resultados } from './ui/Resultados';
import { useAppState } from './ui/useAppState';

export function App() {
  const app = useAppState();
  // Sin nada empezado no hay "regreso": la pantalla de inicio es la primera pregunta.
  const screen = app.screen.name === 'inicio' && !app.started ? app.home : app.screen;
  const scene = useMemo(() => buildScene(featuresFromProfile(app.profile)), [app.profile]);
  const { statuses } = useResults(app.profile, app.answers);

  const inTour = screen.name === 'cuestionario' || screen.name === 'profundizar';
  // Pantallas "cuarto": el dibujo ocupa la ventana y la pregunta flota abajo.
  const full = inTour || screen.name === 'perfil' || screen.name === 'inicio';
  return (
    <div className={`shell${full ? ' shell--room' : ''}`}>
      <header className="mast no-print">
        <button type="button" className="logo" onClick={() => app.go(app.home)} aria-label="La 81, ir al inicio">
          La 81<sup>PA</sup>
        </button>
        {screen.name !== 'metodologia' && (
          <button type="button" className="link mast__link" onClick={() => app.go({ name: 'metodologia' })}>
            Metodología
          </button>
        )}
      </header>

      <main className={`main main--${screen.name}`}>
        {screen.name === 'inicio' && <Inicio app={app} scene={scene} statuses={statuses} />}
        {screen.name === 'perfil' && <Perfil key={`p${screen.step}`} app={app} step={screen.step} scene={scene} />}
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
        {screen.name === 'metodologia' && <Metodologia app={app} />}
      </main>

      {!full && <Disclaimer />}
    </div>
  );
}
