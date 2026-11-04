// Escena axonométrica «Anatomía de tu negocio».
// Funciones puras: a partir del perfil devuelven el dibujo como piezas SVG con id estable,
// las anclas de los 8 puntos y el nombre del lugar de cada área.
// Todo el SVG se genera aquí a partir de números y textos fijos: no contiene datos del usuario.
import type { AreaId, Profile } from '../engine/types';

export interface SceneFeatures {
  archivero: boolean;
  computadora: boolean;
  celular: boolean;
  camaras: boolean;
  biometria: boolean;
  nube: boolean;
  contador: boolean;
  ti: boolean;
  marketing: boolean;
  delivery: boolean;
  /** Personas del equipo dibujadas (1 a 3). */
  equipo: 1 | 2 | 3;
}

export type Point = { x: number; y: number };
export type ViewBox = [number, number, number, number];

export interface SceneItem {
  id: string;
  kind: 'fade' | 'drop' | 'rise';
  html: string;
}

export interface Callout {
  area: AreaId;
  n: number;
  anchor: Point;
  bubble: Point;
  place: string;
}

export interface Scene {
  items: SceneItem[];
  flows: { id: string; html: string }[];
  callouts: Callout[];
  viewBox: ViewBox;
}

export const AREA_ORDER: AreaId[] = [
  'inventario', 'licitud', 'transparencia', 'derechos', 'seguridad', 'terceros', 'incidentes', 'cultura',
];

/** El negocio de ejemplo de la portada: una farmacia de barrio con todo. */
export const DEMO_FEATURES: SceneFeatures = {
  archivero: true, computadora: true, celular: true, camaras: true, biometria: false,
  nube: true, contador: true, ti: false, marketing: false, delivery: true, equipo: 1,
};

export function featuresFromProfile(profile: Profile): SceneFeatures {
  const has = (q: string, id: string) => (profile[q] ?? []).includes(id);
  const tam = profile.tamano?.[0];
  return {
    archivero: has('canales', 'papel') || has('herramientas', 'archivo'),
    computadora: has('herramientas', 'excel') || has('herramientas', 'sistema'),
    celular: has('canales', 'whatsapp') || has('herramientas', 'celular'),
    camaras: has('canales', 'camaras'),
    biometria: has('canales', 'biometria'),
    nube: has('herramientas', 'nube'),
    contador: has('terceros', 'contador'),
    ti: has('terceros', 'ti'),
    marketing: has('terceros', 'marketing'),
    delivery: has('terceros', 'delivery'),
    equipo: tam === '11-50' || tam === '50+' ? 3 : tam === '2-10' ? 2 : 1,
  };
}

// ── Proyección isométrica ────────────────────────────────────────────────
const S = 44;
const C = Math.cos(Math.PI / 6);
const f = (n: number) => n.toFixed(1);
type V3 = [number, number, number];

function makeBuilder() {
  const B = [Infinity, Infinity, -Infinity, -Infinity];
  const grow = (x: number, y: number) => {
    B[0] = Math.min(B[0]!, x); B[1] = Math.min(B[1]!, y); B[2] = Math.max(B[2]!, x); B[3] = Math.max(B[3]!, y);
  };
  const P = (x: number, y: number, z = 0): Point => {
    const p = { x: (x - y) * C * S, y: (x + y) * 0.5 * S - z * S };
    grow(p.x, p.y);
    return p;
  };
  const pts = (a: V3[]) => a.map((q) => { const p = P(...q); return `${f(p.x)},${f(p.y)}`; }).join(' ');
  const poly = (a: V3[], cls = '') => `<polygon class="${cls}" points="${pts(a)}"/>`;
  const seg = (a: V3, b: V3, cls = 'ln') => {
    const p = P(...a), q = P(...b);
    return `<line class="${cls}" x1="${f(p.x)}" y1="${f(p.y)}" x2="${f(q.x)}" y2="${f(q.y)}"/>`;
  };
  const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, cls = '', inner = '') =>
    `<g class="bx ${cls}">` +
    poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], 'fy') +
    poly([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], 'fx') +
    poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], 'ft') +
    inner + '</g>';
  const ringXZ = (cx: number, y: number, cz: number, r: number, cls: string) => {
    const a: V3[] = [];
    for (let i = 0; i < 24; i++) { const t = (i / 24) * Math.PI * 2; a.push([cx + r * Math.cos(t), y, cz + r * Math.sin(t)]); }
    return poly(a, cls);
  };
  const person = (x: number, y: number, cls = '') => {
    const b = P(x, y, 0), t = P(x, y, 1.22), h = P(x, y, 1.46); P(x, y, 1.65);
    const rs = 1.2247 * 0.23 * S, ys = 0.707 * 0.23 * S, rb = 1.2247 * 0.12 * S, yb = 0.707 * 0.12 * S;
    return `<g class="person ${cls}"><path class="person-b" d="M${f(t.x - rs)} ${f(t.y)}L${f(b.x - rb)} ${f(b.y)}A${f(rb)} ${f(yb)} 0 0 0 ${f(b.x + rb)} ${f(b.y)}L${f(t.x + rs)} ${f(t.y)}A${f(rs)} ${f(ys)} 0 0 0 ${f(t.x - rs)} ${f(t.y)}Z"/>` +
      `<ellipse class="person-s" cx="${f(t.x)}" cy="${f(t.y)}" rx="${f(rs)}" ry="${f(ys)}"/><circle class="head" cx="${f(h.x)}" cy="${f(h.y)}" r="${f(0.15 * S)}"/></g>`;
  };
  return { B, grow, P, poly, seg, box, ringXZ, person };
}

// Pseudo-aleatorio fijo: el dibujo siempre es igual.
function makeRnd() {
  let seed = 7;
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
}

type AnchorKey =
  | 'archivero' | 'papeles' | 'libreta' | 'celular' | 'caja' | 'aviso' | 'cliente' | 'monitor'
  | 'nube' | 'contador' | 'ti' | 'marketing' | 'delivery' | 'router' | 'entrada' | 'equipo';

const OFFSET: Record<AnchorKey, Point> = {
  archivero: { x: -46, y: -64 }, papeles: { x: -40, y: -70 }, libreta: { x: -64, y: -36 }, celular: { x: -70, y: -40 },
  caja: { x: 30, y: -66 }, aviso: { x: 56, y: -46 }, cliente: { x: 62, y: 6 }, monitor: { x: 10, y: -78 },
  nube: { x: 34, y: -40 }, contador: { x: 46, y: -46 }, ti: { x: 46, y: -46 }, marketing: { x: 46, y: -46 },
  delivery: { x: 64, y: -24 }, router: { x: 26, y: -60 }, entrada: { x: -72, y: -30 }, equipo: { x: -60, y: -50 },
};

const PLACE: Record<AnchorKey, string> = {
  archivero: 'El archivero', papeles: 'Los papeles del escritorio', libreta: 'La libreta del mostrador',
  celular: 'El WhatsApp del negocio', caja: 'La caja', aviso: 'El aviso junto a la caja', cliente: 'El cliente que pregunta',
  monitor: 'La computadora', nube: 'La nube', contador: 'El contador', ti: 'El soporte técnico', marketing: 'La agencia de marketing',
  delivery: 'El delivery', router: 'El internet del local', entrada: 'La entrada', equipo: 'Quien atiende',
};

function compose(ft: SceneFeatures): Scene {
  const { B, grow, P, poly, seg, box, ringXZ, person } = makeBuilder();
  const rnd = makeRnd();
  const items: SceneItem[] = [];
  const add = (id: string, html: string, kind: SceneItem['kind'] = 'drop') => items.push({ id, kind, html });
  const A: Partial<Record<AnchorKey, Point>> = {};

  // Terreno, acera y calle
  add('lote', poly([[-0.7, -0.7, 0], [7.9, -0.7, 0], [7.9, 11.2, 0], [-0.7, 11.2, 0]], 'lot'), 'fade');
  let walk = box(-0.7, 11.2, -0.14, 7.9, 12.9, 0, 'walk');
  for (let x = 0.3; x < 7.9; x += 0.95) walk += seg([x, 11.2, 0], [x, 12.9, 0], 'tile');
  walk += seg([-0.7, 12.45, 0], [7.9, 12.45, 0], 'tile');
  add('acera', walk, 'fade');
  add('carril', seg([-0.7, 14.4, -0.14], [7.9, 14.4, -0.14], 'lane'), 'fade');
  const st = P(0.4, 13.75, -0.14); P(7.2, 13.75, -0.14);
  add('calle', `<text class="street" transform="matrix(${f(C)} 0.5 ${f(-C)} 0.5 ${f(st.x)} ${f(st.y)})">CALLE PRINCIPAL</text>`, 'fade');

  // Pisos
  add('piso-trastienda', poly([[0, 0, 0], [7, 0, 0], [7, 3, 0], [0, 3, 0]], 'floor2'), 'fade');
  let fl = poly([[0, 3.15, 0], [7, 3.15, 0], [7, 11, 0], [0, 11, 0]], 'floor');
  for (let x = 0.55; x < 7; x += 0.55) fl += seg([x, 3.15, 0], [x, 11, 0], 'grout');
  for (let y = 3.7; y < 11; y += 0.55) fl += seg([0, y, 0], [7, y, 0], 'grout');
  add('piso', fl, 'fade');

  // Muros del fondo con ventana, baño, reloj y calendario
  add('muro-izq', box(-0.22, -0.22, 0, 0, 11, 3, 'wall',
    poly([[0, 1.0, 1.0], [0, 2.4, 1.0], [0, 2.4, 2.1], [0, 1.0, 2.1]], 'glass') + seg([0, 1.7, 1.0], [0, 1.7, 2.1]) +
    seg([0, 1.0, 1.55], [0, 2.4, 1.55], 'ln-thin')), 'rise');
  add('muro-fondo', box(0, -0.22, 0, 7, 0, 3, 'wall',
    poly([[1.2, 0, 0], [2.0, 0, 0], [2.0, 0, 2.1], [1.2, 0, 2.1]], 'doorleaf') + seg([1.85, 0, 1.0], [1.88, 0, 1.0]) +
    ringXZ(3.1, 0, 2.45, 0.17, 'clock') + seg([3.1, 0, 2.45], [3.1, 0, 2.57]) + seg([3.1, 0, 2.45], [3.19, 0, 2.45]) +
    poly([[3.75, 0, 1.35], [4.1, 0, 1.35], [4.1, 0, 1.85], [3.75, 0, 1.85]], 'sheet') +
    seg([3.8, 0, 1.75], [4.05, 0, 1.75], 'ln-thin') + seg([3.8, 0, 1.65], [4.05, 0, 1.65], 'ln-thin')), 'rise');

  // Trastienda
  if (ft.archivero) {
    let arch = '';
    for (const z of [0.45, 0.9]) arch += seg([0.12, 0.72, z], [0.78, 0.72, z]);
    for (const z of [0.28, 0.72, 1.15]) arch += seg([0.38, 0.72, z], [0.52, 0.72, z]);
    add('archivero', box(0.12, 0.12, 0, 0.78, 0.72, 1.35, 'metal', arch));
    add('archivero-carpeta', box(0.25, 0.3, 1.35, 0.6, 0.6, 1.42, 'paper'));
    A.archivero = P(0.45, 0.45, 1.42);
  }
  add('router', box(4.15, 0, 1.72, 4.5, 0.08, 1.8, 'device', seg([4.2, 0.04, 1.8], [4.18, 0.04, 2.02]) + seg([4.45, 0.04, 1.8], [4.47, 0.04, 2.02])));
  A.router = P(4.32, 0.04, 1.8);

  add('estante-fondo', box(4.9, 0.02, 0, 6.85, 0.08, 2.0, 'shelfback'));
  add('estante-poste-a', box(4.9, 0.08, 0, 4.95, 0.6, 2.0, 'board'));
  [0.06, 0.7, 1.34, 1.96].forEach((z, k) => {
    add(`estante-tabla-${k}`, box(4.95, 0.08, z, 6.8, 0.6, z + 0.04, 'board'));
    if (z < 1.9) {
      let x = 5.0, i = 0;
      while (x < 6.6) {
        const w = 0.32 + rnd() * 0.25, h = 0.22 + rnd() * 0.3;
        if (x + w > 6.76) break;
        add(`caja-${k}-${i++}`, box(x, 0.14, z + 0.04, x + w, 0.54, z + 0.04 + h, 'carton'));
        x += w + 0.06;
      }
    }
  });
  add('estante-poste-b', box(6.8, 0.08, 0, 6.85, 0.6, 2.0, 'board'));

  // Escritorio: siempre hay un escritorio; la computadora solo si se usa.
  add('escritorio-panel', box(2.1, 0.1, 0.1, 3.9, 0.15, 0.72, 'wood'));
  if (ft.computadora) add('cpu', box(3.35, 0.2, 0, 3.72, 0.66, 0.46, 'device'));
  add('escritorio-pata-a', box(2.12, 0.74, 0, 2.18, 0.8, 0.72, 'wood'));
  add('escritorio-pata-b', box(3.82, 0.74, 0, 3.88, 0.8, 0.72, 'wood'));
  add('escritorio', box(2.1, 0.1, 0.72, 3.9, 0.82, 0.77, 'wood'));
  add('papeles', box(2.22, 0.3, 0.77, 2.6, 0.68, 0.79, 'paper'));
  A.papeles = P(2.41, 0.49, 0.79);
  if (ft.computadora) {
    add('monitor-pie', box(2.95, 0.3, 0.77, 3.15, 0.42, 0.86, 'device'));
    add('monitor', box(2.62, 0.25, 0.86, 3.48, 0.31, 1.34, 'monitor'));
    add('teclado', box(2.75, 0.5, 0.77, 3.3, 0.66, 0.79, 'device'));
    add('mouse', box(3.45, 0.55, 0.77, 3.53, 0.65, 0.8, 'device'));
    A.monitor = P(3.05, 0.28, 1.34);
  }
  if (ft.equipo >= 2) add('persona-escritorio', person(3.0, 1.3));
  else {
    add('silla', box(2.75, 1.1, 0.42, 3.25, 1.52, 0.48, 'device'));
    add('silla-respaldo', box(2.75, 1.5, 0.48, 3.25, 1.57, 0.98, 'device'));
  }

  // Tabique con puerta
  add('tabique-a', box(0, 3.0, 0, 0.6, 3.15, 0.9, 'wall'), 'rise');
  add('tabique-b', box(1.6, 3.0, 0, 7, 3.15, 0.9, 'wall'), 'rise');

  // Estantes detrás del mostrador
  add('repisa-fondo', box(0, 3.35, 0, 0.06, 5.55, 2.2, 'shelfback'));
  const kinds = ['pill', 'pill', 'pill2', 'pill', 'pill3'];
  [0.1, 0.62, 1.14, 1.66, 2.16].forEach((z, k) => {
    add(`repisa-${k}`, box(0.06, 3.35, z, 0.46, 5.55, z + 0.04, 'board'));
    if (z < 2) {
      let y = 3.42, i = 0;
      while (y < 5.4) {
        const d = 0.14 + rnd() * 0.12, h = 0.16 + rnd() * 0.22;
        if (y + d > 5.5) break;
        const kind = kinds[Math.floor(rnd() * kinds.length)] ?? 'pill';
        add(`producto-${k}-${i++}`, box(0.09, y, z + 0.04, 0.27 + rnd() * 0.12, y + d, z + 0.04 + h, kind));
        y += d + 0.04;
      }
    }
  });
  add('repisa-cierre', box(0.06, 5.51, 0, 0.46, 5.55, 2.2, 'board'));

  // Quien atiende
  add('persona-mostrador', person(3.9, 4.65));
  A.equipo = P(3.9, 4.65, 1.62);

  // Mostrador
  add('mostrador', box(1.6, 5.6, 0, 6.4, 6.2, 1.0, 'counter', seg([1.6, 6.2, 0.12], [6.4, 6.2, 0.12]) + seg([6.4, 5.6, 0.12], [6.4, 6.2, 0.12])));
  add('mostrador-tope', box(1.55, 5.55, 1.0, 6.45, 6.25, 1.05, 'wood'));
  add('libreta', box(2.2, 5.68, 1.05, 2.72, 6.08, 1.09, 'paper', seg([2.46, 5.68, 1.09], [2.46, 6.08, 1.09], 'ln-thin')));
  A.libreta = P(2.46, 5.88, 1.09);
  if (ft.celular) {
    add('celular', box(3.3, 5.76, 1.05, 3.43, 6.0, 1.068, 'phone'));
    A.celular = P(3.36, 5.88, 1.07);
  }
  if (ft.biometria) add('huellero', box(3.75, 5.78, 1.05, 3.98, 6.0, 1.11, 'device', poly([[3.8, 5.82, 1.11], [3.93, 5.82, 1.11], [3.93, 5.96, 1.11], [3.8, 5.96, 1.11]], 'pad')));
  add('caja', box(4.55, 5.72, 1.05, 4.98, 6.02, 1.12, 'device'));
  add('caja-pantalla', box(4.6, 5.72, 1.12, 4.94, 5.78, 1.36, 'monitor'));
  A.caja = P(4.77, 5.75, 1.36);
  add('impresora', box(5.18, 5.7, 1.05, 5.62, 6.05, 1.22, 'device', poly([[5.32, 6.05, 1.22], [5.48, 6.05, 1.22], [5.48, 6.09, 1.08], [5.32, 6.09, 1.08]], 'sheet')));
  add('aviso', box(5.86, 5.93, 1.05, 6.26, 5.98, 1.38, 'paper',
    seg([5.92, 5.98, 1.3], [6.2, 5.98, 1.3], 'ln-thin') + seg([5.92, 5.98, 1.24], [6.2, 5.98, 1.24], 'ln-thin') + seg([5.92, 5.98, 1.18], [6.12, 5.98, 1.18], 'ln-thin')));
  A.aviso = P(6.06, 5.95, 1.38);

  // Cámara
  if (ft.camaras) {
    add('camara', box(0, 6.32, 2.52, 0.18, 6.5, 2.68, 'device'));
    add('camara-vision', poly([[0.18, 6.41, 2.6], [3.0, 10.6, 0], [5.8, 8.2, 0]], 'cone'), 'fade');
  }

  // Nevera
  let fr = poly([[0.72, 7.0, 0.2], [0.72, 7.8, 0.2], [0.72, 7.8, 1.8], [0.72, 7.0, 1.8]], 'glass');
  for (const z of [0.6, 1.0, 1.4]) {
    fr += seg([0.72, 7.0, z], [0.72, 7.8, z], 'ln-thin');
    for (let y = 7.08; y < 7.75; y += 0.13) fr += seg([0.72, y, z], [0.72, y, z + 0.22], 'ln');
  }
  add('nevera', box(0, 6.9, 0, 0.72, 7.9, 1.95, 'fridge', fr));

  // Cliente
  add('cliente', person(4.3, 7.05, 'client'));
  add('canasta', box(4.72, 7.15, 0, 5.04, 7.42, 0.22, 'carton'));
  A.cliente = P(4.3, 7.05, 1.62);

  // Góndola
  let go = '';
  for (const z of [0.12, 0.55, 0.95]) {
    go += seg([1.55, 8.4, z], [1.55, 10.4, z], 'ln-thin');
    for (let y = 8.5; y < 10.25; y += 0.24) {
      const k = ['prod', 'prod2', 'prod3'][Math.floor(rnd() * 3)] ?? 'prod';
      go += poly([[1.55, y, z + 0.02], [1.55, y + 0.17, z + 0.02], [1.55, y + 0.17, z + 0.3], [1.55, y, z + 0.3]], k);
    }
  }
  add('gondola', box(0.9, 8.4, 0, 1.55, 10.4, 1.25, 'board', go));
  if (ft.equipo >= 3) add('persona-gondola', person(2.2, 9.3));

  // Muros cortados del frente y del lado
  add('muro-der', box(7, -0.22, 0, 7.22, 11, 0.4, 'wall'), 'rise');
  add('muro-frente-a', box(-0.22, 11, 0, 2.7, 11.2, 0.4, 'wall'), 'rise');
  add('muro-frente-b', box(4.7, 11, 0, 7.22, 11.2, 0.4, 'wall'), 'rise');

  // Entrada con cortina metálica
  add('marco-a', box(2.7, 11, 0, 2.8, 11.2, 2.55, 'device'), 'rise');
  add('marco-b', box(4.6, 11, 0, 4.7, 11.2, 2.55, 'device',
    ft.camaras ? poly([[4.6, 11.2, 1.3], [4.7, 11.2, 1.3], [4.7, 11.2, 1.5], [4.6, 11.2, 1.5]], 'sticker') : ''), 'rise');
  add('dintel', box(2.7, 11, 2.45, 4.7, 11.2, 2.55, 'device'), 'rise');
  let sh = '';
  for (let z = 2.6; z < 2.86; z += 0.05) sh += seg([2.75, 11.25, z], [4.65, 11.25, z], 'ln-thin');
  add('cortina', box(2.75, 10.98, 2.55, 4.65, 11.25, 2.88, 'shutter', sh), 'rise');
  A.entrada = P(3.7, 11.12, 2.88);

  // Delivery en la acera
  if (ft.delivery) {
    add('moto-rueda-a', ringXZ(5.75, 12.1, 0.2, 0.2, 'wheel'));
    add('moto', box(5.8, 12.0, 0.22, 6.75, 12.2, 0.48, 'device'));
    add('moto-rueda-b', ringXZ(6.8, 12.1, 0.2, 0.2, 'wheel'));
    add('moto-asiento', box(6.0, 11.98, 0.48, 6.45, 12.22, 0.56, 'device'));
    add('moto-manubrio', seg([5.85, 12.1, 0.48], [5.85, 12.1, 0.95]) + seg([5.85, 11.9, 0.95], [5.85, 12.3, 0.95]));
    add('moto-caja', box(6.35, 11.88, 0.56, 6.85, 12.32, 1.0, 'carton'));
    A.delivery = P(6.6, 12.1, 1.0);
  }

  // Fuera del local: oficinas de terceros y nube
  const offices: { key: 'contador' | 'ti' | 'marketing'; label: string }[] = [];
  if (ft.contador) offices.push({ key: 'contador', label: 'CONTADOR' });
  if (ft.ti) offices.push({ key: 'ti', label: 'SOPORTE TI' });
  if (ft.marketing) offices.push({ key: 'marketing', label: 'MARKETING' });
  offices.forEach((o, i) => {
    const y0 = 0.3 + i * 3.3;
    add(`${o.key}-lote`, poly([[8.9, y0 - 0.4, 0], [11.6, y0 - 0.4, 0], [11.6, y0 + 2.4, 0], [8.9, y0 + 2.4, 0]], 'lot'), 'fade');
    let win = '';
    for (const x of [9.55, 10.15]) win += poly([[x, y0 + 1.9, 0.9], [x + 0.4, y0 + 1.9, 0.9], [x + 0.4, y0 + 1.9, 1.4], [x, y0 + 1.9, 1.4]], 'glass');
    win += poly([[10.6, y0 + 1.9, 0], [10.9, y0 + 1.9, 0], [10.9, y0 + 1.9, 0.85], [10.6, y0 + 1.9, 0.85]], 'doorleaf');
    add(`${o.key}-edificio`, box(9.3, y0, 0, 11.1, y0 + 1.9, 1.7, '', win));
    add(`${o.key}-techo`, box(9.22, y0 - 0.08, 1.7, 11.18, y0 + 1.98, 1.8, 'device'));
    const lc = P(10.2, y0 + 2.75, 0);
    add(`${o.key}-rotulo`, `<text class="olabel" x="${f(lc.x)}" y="${f(lc.y)}">${o.label}</text>`, 'fade');
    A[o.key] = P(9.3, y0 + 0.9, 1.6);
  });
  let cloud: Point | null = null;
  if (ft.nube) {
    const cl = P(9.8, -2.0, 2.4);
    cloud = cl;
    grow(cl.x + 48, cl.y - 40);
    add('nube', `<path class="cloud" d="M${f(cl.x - 40)} ${f(cl.y + 14)}a15 15 0 0 1 6-27a21 21 0 0 1 38-8a17 17 0 0 1 31 9a14 14 0 0 1 4 26z"/>` +
      `<text class="olabel" x="${f(cl.x + 2)}" y="${f(cl.y + 32)}">NUBE</text>`, 'fade');
    A.nube = { x: cl.x + 10, y: cl.y - 30 };
  }

  // Flujos de datos que salen del local
  const flows: { id: string; html: string }[] = [];
  const origin = A.monitor ?? A.celular ?? A.caja!;
  const curve = (id: string, a: Point, b: Point, c1: Point, c2: Point, label: string, lp: Point, anchor = 'middle') =>
    flows.push({ id, html: `<path class="flow" d="M${f(a.x)} ${f(a.y)}C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(b.x)} ${f(b.y)}"/>` +
      `<text class="flabel" x="${f(lp.x)}" y="${f(lp.y)}" text-anchor="${anchor}">${label}</text>` });
  if (cloud) curve('flujo-nube', origin, { x: cloud.x - 30, y: cloud.y - 16 }, { x: origin.x + 120, y: origin.y - 70 }, { x: cloud.x - 120, y: cloud.y - 90 }, 'respaldos', { x: cloud.x - 52, y: cloud.y - 34 }, 'end');
  for (const o of offices) {
    const to = A[o.key]!;
    const from = o.key === 'contador' ? (A.archivero ?? A.papeles!) : o.key === 'ti' ? origin : (A.celular ?? origin);
    const label = o.key === 'contador' ? 'planilla y expedientes' : o.key === 'ti' ? 'acceso remoto' : 'lista de clientes';
    curve(`flujo-${o.key}`, from, to, { x: from.x + 160, y: from.y - 170 }, { x: to.x - 120, y: to.y - 150 }, label, { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 70 });
  }
  if (A.delivery) {
    const from = A.celular ?? A.libreta!, to = A.delivery;
    curve('flujo-delivery', from, to, { x: from.x + 40, y: from.y + 90 }, { x: to.x + 60, y: to.y - 120 }, 'nombre, dirección, teléfono', { x: to.x + 40, y: to.y - 70 }, 'start');
  }

  // Ancla de cada área según lo que existe en el negocio
  const pick = (...keys: AnchorKey[]): AnchorKey => keys.find((k) => A[k]) ?? 'caja';
  const keyFor: Record<AreaId, AnchorKey> = {
    inventario: pick('archivero', 'papeles'),
    licitud: pick('celular', 'libreta'),
    transparencia: 'aviso',
    derechos: 'cliente',
    seguridad: pick('monitor', 'celular', 'caja'),
    terceros: pick('nube', 'contador', 'ti', 'marketing', 'delivery', 'router'),
    incidentes: 'entrada',
    cultura: 'equipo',
  };
  const used = new Set<AnchorKey>();
  const callouts: Callout[] = AREA_ORDER.map((area, i) => {
    const key = keyFor[area];
    const anchor = A[key]!;
    const base = OFFSET[key];
    const off = used.has(key) ? { x: -base.x, y: base.y } : base;
    used.add(key);
    const bubble = { x: anchor.x + off.x, y: anchor.y + off.y };
    grow(bubble.x - 22, bubble.y - 22); grow(bubble.x + 22, bubble.y + 22);
    const place = key === 'equipo' && ft.equipo >= 2 ? 'Tu equipo' : PLACE[key];
    return { area, n: i + 1, anchor, bubble, place };
  });

  const pad = 18;
  const viewBox: ViewBox = [B[0]! - pad, B[1]! - pad, B[2]! - B[0]! + pad * 2, B[3]! - B[1]! + pad * 2];
  return { items, flows, callouts, viewBox };
}

// El encuadre es el del negocio más completo posible, para que el dibujo no salte
// mientras se arma con las respuestas del perfil.
const FULL: SceneFeatures = {
  archivero: true, computadora: true, celular: true, camaras: true, biometria: true,
  nube: true, contador: true, ti: true, marketing: true, delivery: true, equipo: 3,
};
let frame: ViewBox | null = null;
export function sceneFrame(): ViewBox {
  return (frame ??= compose(FULL).viewBox);
}

/** `fixedFrame`: usar el encuadre común (perfil y preguntas) o el propio del dibujo (portada). */
export function buildScene(features: SceneFeatures, fixedFrame = true): Scene {
  const scene = compose(features);
  return fixedFrame ? { ...scene, viewBox: sceneFrame() } : scene;
}

/** Encuadre de cerca para un área (la «cámara» que viaja). */
export function focusBox(scene: Scene, area: AreaId, zoom = 0.5): ViewBox {
  const full = scene.viewBox;
  const c = scene.callouts.find((x) => x.area === area);
  if (!c) return full;
  const w = full[2] * zoom, h = full[3] * zoom;
  const cx = (c.anchor.x + c.bubble.x) / 2, cy = (c.anchor.y + c.bubble.y) / 2;
  const x = Math.min(Math.max(cx - w / 2, full[0]), full[0] + full[2] - w);
  const y = Math.min(Math.max(cy - h * 0.5, full[1]), full[1] + full[3] - h);
  return [x, y, w, h];
}
