// La finca: el lugar de los negocios del campo (agricultura, ganadería, pesca, viveros).
// No hay local: hay un terreno cercado, una galera con techo de zinc donde se guardan los papeles,
// los surcos, el tractor y un puesto de venta junto al portón.
import { atiende, cliente, reponedor, sentado } from './figures';
import type { Rect, V3 } from './ink';
import type { AnchorKey, Kit } from './scene';

const LOT: Rect = [-0.7, -0.7, 7.9, 11.2];
const n1 = (n: number) => n.toFixed(1);

// ── Figuras en 2D (px, con el pie en 0,0) ────────────────────────────────

/** Mata de plátano: tallo y hojas anchas que se abren y caen. */
function mata(h: number, flip: boolean): string {
  const s = flip ? -1 : 1;
  const top = -h * 0.5;
  const tips: [number, number][] = [
    [-0.62, -0.7],
    [-0.26, -1.0],
    [0.2, -0.96],
    [0.66, -0.62],
    [0.02, -0.8],
  ];
  let out = `<path class="p2 s2" d="M-2.4 0L-1.5 ${n1(top)}L1.5 ${n1(top)}L2.4 0Z"/>`;
  for (const [tx, ty] of tips) {
    const x = tx * h * 0.6 * s;
    const y = ty * h;
    const mx = x / 2;
    const my = (top + y) / 2 - h * 0.1;
    const len = Math.hypot(x, y - top) || 1;
    const nx = (-(y - top) / len) * h * 0.11;
    const ny = (x / len) * h * 0.11;
    out +=
      `<path class="p s2" d="M0 ${n1(top)}Q${n1(mx + nx)} ${n1(my + ny)} ${n1(x)} ${n1(y)}Q${n1(mx - nx)} ${n1(my - ny)} 0 ${n1(top)}Z"/>` +
      `<path class="e4" d="M0 ${n1(top)}Q${n1(mx)} ${n1(my)} ${n1(x)} ${n1(y)}"/>`;
  }
  return out;
}

/** Hortaliza: un manojo bajo de hojas. */
function hortaliza(big: boolean): string {
  const k = big ? 1.25 : 1;
  return `<path class="p s3" d="M0 0C${n1(-7 * k)} ${n1(-2 * k)} ${n1(-7 * k)} ${n1(-8 * k)} ${n1(-2 * k)} ${n1(-7 * k)}C${n1(-2 * k)} ${n1(-12 * k)} ${n1(2 * k)} ${n1(-12 * k)} ${n1(2 * k)} ${n1(-7 * k)}C${n1(7 * k)} ${n1(-8 * k)} ${n1(7 * k)} ${n1(-2 * k)} 0 0Z"/><path class="e4" d="M0 0V${n1(-9 * k)}M0 ${n1(-2 * k)}L${n1(-4 * k)} ${n1(-5 * k)}M0 ${n1(-2 * k)}L${n1(4 * k)} ${n1(-5 * k)}"/>`;
}

/** Árbol de mango: tronco con horqueta y copa de bordes redondos. */
function arbol(): string {
  const cx = 2;
  const cy = -86;
  const rx = 38;
  const ry = 31;
  const n = 11;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(t) * rx * (1 + 0.07 * Math.sin(i * 2.7));
    const y = cy + Math.sin(t) * ry * (1 + 0.09 * Math.cos(i * 1.9));
    d += i === 0 ? `M${n1(x)} ${n1(y)}` : `A13 13 0 0 1 ${n1(x)} ${n1(y)}`;
  }
  let hatch = '';
  for (let i = 0; i < 9; i++) hatch += `M${n1(cx + 8 + i * 3.4)} ${n1(cy + 26 - i * 2.2)}l-9 9`;
  const leaves = [
    [-18, -98], [-4, -104], [12, -96], [-22, -82], [-6, -86], [10, -80], [22, -90], [-12, -70], [6, -68],
  ]
    .map(([x, y]) => `M${x} ${y}q4 -4 8 0`)
    .join('');
  return (
    `<path class="p2 s2" d="M-5 0C-3.6 -18 -4.4 -34 -9 -50L-4.6 -52L-0.6 -40L3.4 -55L7.6 -53C5.4 -38 4.4 -18 5.6 0Z"/>` +
    `<path class="e4" d="M-1 -6V-30M2 -10V-24"/>` +
    `<path class="p s2" d="${d}Z"/>` +
    `<path class="e4" d="${hatch}${leaves}"/>`
  );
}

/** Gallina. `flip` la pone mirando al otro lado. */
function gallina(flip: boolean): string {
  return (
    `<g${flip ? ' transform="scale(-1 1)"' : ''}>` +
    `<path class="e3" d="M-2 -3.8V0M1.2 -4V0M-3.6 0H-0.6M-0.2 0H2.8"/>` +
    `<path class="p s2" d="M-7 -9L-10 -14.5L-5 -11.6C-2 -13.2 3 -12.6 4.6 -9.6C5 -6 2 -3.4 -1.6 -3.4C-5 -3.4 -7.6 -6 -7 -9Z"/>` +
    `<path class="e4" d="M-3.6 -8.4Q-1 -6 1.6 -8.2"/>` +
    `<circle class="p s2" cx="6" cy="-12.6" r="2.5"/>` +
    `<path class="k" d="M8.2 -13L10.8 -12.2L8.2 -11.4ZM4.6 -14.8q0.9 -2 1.6 -0.2q0.9 -1.8 1.5 0.3Z"/>` +
    `<circle class="k" cx="6.7" cy="-13" r="0.5"/>` +
    `</g>`
  );
}

/** Sombrero de ala ancha sobre una cabeza con centro en (0, cy). */
function sombrero(cy: number): string {
  const b = cy - 3.6;
  return (
    `<ellipse class="p s2" cx="0" cy="${n1(b)}" rx="10.6" ry="3.1"/>` +
    `<path class="p s2" d="M-5.4 ${n1(b - 0.4)}C-5.4 ${n1(b - 7.6)} 5.4 ${n1(b - 7.6)} 5.4 ${n1(b - 0.4)}Z"/>` +
    `<path class="e3" d="M-5.2 ${n1(b - 1.6)}Q0 ${n1(b)} 5.2 ${n1(b - 1.6)}"/>`
  );
}

// ── El lugar ─────────────────────────────────────────────────────────────

export function campo(k: Kit): Partial<Record<AnchorKey, string>> {
  const { ft, add, A, range, shade, placeShadows, P, rnd, fill, lines, loop, plane, box, shadow, cyl, ring, ringPath, label, at, grain } = k;
  const seg = (a: V3, b: V3): [V3, V3] => [a, b];

  // ── Terreno, camino y pasto
  add('lote', loop([[-0.7, -0.7, 0], [7.9, -0.7, 0], [7.9, 11.2, 0], [-0.7, 11.2, 0]], 'dash', 0), 'fade');
  add(
    'camino',
    fill([[-0.7, 11.2, 0], [7.9, 11.2, 0], [7.9, 12.9, 0], [-0.7, 12.9, 0]], 'p2') +
      lines([seg([-0.7, 11.2, 0], [7.9, 11.2, 0]), seg([-0.7, 12.9, 0], [7.9, 12.9, 0])], 'e3', 0) +
      lines(
        range(-0.5, 7.4, 0.8).flatMap((x) => [seg([x, 11.75, 0], [x + 0.45, 11.75, 0]), seg([x + 0.25, 12.4, 0], [x + 0.7, 12.4, 0])]),
        'e4',
        0,
      ),
    'fade',
  );
  add('calle', label('CAMINO REAL', 0.4, 13.6, 0, 'xy', 'street', 'start'), 'fade');
  add(
    'norte',
    loop(ring(9.5, 12.5, 0, 0.32, 'xy'), 'e3', 0) +
      fill([[9.5, 12.0, 0], [9.6, 12.62, 0], [9.5, 12.5, 0], [9.4, 12.62, 0]], 'k') +
      label('N', 9.5, 11.86, 0, 'xy', 'room', 'middle'),
    'fade',
  );
  const tufts: [V3, V3][] = [];
  for (let i = 0; i < 70; i++) {
    const x = -0.5 + rnd() * 8.1;
    const y = -0.5 + rnd() * 11.4;
    const inGalera = x > 0.1 && x < 3.8 && y > 0.2 && y < 3.2;
    const inCultivo = x > 3.9 && y > 2.0 && y < 6.5;
    if (inGalera || inCultivo) continue;
    tufts.push(seg([x, y, 0], [x - 0.04, y, 0.1]), seg([x + 0.05, y, 0], [x + 0.05, y, 0.14]), seg([x + 0.1, y, 0], [x + 0.15, y, 0.09]));
  }
  add('pasto', lines(tufts, 'e4', 0), 'fade');
  placeShadows();

  // ── Cerca de estacones y alambre; algunos estacones retoñan
  const cerca = (id: string, a: [number, number], b: [number, number], n: number) => {
    let h = '';
    for (let i = 0; i <= n; i++) {
      const x = a[0] + ((b[0] - a[0]) * i) / n;
      const y = a[1] + ((b[1] - a[1]) * i) / n;
      h += box(x - 0.045, y - 0.045, 0, x + 0.045, y + 0.045, 0.95, { w: 3 });
      if (i % 3 === 1) h += lines([seg([x, y, 0.95], [x - 0.1, y, 1.22]), seg([x, y, 0.95], [x + 0.09, y, 1.27]), seg([x, y, 0.95], [x, y + 0.1, 1.16])], 'e3', 0);
    }
    h += lines([0.4, 0.78].map((z) => seg([a[0], a[1], z], [b[0], b[1], z])), 'e3', 0);
    add(id, h, 'rise');
  };
  cerca('cerca-fondo', [-0.5, -0.5], [7.7, -0.5], 9);
  cerca('cerca-izq', [-0.5, 0.42], [-0.5, 11.0], 11);

  // ── Tanque de agua en su torre
  add(
    'tanque-torre',
    lines(
      [
        seg([5.7, 0.6, 0], [5.7, 0.6, 1.5]),
        seg([6.5, 0.6, 0], [6.5, 0.6, 1.5]),
        seg([5.7, 1.4, 0], [5.7, 1.4, 1.5]),
        seg([6.5, 1.4, 0], [6.5, 1.4, 1.5]),
      ],
      'e1',
      0,
    ) +
      lines(
        [
          seg([5.7, 1.4, 0.15], [6.5, 1.4, 1.35]),
          seg([6.5, 1.4, 0.15], [5.7, 1.4, 1.35]),
          seg([6.5, 0.6, 0.15], [6.5, 1.4, 1.35]),
          seg([6.5, 1.4, 0.15], [6.5, 0.6, 1.35]),
        ],
        'e3',
        0,
      ) +
      box(5.6, 0.5, 1.5, 6.6, 1.5, 1.58, { w: 2 }),
  );
  add(
    'tanque',
    cyl(6.1, 1.0, 1.58, 2.42, 0.42, { body: 'p2' }) +
      cyl(6.1, 1.0, 2.42, 2.48, 0.16, { w: 3 }) +
      lines([seg([6.52, 1.42, 1.58], [6.52, 1.42, 0.35]), seg([6.52, 1.42, 0.35], [6.62, 1.42, 0.35])], 'e2', 0),
  );
  shade(shadow(5.6, 0.5, 6.6, 1.5, 2.4, LOT));

  // ── Galera: piso de concreto, horcones y techo de zinc (la mitad del frente va cortada, para ver adentro)
  const X0 = 0.1, X1 = 3.8, YB = 0.2, YR = 1.7, YF = 3.2, ZE = 2.25, ZR = 2.95;
  add('galera-piso', plane([[0.2, 0.3, 0], [3.7, 0.3, 0], [3.7, 3.1, 0], [0.2, 3.1, 0]], 'p', 'e3', 0), 'fade');
  const horcon = (x: number, y: number) => box(x - 0.06, y - 0.06, 0, x + 0.06, y + 0.06, ZE, { w: 2 });
  add('galera-horcones-fondo', horcon(0.3, 0.4) + horcon(1.95, 0.4) + horcon(3.6, 0.4), 'rise');
  add(
    'galera-techo',
    fill([[X0, YB, ZE], [X1, YB, ZE], [X1, YR, ZR], [X0, YR, ZR]], 'p2') +
      lines(range(X0 + 0.14, X1, 0.14).map((x) => seg([x, YB, ZE], [x, YR, ZR])), 'e4', 0) +
      loop([[X0, YB, ZE], [X1, YB, ZE], [X1, YR, ZR], [X0, YR, ZR]], 'e2', 0),
    'rise',
  );

  if (ft.archivero) {
    let d = lines([0.46, 0.9].map((z) => seg([0.4, 1.0, z], [1.0, 1.0, z])), 'e2', 0);
    for (const zc of [0.28, 0.72, 1.16]) d += fill([[0.61, 1.0, zc], [0.79, 1.0, zc], [0.79, 1.0, zc + 0.04], [0.61, 1.0, zc + 0.04]], 'k');
    add('archivero', box(0.4, 0.45, 0, 1.0, 1.0, 1.35, { w: 1, inner: d }));
    add('archivero-carpeta', box(0.5, 0.55, 1.35, 0.9, 0.9, 1.4, { t: 'p2', x: 'p2', w: 3 }));
    A.archivero = P(0.7, 0.72, 1.4);
    shade(shadow(0.4, 0.45, 1.0, 1.0, 1.35, LOT));
  }

  // Mesa de trabajo con los papeles de la finca
  add('mesa-patas', lines([seg([1.56, 0.76, 0], [1.56, 0.76, 0.74]), seg([1.56, 1.34, 0], [1.56, 1.34, 0.74]), seg([3.24, 1.34, 0], [3.24, 1.34, 0.74]), seg([3.24, 0.76, 0], [3.24, 0.76, 0.74])], 'e2', 0));
  add('escritorio', box(1.5, 0.7, 0.74, 3.3, 1.4, 0.79, { y: 'p2', w: 1, inner: grain(1.5, 0.7, 3.3, 1.4, 0.79, 4) }));
  add(
    'papeles',
    box(1.6, 0.9, 0.79, 1.98, 1.26, 0.805, { w: 3 }) +
      box(1.64, 0.87, 0.805, 2.02, 1.23, 0.82, { w: 3, inner: lines(range(0.93, 1.2, 0.045).map((y) => seg([1.69, y, 0.82], [1.95 - ((y * 7) % 0.12), y, 0.82])), 'e4', 0) }),
  );
  A.papeles = P(1.83, 1.05, 0.82);
  if (ft.computadora) {
    add('monitor-pie', box(2.4, 0.92, 0.79, 2.6, 1.02, 0.82, { w: 3 }) + box(2.47, 0.9, 0.82, 2.53, 0.94, 0.92, { w: 3 }));
    const scr =
      lines(range(0.98, 1.32, 0.06).map((z) => seg([2.18, 0.92, z], [2.82, 0.92, z])), 'rf', 0) +
      lines([2.36, 2.58].map((x) => seg([x, 0.92, 0.96], [x, 0.92, 1.34])), 'rf', 0);
    add('monitor', box(2.1, 0.86, 0.9, 2.9, 0.92, 1.38, { t: 'p2', x: 'p3', y: 'k', w: 1, inner: scr }));
    add('teclado', box(2.25, 1.1, 0.79, 2.75, 1.26, 0.81, { w: 3, inner: lines(range(1.14, 1.26, 0.035).map((y) => seg([2.28, y, 0.81], [2.72, y, 0.81])), 'e4', 0) }));
    A.monitor = P(2.5, 0.89, 1.38);
  }
  add(
    'radio',
    box(2.98, 0.8, 0.79, 3.24, 0.92, 0.96, { t: 'p2', w: 3, inner: loop(ring(3.07, 0.92, 0.875, 0.05, 'xz', 12), 'e4', 0) + lines([seg([3.15, 0.92, 0.84], [3.21, 0.92, 0.84]), seg([3.15, 0.92, 0.9], [3.21, 0.92, 0.9])], 'e4', 0) }) +
      lines([seg([3.2, 0.86, 0.96], [3.34, 0.86, 1.3])], 'e3', 0),
  );
  if (ft.biometria) add('huellero', box(2.98, 1.14, 0.79, 3.2, 1.32, 0.85, { t: 'p2', w: 2, inner: plane([[3.03, 1.18, 0.85], [3.15, 1.18, 0.85], [3.15, 1.28, 0.85], [3.03, 1.28, 0.85]], 'k', 'e3', 0) }));
  // Pala y rastrillo recostados al horcón
  add(
    'herramientas',
    plane([[3.36, 0.52, 0], [3.52, 0.52, 0], [3.52, 0.52, 0.3], [3.36, 0.52, 0.3]], 'p3', 'e2', 0) +
      lines([seg([3.44, 0.52, 0.3], [3.5, 0.44, 1.5]), seg([3.2, 0.5, 0], [3.3, 0.42, 1.55]), seg([3.08, 0.5, 0], [3.32, 0.5, 0])], 'e1', 0) +
      lines(range(3.08, 3.33, 0.06).map((x) => seg([x, 0.5, 0], [x, 0.5, 0.1])), 'e2', 0),
  );
  add('banco', box(2.25, 1.62, 0, 2.65, 1.96, 0.45, { t: 'p2', w: 2 }));
  if (ft.equipo >= 2) add('persona-escritorio', at(2.45, 1.79, 0, sentado(), [-13, -63, 13, 0]));

  // Sacos apilados
  const saco = (x0: number, y0: number, z0: number, txt?: string) =>
    box(x0, y0, z0, x0 + 0.8, y0 + 0.5, z0 + 0.22, {
      t: 'p',
      x: 'p2',
      y: 'p2',
      w: 2,
      inner:
        lines([seg([x0 + 0.08, y0 + 0.5, z0 + 0.03], [x0 + 0.08, y0 + 0.5, z0 + 0.19]), seg([x0 + 0.72, y0 + 0.5, z0 + 0.03], [x0 + 0.72, y0 + 0.5, z0 + 0.19])], 'e4', 0) +
        (txt ? label(txt, x0 + 0.4, y0 + 0.5, z0 + 0.06, 'xz', 'tiny', 'middle') : ''),
    });
  add('sacos', saco(0.45, 1.95, 0) + saco(0.45, 2.5, 0) + saco(0.45, 2.2, 0.22) + saco(0.5, 2.28, 0.44, 'ABONO'));
  shade(shadow(0.45, 1.95, 1.25, 3.0, 0.66, LOT));

  // Armadura del techo: cumbrera, cerchas y correas del lado cortado
  const cercha = (x: number): [V3, V3][] => [
    seg([x, YB, ZE], [x, YR, ZR]),
    seg([x, YR, ZR], [x, YF, ZE]),
    seg([x, 0.4, ZE], [x, 3.0, ZE]),
    seg([x, YR, ZE], [x, YR, ZR]),
  ];
  add(
    'galera-armadura',
    lines([...cercha(0.3), ...cercha(1.95)], 'e3', 0) +
      lines(range(0.85, X1, 0.55).map((x) => seg([x, YR, ZR], [x, YF, ZE])), 'e4', 0) +
      lines([seg([X0, 2.2, 2.717], [X1, 2.2, 2.717]), seg([X0, 2.7, 2.483], [X1, 2.7, 2.483])], 'e4', 0) +
      lines([seg([X0, YF, ZE], [X1, YF, ZE]), seg([X0, YR, ZR], [X0, YF, ZE])], 'dash', 0) +
      lines(cercha(3.6), 'e2', 0) +
      lines([seg([X0, YR, ZR], [X1, YR, ZR])], 'e1', 0),
    'rise',
  );
  add('galera-horcones', horcon(0.3, 3.0) + horcon(1.95, 3.0) + horcon(3.6, 3.0), 'rise');

  // ── Surcos: plátano al fondo, hortalizas adelante
  const filas = [4.3, 4.95, 5.6, 6.25, 6.9];
  filas.forEach((x, r) => {
    const alto = r < 2;
    let h =
      fill([[x - 0.2, 2.2, 0], [x + 0.2, 2.2, 0], [x + 0.2, 6.3, 0], [x - 0.2, 6.3, 0]], 'p3') +
      lines([seg([x - 0.2, 2.2, 0], [x - 0.2, 6.3, 0]), seg([x + 0.2, 2.2, 0], [x + 0.2, 6.3, 0])], 'e4', 0);
    let i = 0;
    for (const y of range(alto ? 2.5 + r * 0.3 : 2.4, 6.2, alto ? 0.95 : 0.46)) {
      if (alto) {
        const tall = 46 + rnd() * 14;
        h += at(x, y, 0, mata(tall, (i + r) % 2 === 0), [-34, -62, 34, 0]);
        shade(shadow(x - 0.25, y - 0.25, x + 0.25, y + 0.25, 0.9, LOT));
      } else h += at(x, y, 0, hortaliza((i + r) % 3 === 0), [-9, -15, 9, 0]);
      i++;
    }
    add(`surco-${r}`, h);
  });

  // ── Hamaca entre la galera y el palo de mango
  const h1 = P(0.34, 3.08, 1.3);
  const h2 = P(0.78, 5.86, 1.3);
  const mx = (h1.x + h2.x) / 2;
  const my = (h1.y + h2.y) / 2;
  add(
    'hamaca',
    `<path class="p2 s2" d="M${n1(h1.x)} ${n1(h1.y)}Q${n1(mx + 4)} ${n1(my + 40)} ${n1(h2.x)} ${n1(h2.y)}Q${n1(mx + 2)} ${n1(my + 18)} ${n1(h1.x)} ${n1(h1.y)}Z"/>` +
      `<path class="e4" d="M${n1(h1.x)} ${n1(h1.y)}Q${n1(mx + 3)} ${n1(my + 26)} ${n1(h2.x)} ${n1(h2.y)}M${n1(h1.x)} ${n1(h1.y)}Q${n1(mx + 3.5)} ${n1(my + 33)} ${n1(h2.x)} ${n1(h2.y)}"/>`,
  );
  shade(shadow(0.4, 3.5, 0.75, 5.5, 0.5, LOT));
  add('arbol', at(0.78, 5.95, 0, arbol(), [-40, -124, 44, 0]));
  shade(shadow(0.2, 5.3, 1.5, 6.5, 0.5, LOT));

  if (ft.equipo >= 3) {
    add('persona-cultivo', at(6.45, 6.85, 0, reponedor('caja') + sombrero(-65.5), [-25, -80, 13, 0]));
    shade(shadow(6.33, 6.73, 6.57, 6.97, 1.6, LOT));
  }

  // ── Tractor, entre el palo de mango y el portón
  const rueda = (cx: number, cy: number, r: number) =>
    ringPath(ring(cx, cy, r, r, 'xz'), 'k', 2) + ringPath(ring(cx, cy, r, r * 0.6, 'xz', 20), 'p', 3) + fill(ring(cx, cy, r, r * 0.15, 'xz', 8), 'k');
  const tx = 1.9;
  const ty = 6.9;
  add('tractor-ruedas-fondo', rueda(tx + 0.45, ty + 0.05, 0.55) + rueda(tx + 1.75, ty + 0.14, 0.3));
  add(
    'tractor',
    box(tx + 0.1, ty + 0.2, 0.5, tx + 0.95, ty + 0.8, 0.95, { t: 'p2', w: 2 }) +
      box(tx + 0.95, ty + 0.28, 0.55, tx + 2.05, ty + 0.72, 1.08, {
        t: 'p2',
        x: 'p',
        w: 1,
        inner:
          lines(range(0.62, 1.05, 0.07).map((z) => seg([tx + 2.05, ty + 0.34, z], [tx + 2.05, ty + 0.66, z])), 'e4', 0) +
          lines(range(tx + 1.1, tx + 1.9, 0.12).map((x) => seg([x, ty + 0.72, 0.72], [x, ty + 0.72, 0.98])), 'e4', 0),
      }) +
      lines([seg([tx + 1.65, ty + 0.5, 1.08], [tx + 1.65, ty + 0.5, 1.58])], 'e1', 0) +
      box(tx + 0.32, ty + 0.35, 0.95, tx + 0.72, ty + 0.65, 1.03, { t: 'k', w: 3 }) +
      lines([seg([tx + 1.0, ty + 0.5, 1.08], [tx + 0.82, ty + 0.5, 1.32])], 'e1', 0) +
      loop(ring(tx + 0.8, ty + 0.5, 1.34, 0.14, 'yz', 14), 'e2', 0) +
      lines(
        [
          seg([tx + 0.15, ty + 0.25, 0.95], [tx + 0.15, ty + 0.25, 1.8]),
          seg([tx + 0.15, ty + 0.75, 0.95], [tx + 0.15, ty + 0.75, 1.8]),
          seg([tx + 0.15, ty + 0.25, 1.8], [tx + 0.15, ty + 0.75, 1.8]),
        ],
        'e1',
        0,
      ),
  );
  add('tractor-ruedas', rueda(tx + 0.45, ty + 0.95, 0.55) + rueda(tx + 1.75, ty + 0.86, 0.3));
  shade(shadow(tx, ty, tx + 2.1, ty + 1.0, 0.9, LOT));

  // ── Puesto de venta, a un lado del portón
  const px = 4.6;
  const py = 9.15;
  add('persona-mostrador', at(px + 1.1, py - 0.3, 0, atiende('polo') + sombrero(-65.5), [-14, -80, 14, 0]));
  A.equipo = P(px + 1.1, py - 0.3, 1.62);
  // Báscula de reloj colgada de su poste
  add(
    'bascula',
    box(px - 0.4, py + 0.25, 0, px - 0.3, py + 0.35, 1.95, { w: 2 }) +
      lines([seg([px - 0.35, py + 0.3, 1.9], [px - 0.1, py + 0.3, 1.9]), seg([px - 0.12, py + 0.3, 1.9], [px - 0.12, py + 0.3, 1.72])], 'e1', 0) +
      ringPath(ring(px - 0.12, py + 0.3, 1.55, 0.17, 'xz', 20), 'p', 2) +
      lines(
        [
          seg([px - 0.12, py + 0.3, 1.55], [px - 0.03, py + 0.3, 1.64]),
          seg([px - 0.12, py + 0.3, 1.38], [px - 0.28, py + 0.3, 1.02]),
          seg([px - 0.12, py + 0.3, 1.38], [px + 0.04, py + 0.3, 1.02]),
        ],
        'e3',
        0,
      ) +
      ringPath(ring(px - 0.12, py + 0.3, 1.0, 0.2, 'xy', 18), 'p2', 2),
  );
  add(
    'puesto-patas',
    lines(
      [
        seg([px + 0.06, py + 0.05, 0], [px + 0.06, py + 0.05, 0.8]),
        seg([px + 0.06, py + 0.59, 0], [px + 0.06, py + 0.59, 0.8]),
        seg([px + 2.14, py + 0.59, 0], [px + 2.14, py + 0.59, 0.8]),
        seg([px + 2.14, py + 0.05, 0], [px + 2.14, py + 0.05, 0.8]),
      ],
      'e2',
      0,
    ),
  );
  add(
    'puesto',
    box(px, py, 0.8, px + 2.2, py + 0.65, 0.86, { y: 'p2', w: 1, inner: grain(px, py, px + 2.2, py + 0.65, 0.86, 4) }) +
      plane([[px + 0.1, py + 0.65, 0.44], [px + 2.1, py + 0.65, 0.44], [px + 2.1, py + 0.65, 0.8], [px + 0.1, py + 0.65, 0.8]], 'p', 'e3', 0) +
      label('DE LA FINCA', px + 1.1, py + 0.65, 0.55, 'xz', 'tiny', 'middle'),
  );
  shade(shadow(px, py, px + 2.2, py + 0.65, 0.86, LOT));
  let frutas = '';
  for (const [dx, dy] of [[-0.08, -0.06], [0.07, -0.07], [0, 0.04], [-0.1, 0.07], [0.1, 0.06]] as [number, number][])
    frutas += ringPath(ring(px + 0.32 + dx, py + 0.33 + dy, 1.03, 0.06, 'xy', 10), 'p', 3);
  add('canasta', cyl(px + 0.32, py + 0.33, 0.86, 1.02, 0.2, { body: 'p2', top: 'p3' }) + frutas);
  add(
    'cosecha',
    box(px + 0.7, py + 0.1, 0.86, px + 1.25, py + 0.55, 1.04, {
      t: 'p3',
      w: 2,
      inner: lines(
        [0.92, 0.98].flatMap((z) => [seg([px + 0.7, py + 0.55, z], [px + 1.25, py + 0.55, z]), seg([px + 1.25, py + 0.1, z], [px + 1.25, py + 0.55, z])]),
        'e4',
        0,
      ),
    }) +
      at(px + 0.82, py + 0.25, 1.04, hortaliza(false), [-9, -15, 9, 0]) +
      at(px + 1.1, py + 0.23, 1.04, hortaliza(true), [-9, -15, 9, 0]) +
      at(px + 0.96, py + 0.43, 1.04, hortaliza(false), [-9, -15, 9, 0]),
  );
  add(
    'libreta',
    box(px + 1.4, py + 0.15, 0.86, px + 1.6, py + 0.5, 0.875, { w: 3, inner: lines(range(py + 0.21, py + 0.45, 0.05).map((y) => seg([px + 1.42, y, 0.875], [px + 1.5 + rnd() * 0.07, y, 0.875])), 'e4', 0) }) +
      box(px + 1.6, py + 0.15, 0.86, px + 1.8, py + 0.5, 0.875, { w: 3, inner: lines(range(py + 0.21, py + 0.35, 0.05).map((y) => seg([px + 1.62, y, 0.875], [px + 1.7 + rnd() * 0.07, y, 0.875])), 'e4', 0) }) +
      lines([seg([px + 1.66, py + 0.39, 0.88], [px + 1.78, py + 0.51, 0.88])], 'e1', 0),
  );
  A.libreta = P(px + 1.6, py + 0.33, 0.875);
  add(
    'caja',
    box(px + 1.9, py + 0.05, 0.86, px + 2.14, py + 0.21, 0.98, {
      t: 'p2',
      w: 1,
      inner: lines(
        [
          seg([px + 1.98, py + 0.13, 0.98], [px + 1.98, py + 0.13, 1.02]),
          seg([px + 2.06, py + 0.13, 0.98], [px + 2.06, py + 0.13, 1.02]),
          seg([px + 1.98, py + 0.13, 1.02], [px + 2.06, py + 0.13, 1.02]),
        ],
        'e2',
        0,
      ),
    }),
  );
  A.caja = P(px + 2.02, py + 0.13, 1.02);
  if (ft.celular) {
    add('celular', box(px + 1.88, py + 0.31, 0.86, px + 2.0, py + 0.53, 0.88, { t: 'k', x: 'p3', y: 'p3', w: 2, inner: lines([seg([px + 1.91, py + 0.37, 0.88], [px + 1.95, py + 0.47, 0.88])], 'rf', 0) }));
    A.celular = P(px + 1.94, py + 0.42, 0.88);
  }
  add('cliente', at(px + 1.1, py + 1.2, 0, cliente(), [-13, -75, 20, 0]));
  A.cliente = P(px + 1.1, py + 1.2, 1.62);
  shade(shadow(px + 0.98, py + 1.08, px + 1.22, py + 1.32, 1.6, LOT));

  // Cajones de cosecha y gallinas sueltas, del otro lado del portón
  const cajon = (x0: number, y0: number, z0: number) =>
    box(x0, y0, z0, x0 + 0.6, y0 + 0.42, z0 + 0.3, {
      t: 'p3',
      w: 2,
      inner: lines(
        [0.1, 0.2].flatMap((dz) => [seg([x0, y0 + 0.42, z0 + dz], [x0 + 0.6, y0 + 0.42, z0 + dz]), seg([x0 + 0.6, y0, z0 + dz], [x0 + 0.6, y0 + 0.42, z0 + dz])]),
        'e4',
        0,
      ),
    });
  add(
    'cajones',
    cajon(0.5, 9.3, 0) + cajon(1.16, 9.3, 0) + cajon(0.82, 9.32, 0.3) + at(0.98, 9.46, 0.6, hortaliza(true), [-9, -15, 9, 0]) + at(1.24, 9.56, 0.6, hortaliza(false), [-9, -15, 9, 0]),
  );
  shade(shadow(0.5, 9.3, 1.76, 9.74, 0.6, LOT));
  add('gallinas', at(3.4, 9.2, 0, gallina(true), [-12, -17, 12, 0]) + at(2.2, 10.2, 0, gallina(false), [-12, -17, 12, 0]) + at(4.0, 10.3, 0, gallina(true), [-12, -17, 12, 0]));

  // ── Portón abierto, con el letrero colgado del travesaño
  const hoja = (x: number): string =>
    lines([0.3, 0.65, 1.0].map((z) => seg([x, 10.95, z], [x, 9.95, z])), 'e2', 0) +
    lines([seg([x, 9.95, 0.2], [x, 9.95, 1.1]), seg([x, 10.95, 0.3], [x, 9.95, 1.0])], 'e2', 0);
  add('porton-hojas', hoja(2.84) + hoja(4.56), 'rise');
  add('marco-a', box(2.62, 10.95, 0, 2.8, 11.13, 2.5, { w: 1 }), 'rise');
  add('marco-b', box(4.6, 10.95, 0, 4.78, 11.13, 2.5, { w: 1 }), 'rise');
  add(
    'dintel',
    box(2.56, 10.98, 2.5, 4.84, 11.1, 2.62, { w: 1 }) +
      lines([seg([3.2, 11.04, 2.5], [3.2, 11.04, 2.4]), seg([4.2, 11.04, 2.5], [4.2, 11.04, 2.4])], 'e2', 0) +
      plane([[3.05, 11.04, 1.92], [4.35, 11.04, 1.92], [4.35, 11.04, 2.4], [3.05, 11.04, 2.4]], 'p', 'e2', 0) +
      label('FINCA', 3.7, 11.04, 2.05, 'xz', 'sign', 'middle'),
    'rise',
  );
  A.entrada = P(3.7, 11.05, 2.62);
  if (ft.camaras) add('camara', box(4.78, 11.0, 2.24, 5.0, 11.1, 2.36, { t: 'p3', x: 'k', y: 'p3', w: 2 }));

  cerca('cerca-der', [7.7, 0.42], [7.7, 11.0], 11);
  cerca('cerca-frente-a', [-0.5, 11.0], [2.4, 11.0], 3);
  cerca('cerca-frente-b', [5.0, 11.0], [7.7, 11.0], 3);
  add(
    'aviso',
    plane([[1.5, 11.06, 0.5], [2.35, 11.06, 0.5], [2.35, 11.06, 1.18], [1.5, 11.06, 1.18]], 'p', 'e2', 0) +
      label('PRIVACIDAD', 1.925, 11.06, 1.05, 'xz', 'tiny', 'middle') +
      lines([seg([1.58, 11.06, 1.0], [2.27, 11.06, 1.0])], 'e3', 0) +
      lines(range(0.62, 0.95, 0.07).map((z) => seg([1.58, 11.06, z], [2.15 + ((z * 31) % 0.1), 11.06, z])), 'e4', 0),
  );
  A.aviso = P(1.925, 11.06, 1.18);

  return {
    archivero: 'El archivero de la galera',
    papeles: 'Los papeles de la galera',
    libreta: 'El cuaderno de ventas',
    celular: 'El WhatsApp de la finca',
    caja: 'La caja del puesto',
    aviso: 'El aviso del portón',
    cliente: 'El comprador',
    entrada: 'El portón',
    equipo: 'Quien atiende el puesto',
  };
}
