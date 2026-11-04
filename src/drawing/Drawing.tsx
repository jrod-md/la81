import { useEffect, useRef, type CSSProperties, type KeyboardEvent } from 'react';
import type { AreaId, Level } from '../engine/types';
import { focusBox, type Scene, type ViewBox } from './scene';

const LEVEL_TEXT: Record<Level, string> = {
  buena: 'bien encaminado',
  mejorable: 'puede mejorar',
  atender: 'atender pronto',
};

interface Props {
  scene: Scene;
  statuses: Partial<Record<AreaId, Level>>;
  /** Área de la pregunta actual: su punto gira. */
  active?: AreaId | null;
  /** Área a la que se acerca la cámara. */
  focus?: AreaId | null;
  /** Punto resaltado (enlace con las notas). */
  hot?: AreaId | null;
  onHot?: (area: AreaId | null) => void;
  onSelect?: (area: AreaId) => void;
  /** Animar la entrada del dibujo. */
  intro?: boolean;
  label: string;
}

const ease = (t: number) => 1 - Math.pow(1 - t, 4);
const fmt = (v: ViewBox) => v.map((n) => n.toFixed(1)).join(' ');

export function Drawing({ scene, statuses, active, focus, hot, onHot, onSelect, intro = true, label }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const current = useRef<ViewBox | null>(null);
  // Cada pieza conserva el retraso con el que apareció la primera vez;
  // las que se agregan después (al responder el perfil) caen de inmediato.
  const delays = useRef(new Map<string, number>());
  const first = useRef(true);
  scene.items.forEach((it, i) => {
    if (!delays.current.has(it.id)) delays.current.set(it.id, first.current && intro ? i : 0);
  });
  const calloutBase = first.current && intro ? scene.items.length : 0;
  useEffect(() => {
    first.current = false;
  }, []);

  const target = focus ? focusBox(scene, focus) : scene.viewBox;
  const targetKey = fmt(target);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = current.current;
    if (!from || reduced) {
      current.current = target;
      svg.setAttribute('viewBox', fmt(target));
      return;
    }
    const t0 = performance.now();
    const dur = 1100;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const k = ease(t);
      const v = from.map((n, i) => n + (target[i]! - n) * k) as ViewBox;
      current.current = v;
      svg.setAttribute('viewBox', fmt(v));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // targetKey resume el encuadre de destino.
  }, [targetKey]);

  const onKey = (area: AreaId) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(area);
    }
  };

  return (
    <svg
      ref={svgRef}
      className={`plan${intro ? '' : ' plan--still'}${focus ? ' plan--zoom' : ''}`}
      viewBox={fmt(current.current ?? target)}
      role="group"
      aria-label={label}
    >
      {scene.items.map((it) => (
        <g
          key={it.id}
          className={`rv ${it.kind}`}
          style={{ '--d': delays.current.get(it.id) ?? 0 } as CSSProperties}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: it.html }}
        />
      ))}
      <g className="flows" aria-hidden="true">
        {scene.flows.map((fl) => (
          <g key={fl.id} className="rv fade" style={{ '--d': calloutBase } as CSSProperties} dangerouslySetInnerHTML={{ __html: fl.html }} />
        ))}
      </g>
      {scene.callouts.map((c, i) => {
        const s = statuses[c.area];
        const dx = c.bubble.x - c.anchor.x, dy = c.bubble.y - c.anchor.y;
        const d = Math.hypot(dx, dy) || 1;
        const ex = c.bubble.x - (dx / d) * 15, ey = c.bubble.y - (dy / d) * 15;
        const text = `${c.n}. ${c.place}: ${s ? LEVEL_TEXT[s] : 'sin revisar'}`;
        return (
          <g
            key={c.area}
            className={`co${active === c.area ? ' is-active' : ''}${hot === c.area ? ' hot' : ''}`}
            data-s={s ?? 'pending'}
            style={{ '--d': calloutBase + i * 2 } as CSSProperties}
            role={onSelect ? 'button' : 'img'}
            tabIndex={onSelect ? 0 : undefined}
            aria-label={text}
            onClick={onSelect ? () => onSelect(c.area) : undefined}
            onKeyDown={onSelect ? onKey(c.area) : undefined}
            onPointerEnter={onHot ? () => onHot(c.area) : undefined}
            onPointerLeave={onHot ? () => onHot(null) : undefined}
          >
            <line className="leader" pathLength={1} x1={c.anchor.x} y1={c.anchor.y} x2={ex} y2={ey} />
            <circle className="anc" cx={c.anchor.x} cy={c.anchor.y} r={2.6} />
            <g transform={`translate(${c.bubble.x.toFixed(1)} ${c.bubble.y.toFixed(1)})`}>
              <circle className="bub-hit" r={22} />
              <circle className="bub-pulse" r={15} />
              <circle className="bub-focus" r={22} />
              <circle className="bub-c" r={15} />
              <path className="bub-half" d="M0 -15A15 15 0 0 1 0 15Z" />
              <text className="bub-t" dy="0.36em">
                {c.n}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
