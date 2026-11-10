// El hostal: el lugar de los negocios de hospedaje y turismo.
// Dos habitaciones al fondo, recepción con lobby al frente y un huésped que llega con su maleta.
import { atiende, cliente, reponedor, sentado } from './figures';
import type { Rect, V3 } from './ink';
import type { AnchorKey, Kit } from './scene';

const LOT: Rect = [-0.7, -0.7, 7.9, 11.2];
const ACERA_R: Rect = [-0.7, 11.2, 7.9, 12.9];
const HAB_A: Rect = [0, 0, 3.4, 4.4];
const HAB_B: Rect = [3.6, 0, 7, 4.4];
const LOBBY: Rect = [0, 4.8, 7, 11];
const n1 = (n: number) => n.toFixed(1);

// ── Figuras en 2D (px, con el pie en 0,0) ────────────────────────────────

/** Toalla doblada en forma de cisne, sobre la cama. */
function toallaCisne(): string {
  return (
    `<path class='p s2' d='M-10 0C-15 -5 -12 -13 -4 -12C5 -11 9 -5 6 0Z'/>` +
    `<path class='p s2' d='M2 -10C-2 -18 2 -27 7 -24C10 -22 9 -18 6 -18C4 -18 3 -16 4 -10Z'/>` +
    `<path class='e3' d='M6 -24L12 -22L6 -20Z'/>` +
    `<circle class='k' cx='7' cy='-22.4' r='0.9'/>` +
    `<path class='e4' d='M-8 -8Q-2 -12 2 -8M-9 -4Q-3 -7 3 -4'/>`
  );
}

/** Planta grande de hojas largas para el lobby o la acera. */
function plantaLobby(): string {
  const leaves: [number, number, number, number][] = [
    [-4, -17, -36, 3.2],
    [-1.2, -9, -50, 3.8],
    [3.8, 18, -38, 3.2],
    [1.5, 5, -55, 3.8],
    [0, -1, -31, 3],
  ];
  return leaves
    .map(([bx, tx, ty, w]) => {
      const mx = bx + (tx - bx) * 0.45;
      const half = w * 0.9;
      return (
        `<path class='p s2' d='M${n1(bx - w)} 0Q${n1(mx - half)} ${n1(ty * 0.55)} ${n1(tx)} ${n1(ty)}` +
        `Q${n1(mx + half)} ${n1(ty * 0.55)} ${n1(bx + w)} 0Z'/>` +
        `<path class='e4' d='M${n1(bx)} 0Q${n1(mx)} ${n1(ty * 0.5)} ${n1(tx)} ${n1(ty)}'/>`
      );
    })
    .join('');
}

// ── El lugar ─────────────────────────────────────────────────────────────

export function hospedaje(k: Kit): Partial<Record<AnchorKey, string>> {
  const { ft, add, A, range, shade, placeShadows, P, rnd, fill, lines, loop, plane, box, shadow, cyl, ring, ringPath, label, at, grain } = k;
  const seg = (a: V3, b: V3): [V3, V3] => [a, b];

  // ── Terreno, acera y calle
  add(
    'lote',
    loop([[LOT[0], LOT[1], 0], [LOT[2], LOT[1], 0], [LOT[2], LOT[3], 0], [LOT[0], LOT[3], 0]], 'dash', 0),
    'fade',
  );
  add(
    'acera',
    box(-0.7, 11.2, -0.14, 7.9, 12.0, 0, { y: 'p2', w: 2 }) +
      lines(range(0.25, 7.9, 0.95).map((x) => seg([x, 11.2, 0], [x, 12.0, 0])), 'e4', 0) +
      lines([seg([-0.7, 11.6, 0], [7.9, 11.6, 0])], 'e4', 0) +
      plane([[1.1, 12.0, -0.12], [1.62, 12.0, -0.12], [1.62, 12.0, -0.04], [1.1, 12.0, -0.04]], 'k', 'e3', 0),
    'fade',
  );
  add(
    'carril',
    lines(range(-0.7, 7.9, 0.9).map((x) => seg([x, 12.35, -0.14], [x + 0.5, 12.35, -0.14])), 'e2', 0),
    'fade',
  );
  add('calle', label('CALLE PRINCIPAL', 0.4, 12.72, -0.14, 'xy', 'street', 'start'), 'fade');
  add(
    'norte',
    loop(ring(8.1, 12.5, 0, 0.32, 'xy'), 'e3', 0) +
      fill([[8.1, 11.95, 0], [8.2, 12.62, 0], [8.1, 12.5, 0], [8.0, 12.62, 0]], 'k') +
      label('N', 8.1, 11.86, 0, 'xy', 'room', 'middle'),
    'fade',
  );

  // ── Pisos: madera en las habitaciones, damero en el lobby
  const duela = (x0: number, y0: number, x1: number, y1: number) =>
    fill([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], 'p2') +
    lines(range(y0 + 0.35, y1, 0.55).map((y) => seg([x0, y, 0], [x1, y, 0])), 'e4', 0) +
    grain(x0 + 0.1, y0 + 0.1, x1 - 0.1, y1 - 0.1, 0, 6) +
    loop([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], 'e2', 0);
  add('piso-hab-a', duela(0, 0, 3.4, 4.4), 'fade');
  add('piso-hab-b', duela(3.6, 0, 7, 4.4), 'fade');
  add(
    'piso-pasillo',
    fill([[0, 4.4, 0], [7, 4.4, 0], [7, 4.8, 0], [0, 4.8, 0]], 'p3') +
      lines(range(0.5, 7, 0.5).map((x) => seg([x, 4.4, 0], [x, 4.8, 0])), 'e4', 0),
    'fade',
  );
  let lobby = fill([[0, 4.8, 0], [7, 4.8, 0], [7, 11, 0], [0, 11, 0]], 'p');
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 6; j++) {
      if ((i + j) % 2 === 0) continue;
      const x0 = i;
      const x1 = Math.min(7, x0 + 1);
      const y0 = 4.8 + j;
      const y1 = Math.min(11, y0 + 1);
      lobby += fill([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], 'p2');
    }
  }
  lobby += lines(range(1, 7, 1).map((x) => seg([x, 4.8, 0], [x, 11, 0])), 'e4', 0);
  lobby += lines(range(5.8, 11, 1).map((y) => seg([0, y, 0], [7, y, 0])), 'e4', 0);
  add('piso-lobby', lobby, 'fade');
  add(
    'tapete',
    fill([[2.95, 10.1, 0], [4.45, 10.1, 0], [4.45, 10.88, 0], [2.95, 10.88, 0]], 'p3') +
      lines(range(3.05, 4.4, 0.1).map((x) => seg([x, 10.14, 0], [x, 10.84, 0])), 'e4', 0),
    'fade',
  );
  placeShadows();

  // ── Muros altos del fondo y de la izquierda
  add('muro-fondo', box(0, -0.22, 0, 7, 0, 3, { t: 'k', y: 'p', x: 'p2', w: 1 }), 'rise');
  add('muro-izq', box(-0.22, -0.22, 0, 0, 11, 3, { t: 'k', x: 'p2', y: 'p', w: 1 }), 'rise');

  // Ventanas con cortina y cuadros de cada habitación
  const ventana = (id: string, x0: number, x1: number, z0: number, z1: number) => {
    const zm = (z0 + z1) / 2;
    let v = plane([[x0, 0.01, z0], [x1, 0.01, z0], [x1, 0.01, z1], [x0, 0.01, z1]], 'g', 'e2', 0);
    v += lines([seg([x0, 0.01, zm], [x1, 0.01, zm]), seg([(x0 + x1) / 2, 0.01, z0], [(x0 + x1) / 2, 0.01, z1])], 'e3', 0);
    v += plane([[x0 - 0.18, 0.02, z0 - 0.1], [x0, 0.02, z0 - 0.1], [x0, 0.02, z1 + 0.08], [x0 - 0.18, 0.02, z1 + 0.08]], 'p2', 'e3', 0);
    v += lines(range(z0 + 0.12, z1 - 0.04, 0.09).map((z) => seg([x0 - 0.17, 0.02, z], [x0 - 0.1, 0.02, z + 0.02])), 'e4', 0);
    v += plane([[x1, 0.02, z0 - 0.1], [x1 + 0.18, 0.02, z0 - 0.1], [x1 + 0.18, 0.02, z1 + 0.08], [x1, 0.02, z1 + 0.08]], 'p2', 'e3', 0);
    v += lines(range(z0 + 0.12, z1 - 0.04, 0.09).map((z) => seg([x1 + 0.1, 0.02, z + 0.02], [x1 + 0.17, 0.02, z])), 'e4', 0);
    add(id, v);
  };
  const cuadro = (id: string, x0: number, x1: number, z0: number, z1: number) => {
    const marco: V3[] = [[x0, 0.01, z0], [x1, 0.01, z0], [x1, 0.01, z1], [x0, 0.01, z1]];
    const lienzo: V3[] = [[x0 + 0.06, 0.02, z0 + 0.06], [x1 - 0.06, 0.02, z0 + 0.06], [x1 - 0.06, 0.02, z1 - 0.06], [x0 + 0.06, 0.02, z1 - 0.06]];
    add(
      id,
      plane(marco, 'p', 'e2', 0) +
        plane(lienzo, 'p2', 'e4', 0) +
        lines([seg([x0 + 0.12, 0.02, z0 + 0.18], [x1 - 0.12, 0.02, z1 - 0.2])], 'e3', 0),
    );
  };
  ventana('ventana-a', 2.45, 3.2, 1.2, 2.2);
  cuadro('cuadro-a', 0.55, 1.25, 1.55, 2.1);
  ventana('ventana-b', 4.2, 4.95, 1.2, 2.2);
  cuadro('cuadro-b', 5.4, 6.1, 1.55, 2.1);
  add(
    'aire-hab-b',
    box(6.15, 0, 2.2, 6.85, 0.24, 2.58, {
      w: 2,
      inner:
        lines(range(6.24, 6.76, 0.07).map((x) => seg([x, 0.24, 2.3], [x + 0.03, 0.24, 2.38])), 'e4', 0) +
        lines([seg([6.2, 0.24, 2.42], [6.8, 0.24, 2.42])], 'e3', 0),
    }),
  );

  // ── Tabiques bajos y puertas numeradas
  add('tabique-medio', box(3.4, 0, 0, 3.6, 4.4, 0.9, { t: 'k', w: 1 }), 'rise');
  add('tabique-pasillo-a', box(0, 4.4, 0, 0.9, 4.6, 0.9, { t: 'k', w: 1 }), 'rise');
  add('tabique-pasillo-b', box(1.6, 4.4, 0, 4.9, 4.6, 0.9, { t: 'k', w: 1 }), 'rise');
  add('tabique-pasillo-c', box(5.6, 4.4, 0, 7, 4.6, 0.9, { t: 'k', w: 1 }), 'rise');
  add(
    'puerta-hab-a',
    plane([[0.9, 4.5, 0], [1.6, 4.5, 0], [1.6, 4.5, 0.86], [0.9, 4.5, 0.86]], 'p2', 'e2', 0) +
      label('1', 1.25, 4.53, 0.55, 'xz', 'tiny', 'middle'),
    'rise',
  );
  add(
    'puerta-hab-b',
    plane([[4.9, 4.5, 0], [5.6, 4.5, 0], [5.6, 4.5, 0.86], [4.9, 4.5, 0.86]], 'p2', 'e2', 0) +
      label('2', 5.25, 4.53, 0.55, 'xz', 'tiny', 'middle'),
    'rise',
  );

  // ── Habitaciones
  const cama = (id: string, x0: number, y0: number, clip: Rect) => {
    const x1 = x0 + 1.4;
    const y1 = y0 + 2.0;
    const cab = box(x0 - 0.04, y0 - 0.05, 0, x1 + 0.04, y0 + 0.02, 0.95, { t: 'p2', x: 'p2', w: 2 });
    const base = box(x0, y0, 0, x1, y1, 0.38, { t: 'p2', x: 'p3', y: 'p', w: 2 });
    const col = box(x0 + 0.06, y0 + 0.06, 0.38, x1 - 0.06, y1 - 0.06, 0.58, { t: 'p', x: 'p2', y: 'p2', w: 1 });
    const alm = box(x0 + 0.12, y0 + 0.12, 0.58, x0 + 0.58, y0 + 0.48, 0.72, { t: 'p', w: 3 }) +
      box(x0 + 0.72, y0 + 0.12, 0.58, x1 - 0.12, y0 + 0.48, 0.72, { t: 'p', w: 3 });
    const pliegues = lines(
      range(x0 + 0.12, x1 - 0.1, 0.18).map((x) => seg([x, y1 - 0.06, 0.64], [x, y1 - 0.45, 0.64])),
      'e4',
      0,
    );
    const sab = box(x0 + 0.04, y1 - 0.45, 0.58, x1 - 0.04, y1 - 0.06, 0.64, { t: 'p2', w: 3, inner: pliegues });
    add(id, cab + base + col + alm + sab);
    shade(shadow(x0, y0, x1, y1, 0.95, clip));
  };
  const mesita = (id: string, x: number, y: number, clip: Rect) => {
    add(
      id,
      box(x, y, 0, x + 0.38, y + 0.38, 0.45, { t: 'p2', x: 'p3', w: 2 }) +
        cyl(x + 0.19, y + 0.19, 0.45, 0.62, 0.045, { w: 3, shade: false }) +
        cyl(x + 0.19, y + 0.19, 0.62, 0.78, 0.11, { body: 'p', top: 'p3', w: 2 }),
    );
    shade(shadow(x, y, x + 0.38, y + 0.38, 0.78, clip));
  };
  cama('cama-a', 0.35, 0.45, HAB_A);
  mesita('mesita-a', 1.95, 0.45, HAB_A);
  add('toalla-cisne', at(1.12, 2.16, 0.64, toallaCisne(), [-16, -30, 16, 2]));
  const rack = lines(
    [
      seg([2.45, 2.15, 0], [2.45, 2.15, 0.32]),
      seg([2.98, 2.15, 0], [2.98, 2.15, 0.32]),
      seg([2.45, 2.58, 0], [2.45, 2.58, 0.32]),
      seg([2.98, 2.58, 0], [2.98, 2.58, 0.32]),
    ],
    'e2',
    0,
  );
  add('portamaletas', rack + box(2.42, 2.12, 0.32, 3.01, 2.61, 0.37, { t: 'p2', w: 3 }));
  const forro = lines(
    [seg([2.5, 2.59, 0.46], [2.93, 2.59, 0.46]), seg([2.5, 2.59, 0.54], [2.93, 2.59, 0.54])],
    'e4',
    0,
  );
  add(
    'maleta-abierta',
    box(2.46, 2.14, 0.37, 2.97, 2.59, 0.64, { t: 'p2', x: 'p3', y: 'p3', w: 2, inner: forro }) +
      plane([[2.46, 2.14, 0.64], [2.97, 2.14, 0.64], [2.97, 2.14, 1.02], [2.46, 2.14, 1.02]], 'p2', 'e3', 0) +
      lines([seg([2.52, 2.14, 0.72], [2.91, 2.14, 0.72]), seg([2.52, 2.14, 0.86], [2.91, 2.14, 0.86])], 'e4', 0) +
      lines([seg([2.66, 2.14, 0.64], [2.72, 2.14, 0.64]), seg([2.72, 2.14, 0.64], [2.72, 2.14, 0.7])], 'e1', 0),
  );
  shade(shadow(2.42, 2.12, 3.01, 2.61, 0.7, HAB_A));

  cama('cama-b', 4.05, 0.45, HAB_B);
  mesita('mesita-b', 5.65, 0.45, HAB_B);
  let fan = '';
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const bx = 5.2 + c * 0.12;
    const by = 3.2 + s * 0.12;
    const tx = 5.2 + c * 0.56;
    const ty = 3.2 + s * 0.56;
    const px = -s * 0.1;
    const py = c * 0.1;
    const aspa: V3[] = [[bx + px, by + py, 2.52], [tx + px, ty + py, 2.52], [tx - px, ty - py, 2.52], [bx - px, by - py, 2.52]];
    fan += plane(aspa, 'p2', 'e3', 0);
  }
  add(
    'ventilador-techo',
    lines([seg([5.2, 3.2, 2.95], [5.2, 3.2, 2.62])], 'e2', 0) +
      cyl(5.2, 3.2, 2.52, 2.62, 0.06, { w: 3, shade: false }) +
      fan +
      lines([seg([5.2, 3.2, 2.52], [5.2, 3.2, 2.46])], 'e1', 0),
  );

  // ── Muro izquierdo del lobby: casillero de llaves, letrero y mapa
  let llaves = plane([[0.01, 5.15, 1.3], [0.01, 5.95, 1.3], [0.01, 5.95, 2.18], [0.01, 5.15, 2.18]], 'p', 'e2', 0);
  llaves += lines(range(5.15, 5.96, 0.267).map((y) => seg([0.01, y, 1.3], [0.01, y, 2.18])), 'e3', 0);
  llaves += lines(range(1.3, 2.18, 0.22).map((z) => seg([0.01, 5.15, z], [0.01, 5.95, z])), 'e3', 0);
  for (let c = 0; c < 3; c++) {
    for (let r = 0; r < 4; r++) {
      const yc = 5.28 + c * 0.25;
      const zc = 1.43 + r * 0.2;
      llaves += ringPath(ring(0.01, yc, zc, 0.022, 'yz', 8), 'p', 3);
      llaves += lines(
        [seg([0.01, yc, zc - 0.02], [0.01, yc, zc - 0.08]), seg([0.01, yc, zc - 0.08], [0.01, yc + 0.03, zc - 0.08])],
        'e2',
        0,
      );
    }
  }
  add('casillero-llaves', llaves);
  add(
    'letrero-hostal',
    plane([[0.01, 6.25, 2.32], [0.01, 7.45, 2.32], [0.01, 7.45, 2.82], [0.01, 6.25, 2.82]], 'p', 'e2', 0) +
      label('HOSTAL', 0.01, 6.85, 2.45, 'yz', 'sign', 'middle'),
  );
  let mapa = plane([[0.01, 7.9, 1.45], [0.01, 9.1, 1.45], [0.01, 9.1, 2.25], [0.01, 7.9, 2.25]], 'p2', 'e2', 0);
  mapa += lines(
    [
      seg([0.01, 8.05, 1.62], [0.01, 8.5, 1.9]),
      seg([0.01, 8.5, 1.9], [0.01, 8.85, 1.75]),
      seg([0.01, 8.85, 1.75], [0.01, 8.95, 2.1]),
      seg([0.01, 8.2, 2.08], [0.01, 8.35, 1.78]),
      seg([0.01, 8.35, 1.78], [0.01, 8.7, 1.95]),
    ],
    'e4',
    0,
  );
  mapa += label('MAPA TURÍSTICO', 0.01, 8.5, 2.12, 'yz', 'tiny', 'middle');
  add('mapa-turistico', mapa);

  // ── Escritorio de reservas junto al muro
  add(
    'escritorio-patas',
    lines(
      [
        seg([0.18, 4.94, 0], [0.18, 4.94, 0.7]),
        seg([1.32, 4.94, 0], [1.32, 4.94, 0.7]),
        seg([0.18, 5.12, 0], [0.18, 5.12, 0.7]),
        seg([1.32, 5.12, 0], [1.32, 5.12, 0.7]),
      ],
      'e2',
      0,
    ),
  );
  add(
    'escritorio',
    box(0.15, 4.9, 0.7, 1.35, 5.15, 0.76, { y: 'p2', w: 1, inner: grain(0.15, 4.9, 1.35, 5.15, 0.76, 4) }),
  );
  const renglones = lines(
    range(4.96, 5.06, 0.03).map((y) => seg([0.4, y, 0.796], [0.66 + rnd() * 0.08, y, 0.796])),
    'e4',
    0,
  );
  add(
    'papeles',
    box(0.33, 4.94, 0.76, 0.75, 5.1, 0.78, { w: 3 }) +
      box(0.36, 4.92, 0.78, 0.78, 5.08, 0.796, { w: 3, inner: renglones }),
  );
  A.papeles = P(0.57, 5.0, 0.796);
  shade(shadow(0.15, 4.9, 1.35, 5.15, 0.76, LOBBY));
  if (ft.archivero) {
    let d = lines([seg([1.55, 5.2, 0.5], [2.05, 5.2, 0.5]), seg([1.55, 5.2, 0.95], [2.05, 5.2, 0.95])], 'e2', 0);
    for (const zc of [0.2, 0.65, 1.1]) {
      d += fill([[1.72, 5.2, zc], [1.9, 5.2, zc], [1.9, 5.2, zc + 0.04], [1.72, 5.2, zc + 0.04]], 'k');
    }
    add('archivero', box(1.45, 4.95, 0, 2.05, 5.5, 1.35, { w: 1, inner: d }));
    A.archivero = P(1.75, 5.25, 1.4);
    shade(shadow(1.45, 4.95, 2.05, 5.5, 1.35, LOBBY));
  }
  if (ft.computadora) {
    add(
      'monitor-pie',
      box(0.72, 4.98, 0.76, 0.92, 5.04, 0.82, { w: 3 }) +
        box(0.8, 4.97, 0.82, 0.86, 5.01, 0.94, { w: 3 }),
    );
    const scr = lines(range(0.98, 1.3, 0.06).map((z) => seg([0.52, 4.99, z], [1.14, 4.99, z])), 'rf', 0) +
      lines([seg([0.78, 4.99, 0.96], [0.78, 4.99, 1.32]), seg([1.0, 4.99, 0.96], [1.0, 4.99, 1.32])], 'rf', 0);
    add('monitor', box(0.45, 4.97, 0.9, 1.2, 5.02, 1.38, { t: 'p2', x: 'p3', y: 'k', w: 1, inner: scr }));
    add(
      'teclado',
      box(0.6, 5.04, 0.76, 1.05, 5.12, 0.78, {
        w: 3,
        inner: lines(range(5.05, 5.11, 0.02).map((y) => seg([0.62, y, 0.78], [1.02, y, 0.78])), 'e4', 0),
      }),
    );
    A.monitor = P(0.82, 4.99, 1.38);
  }

  // ── Recepción: quien atiende y el mostrador en L
  add('persona-mostrador', at(2.2, 6.0, 0, atiende('camisa'), [-14, -80, 14, 0]));
  A.equipo = P(2.2, 6.0, 1.62);
  shade(shadow(2.08, 5.88, 2.32, 6.12, 1.62, LOBBY));
  if (ft.equipo >= 2) {
    add('persona-escritorio', at(0.7, 5.4, 0, sentado(), [-13, -63, 13, 0]));
    shade(shadow(0.58, 5.28, 0.82, 5.52, 1.3, LOBBY));
  }
  add(
    'mostrador-lado',
    box(0.5, 5.2, 0, 1.1, 7.2, 1.0, {
      w: 1,
      inner: lines([seg([1.1, 5.55, 0.12], [1.1, 5.55, 0.9]), seg([1.1, 6.05, 0.12], [1.1, 6.05, 0.9])], 'e4', 0),
    }),
  );
  const friso = fill([[1.1, 7.2, 0.9], [3.6, 7.2, 0.9], [3.6, 7.2, 1.0], [1.1, 7.2, 1.0]], 'hd');
  const tablas = lines(range(1.38, 3.6, 0.3).map((x) => seg([x, 7.2, 0.12], [x, 7.2, 0.9])), 'e4', 0);
  add(
    'mostrador',
    box(1.1, 6.6, 0, 3.6, 7.2, 1.0, {
      w: 1,
      inner: friso + tablas + lines([seg([1.1, 7.2, 0.12], [3.6, 7.2, 0.12])], 'e3', 0),
    }),
  );
  add(
    'mostrador-tope-lado',
    box(0.45, 5.15, 1.0, 1.15, 7.25, 1.05, { y: 'p2', x: 'p2', w: 1, inner: grain(0.45, 5.15, 1.15, 7.25, 1.05, 4) }),
  );
  add(
    'mostrador-tope',
    box(1.1, 6.55, 1.0, 3.65, 7.25, 1.05, { y: 'p2', x: 'p2', w: 1, inner: grain(1.1, 6.55, 3.65, 7.25, 1.05, 4) }),
  );
  shade(shadow(0.5, 5.2, 3.65, 7.25, 1.05, LOBBY));
  add(
    'timbre',
    cyl(1.26, 6.9, 1.05, 1.13, 0.055, { body: 'p2', top: 'p3', w: 3 }) +
      lines([seg([1.26, 6.9, 1.13], [1.26, 6.9, 1.18])], 'e2', 0),
  );
  const libroA = lines(
    range(6.75, 7.04, 0.045).map((y) => seg([1.48, y, 1.062], [1.6 + rnd() * 0.08, y, 1.062])),
    'e4',
    0,
  );
  const libroB = lines(
    range(6.75, 7.0, 0.045).map((y) => seg([1.65, y, 1.062], [1.78 + rnd() * 0.05, y, 1.062])),
    'e4',
    0,
  );
  add(
    'libreta',
    box(1.4, 6.68, 1.05, 1.62, 7.08, 1.062, { w: 3, inner: libroA }) +
      box(1.62, 6.68, 1.05, 1.84, 7.08, 1.062, { w: 3, inner: libroB }) +
      lines([seg([1.86, 6.76, 1.07], [1.96, 7.0, 1.07])], 'e1', 0),
  );
  A.libreta = P(1.62, 6.88, 1.062);
  add(
    'pasaporte',
    box(2.02, 6.78, 1.05, 2.28, 7.02, 1.075, {
      t: 'p3',
      w: 3,
      inner: lines([seg([2.08, 6.92, 1.075], [2.22, 6.92, 1.075])], 'e4', 0),
    }),
  );
  const teclas = lines(range(2.68, 3.02, 0.05).map((x) => seg([x, 7.0, 1.08], [x, 7.0, 1.12])), 'e4', 0);
  add(
    'caja',
    box(2.62, 6.7, 1.05, 3.08, 7.0, 1.15, {
      w: 1,
      inner: teclas + fill([[2.68, 7.0, 1.12], [3.0, 7.0, 1.12], [3.0, 7.0, 1.14], [2.68, 7.0, 1.14]], 'p3'),
    }) +
      box(2.78, 6.74, 1.15, 2.94, 6.82, 1.32, {
        t: 'p2',
        x: 'p3',
        y: 'k',
        w: 2,
        inner: lines([seg([2.81, 6.82, 1.22], [2.88, 6.82, 1.28])], 'rf', 0),
      }),
  );
  A.caja = P(2.86, 6.78, 1.32);
  if (ft.celular) {
    add(
      'celular',
      box(2.38, 6.72, 1.05, 2.52, 6.96, 1.07, {
        t: 'k',
        x: 'p3',
        y: 'p3',
        w: 2,
        inner: lines([seg([2.41, 6.78, 1.07], [2.46, 6.9, 1.07])], 'rf', 0),
      }),
    );
    A.celular = P(2.45, 6.84, 1.07);
  }
  if (ft.biometria) {
    add(
      'huellero',
      box(3.1, 6.76, 1.05, 3.26, 6.92, 1.11, {
        t: 'p2',
        w: 2,
        inner: plane([[3.13, 6.8, 1.11], [3.23, 6.8, 1.11], [3.23, 6.88, 1.11], [3.13, 6.88, 1.11]], 'g', 'e3', 0),
      }),
    );
  }
  const priv = lines(
    range(1.13, 1.28, 0.035).map((z) => seg([3.3, 6.86, z], [3.5 + ((z * 31) % 0.06), 6.86, z])),
    'e4',
    0,
  );
  add(
    'aviso',
    box(3.28, 6.78, 1.05, 3.58, 6.82, 1.07, { w: 3 }) +
      box(3.25, 6.82, 1.07, 3.61, 6.86, 1.42, {
        x: 'p2',
        w: 2,
        inner:
          label('PRIVACIDAD', 3.43, 6.86, 1.35, 'xz', 'tiny', 'middle') +
          lines([seg([3.3, 6.86, 1.31], [3.56, 6.86, 1.31])], 'e3', 0) +
          priv,
      }),
  );
  A.aviso = P(3.43, 6.84, 1.42);

  // ── Lobby: sofá, mesa de centro, folletos y planta
  add('sofa-base', box(4.7, 9.35, 0, 6.5, 10.05, 0.38, { t: 'p2', x: 'p3', y: 'p3', w: 2 }));
  const cojines = box(4.82, 9.42, 0.38, 5.48, 10.0, 0.55, { t: 'p', w: 3 }) +
    box(5.56, 9.42, 0.38, 6.38, 10.0, 0.55, { t: 'p', w: 3 });
  add('sofa-cojines', cojines);
  const brazos = box(4.56, 9.35, 0.38, 4.7, 10.05, 0.72, { t: 'p2', w: 2 }) +
    box(6.5, 9.35, 0.38, 6.64, 10.05, 0.72, { t: 'p2', w: 2 });
  add('sofa-respaldo', box(4.7, 10.05, 0.38, 6.5, 10.22, 1.05, { t: 'p', x: 'p2', y: 'p2', w: 2 }) + brazos);
  shade(shadow(4.56, 9.35, 6.64, 10.22, 1.05, LOBBY));
  const tapaMesa = grain(5.0, 8.55, 5.9, 9.1, 0.44, 4);
  add('mesa-centro', box(5.0, 8.55, 0, 5.9, 9.1, 0.44, { t: 'p2', x: 'p3', y: 'p3', w: 2, inner: tapaMesa }));
  add(
    'folletos',
    box(5.12, 8.62, 0.44, 5.38, 8.82, 0.47, { t: 'p3', w: 3 }) +
      box(5.5, 8.7, 0.44, 5.78, 8.9, 0.47, { t: 'p', w: 3 }),
  );
  shade(shadow(5.0, 8.55, 5.9, 9.1, 0.44, LOBBY));
  add(
    'exhibidor-patas',
    lines(
      [
        seg([3.45, 10.15, 0], [3.45, 10.15, 0.9]),
        seg([3.85, 10.5, 0], [3.85, 10.5, 0.9]),
        seg([3.45, 10.5, 0], [3.45, 10.5, 0.9]),
        seg([3.85, 10.15, 0], [3.85, 10.15, 0.9]),
      ],
      'e2',
      0,
    ),
  );
  let vitrina = '';
  for (let i = 0; i < 3; i++) {
    const z0 = 0.15 + i * 0.25;
    vitrina += plane([[3.42, 10.55, z0], [3.88, 10.55, z0], [3.88, 10.55, z0 + 0.12], [3.42, 10.55, z0 + 0.12]], 'p', 'e3', 0);
  }
  add('exhibidor', box(3.4, 10.15, 0, 3.9, 10.55, 0.85, { t: 'p2', w: 2 }) + vitrina);
  shade(shadow(3.4, 10.15, 3.9, 10.55, 0.85, LOBBY));
  add(
    'maceta-lobby',
    cyl(6.55, 10.45, 0, 0.46, 0.28, { body: 'p2', top: 'p3' }) +
      cyl(6.55, 10.45, 0.46, 0.5, 0.3, { w: 2, body: 'p3', top: 'p3' }),
  );
  add('planta-lobby', at(6.55, 10.45, 0.5, plantaLobby(), [-22, -65, 22, 0]));
  shade(shadow(6.25, 10.15, 6.85, 10.75, 1.2, LOBBY));

  // ── El huésped que llega con su maleta
  add('cliente', at(2.4, 8.3, 0, cliente(), [-13, -75, 20, 0]));
  A.cliente = P(2.4, 8.3, 1.62);
  shade(shadow(2.28, 8.18, 2.52, 8.42, 1.62, LOBBY));
  const costuras = lines(
    [seg([2.82, 8.7, 0.24], [3.04, 8.7, 0.24]), seg([2.82, 8.7, 0.46], [3.04, 8.7, 0.46])],
    'e4',
    0,
  );
  add(
    'maleta-cliente',
    box(2.78, 8.45, 0.1, 3.08, 8.7, 0.62, { t: 'p2', x: 'p3', y: 'p3', w: 2, inner: costuras }) +
      lines([seg([2.86, 8.45, 0.62], [2.86, 8.45, 0.94]), seg([2.86, 8.45, 0.94], [3.0, 8.45, 0.94]), seg([3.0, 8.45, 0.94], [3.0, 8.45, 0.62])], 'e1', 0) +
      ringPath(ring(2.84, 8.5, 0.08, 0.07, 'xz', 10), 'k', 3) +
      ringPath(ring(3.02, 8.5, 0.08, 0.07, 'xz', 10), 'k', 3),
  );
  shade(shadow(2.78, 8.45, 3.08, 8.7, 0.95, LOBBY));
  if (ft.equipo >= 3) {
    add('persona-sala', at(5.5, 5.0, 0, reponedor('caja'), [-25, -80, 13, 0]));
    shade(shadow(5.38, 4.88, 5.62, 5.12, 1.6, LOBBY));
  }

  // ── Fachada, toldo y entrada
  add('muro-der', box(7, -0.22, 0, 7.22, 11, 0.4, { t: 'k', w: 1 }), 'rise');
  add('muro-frente-a', box(-0.22, 11, 0, 2.7, 11.2, 0.4, { t: 'k', w: 1 }), 'rise');
  add('muro-frente-b', box(4.7, 11, 0, 7.22, 11.2, 0.4, { t: 'k', w: 1 }), 'rise');
  add('marco-a', box(2.7, 11, 0, 2.8, 11.2, 2.55, { w: 1 }), 'rise');
  add('marco-b', box(4.6, 11, 0, 4.7, 11.2, 2.55, { w: 1 }), 'rise');
  add('dintel', box(2.7, 11, 2.45, 4.7, 11.2, 2.55, { w: 1 }), 'rise');
  const toldo: V3[] = [[2.5, 11.2, 2.55], [4.9, 11.2, 2.55], [4.9, 11.9, 2.22], [2.5, 11.9, 2.22]];
  add(
    'toldo',
    plane(toldo, 'p2', 'e2', 0) +
      lines(range(2.65, 4.85, 0.22).map((x) => seg([x, 11.2, 2.55], [x, 11.9, 2.22])), 'e4', 0) +
      lines(range(2.6, 4.9, 0.22).map((x) => seg([x, 11.9, 2.22], [x, 11.9, 2.14])), 'e3', 0),
    'rise',
  );
  A.entrada = P(3.7, 11.25, 2.55);
  if (ft.camaras) {
    add('camara', box(4.72, 11.0, 2.24, 4.94, 11.1, 2.36, { t: 'p3', x: 'k', y: 'p3', w: 2 }), 'rise');
  }
  add(
    'maceta-acera-a',
    cyl(1.35, 12.2, 0, 0.34, 0.18, { body: 'p2', top: 'p3' }) +
      at(1.35, 12.2, 0.34, plantaLobby(), [-18, -52, 18, 0]),
  );
  add(
    'maceta-acera-b',
    cyl(6.3, 12.2, 0, 0.32, 0.17, { body: 'p2', top: 'p3' }) +
      at(6.3, 12.2, 0.32, plantaLobby(), [-18, -52, 18, 0]),
  );
  shade(shadow(1.17, 12.02, 1.53, 12.38, 0.9, ACERA_R));
  shade(shadow(6.13, 12.03, 6.47, 12.37, 0.88, ACERA_R));

  return {
    archivero: 'El archivero de la recepción',
    papeles: 'Las reservas del escritorio',
    libreta: 'El libro de huéspedes',
    celular: 'El WhatsApp del hostal',
    caja: 'La caja de la recepción',
    aviso: 'El aviso de privacidad',
    cliente: 'El huésped que llega',
    entrada: 'La entrada del hostal',
    equipo: 'Quien atiende la recepción',
    monitor: 'La computadora de recepción',
  };
}
