// Escena axonométrica «Anatomía de tu negocio».
// Funciones puras: a partir del perfil devuelven el dibujo como piezas SVG con id estable,
// las anclas de los 8 puntos y el nombre del lugar de cada área.
// Todo el SVG se genera aquí a partir de números y textos fijos: no contiene datos del usuario.
import type { AreaId, Profile } from '../engine/types';
import { campo } from './campo';
import { casa } from './casa';
import { escuela } from './escuela';
import { hospedaje } from './hospedaje';
import { obra } from './obra';
import { organizacion } from './organizacion';
import { taller } from './taller';
import { transporte } from './transporte';
import { abanico, atiende, cliente, planta, reponedor, sentado, type Dress } from './figures';
import { f, makeInk, type Rect, type V3 } from './ink';

/** Tipo de local que se dibuja. */
export type Tipo =
  | 'farmacia' | 'fonda' | 'salon' | 'tienda' | 'oficina'
  | 'campo' | 'taller' | 'obra' | 'escuela' | 'hospedaje' | 'transporte' | 'casa' | 'organizacion';
const TIPOS: Tipo[] = [
  'farmacia', 'fonda', 'salon', 'tienda', 'oficina',
  'campo', 'taller', 'obra', 'escuela', 'hospedaje', 'transporte', 'casa', 'organizacion',
];

/** Lugar que se dibuja para cada tipo. */
type Lugar = 'farmacia' | 'fonda' | 'salon' | 'tienda' | 'oficina' | 'campo' | 'taller' | 'obra' | 'hospedaje' | 'escuela' | 'transporte' | 'casa' | 'organizacion';
const LUGAR: Record<Tipo, Lugar> = {
  farmacia: 'farmacia', fonda: 'fonda', salon: 'salon', tienda: 'tienda', oficina: 'oficina', campo: 'campo',
  taller: 'taller', obra: 'obra', escuela: 'escuela', hospedaje: 'hospedaje', transporte: 'transporte', casa: 'casa', organizacion: 'organizacion',
};

export interface SceneFeatures {
  /** Sin tipo se dibuja una tienda. */
  tipo?: Tipo;
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
  tipo: 'farmacia',
  archivero: true, computadora: true, celular: true, camaras: true, biometria: false,
  nube: true, contador: true, ti: false, marketing: false, delivery: true, equipo: 1,
};

export function featuresFromProfile(profile: Profile): SceneFeatures {
  const has = (q: string, id: string) => (profile[q] ?? []).includes(id);
  const tam = profile.tamano?.[0];
  const tipo = TIPOS.find((t) => t === profile.tipo?.[0]);
  return {
    tipo,
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

// ── Dibujo ───────────────────────────────────────────────────────────────
// Lámina de corte arquitectónico: tinta sobre papel, trama vertical en las caras
// en sombra, muros cortados en negro (poché) y sombras rayadas en el piso.

export type AnchorKey =
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

const SIGN: Record<Tipo, string> = {
  farmacia: 'FARMACIA', fonda: 'FONDA', salon: 'SALÓN', tienda: 'MINISÚPER', oficina: 'OFICINA', campo: 'FINCA',
  taller: 'TALLER', obra: 'OBRAS', escuela: 'ESCUELA', hospedaje: 'HOSTAL', transporte: 'FLETES', casa: 'EN CASA', organizacion: 'SEDE',
};
const DRESS: Record<Exclude<Lugar, Propio>, Dress> = { farmacia: 'bata', fonda: 'delantal', salon: 'delantal', tienda: 'polo', oficina: 'camisa' };

/** Lugares que se dibujan en su propio archivo, sin el local. */
const PROPIOS = { campo, taller, obra, hospedaje, escuela, transporte, casa, organizacion } as const;
type Propio = keyof typeof PROPIOS;
const esPropio = (l: Lugar): l is Propio => l in PROPIOS;

/** Lo que recibe cada lugar para dibujarse: la tinta, dónde dejar piezas, anclas y sombras. */
export type Kit = ReturnType<typeof makeInk> & {
  ft: SceneFeatures;
  add: (id: string, html: string, kind?: SceneItem['kind']) => void;
  /** Anclas de los puntos numerados: cada lugar deja las suyas. */
  A: Partial<Record<AnchorKey, Point>>;
  range: (a: number, b: number, step: number) => number[];
  /** Suma una sombra al piso. */
  shade: (html: string) => void;
  /** Coloca aquí la capa de sombras (debajo de todo lo que venga después). */
  placeShadows: () => void;
};

const BACK: Rect = [0, 0, 7, 3];
const FRONT: Rect = [0, 3.15, 7, 11];

function compose(ft: SceneFeatures): Scene {
  const ink = makeInk(7);
  const { B, rnd, grow, P, fill, lines, loop, plane, box, shadow, cyl, ring, ringPath, label, at, grain } = ink;
  const items: SceneItem[] = [];
  const add = (id: string, html: string, kind: SceneItem['kind'] = 'drop') => items.push({ id, kind, html });
  const A: Partial<Record<AnchorKey, Point>> = {};
  const range = (a: number, b: number, step: number) => {
    const out: number[] = [];
    for (let v = a; v < b - 1e-6; v += step) out.push(v);
    return out;
  };

  const tipo: Tipo = ft.tipo ?? 'tienda';
  const lugar = LUGAR[tipo];
  let sh = '';
  const shadowItem: SceneItem = { id: 'sombras', kind: 'fade', html: '' };
  /** Nombres de lugar propios del sitio (si no, los del local). */
  let places: Partial<Record<AnchorKey, string>> = {};

  // El local de siempre: trastienda, mostrador y sala. Cambia por dentro según el tipo.
  const local = (base: Exclude<Lugar, Propio>) => {
  // ── Terreno, acera y calle
  add('lote', loop([[-0.7, -0.7, 0], [7.9, -0.7, 0], [7.9, 11.2, 0], [-0.7, 11.2, 0]], 'dash', 0), 'fade');
  add(
    'acera',
    box(-0.7, 11.2, -0.14, 7.9, 12.9, 0, { y: 'p2', w: 2 }) +
      lines(range(0.25, 7.9, 0.95).map((x) => [[x, 11.2, 0], [x, 12.9, 0]] as [V3, V3]), 'e4', 0) +
      lines([[[-0.7, 12.05, 0], [7.9, 12.05, 0]]], 'e4', 0) +
      plane([[1.1, 12.9, -0.12], [1.62, 12.9, -0.12], [1.62, 12.9, -0.04], [1.1, 12.9, -0.04]], 'k', 'e3', 0),
    'fade',
  );
  add('carril', lines(range(-0.7, 7.9, 0.9).map((x) => [[x, 14.4, -0.14], [x + 0.5, 14.4, -0.14]] as [V3, V3]), 'e2', 0), 'fade');
  add('calle', label('CALLE PRINCIPAL', 0.4, 13.75, -0.14, 'xy', 'street', 'start'), 'fade');
  add(
    'norte',
    loop(ring(9.5, 12.5, 0, 0.32, 'xy'), 'e3', 0) +
      fill([[9.5, 12.0, 0], [9.6, 12.62, 0], [9.5, 12.5, 0], [9.4, 12.62, 0]], 'k') +
      label('N', 9.5, 11.86, 0, 'xy', 'room', 'middle'),
    'fade',
  );

  // ── Pisos
  add('piso-trastienda', fill([[0, 0, 0], [7, 0, 0], [7, 3, 0], [0, 3, 0]], 'p dots'), 'fade');
  add(
    'piso',
    fill([[0, 3.15, 0], [7, 3.15, 0], [7, 11, 0], [0, 11, 0]], 'p') +
      lines(range(0.5, 7, 0.5).map((x) => [[x, 3.15, 0], [x, 11, 0]] as [V3, V3]), 'e4', 0) +
      lines(range(3.65, 11, 0.5).map((y) => [[0, y, 0], [7, y, 0]] as [V3, V3]), 'e4', 0),
    'fade',
  );
  add('rotulo-trastienda', label('TRASTIENDA', 1.0, 2.82, 0, 'xy', 'room', 'start'), 'fade');
  const mat: V3[] = [[2.95, 10.2, 0], [4.45, 10.2, 0], [4.45, 10.86, 0], [2.95, 10.86, 0]];
  add('tapete', fill(mat, 'p3') + lines(range(3.05, 4.45, 0.1).map((x) => [[x, 10.24, 0], [x, 10.82, 0]] as [V3, V3]), 'e4', 0) + loop(mat, 'e3', 0), 'fade');

  // Sombras de los muebles en el piso (van debajo de todo)
  if (ft.archivero) sh += shadow(0.12, 0.12, 0.78, 0.72, 1.35, BACK);
  sh += shadow(4.9, 0.02, 6.85, 0.6, 2.0, BACK);
  sh += shadow(2.1, 0.1, 3.9, 0.82, 0.77, BACK);
  sh += shadow(6.15, 2.1, 6.6, 2.55, 1.5, BACK);
  sh += shadow(2.82, 1.08, 3.2, 1.5, ft.equipo >= 2 ? 1.3 : 0.95, BACK);
  sh += shadow(1.55, 5.55, 6.45, 6.25, 1.05, FRONT);
  // Las sombras de la sala se suman abajo, según el tipo; la pieza va aquí para quedar debajo de todo.
  items.push(shadowItem);

  // ── Muro izquierdo: ventana con rejas, letrero, horario
  let lw = '';
  lw += plane([[0, 1.0, 1.0], [0, 2.4, 1.0], [0, 2.4, 2.1], [0, 1.0, 2.1]], 'g', 'e2');
  lw += lines([[[0, 1.22, 1.32], [0, 1.58, 1.86]], [[0, 1.38, 1.26], [0, 1.74, 1.8]]], 'e4', 0);
  lw += lines(range(1.175, 2.4, 0.175).map((y) => [[0, y, 1.0], [0, y, 2.1]] as [V3, V3]), 'e2', 0);
  lw += lines([[[0, 1.0, 1.55], [0, 2.4, 1.55]]], 'e2', 0);
  lw += box(0, 0.94, 0.93, 0.09, 2.46, 1.0, { w: 3, x: 'p' });
  lw += plane([[0, 5.5, 2.36], [0, 3.45, 2.36], [0, 3.45, 2.84], [0, 5.5, 2.84]], 'p', 'e2');
  if (base === 'farmacia') {
    lw += fill([[0, 5.35, 2.46], [0, 5.27, 2.46], [0, 5.27, 2.74], [0, 5.35, 2.74]], 'k');
    lw += fill([[0, 5.45, 2.56], [0, 5.17, 2.56], [0, 5.17, 2.64], [0, 5.45, 2.64]], 'k');
    lw += label(SIGN.farmacia, 0, 5.08, 2.49, 'yz', 'sign', 'start');
  } else lw += label(ft.tipo ? SIGN[tipo] : 'TU NEGOCIO', 0, 4.475, 2.49, 'yz', 'sign', 'middle');
  add('muro-izq', box(-0.22, -0.22, 0, 0, 11, 3, { t: 'k', x: 'p2', y: 'p', w: 1, inner: lw }), 'rise');

  // ── Muro del fondo: baño, reloj, calendario
  let bw = '';
  bw += loop([[1.14, 0, 0], [2.06, 0, 0], [2.06, 0, 2.16], [1.14, 0, 2.16]], 'e3', 0);
  bw += plane([[1.2, 0, 0], [2.0, 0, 0], [2.0, 0, 2.1], [1.2, 0, 2.1]], 'p2', 'e2');
  bw += loop([[1.3, 0, 1.2], [1.9, 0, 1.2], [1.9, 0, 1.95], [1.3, 0, 1.95]], 'e4', 0);
  bw += loop([[1.3, 0, 0.15], [1.9, 0, 0.15], [1.9, 0, 0.95], [1.3, 0, 0.95]], 'e4', 0);
  bw += lines([[[1.84, 0, 1.04], [1.94, 0, 1.04]]], 'e1', 0);
  bw += label('BAÑO', 1.6, 0, 2.0, 'xz', 'tiny', 'middle');
  bw += ringPath(ring(1.6, 0, 2.52, 0.16, 'xz'), 'p', 2);
  bw += lines([[[1.6, 0, 2.52], [1.6, 0, 2.63]], [[1.6, 0, 2.52], [1.68, 0, 2.5]]], 'e2', 0);
  bw += plane([[3.76, 0, 1.3], [4.1, 0, 1.3], [4.1, 0, 1.86], [3.76, 0, 1.86]], 'p', 'e3');
  bw += fill([[3.76, 0, 1.76], [4.1, 0, 1.76], [4.1, 0, 1.86], [3.76, 0, 1.86]], 'k');
  bw += lines(
    [...range(1.38, 1.72, 0.085).map((z) => [[3.79, 0, z], [4.07, 0, z]] as [V3, V3]), ...range(3.84, 4.06, 0.07).map((x) => [[x, 0, 1.36], [x, 0, 1.72]] as [V3, V3])],
    'e4',
    0,
  );
  add('muro-fondo', box(0, -0.22, 0, 7, 0, 3, { t: 'k', y: 'p', x: 'p2', w: 1, inner: bw }), 'rise');

  // Aire acondicionado de pared, con su tubo
  add(
    'aire',
    box(2.3, 0, 2.28, 3.6, 0.27, 2.72, {
      w: 2,
      inner:
        lines(range(2.42, 3.5, 0.07).map((x) => [[x, 0.27, 2.31], [x + 0.03, 0.27, 2.38]] as [V3, V3]), 'e4', 0) +
        lines([[[2.36, 0.27, 2.4], [3.54, 0.27, 2.4]]], 'e3', 0) +
        fill(ring(3.46, 0.27, 2.62, 0.018, 'xz', 10), 'k'),
    }) + lines([[[3.52, 0.01, 2.28], [3.52, 0.01, 1.9]], [[3.52, 0.01, 1.9], [3.62, 0.01, 1.84]]], 'e3', 0),
  );

  // ── Trastienda
  if (ft.archivero) {
    let d = lines([0.46, 0.9].map((z) => [[0.15, 0.72, z], [0.75, 0.72, z]] as [V3, V3]), 'e2', 0);
    for (const zc of [0.28, 0.72, 1.16]) {
      d += fill([[0.36, 0.72, zc], [0.54, 0.72, zc], [0.54, 0.72, zc + 0.04], [0.36, 0.72, zc + 0.04]], 'k');
      d += loop([[0.39, 0.72, zc + 0.08], [0.51, 0.72, zc + 0.08], [0.51, 0.72, zc + 0.15], [0.39, 0.72, zc + 0.15]], 'e3', 0);
    }
    d += fill(ring(0.7, 0.72, 1.27, 0.022, 'xz', 10), 'k');
    add('archivero', box(0.12, 0.12, 0, 0.78, 0.72, 1.35, { w: 1, inner: d }));
    add(
      'archivero-carpeta',
      box(0.22, 0.24, 1.35, 0.64, 0.58, 1.4, { t: 'p2', x: 'p2', w: 3 }) + box(0.26, 0.27, 1.4, 0.6, 0.55, 1.425, { w: 3 }),
    );
    A.archivero = P(0.43, 0.41, 1.43);
  }
  add(
    'router',
    box(4.18, 0, 1.66, 4.5, 0.13, 1.71, { w: 3 }) +
      box(4.16, 0, 1.71, 4.52, 0.1, 1.79, { t: 'p2', x: 'p3', w: 2, inner: fill(ring(4.24, 0.1, 1.75, 0.012, 'xz', 8), 'k') + fill(ring(4.3, 0.1, 1.75, 0.012, 'xz', 8), 'k') }) +
      lines([[[4.21, 0.05, 1.79], [4.19, 0.05, 2.04]], [[4.47, 0.05, 1.79], [4.49, 0.05, 2.04]]], 'e2', 0) +
      lines([[[4.34, 0.01, 1.66], [4.34, 0.01, 0.98]], [[4.34, 0.01, 0.98], [3.7, 0.01, 0.98]], [[3.7, 0.01, 0.98], [3.62, 0.18, 0.46]]], 'e3', 0),
  );
  A.router = P(4.34, 0.05, 1.79);

  // Estantería con cajas y archivadores de palanca
  add('estante-fondo', box(4.9, 0.02, 0, 6.85, 0.08, 2.0, { y: 'p2', x: 'p2', w: 3 }));
  add('estante-poste-a', box(4.9, 0.08, 0, 4.95, 0.6, 2.0, { x: 'p', w: 2 }));
  [0.06, 0.7, 1.34, 1.96].forEach((z, k) => {
    add(`estante-tabla-${k}`, box(4.95, 0.08, z, 6.8, 0.6, z + 0.04, { x: 'p', w: 2 }));
    const z0 = z + 0.04;
    if (k === 1) {
      let x = 5.02;
      let i = 0;
      while (x < 6.0) {
        add(
          `archivador-${i++}`,
          box(x, 0.16, z0, x + 0.085, 0.52, z0 + 0.42, {
            t: 'p2',
            x: 'p3',
            w: 3,
            inner: loop(ring(x + 0.042, 0.52, z0 + 0.1, 0.022, 'xz', 10), 'e4', 0) + loop([[x + 0.015, 0.52, z0 + 0.22], [x + 0.07, 0.52, z0 + 0.22], [x + 0.07, 0.52, z0 + 0.34], [x + 0.015, 0.52, z0 + 0.34]], 'e4', 0),
          }),
        );
        x += 0.095;
      }
      add('caja-1-0', box(6.12, 0.14, z0, 6.72, 0.54, z0 + 0.32, { w: 2, inner: lines([[[6.42, 0.14, z0 + 0.32], [6.42, 0.54, z0 + 0.32]]], 'e3', 0) }));
    } else if (k < 3) {
      let x = 5.0;
      let i = 0;
      while (x < 6.6) {
        const w = 0.34 + rnd() * 0.24;
        const h = 0.22 + rnd() * 0.3;
        if (x + w > 6.76) break;
        const top = z0 + h;
        add(
          `caja-${k}-${i++}`,
          box(x, 0.14, z0, x + w, 0.54, top, {
            w: 2,
            inner:
              lines([[[x + w / 2, 0.14, top], [x + w / 2, 0.54, top]]], 'e3', 0) +
              loop([[x + 0.06, 0.54, z0 + h * 0.35], [x + 0.2, 0.54, z0 + h * 0.35], [x + 0.2, 0.54, z0 + h * 0.62], [x + 0.06, 0.54, z0 + h * 0.62]], 'e4', 0),
          }),
        );
        x += w + 0.06;
      }
    }
  });
  add('estante-poste-b', box(6.8, 0.08, 0, 6.85, 0.6, 2.0, { x: 'p', w: 2 }));

  // Escritorio: siempre hay uno; la computadora solo si se usa.
  add('escritorio-panel', box(2.1, 0.1, 0.1, 3.9, 0.15, 0.72, { w: 2 }));
  if (ft.computadora)
    add('cpu', box(3.38, 0.2, 0, 3.72, 0.66, 0.46, { t: 'p2', x: 'p3', w: 2, inner: lines(range(0.06, 0.2, 0.035).map((z) => [[3.44, 0.66, z], [3.66, 0.66, z]] as [V3, V3]), 'e4', 0) + fill(ring(3.62, 0.66, 0.38, 0.018, 'xz', 8), 'k') }));
  add('escritorio-pata-a', box(2.12, 0.74, 0, 2.18, 0.8, 0.72, { w: 2 }));
  add('escritorio-pata-b', box(3.82, 0.74, 0, 3.88, 0.8, 0.72, { w: 2 }));
  add('escritorio', box(2.1, 0.1, 0.72, 3.9, 0.82, 0.77, { y: 'p2', w: 1, inner: grain(2.1, 0.1, 3.9, 0.82, 0.77, 5) }));
  add('taza', cyl(2.27, 0.19, 0.77, 0.89, 0.055, { w: 2 }) + `<path class="e2" d="M${f(P(2.31, 0.24, 0.86).x + 2)} ${f(P(2.31, 0.24, 0.86).y)}q3 1 0 4"/>`);
  add(
    'papeles',
    box(2.2, 0.3, 0.77, 2.58, 0.66, 0.785, { w: 3 }) +
      box(2.24, 0.27, 0.785, 2.62, 0.63, 0.8, { w: 3, inner: lines(range(0.33, 0.6, 0.045).map((y) => [[2.29, y, 0.8], [2.55 - (y * 7) % 0.12, y, 0.8]] as [V3, V3]), 'e4', 0) }),
  );
  A.papeles = P(2.43, 0.45, 0.8);
  if (ft.computadora) {
    add('monitor-pie', box(2.95, 0.3, 0.77, 3.15, 0.42, 0.8, { w: 3 }) + box(3.02, 0.29, 0.8, 3.08, 0.33, 0.92, { w: 3 }));
    let scr = lines(range(0.98, 1.32, 0.06).map((z) => [[2.68, 0.31, z], [3.42, 0.31, z]] as [V3, V3]), 'rf', 0);
    scr += lines([2.86, 3.08].map((x) => [[x, 0.31, 0.96], [x, 0.31, 1.34]] as [V3, V3]), 'rf', 0);
    add('monitor', box(2.6, 0.25, 0.88, 3.5, 0.31, 1.4, { t: 'p2', x: 'p3', y: 'k', w: 1, inner: scr }));
    add('teclado', box(2.75, 0.5, 0.77, 3.3, 0.66, 0.795, { w: 3, inner: lines(range(0.54, 0.66, 0.035).map((y) => [[2.78, y, 0.795], [3.27, y, 0.795]] as [V3, V3]), 'e4', 0) }));
    add('mouse', box(3.45, 0.55, 0.77, 3.53, 0.65, 0.795, { w: 3 }));
    A.monitor = P(3.05, 0.28, 1.4);
  }
  // Silla con base de estrella; con equipo hay alguien sentado.
  let star = '';
  for (let i = 0; i < 5; i++) {
    const t = (i / 5) * Math.PI * 2 + 0.3;
    const ex = 3.0 + Math.cos(t) * 0.26;
    const ey = 1.27 + Math.sin(t) * 0.26;
    star += lines([[[3.0, 1.27, 0.06], [ex, ey, 0.05]]], 'e2', 0) + fill(ring(ex, ey, 0.03, 0.03, 'xz', 8), 'k');
  }
  add('silla-base', star + lines([[[3.0, 1.27, 0.06], [3.0, 1.27, 0.42]]], 'e1', 0));
  add('silla', box(2.78, 1.05, 0.42, 3.22, 1.47, 0.48, { t: 'p2', w: 2 }));
  if (ft.equipo >= 2) add('persona-escritorio', at(3.0, 1.25, 0, sentado(), [-13, -63, 13, 0]));
  add('silla-respaldo', box(2.8, 1.47, 0.52, 3.2, 1.54, 0.96, { t: 'p2', y: 'p2', w: 2 }) + lines([[[3.0, 1.5, 0.48], [3.0, 1.5, 0.52]]], 'e1', 0));

  // Botellón de agua
  add(
    'botellon',
    box(6.15, 2.1, 0, 6.6, 2.55, 0.95, { w: 2, inner: box(6.32, 2.55, 0.62, 6.42, 2.6, 0.7, { w: 3, x: 'p3' }) + loop([[6.22, 2.55, 0.12], [6.53, 2.55, 0.12], [6.53, 2.55, 0.5], [6.22, 2.55, 0.5]], 'e4', 0) }) +
      cyl(6.375, 2.325, 0.95, 1.42, 0.19, { body: 'g' }) +
      cyl(6.375, 2.325, 1.42, 1.5, 0.07, { w: 3 }),
  );

  // Tabique con puerta
  add('tabique-a', box(0, 3.0, 0, 0.6, 3.15, 0.9, { t: 'k', w: 1 }), 'rise');
  add('tabique-b', box(1.6, 3.0, 0, 7, 3.15, 0.9, { t: 'k', w: 1 }), 'rise');

  // ── Detrás del mostrador: estantes (o la cocina, en una fonda)
  const shelves = (bottleShare: number, binders: boolean) => {
    add('repisa-lado', box(0.06, 3.33, 0, 0.48, 3.37, 2.2, { x: 'p', w: 2 }));
    add('repisa-fondo', box(0, 3.37, 0, 0.06, 5.51, 2.2, { x: 'p2', w: 3 }));
    add(
      'repisa-gabinete',
      box(0.06, 3.37, 0, 0.48, 5.51, 0.58, {
        x: 'p',
        w: 2,
        inner:
          lines([3.9, 4.44, 4.98].map((y) => [[0.48, y, 0.08], [0.48, y, 0.52]] as [V3, V3]), 'e3', 0) +
          lines([[[0.48, 3.37, 0.07], [0.48, 5.51, 0.07]]], 'e3', 0) +
          [3.84, 3.96, 4.92, 5.04].map((y) => fill(ring(0.48, y, 0.4, 0.018, 'yz', 8), 'k')).join(''),
      }),
    );
    const levels = [0.58, 1.16, 1.7];
    levels.forEach((z0, k) => {
      let y = 3.42;
      let i = 0;
      if (binders && k < 2) {
        while (y < 5.4) {
          add(
            `producto-${k}-${i++}`,
            box(0.1, y, z0, 0.44, y + 0.085, z0 + 0.42, {
              t: 'p2',
              y: 'p3',
              x: 'p',
              w: 3,
              inner:
                loop(ring(0.44, y + 0.042, z0 + 0.1, 0.022, 'yz', 10), 'e4', 0) +
                loop([[0.44, y + 0.015, z0 + 0.22], [0.44, y + 0.07, z0 + 0.22], [0.44, y + 0.07, z0 + 0.34], [0.44, y + 0.015, z0 + 0.34]], 'e4', 0),
            }),
          );
          y += 0.095;
        }
      } else {
        while (y < 5.42) {
          const bottle = rnd() < bottleShare;
          if (bottle) {
            const r = 0.05 + rnd() * 0.025;
            const h = 0.18 + rnd() * 0.18;
            if (y + r * 2 > 5.48) break;
            const cy = y + r;
            add(
              `producto-${k}-${i++}`,
              cyl(0.27, cy, z0, z0 + h, r, { w: 3, body: rnd() < 0.4 ? 'p2' : 'p', shade: false }) +
                cyl(0.27, cy, z0 + h, z0 + h + 0.05, r * 0.62, { w: 3, body: 'k', top: 'k', shade: false }),
            );
            y += r * 2 + 0.035;
          } else {
            const d = 0.14 + rnd() * 0.13;
            const h = 0.16 + rnd() * 0.24;
            if (y + d > 5.48) break;
            const dep = 0.2 + rnd() * 0.16;
            const tone = rnd();
            add(
              `producto-${k}-${i++}`,
              box(0.09, y, z0, 0.09 + dep, y + d, z0 + h, {
                x: tone < 0.2 ? 'p3' : tone < 0.55 ? 'p2' : 'p',
                w: 3,
                inner: lines([[[0.09 + dep, y + 0.02, z0 + h * 0.55], [0.09 + dep, y + d - 0.02, z0 + h * 0.55]]], 'e4', 0),
              }),
            );
            y += d + 0.03;
          }
        }
      }
      const zb = levels[k + 1] ?? 2.2;
      add(`repisa-${k}`, box(0.06, 3.37, zb - 0.04, 0.48, 5.51, zb, { x: 'p', w: 2 }));
    });
    add('repisa-cierre', box(0.06, 5.51, 0, 0.48, 5.55, 2.2, { x: 'p', w: 2 }));
    sh += shadow(0, 3.35, 0.48, 5.55, 2.2, FRONT);
  };

  const cocina = () => {
    add('campana', box(0, 3.75, 2.02, 0.3, 4.15, 2.34, { w: 2 }) + box(0, 3.42, 1.76, 0.64, 4.48, 2.02, { w: 1, inner: lines(range(3.55, 4.4, 0.09).map((y) => [[0.64, y, 1.8], [0.64, y, 1.86]] as [V3, V3]), 'e4', 0) }));
    let st = plane([[0.72, 3.56, 0.14], [0.72, 4.34, 0.14], [0.72, 4.34, 0.62], [0.72, 3.56, 0.62]], 'p2', 'e2', 0);
    st += plane([[0.72, 3.68, 0.26], [0.72, 4.22, 0.26], [0.72, 4.22, 0.52], [0.72, 3.68, 0.52]], 'p3', 'e3', 0);
    st += lines([[[0.72, 3.66, 0.68], [0.72, 4.24, 0.68]]], 'e1', 0);
    st += [3.64, 3.82, 4.0, 4.18, 4.36].map((y) => fill(ring(0.72, y, 0.78, 0.026, 'yz', 10), 'k')).join('');
    add('estufa', box(0.06, 3.45, 0, 0.72, 4.45, 0.86, { w: 1, inner: st }));
    add(
      'hornillas',
      [3.7, 4.2].map((y) => loop(ring(0.39, y, 0.86, 0.13, 'xy'), 'e3', 0) + loop(ring(0.39, y, 0.86, 0.06, 'xy', 16), 'e4', 0)).join(''),
    );
    add('olla', cyl(0.39, 3.7, 0.86, 1.1, 0.15, { body: 'p2' }) + cyl(0.39, 3.7, 1.1, 1.12, 0.156, { w: 3 }) + cyl(0.39, 3.7, 1.12, 1.16, 0.03, { w: 3, body: 'k', top: 'k', shade: false }));
    add('sarten', cyl(0.39, 4.2, 0.86, 0.92, 0.16, { w: 2, top: 'p3' }) + lines([[[0.5, 4.33, 0.9], [0.78, 4.6, 0.93]]], 'e1', 0));
    add(
      'meson',
      box(0.06, 4.55, 0, 0.72, 5.5, 0.86, {
        w: 1,
        inner: lines([[[0.72, 5.02, 0.08], [0.72, 5.02, 0.78]], [[0.72, 4.55, 0.07], [0.72, 5.5, 0.07]]], 'e3', 0) + [4.94, 5.1].map((y) => fill(ring(0.72, y, 0.62, 0.018, 'yz', 8), 'k')).join(''),
      }),
    );
    add('tabla', box(0.16, 4.66, 0.86, 0.56, 5.0, 0.89, { t: 'p2', w: 3 }) + cyl(0.38, 5.26, 0.86, 0.95, 0.12, { w: 2 }));
    add(
      'repisa-platos',
      box(0, 4.6, 1.42, 0.32, 5.45, 1.47, { w: 2, x: 'p' }) + [4.75, 4.98, 5.21].map((y) => cyl(0.16, y, 1.47, 1.66, 0.07, { w: 3, body: 'g', top: 'k', shade: false })).join(''),
    );
    sh += shadow(0.06, 3.45, 0.72, 5.5, 0.86, FRONT);
  };

  if (base === 'fonda') cocina();
  else shelves(base === 'farmacia' ? 0.38 : base === 'salon' ? 0.75 : 0.55, base === 'oficina');

  // Quien atiende
  add('persona-mostrador', at(3.9, 4.65, 0, atiende(DRESS[base]), [-14, -75, 14, 0]));
  A.equipo = P(3.9, 4.65, 1.62);

  // ── Mostrador
  add(
    'mostrador',
    box(1.6, 5.6, 0, 6.4, 6.2, 1.0, {
      w: 1,
      inner:
        fill([[1.6, 6.2, 0.9], [6.4, 6.2, 0.9], [6.4, 6.2, 1.0], [1.6, 6.2, 1.0]], 'hd') +
        lines(range(1.92, 6.4, 0.32).map((x) => [[x, 6.2, 0.1], [x, 6.2, 0.9]] as [V3, V3]), 'e4', 0) +
        lines([[[1.6, 6.2, 0.1], [6.4, 6.2, 0.1]]], 'e3', 0),
    }),
  );
  add('mostrador-tope', box(1.55, 5.55, 1.0, 6.45, 6.25, 1.05, { y: 'p2', x: 'p2', w: 1, inner: grain(1.55, 5.55, 6.45, 6.25, 1.05, 4) }));
  add('frasco', cyl(1.86, 5.9, 1.05, 1.3, 0.12, { body: 'g' }) + cyl(1.86, 5.9, 1.3, 1.34, 0.126, { body: 'p2', top: 'p2', w: 3 }) + cyl(1.86, 5.9, 1.34, 1.37, 0.03, { w: 3, shade: false }));
  add(
    'libreta',
    box(2.18, 5.68, 1.05, 2.46, 6.08, 1.065, { w: 3, inner: lines(range(5.75, 6.03, 0.05).map((y) => [[2.21, y, 1.065], [2.3 + rnd() * 0.12, y, 1.065]] as [V3, V3]), 'e4', 0) }) +
      box(2.46, 5.68, 1.05, 2.74, 6.08, 1.065, { w: 3, inner: lines(range(5.75, 5.93, 0.05).map((y) => [[2.49, y, 1.065], [2.58 + rnd() * 0.12, y, 1.065]] as [V3, V3]), 'e4', 0) }) +
      lines([[[2.8, 5.74, 1.07], [2.93, 6.02, 1.07]]], 'e1', 0),
  );
  A.libreta = P(2.46, 5.88, 1.065);
  if (ft.celular) {
    add('celular', box(3.28, 5.76, 1.05, 3.43, 6.0, 1.07, { t: 'k', x: 'p3', y: 'p3', w: 2, inner: lines([[[3.31, 5.82, 1.07], [3.36, 5.94, 1.07]]], 'rf', 0) }));
    A.celular = P(3.36, 5.88, 1.07);
  }
  if (ft.biometria)
    add('huellero', box(3.72, 5.78, 1.05, 3.98, 6.0, 1.11, { t: 'p2', w: 2, inner: plane([[3.77, 5.83, 1.11], [3.92, 5.83, 1.11], [3.92, 5.95, 1.11], [3.77, 5.95, 1.11]], 'g', 'e3', 0) }));
  let keys = '';
  for (const x of range(4.6, 4.84, 0.06)) for (const y of range(5.82, 6.02, 0.05)) keys += loop([[x, y, 1.14], [x + 0.04, y, 1.14], [x + 0.04, y + 0.035, 1.14], [x, y + 0.035, 1.14]], 'e4', 0);
  add('caja', box(4.5, 5.7, 1.05, 5.02, 6.06, 1.14, { w: 1, inner: keys + lines([[[4.54, 6.06, 1.09], [4.98, 6.06, 1.09]]], 'e3', 0) }));
  add(
    'caja-pantalla',
    box(4.7, 5.74, 1.14, 4.8, 5.78, 1.2, { w: 3 }) +
      box(4.56, 5.72, 1.2, 4.96, 5.78, 1.42, { t: 'p2', x: 'p3', y: 'k', w: 2, inner: lines([[[4.62, 5.78, 1.26], [4.72, 5.78, 1.38]], [[4.68, 5.78, 1.25], [4.76, 5.78, 1.35]]], 'rf', 0) }),
  );
  A.caja = P(4.76, 5.75, 1.42);
  let qr = '';
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i * 7 + j * 3 + i * j) % 3 !== 1) qr += fill([[5.1 + i * 0.03, 6.0, 1.1 + j * 0.03], [5.13 + i * 0.03, 6.0, 1.1 + j * 0.03], [5.13 + i * 0.03, 6.0, 1.13 + j * 0.03], [5.1 + i * 0.03, 6.0, 1.13 + j * 0.03]], 'k');
  add('qr', box(5.07, 5.96, 1.05, 5.25, 6.0, 1.26, { w: 3, x: 'p2', inner: qr }));
  add(
    'impresora',
    box(5.32, 5.7, 1.05, 5.68, 6.0, 1.19, { t: 'p2', x: 'p3', y: 'p2', w: 2 }) +
      plane([[5.42, 6.0, 1.19], [5.58, 6.0, 1.19], [5.58, 6.07, 1.07], [5.42, 6.07, 1.07]], 'p', 'e3', 0),
  );
  add(
    'aviso',
    box(5.9, 5.88, 1.05, 6.26, 6.02, 1.08, { w: 3 }) +
      box(5.86, 5.93, 1.08, 6.3, 5.97, 1.44, {
        x: 'p2',
        w: 2,
        inner:
          label('PRIVACIDAD', 6.08, 5.97, 1.36, 'xz', 'tiny', 'middle') +
          lines([[[5.92, 5.97, 1.33], [6.24, 5.97, 1.33]]], 'e3', 0) +
          lines(range(1.15, 1.3, 0.035).map((z) => [[5.92, 5.97, z], [6.18 + ((z * 31) % 0.06), 5.97, z]] as [V3, V3]), 'e4', 0),
      }),
  );
  A.aviso = P(6.08, 5.95, 1.44);

  // Cámara de seguridad y lo que ve
  if (ft.camaras) {
    add('camara', box(0, 6.32, 2.5, 0.16, 6.5, 2.66, { w: 2 }) + box(0.16, 6.36, 2.53, 0.27, 6.46, 2.63, { t: 'p3', x: 'k', y: 'p3', w: 2 }));
    // Cono de visión: dos rayos cortos y el arco de lo que alcanza a ver
    const lens: V3 = [0.27, 6.41, 2.58];
    const toward = (q: V3, t: number): V3 => [lens[0] + (q[0] - lens[0]) * t, lens[1] + (q[1] - lens[1]) * t, lens[2] + (q[2] - lens[2]) * t];
    const ra = toward([3.0, 10.6, 0], 0.42);
    const rb = toward([5.8, 8.2, 0], 0.42);
    const arc: [V3, V3][] = [];
    for (let i = 0; i < 6; i++) {
      const t0 = i / 6;
      const t1 = (i + 0.6) / 6;
      const pt = (t: number): V3 => [ra[0] + (rb[0] - ra[0]) * t, ra[1] + (rb[1] - ra[1]) * t + Math.sin(t * Math.PI) * 0.25, ra[2] + (rb[2] - ra[2]) * t];
      arc.push([pt(t0), pt(t1)]);
    }
    add('camara-vision', lines([[lens, ra], [lens, rb]], 'dash', 0) + lines(arc, 'e3', 0), 'fade');
  }

  // Cliente
  add('cliente', at(4.3, 7.05, 0, cliente(), [-13, -75, 20, 0]));
  A.cliente = P(4.3, 7.05, 1.62);
  sh += shadow(4.18, 6.93, 4.42, 7.17, 1.6, FRONT);

  // ── Sala: muebles según el tipo de negocio
  const nevera = (id: string, y0: number) => {
    const Y = (n: number) => y0 + n;
    let fr = plane([[0.72, Y(0.1), 0.24], [0.72, Y(0.92), 0.24], [0.72, Y(0.92), 1.76], [0.72, Y(0.1), 1.76]], 'g', 'e2', 0);
    for (const zl of [0.24, 0.62, 1.0, 1.38]) {
      if (zl > 0.3) fr += lines([[[0.72, Y(0.1), zl], [0.72, Y(0.92), zl]]], 'e3', 0);
      for (let k = 0; k < 6; k++) {
        const y = Y(0.15 + k * 0.115);
        const tall = (k + Math.round(zl * 10)) % 3 !== 0;
        const h = tall ? 0.3 : 0.18;
        fr += plane(
          tall
            ? [[0.72, y, zl + 0.01], [0.72, y + 0.075, zl + 0.01], [0.72, y + 0.075, zl + 0.19], [0.72, y + 0.05, zl + 0.25], [0.72, y + 0.05, zl + h], [0.72, y + 0.025, zl + h], [0.72, y + 0.025, zl + 0.25], [0.72, y, zl + 0.19]]
            : [[0.72, y, zl + 0.01], [0.72, y + 0.075, zl + 0.01], [0.72, y + 0.075, zl + h], [0.72, y, zl + h]],
          'p',
          'e4',
          0,
        );
      }
    }
    fr += box(0.72, Y(0.15), 0.8, 0.77, Y(0.19), 1.3, { w: 3, x: 'p3' });
    fr += lines(range(0.07, 0.2, 0.04).map((z) => [[0.72, Y(0.16), z], [0.72, Y(0.86), z]] as [V3, V3]), 'e4', 0);
    add(id, box(0, y0, 0, 0.72, y0 + 1, 1.95, { x: 'p', y: 'p hv', w: 1, inner: fr }));
    sh += shadow(0, y0, 0.72, y0 + 1, 1.95, FRONT);
  };

  const gondola = (id: string, x0: number, y0: number, y1: number, price: string) => {
    const x1 = x0 + 0.65;
    let go = '';
    for (const z of [0.12, 0.55, 0.95]) {
      go += lines([[[x1, y0 + 0.02, z], [x1, y1 - 0.02, z]]], 'e3', 0);
      go += lines([[[x1, y0 + 0.02, z - 0.035], [x1, y1 - 0.02, z - 0.035]]], 'e4', 0);
      let y = y0 + 0.1;
      while (y < y1 - 0.15) {
        const w = 0.1 + rnd() * 0.1;
        const h = 0.16 + rnd() * 0.18;
        if (y + w > y1 - 0.06) break;
        const bottle = rnd() < 0.3;
        go += plane(
          bottle
            ? [[x1, y, z + 0.01], [x1, y + w, z + 0.01], [x1, y + w, z + h * 0.7], [x1, y + w * 0.7, z + h], [x1, y + w * 0.3, z + h], [x1, y, z + h * 0.7]]
            : [[x1, y, z + 0.01], [x1, y + w, z + 0.01], [x1, y + w, z + h], [x1, y, z + h]],
          rnd() < 0.3 ? 'p2' : 'p',
          'e4',
          0,
        );
        y += w + 0.025;
      }
    }
    go += plane([[x0 + 0.1, y1, 0.6], [x1 - 0.09, y1, 0.6], [x1 - 0.09, y1, 1.14], [x0 + 0.1, y1, 1.14]], 'p', 'e3', 0);
    go += label('OFERTA', x0 + 0.33, y1, 1.04, 'xz', 'tiny', 'middle');
    go += label(price, x0 + 0.33, y1, 0.8, 'xz', 'promo', 'middle');
    add(id, box(x0, y0, 0, x1, y1, 1.25, { x: 'p2', w: 1, inner: go }));
    sh += shadow(x0, y0, x1, y1, 1.25, FRONT);
  };

  /** Silla de cuatro patas; el respaldo va del lado lejano ('lo') o cercano ('hi') en x. */
  const silla = (x0: number, y0: number, back: 'lo' | 'hi' | 'yhi') => {
    const x1 = x0 + 0.42;
    const y1 = y0 + 0.42;
    const legs = lines(
      [[x0 + 0.03, y1 - 0.03], [x1 - 0.03, y1 - 0.03], [x1 - 0.03, y0 + 0.03]].map(([x, y]) => [[x!, y!, 0], [x!, y!, 0.42]] as [V3, V3]),
      'e2',
      0,
    );
    const rest =
      back === 'lo'
        ? box(x0, y0, 0.46, x0 + 0.05, y1, 0.95, { w: 2 })
        : back === 'hi'
          ? box(x1 - 0.05, y0, 0.46, x1, y1, 0.95, { w: 2 })
          : box(x0, y1 - 0.05, 0.46, x1, y1, 0.95, { w: 2 });
    sh += shadow(x0, y0, x1, y1, 0.95, FRONT);
    const seat = legs + box(x0, y0, 0.42, x1, y1, 0.46, { w: 2 });
    return back !== 'lo' ? { before: seat, after: rest } : { before: rest + seat, after: '' };
  };

  const mesa = (id: string, x0: number, y0: number, diner: boolean) => {
    const x1 = x0 + 0.8;
    const y1 = y0 + 0.8;
    const cy = y0 + 0.19;
    const a = silla(x0 - 0.52, cy, 'lo');
    add(`${id}-silla-a`, a.before);
    add(
      `${id}-patas`,
      lines([[x0 + 0.05, y1 - 0.05], [x1 - 0.05, y1 - 0.05], [x1 - 0.05, y0 + 0.05]].map(([x, y]) => [[x!, y!, 0], [x!, y!, 0.72]] as [V3, V3]), 'e1', 0),
    );
    let top = grain(x0, y0, x1, y1, 0.76, 3);
    top += loop(ring(x0 + 0.24, y0 + 0.4, 0.76, 0.12, 'xy', 20), 'e3', 0) + loop(ring(x1 - 0.24, y0 + 0.4, 0.76, 0.12, 'xy', 20), 'e3', 0);
    add(id, box(x0, y0, 0.72, x1, y1, 0.76, { w: 1, inner: top }) + cyl(x0 + 0.4, y0 + 0.2, 0.76, 0.86, 0.04, { w: 3, shade: false }));
    sh += shadow(x0, y0, x1, y1, 0.76, FRONT);
    const b = silla(x1 + 0.1, cy, 'hi');
    add(`${id}-silla-b`, b.before);
    if (diner) add(`${id}-comensal`, at(x1 + 0.31, cy + 0.21, 0, sentado(), [-13, -63, 13, 0]));
    add(`${id}-silla-b-respaldo`, b.after);
  };

  const estacion = (i: number, y0: number, client: boolean) => {
    const y1 = y0 + 0.9;
    const cy = y0 + 0.45;
    add(
      `espejo-${i}`,
      plane([[0, y0, 0.95], [0, y1, 0.95], [0, y1, 2.05], [0, y0, 2.05]], 'g', 'e1', 0) +
        lines([[[0, y0 + 0.15, 1.3], [0, y0 + 0.45, 1.85]], [[0, y0 + 0.3, 1.25], [0, y0 + 0.6, 1.8]]], 'e4', 0) +
        box(0, y0 - 0.02, 0.78, 0.3, y1 + 0.02, 0.83, { w: 2, x: 'p' }) +
        [0.15, 0.32, 0.5].map((d) => cyl(0.15, y0 + d, 0.83, 1.0, 0.045, { w: 3, shade: false }) + cyl(0.15, y0 + d, 1.0, 1.04, 0.025, { w: 3, body: 'k', top: 'k', shade: false })).join(''),
    );
    add(
      `sillon-${i}-base`,
      cyl(1.2, cy, 0, 0.05, 0.24, { body: 'p3', top: 'p3', w: 2 }) + cyl(1.2, cy, 0.05, 0.4, 0.05, { w: 3, shade: false }) + lines([[[0.84, cy - 0.14, 0.2], [0.84, cy + 0.14, 0.2]], [[0.84, cy, 0.2], [1.0, cy, 0.4]]], 'e1', 0),
    );
    add(`sillon-${i}`, box(0.95, cy - 0.25, 0.4, 1.45, cy + 0.25, 0.54, { t: 'p3', y: 'p3', w: 1 }) + box(0.98, cy - 0.31, 0.54, 1.4, cy - 0.25, 0.66, { w: 2 }));
    if (client) add(`cliente-sillon-${i}`, at(1.18, cy, 0.12, sentado(), [-13, -63, 13, 0]));
    add(
      `sillon-${i}-respaldo`,
      box(0.98, cy + 0.25, 0.54, 1.4, cy + 0.31, 0.66, { w: 2 }) +
        box(1.4, cy - 0.24, 0.54, 1.5, cy + 0.24, 1.18, { t: 'p3', y: 'p3', x: 'p3 hv', w: 1 }) +
        box(1.42, cy - 0.1, 1.18, 1.49, cy + 0.1, 1.3, { w: 2 }),
    );
    sh += shadow(0.95, cy - 0.31, 1.5, cy + 0.31, 1.2, FRONT);
  };

  const abanicoPlanta = (fan: boolean, plant: [number, number]) => {
    if (fan) {
      add('abanico', at(6.2, 9.0, 0, abanico(), [-12, -64, 12, 5]));
      sh += shadow(6.12, 8.92, 6.28, 9.08, 1.35, FRONT);
    }
    add('maceta', cyl(plant[0], plant[1], 0, 0.34, 0.16, { body: 'p2', top: 'p3' }) + at(plant[0], plant[1], 0.34, planta(), [-14, -62, 15, 0]));
    sh += shadow(plant[0] - 0.16, plant[1] - 0.16, plant[0] + 0.16, plant[1] + 0.16, 1.0, FRONT);
  };

  const horario = () =>
    add(
      'horario',
      plane([[0, 9.7, 1.45], [0, 9.12, 1.45], [0, 9.12, 2.12], [0, 9.7, 2.12]], 'p', 'e3') +
        label('HORARIO', 0, 9.41, 1.98, 'yz', 'tiny', 'middle') +
        lines(range(1.56, 1.9, 0.07).map((z) => [[0, 9.62, z], [0, 9.2, z]] as [V3, V3]), 'e4', 0),
      'fade',
    );

  if (base === 'farmacia') {
    horario();
    nevera('nevera', 6.9);
    gondola('gondola', 0.9, 8.4, 10.4, 'B/. 2.50');
    if (ft.equipo >= 3) add('persona-gondola', at(2.2, 9.3, 0, reponedor(), [-25, -75, 13, 0]));
    abanicoPlanta(true, [6.4, 10.4]);
  } else if (base === 'tienda') {
    horario();
    nevera('nevera', 6.9);
    nevera('nevera-2', 7.95);
    gondola('gondola', 1.5, 7.3, 9.1, 'B/. 1.25');
    if (ft.equipo >= 3) add('persona-gondola', at(2.75, 8.3, 0, reponedor(), [-25, -75, 13, 0]));
    gondola('gondola-2', 5.0, 7.9, 9.9, 'B/. 0.75');
    abanicoPlanta(false, [6.4, 10.4]);
  } else if (base === 'fonda') {
    // Pizarra del menú, refresquera, taburetes en la barra y mesas
    add(
      'menu',
      plane([[0, 9.8, 1.2], [0, 8.4, 1.2], [0, 8.4, 2.1], [0, 9.8, 2.1]], 'k', 'e2') +
        label('MENÚ DEL DÍA', 0, 9.1, 1.92, 'yz', 'chalk', 'middle') +
        label('Arroz con pollo · B/. 3.50', 0, 9.65, 1.66, 'yz', 'chalk-s', 'start') +
        label('Sancocho · B/. 3.00', 0, 9.65, 1.5, 'yz', 'chalk-s', 'start') +
        label('Chicha de tamarindo · B/. 0.75', 0, 9.65, 1.34, 'yz', 'chalk-s', 'start'),
      'fade',
    );
    nevera('nevera', 6.9);
    for (const [i, x] of [2.4, 3.25].entries()) {
      add(`taburete-${i}`, lines([[[x, 6.6, 0], [x, 6.6, 0.7]]], 'e1', 0) + loop(ring(x, 6.6, 0.25, 0.12, 'xy', 18), 'e3', 0) + cyl(x, 6.6, 0.7, 0.76, 0.16, { w: 2, top: 'p2' }));
      sh += shadow(x - 0.16, 6.44, x + 0.16, 6.76, 0.76, FRONT);
    }
    mesa('mesa-1', 2.0, 8.3, true);
    if (ft.equipo >= 3) add('persona-sala', at(3.55, 8.05, 0, atiende('delantal'), [-14, -75, 14, 0]));
    mesa('mesa-2', 4.65, 8.6, false);
    abanicoPlanta(true, [6.4, 10.4]);
  } else if (base === 'salon') {
    estacion(0, 6.9, true);
    if (ft.equipo >= 3) add('persona-sala', at(1.95, 7.45, 0, reponedor('tijera'), [-25, -75, 13, 0]));
    estacion(1, 8.4, false);
    add(
      'banca',
      lines([[5.05, 10.75], [6.55, 10.75], [6.55, 10.4]].map(([x, y]) => [[x!, y!, 0], [x!, y!, 0.42]] as [V3, V3]), 'e2', 0) +
        box(5.0, 10.36, 0.42, 6.6, 10.8, 0.47, { w: 1 }) +
        box(5.0, 10.8, 0.47, 6.6, 10.86, 0.9, { w: 2 }) +
        box(5.2, 10.45, 0.47, 5.5, 10.68, 0.5, { w: 3 }),
    );
    sh += shadow(5.0, 10.36, 6.6, 10.86, 0.9, FRONT);
    abanicoPlanta(true, [0.45, 10.4]);
  } else {
    // Oficina: sala de espera con diplomas, y otro escritorio si hay más equipo
    add(
      'diplomas',
      [7.3, 8.3].map((y) => plane([[0, y + 0.5, 1.45], [0, y, 1.45], [0, y, 1.9], [0, y + 0.5, 1.9]], 'p', 'e2') + loop([[0, y + 0.44, 1.5], [0, y + 0.06, 1.5], [0, y + 0.06, 1.85], [0, y + 0.44, 1.85]], 'e4', 0) + lines(range(1.58, 1.8, 0.06).map((z) => [[0, y + 0.38, z], [0, y + 0.12, z]] as [V3, V3]), 'e4', 0)).join(''),
      'fade',
    );
    [7.05, 7.65, 8.25, 8.85].forEach((y, i) => add(`espera-${i}`, silla(0.1, y, 'lo').before));
    add(
      'mesita',
      lines([[1.05, 8.45], [1.55, 8.45], [1.55, 7.55]].map(([x, y]) => [[x!, y!, 0], [x!, y!, 0.36]] as [V3, V3]), 'e2', 0) +
        box(1.0, 7.5, 0.36, 1.6, 8.5, 0.4, { w: 1 }) +
        box(1.1, 7.65, 0.4, 1.4, 7.92, 0.43, { w: 3 }) +
        box(1.16, 8.05, 0.4, 1.46, 8.3, 0.42, { w: 3, t: 'p2' }),
    );
    sh += shadow(1.0, 7.5, 1.6, 8.5, 0.4, FRONT);
    if (ft.equipo >= 3) {
      add('escritorio-2', box(4.7, 8.2, 0.72, 6.2, 8.9, 0.76, { w: 1, inner: grain(4.7, 8.2, 6.2, 8.9, 0.76, 4) }) + lines([[4.75, 8.85], [6.15, 8.85], [6.15, 8.25]].map(([x, y]) => [[x!, y!, 0], [x!, y!, 0.72]] as [V3, V3]), 'e1', 0));
      add('monitor-2', box(5.3, 8.3, 0.76, 5.5, 8.4, 0.8, { w: 3 }) + box(5.0, 8.26, 0.84, 5.8, 8.31, 1.28, { t: 'p2', x: 'p3', y: 'k', w: 1 }));
      sh += shadow(4.7, 8.2, 6.2, 8.9, 0.76, FRONT);
      const c = silla(5.24, 9.15, 'yhi');
      add('silla-sala', c.before);
      add('persona-sala', at(5.45, 9.36, 0, sentado(), [-13, -63, 13, 0]));
      add('silla-sala-respaldo', c.after);
    }
    abanicoPlanta(false, [0.45, 10.4]);
  }

  // ── Muros cortados del frente y del lado
  add('muro-der', box(7, -0.22, 0, 7.22, 11, 0.4, { t: 'k', w: 1 }), 'rise');
  add('muro-frente-a', box(-0.22, 11, 0, 2.7, 11.2, 0.4, { t: 'k', w: 1 }), 'rise');
  add('muro-frente-b', box(4.7, 11, 0, 7.22, 11.2, 0.4, { t: 'k', w: 1 }), 'rise');

  // Entrada con cortina metálica a medio subir
  add('marco-a', box(2.7, 11, 0, 2.8, 11.2, 2.55, { w: 1 }), 'rise');
  add(
    'marco-b',
    box(4.6, 11, 0, 4.7, 11.2, 2.55, {
      w: 1,
      inner: ft.camaras ? fill([[4.6, 11.2, 1.3], [4.7, 11.2, 1.3], [4.7, 11.2, 1.48], [4.6, 11.2, 1.48]], 'k') : '',
    }),
    'rise',
  );
  add('dintel', box(2.7, 11, 2.45, 4.7, 11.2, 2.55, { w: 1 }), 'rise');
  add(
    'cortina',
    plane([[2.8, 11.22, 2.2], [4.6, 11.22, 2.2], [4.6, 11.22, 2.45], [2.8, 11.22, 2.45]], 'p2', 'e2', 0) +
      lines(range(2.25, 2.45, 0.04).map((z) => [[2.8, 11.22, z], [4.6, 11.22, z]] as [V3, V3]), 'e4', 0) +
      box(2.8, 11.18, 2.17, 4.6, 11.24, 2.21, { w: 2, x: 'p3' }) +
      box(2.75, 10.98, 2.55, 4.65, 11.25, 2.88, { w: 1, inner: lines(range(2.6, 2.86, 0.045).map((z) => [[2.78, 11.25, z], [4.62, 11.25, z]] as [V3, V3]), 'e4', 0) }),
    'rise',
  );
  A.entrada = P(3.7, 11.12, 2.88);
  };

  if (esPropio(lugar)) {
    places = PROPIOS[lugar]({
      ...ink,
      ft,
      add,
      A,
      range,
      shade: (html) => {
        sh += html;
      },
      placeShadows: () => {
        items.push(shadowItem);
      },
    });
  } else local(lugar);

  // Delivery en la acera
  if (ft.delivery) {
    add('moto-rueda-a', ringPath(ring(5.75, 12.1, 0.2, 0.2, 'xz'), 'k', 2) + ringPath(ring(5.75, 12.1, 0.2, 0.135, 'xz', 20), 'p', 3) + fill(ring(5.75, 12.1, 0.2, 0.035, 'xz', 10), 'k'));
    add('moto-rueda-b', ringPath(ring(6.8, 12.1, 0.2, 0.2, 'xz'), 'k', 2) + ringPath(ring(6.8, 12.1, 0.2, 0.135, 'xz', 20), 'p', 3) + fill(ring(6.8, 12.1, 0.2, 0.035, 'xz', 10), 'k'));
    add(
      'moto',
      box(5.9, 12.02, 0.24, 6.7, 12.18, 0.46, { t: 'p2', y: 'p', w: 2 }) +
        lines([[[6.6, 12.12, 0.22], [7.0, 12.12, 0.3]]], 'e1', 0) +
        box(6.0, 11.99, 0.46, 6.45, 12.21, 0.54, { t: 'k', y: 'p3', x: 'p3', w: 2 }),
    );
    add('moto-manubrio', lines([[[5.75, 12.1, 0.2], [5.92, 12.1, 0.88]]], 'e1', 0) + lines([[[5.92, 11.86, 0.9], [5.92, 12.34, 0.9]]], 'e1', 0) + box(5.84, 12.04, 0.74, 5.9, 12.16, 0.84, { w: 3, x: 'p' }));
    add(
      'moto-caja',
      box(6.35, 11.88, 0.54, 6.85, 12.32, 0.98, { w: 1, inner: loop([[6.43, 12.32, 0.66], [6.77, 12.32, 0.66], [6.77, 12.32, 0.86], [6.43, 12.32, 0.86]], 'e3', 0) + lines([[[6.47, 12.32, 0.76], [6.73, 12.32, 0.76]]], 'e4', 0) }),
    );
    A.delivery = P(6.6, 12.1, 0.98);
  }

  // ── Fuera del local: oficinas de terceros y nube
  const offices: { key: 'contador' | 'ti' | 'marketing'; label: string }[] = [];
  if (ft.contador) offices.push({ key: 'contador', label: 'CONTADOR' });
  if (ft.ti) offices.push({ key: 'ti', label: 'SOPORTE TI' });
  if (ft.marketing) offices.push({ key: 'marketing', label: 'MARKETING' });
  offices.forEach((o, i) => {
    const y0 = 0.3 + i * 3.3;
    const Y1 = y0 + 1.9;
    const lot: Rect = [8.9, y0 - 0.4, 11.6, y0 + 2.4];
    add(`${o.key}-lote`, loop([[lot[0], lot[1], 0], [lot[2], lot[1], 0], [lot[2], lot[3], 0], [lot[0], lot[3], 0]], 'dash', 0) + shadow(9.3, y0, 11.1, Y1, 1.8, lot), 'fade');
    let fa = '';
    for (const x of [9.5, 10.06]) {
      fa += plane([[x, Y1, 0.72], [x + 0.4, Y1, 0.72], [x + 0.4, Y1, 1.2], [x, Y1, 1.2]], 'g', 'e2', 0);
      fa += lines(range(x + 0.08, x + 0.4, 0.08).map((xx) => [[xx, Y1, 0.72], [xx, Y1, 1.2]] as [V3, V3]), 'e3', 0);
      fa += lines([[[x - 0.03, Y1, 0.7], [x + 0.43, Y1, 0.7]]], 'e2', 0);
    }
    fa += plane([[10.6, Y1, 0], [10.94, Y1, 0], [10.94, Y1, 0.96], [10.6, Y1, 0.96]], 'p2', 'e2', 0);
    fa += fill(ring(10.88, Y1, 0.48, 0.02, 'xz', 8), 'k');
    fa += plane([[9.45, Y1, 1.3], [10.98, Y1, 1.3], [10.98, Y1, 1.58], [9.45, Y1, 1.58]], 'p', 'e2', 0);
    fa += label(o.label, 10.215, Y1, 1.38, 'xz', 'osign', 'middle');
    fa += box(11.1, y0 + 0.6, 0.95, 11.3, y0 + 1.2, 1.22, { w: 2, x: 'p', inner: lines(range(y0 + 0.66, y0 + 1.16, 0.05).map((y) => [[11.3, y, 0.99], [11.3, y, 1.18]] as [V3, V3]), 'e4', 0) });
    add(`${o.key}-edificio`, box(9.3, y0, 0, 11.1, Y1, 1.7, { t: 'p2', w: 1, inner: fa }));
    add(`${o.key}-techo`, box(9.22, y0 - 0.08, 1.7, 11.18, Y1 + 0.08, 1.8, { t: 'k', w: 1 }));
    A[o.key] = P(10.2, y0 + 0.95, 1.8);
  });
  let cloud: Point | null = null;
  if (ft.nube) {
    const cl = P(9.8, -2.0, 2.4);
    cloud = cl;
    grow(cl.x + 50, cl.y - 42);
    grow(cl.x - 46, cl.y + 36);
    const X = (n: number) => f(cl.x + n);
    const Y = (n: number) => f(cl.y + n);
    let hatch = '';
    for (let k = 0; k < 9; k++) hatch += `M${X(-30 + k * 8)} ${Y(13)}L${X(-26 + k * 8)} ${Y(7)}`;
    add(
      'nube',
      `<path class="p s2" d="M${X(-40)} ${Y(14)}C${X(-52)} ${Y(12)} ${X(-50)} ${Y(-8)} ${X(-36)} ${Y(-8)}C${X(-36)} ${Y(-24)} ${X(-14)} ${Y(-30)} ${X(-4)} ${Y(-20)}C${X(2)} ${Y(-36)} ${X(30)} ${Y(-34)} ${X(30)} ${Y(-16)}C${X(44)} ${Y(-18)} ${X(50)} ${Y(4)} ${X(38)} ${Y(14)}Z"/>` +
        `<path class="e4" d="${hatch}"/>` +
        `<text class="olabel" x="${X(0)}" y="${Y(32)}">NUBE</text>`,
      'fade',
    );
    A.nube = { x: cl.x + 10, y: cl.y - 30 };
  }

  // Flujos de datos que salen del local
  const flows: { id: string; html: string }[] = [];
  const origin = A.monitor ?? A.celular ?? A.caja!;
  const curve = (id: string, a: Point, b: Point, c1: Point, c2: Point, txt: string, lp: Point, anchor = 'middle') =>
    flows.push({
      id,
      html:
        `<path class="flow" d="M${f(a.x)} ${f(a.y)}C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(b.x)} ${f(b.y)}"/>` +
        `<text class="flabel" x="${f(lp.x)}" y="${f(lp.y)}" text-anchor="${anchor}">${txt}</text>`,
    });
  if (cloud) curve('flujo-nube', origin, { x: cloud.x - 30, y: cloud.y - 16 }, { x: origin.x + 120, y: origin.y - 70 }, { x: cloud.x - 120, y: cloud.y - 90 }, 'respaldos', { x: cloud.x - 52, y: cloud.y - 34 }, 'end');
  for (const o of offices) {
    const to = A[o.key]!;
    const from = o.key === 'contador' ? (A.archivero ?? A.papeles!) : o.key === 'ti' ? origin : (A.celular ?? origin);
    const txt = o.key === 'contador' ? 'planilla y expedientes' : o.key === 'ti' ? 'acceso remoto' : 'lista de clientes';
    curve(`flujo-${o.key}`, from, to, { x: from.x + 160, y: from.y - 170 }, { x: to.x - 120, y: to.y - 150 }, txt, { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 70 });
  }
  if (A.delivery) {
    const from = A.celular ?? A.libreta!;
    const to = A.delivery;
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
    grow(bubble.x - 22, bubble.y - 22);
    grow(bubble.x + 22, bubble.y + 22);
    const place = key === 'equipo' && ft.equipo >= 2 ? 'Tu equipo' : (places[key] ?? PLACE[key]);
    return { area, n: i + 1, anchor, bubble, place };
  });

  shadowItem.html = sh;
  const pad = 18;
  const viewBox: ViewBox = [B[0]! - pad, B[1]! - pad, B[2]! - B[0]! + pad * 2, B[3]! - B[1]! + pad * 2];
  return { items, flows, callouts, viewBox };
}

// El encuadre es el del negocio más completo posible, para que el dibujo no salte
// mientras se arma con las respuestas del perfil.
const FULL: SceneFeatures = {
  tipo: 'farmacia',
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

/**
 * Encuadre para el recorrido: acerca la cámara a un área con la proporción del escenario,
 * dejando el lugar en la fracción (fx, fy) del cuadro (por ejemplo, a la izquierda si la ficha va a la derecha).
 */
export function frameOn(scene: Scene, area: AreaId, aspect: number, zoom = 0.5, fx = 0.5, fy = 0.5): ViewBox {
  const full = scene.viewBox;
  const c = scene.callouts.find((x) => x.area === area);
  const w = full[2] * zoom;
  const h = w / aspect;
  if (!c) return [full[0] + (full[2] - w) / 2, full[1] + (full[3] - h) / 2, w, h];
  const cx = c.anchor.x * 0.7 + c.bubble.x * 0.3;
  const cy = c.anchor.y * 0.7 + c.bubble.y * 0.3;
  return [cx - w * fx, cy - h * fy, w, h];
}
