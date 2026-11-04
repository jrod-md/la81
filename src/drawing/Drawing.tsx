import { useEffect, useRef, type CSSProperties, type KeyboardEvent } from 'react';
import type { AreaId, Level } from '../engine/types';
import { focusBox, type Scene, type ViewBox } from './scene';

// Reacción de cada lugar a las respuestas: un objeto dibujado a mano junto al lugar,
// con un sello del color del estado. Cambia (y vuelve a aparecer) cada vez que cambia el estado.
type Icon = 'doc' | 'bubble' | 'lock' | 'bell' | 'badge';
const AREA_ICON: Record<AreaId, Icon> = {
  inventario: 'doc',
  licitud: 'bubble',
  transparencia: 'doc',
  derechos: 'bubble',
  seguridad: 'lock',
  terceros: 'doc',
  incidentes: 'bell',
  cultura: 'badge',
};
const ICON_SVG: Record<Icon | 'lock-open', string> = {
  doc: '<path class="ri" d="M-7 -9H3L7 -5V9H-7Z"/><path class="ri-l" d="M3 -9V-5H7M-4 -3H3M-4 0H4M-4 3H2"/>',
  bubble: '<path class="ri" d="M-8 -7H8V4H-1L-5 8V4H-8Z"/><path class="ri-l" d="M-5 -3H5M-5 0H3"/>',
  lock: '<path class="ri-s" d="M-4 -2V-5.5A4 4 0 0 1 4 -5.5V-2"/><path class="ri" d="M-6.5 -2H6.5V8H-6.5Z"/><circle class="ri-k" cx="0" cy="2.6" r="1.4"/>',
  'lock-open': '<path class="ri-s" d="M4 -2V-8A4 4 0 0 0 -4 -8V-6.2"/><path class="ri" d="M-6.5 -2H6.5V8H-6.5Z"/><circle class="ri-k" cx="0" cy="2.6" r="1.4"/>',
  bell: '<path class="ri" d="M-6.5 4.5C-5.4 2.5 -5.2 -0.5 -5.2 -2.6A5.2 5.2 0 0 1 5.2 -2.6C5.2 -0.5 5.4 2.5 6.5 4.5Z"/><path class="ri-l" d="M-1.8 6.6A1.9 1.9 0 0 0 1.8 6.6M0 -7.8V-9.4"/>',
  badge: '<path class="ri" d="M-7 -8H7V8H-7Z"/><circle class="ri" cx="0" cy="-2.2" r="2.6"/><path class="ri-l" d="M-4 3.6H4M-3 6H3M-2 -8V-10H2V-8"/>',
};
const MARK: Record<Level, string> = {
  buena: 'M-2.2 0.1L-0.6 1.7L2.4 -1.6',
  mejorable: 'M-2.4 0.5Q-1.2 -1.5 0 0.2T2.4 -0.3',
  atender: 'M0 -2.4V0.5M0 2.2V2.3',
};

function reactionSvg(area: AreaId, level: Level): string {
  const icon = AREA_ICON[area];
  const body = icon === 'lock' && level !== 'buena' ? ICON_SVG['lock-open'] : ICON_SVG[icon];
  return `<circle class="rx__bg" r="13"/>${body}<g transform="translate(8 7)"><circle class="rm" r="4.6"/><path class="rm-g" d="${MARK[level]}"/></g>`;
}

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
  /** Encuadre de la cámara dado desde afuera (el recorrido calcula el suyo). */
  view?: ViewBox;
}

const ease = (t: number) => 1 - Math.pow(1 - t, 4);
const fmt = (v: ViewBox) => v.map((n) => n.toFixed(1)).join(' ');

export function Drawing({ scene, statuses, active, focus, hot, onHot, onSelect, intro = true, label, view }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const current = useRef<ViewBox | null>(null);
  // Cada pieza conserva el retraso con el que apareció la primera vez;
  // las que se agregan después (al responder el perfil) caen de inmediato.
  const delays = useRef(new Map<string, number>());
  const first = useRef(true);
  // La entrada dura lo mismo (unos 2 s) sin importar cuántas piezas tenga el dibujo.
  const pace = Math.min(1, 80 / Math.max(1, scene.items.length));
  scene.items.forEach((it, i) => {
    if (!delays.current.has(it.id)) delays.current.set(it.id, first.current && intro ? Math.round(i * pace * 10) / 10 : 0);
  });
  const calloutBase = first.current && intro ? Math.round(scene.items.length * pace) : 0;
  useEffect(() => {
    first.current = false;
  }, []);

  const target = view ?? (focus ? focusBox(scene, focus) : scene.viewBox);
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
      <defs>
        <pattern id="la81-hv" width="3" height="6" patternUnits="userSpaceOnUse">
          <path className="hl" d="M1.5 0V6" />
        </pattern>
        <pattern id="la81-hd" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <path className="hl" d="M1.6 0V3.2" />
        </pattern>
        <pattern id="la81-sh" width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path className="hl hl--sh" d="M1.3 0V2.6" />
        </pattern>
        <pattern id="la81-dots" width="6" height="5" patternUnits="userSpaceOnUse">
          <circle className="dot" cx="1.5" cy="1.4" r="0.42" />
          <circle className="dot" cx="4.6" cy="3.9" r="0.32" />
        </pattern>
      </defs>
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
      <g className="reactions" aria-hidden="true">
        {scene.callouts.map((c) => {
          const s = statuses[c.area];
          if (!s) return null;
          const dx = c.bubble.x - c.anchor.x, dy = c.bubble.y - c.anchor.y;
          const d = Math.hypot(dx, dy) || 1;
          const x = c.anchor.x - (dx / d) * 24, y = c.anchor.y - (dy / d) * 24 - 6;
          return (
            <g key={`${c.area}-${s}`} className="rx" data-s={s} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
              <g className="rx__in" dangerouslySetInnerHTML={{ __html: reactionSvg(c.area, s) }} />
            </g>
          );
        })}
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
