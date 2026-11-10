import { useLayoutEffect, useRef, useState } from 'react';
import type { AreaId } from '../engine/types';
import type { Scene, ViewBox } from '../drawing/scene';

/** Medidas del cuarto en px: el dibujo ocupa todo; la franja visible va de `top` (bajo la barra) a `bottom` (sobre la tarjeta). */
export interface RoomGeo {
  w: number;
  h: number;
  top: number;
  bottom: number;
}

/** Desde este ancho la tarjeta flota sobre el dibujo y la escena se dice en un globo. */
export const WIDE = 880;

/** Mide el escenario, la barra de arriba y la tarjeta de abajo. */
export function useRoom() {
  const stageRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<RoomGeo | null>(null);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const r = stage.getBoundingClientRect();
      const t = topRef.current?.getBoundingClientRect();
      const d = dockRef.current?.getBoundingClientRect();
      const next: RoomGeo = {
        w: Math.round(r.width),
        h: Math.round(r.height),
        top: t ? Math.round(t.bottom - r.top) : 0,
        bottom: d ? Math.round(Math.min(r.height, d.top - r.top)) : Math.round(r.height),
      };
      // Cambios chicos de la tarjeta (al aparecer el efecto) no mueven la cámara.
      setGeo((prev) =>
        prev && prev.w === next.w && prev.h === next.h && prev.top === next.top && Math.abs(prev.bottom - next.bottom) < 48
          ? prev
          : next,
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    for (const el of [stage, topRef.current, dockRef.current]) if (el) ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { stageRef, topRef, dockRef, geo };
}

/** Encuadre que muestra el dibujo completo dentro de la franja visible. */
export function fitView(vb: ViewBox, g: RoomGeo, pad = 20): ViewBox {
  const bw = Math.max(80, g.w - pad * 2);
  const bh = Math.max(80, g.bottom - g.top - pad * 2);
  const upp = Math.max(vb[2] / bw, vb[3] / bh);
  const cx = vb[0] + vb[2] / 2;
  const cy = vb[1] + vb[3] / 2;
  const midY = (g.top + g.bottom) / 2;
  return [cx - (g.w / 2) * upp, cy - midY * upp, g.w * upp, g.h * upp];
}

/**
 * Encuadre de cerca sobre un área: su punto queda en (ax, ay) px.
 * Ancho: el lugar va a la izquierda y abajo de la franja, para el globo encima y la lista a la derecha.
 * Angosto: el lugar va al centro de la franja; la escena se lee en la tarjeta.
 */
export function closeView(scene: Scene, area: AreaId, g: RoomGeo, wide: boolean): { view: ViewBox; anchor: { x: number; y: number } | null } {
  const vb = scene.viewBox;
  const band = Math.max(120, g.bottom - g.top);
  const upp = wide ? (0.68 * vb[3]) / band : (0.5 * vb[2]) / g.w;
  const c = scene.callouts.find((x) => x.area === area);
  if (!c) return { view: fitView(vb, g), anchor: null };
  const ax = wide ? g.w * 0.4 : g.w / 2;
  const ay = wide ? g.top + band * 0.74 : g.top + band * 0.55;
  return { view: [c.anchor.x - ax * upp, c.anchor.y - ay * upp, g.w * upp, g.h * upp], anchor: { x: ax, y: ay } };
}
