// Trazo de tinta para la lámina axonométrica.
// Proyección isométrica, caras con trama y aristas con el leve pulso y el cruce de
// esquinas de un dibujo técnico hecho a mano. Determinista: la misma semilla, el mismo dibujo.

export type Point = { x: number; y: number };
export type V3 = [number, number, number];
type XY = [number, number];
/** Rectángulo en planta: [x0, y0, x1, y1]. */
export type Rect = [number, number, number, number];
export type Plane = 'xy' | 'xz' | 'yz';

export const S = 44;
const C = Math.cos(Math.PI / 6);
export const f = (n: number) => n.toFixed(1);

/** Hacia dónde cae la sombra por cada unidad de altura (luz desde la ventana, a la izquierda). */
const SHADOW: XY = [0.42, -0.16];

/** Matriz de texto para escribir sobre cada plano. */
const TEXT_M: Record<Plane, [number, number, number, number]> = {
  xy: [C, 0.5, -C, 0.5],
  xz: [C, 0.5, 0, 1],
  yz: [C, -0.5, 0, 1],
};

export interface BoxOpt {
  /** Relleno de cada cara visible: la primera clase es la base, las siguientes son tramas encima. */
  t?: string;
  x?: string;
  y?: string;
  /** Grosor del contorno: 1 grueso, 2 medio, 3 fino. */
  w?: 1 | 2 | 3;
  inner?: string;
}

export interface CylOpt {
  body?: string;
  top?: string;
  w?: 1 | 2 | 3;
  shade?: boolean;
}

function hull(p: XY[]): XY[] {
  const a = [...p].sort((u, v) => u[0] - v[0] || u[1] - v[1]);
  const cross = (o: XY, b: XY, c: XY) => (b[0] - o[0]) * (c[1] - o[1]) - (b[1] - o[1]) * (c[0] - o[0]);
  const lo: XY[] = [];
  const up: XY[] = [];
  for (const q of a) {
    while (lo.length >= 2 && cross(lo[lo.length - 2]!, lo[lo.length - 1]!, q) <= 0) lo.pop();
    lo.push(q);
  }
  for (const q of [...a].reverse()) {
    while (up.length >= 2 && cross(up[up.length - 2]!, up[up.length - 1]!, q) <= 0) up.pop();
    up.push(q);
  }
  lo.pop();
  up.pop();
  return lo.concat(up);
}

/** Recorta un polígono en planta a un rectángulo (Sutherland–Hodgman). */
function clipRect(poly: XY[], [x0, y0, x1, y1]: Rect): XY[] {
  const lerp = (a: XY, b: XY, t: number): XY => [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
  const edges: [(p: XY) => boolean, (a: XY, b: XY) => XY][] = [
    [(p) => p[0] >= x0, (a, b) => lerp(a, b, (x0 - a[0]) / (b[0] - a[0]))],
    [(p) => p[0] <= x1, (a, b) => lerp(a, b, (x1 - a[0]) / (b[0] - a[0]))],
    [(p) => p[1] >= y0, (a, b) => lerp(a, b, (y0 - a[1]) / (b[1] - a[1]))],
    [(p) => p[1] <= y1, (a, b) => lerp(a, b, (y1 - a[1]) / (b[1] - a[1]))],
  ];
  let out = poly;
  for (const [inside, cut] of edges) {
    const src = out;
    out = [];
    src.forEach((cur, i) => {
      const prev = src[(i + src.length - 1) % src.length]!;
      if (inside(cur)) {
        if (!inside(prev)) out.push(cut(prev, cur));
        out.push(cur);
      } else if (inside(prev)) out.push(cut(prev, cur));
    });
    if (out.length === 0) break;
  }
  return out;
}

export function makeInk(seed = 7) {
  const B = [Infinity, Infinity, -Infinity, -Infinity];
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const grow = (x: number, y: number) => {
    B[0] = Math.min(B[0]!, x);
    B[1] = Math.min(B[1]!, y);
    B[2] = Math.max(B[2]!, x);
    B[3] = Math.max(B[3]!, y);
  };
  const P = (x: number, y: number, z = 0): Point => {
    const p = { x: (x - y) * C * S, y: (x + y) * 0.5 * S - z * S };
    grow(p.x, p.y);
    return p;
  };
  const pts = (a: V3[]) =>
    a
      .map((q) => {
        const p = P(...q);
        return `${f(p.x)},${f(p.y)}`;
      })
      .join(' ');

  /** Relleno sin contorno. «p hv» = papel y trama vertical encima. */
  const fill = (a: V3[], classes: string) => {
    const pp = pts(a);
    return classes
      .split(' ')
      .filter(Boolean)
      .map((c) => `<polygon class="${c}" points="${pp}"/>`)
      .join('');
  };

  // Una arista a mano: se pasa un poco de la esquina y se curva apenas.
  const stroke = (a: Point, b: Point, ext: number) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const L = Math.hypot(dx, dy);
    if (L < 0.2) return '';
    const ux = dx / L;
    const uy = dy / L;
    const e = Math.min(ext, L * 0.1);
    const ax = a.x - ux * e;
    const ay = a.y - uy * e;
    const bx = b.x + ux * e;
    const by = b.y + uy * e;
    const bow = (rnd() - 0.5) * Math.min(1.2, L * 0.014);
    if (L < 12) return `M${f(ax)} ${f(ay)}L${f(bx)} ${f(by)}`;
    return `M${f(ax)} ${f(ay)}Q${f((ax + bx) / 2 - uy * bow)} ${f((ay + by) / 2 + ux * bow)} ${f(bx)} ${f(by)}`;
  };

  const lines = (segs: [V3, V3][], cls = 'e2', ext = 1.3) =>
    segs.length ? `<path class="${cls}" d="${segs.map(([a, b]) => stroke(P(...a), P(...b), ext)).join('')}"/>` : '';
  const loop = (a: V3[], cls = 'e2', ext = 1.0) => lines(a.map((p, i) => [p, a[(i + 1) % a.length]!] as [V3, V3]), cls, ext);
  /** Cara plana con relleno y contorno. */
  const plane = (a: V3[], classes: string, cls = 'e2', ext = 0.8) => fill(a, classes) + loop(a, cls, ext);

  const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, o: BoxOpt = {}) => {
    const w = o.w ?? 2;
    const small = Math.max(x1 - x0, y1 - y0, z1 - z0) < 0.4;
    const ext = small ? 0.35 : 1.5;
    const fy: V3[] = [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];
    const fx: V3[] = [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]];
    const ft: V3[] = [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
    const sil: [V3, V3][] = [
      [[x0, y0, z1], [x1, y0, z1]],
      [[x1, y0, z1], [x1, y0, z0]],
      [[x1, y0, z0], [x1, y1, z0]],
      [[x1, y1, z0], [x0, y1, z0]],
      [[x0, y1, z0], [x0, y1, z1]],
      [[x0, y1, z1], [x0, y0, z1]],
    ];
    const inn: [V3, V3][] = [
      [[x1, y1, z1], [x1, y0, z1]],
      [[x1, y1, z1], [x0, y1, z1]],
      [[x1, y1, z1], [x1, y1, z0]],
    ];
    const wi = Math.min(3, w + 1);
    return (
      '<g>' +
      fill(fy, o.y ?? 'p') +
      fill(fx, o.x ?? (small ? 'p2' : 'p hv')) +
      fill(ft, o.t ?? 'p') +
      lines(sil, `e${w}`, ext) +
      lines(inn, `e${wi}`, ext) +
      (o.inner ?? '') +
      '</g>'
    );
  };

  /** Sombra arrojada en el piso, recortada al cuarto. */
  const shadow = (x0: number, y0: number, x1: number, y1: number, h: number, clip: Rect, z = 0) => {
    const ox = SHADOW[0] * h;
    const oy = SHADOW[1] * h;
    const raw: XY[] = (
      [
        [x0, y0],
        [x1, y0],
        [x1, y1],
        [x0, y1],
      ] as XY[]
    ).flatMap(([x, y]) => [
      [x, y] as XY,
      [x + ox, y + oy] as XY,
    ]);
    const poly = clipRect(hull(raw), clip);
    if (poly.length < 3) return '';
    return fill(
      poly.map(([x, y]) => [x, y, z] as V3),
      'sh',
    );
  };

  /** Cilindro vertical: frascos, botellas, tazas, macetas. */
  const cyl = (cx: number, cy: number, z0: number, z1: number, r: number, o: CylOpt = {}) => {
    const rx = r * S * 1.2247;
    const ry = r * S * 0.7071;
    const b = P(cx, cy, z0);
    const t = P(cx, cy, z1);
    grow(b.x - rx, b.y + ry);
    grow(t.x + rx, t.y - ry);
    const w = o.w ?? 2;
    const body = `M${f(b.x - rx)} ${f(b.y)}L${f(t.x - rx)} ${f(t.y)}L${f(t.x + rx)} ${f(t.y)}L${f(b.x + rx)} ${f(b.y)}A${f(rx)} ${f(ry)} 0 0 1 ${f(b.x - rx)} ${f(b.y)}Z`;
    let out = (o.body ?? 'p')
      .split(' ')
      .filter(Boolean)
      .map((c) => `<path class="${c}" d="${body}"/>`)
      .join('');
    out += `<path class="e${w}" d="M${f(b.x - rx)} ${f(b.y)}L${f(t.x - rx)} ${f(t.y)}M${f(b.x + rx)} ${f(b.y)}L${f(t.x + rx)} ${f(t.y)}M${f(b.x + rx)} ${f(b.y)}A${f(rx)} ${f(ry)} 0 0 1 ${f(b.x - rx)} ${f(b.y)}"/>`;
    if (o.shade !== false && rx > 4) {
      let d = '';
      for (const k of [0.42, 0.62, 0.77, 0.88]) {
        const dx = rx * k;
        const dy = ry * Math.sqrt(1 - k * k);
        d += `M${f(t.x + dx)} ${f(t.y + dy)}L${f(b.x + dx)} ${f(b.y + dy)}`;
      }
      out += `<path class="e4" d="${d}"/>`;
    }
    out += `<ellipse class="${o.top ?? 'p'} s${w}" cx="${f(t.x)}" cy="${f(t.y)}" rx="${f(rx)}" ry="${f(ry)}"/>`;
    return out;
  };

  /** Puntos de un círculo sobre un plano. */
  const ring = (cx: number, cy: number, cz: number, r: number, pl: Plane, n = 28): V3[] => {
    const a: V3[] = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      const u = r * Math.cos(t);
      const v = r * Math.sin(t);
      a.push(pl === 'xz' ? [cx + u, cy, cz + v] : pl === 'xy' ? [cx + u, cy + v, cz] : [cx, cy + u, cz + v]);
    }
    return a;
  };
  const ringPath = (a: V3[], classes: string, w: 2 | 3 = 3) =>
    fill(a, classes) + `<polygon class="e${w}" points="${pts(a)}"/>`;

  /** Texto escrito sobre un plano (rótulos, letreros). */
  const label = (txt: string, x: number, y: number, z: number, pl: Plane, cls: string, anchor: 'start' | 'middle' | 'end' = 'middle') => {
    const p = P(x, y, z);
    const m = TEXT_M[pl].map((n) => n.toFixed(3)).join(' ');
    return `<text class="${cls}" text-anchor="${anchor}" transform="matrix(${m} ${f(p.x)} ${f(p.y)})">${txt}</text>`;
  };

  /** Figura en 2D (personas, plantas) parada en un punto del dibujo. */
  const at = (x: number, y: number, z: number, inner: string, bb: [number, number, number, number]) => {
    const p = P(x, y, z);
    grow(p.x + bb[0], p.y + bb[1]);
    grow(p.x + bb[2], p.y + bb[3]);
    return `<g transform="translate(${f(p.x)} ${f(p.y)})">${inner}</g>`;
  };

  /** Veta de madera sobre una cara superior. */
  const grain = (x0: number, y0: number, x1: number, y1: number, z: number, n = 4) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const tpos = (i + 0.3 + rnd() * 0.4) / n;
      const a0 = 0.04 + rnd() * 0.3;
      const a1 = 0.7 + rnd() * 0.26;
      const q: Point[] = [];
      for (let k = 0; k <= 10; k++) {
        const u = a0 + (a1 - a0) * (k / 10);
        const wob = Math.sin(u * 11 + i * 2.3) * 0.018 * (y1 - y0);
        q.push(P(x0 + (x1 - x0) * u, y0 + (y1 - y0) * tpos + wob, z));
      }
      d += 'M' + q.map((p) => `${f(p.x)} ${f(p.y)}`).join('L');
    }
    return `<path class="e4" d="${d}"/>`;
  };

  return { B, rnd, grow, P, fill, lines, loop, plane, box, shadow, cyl, ring, ringPath, label, at, grain };
}
