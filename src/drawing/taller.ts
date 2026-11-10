// El taller: el lugar de los negocios de oficio (mecánica, carpintería, imprenta, pequeña fábrica).
// Una nave de bloque con techo alto, elevador de dos postes y mostrador de recepción.
import { atiende, cliente, reponedor, sentado } from './figures';
import type { Rect, V3 } from './ink';
import type { AnchorKey, Kit } from './scene';

const LOT: Rect = [-0.7, -0.7, 7.9, 11.2];

export function taller(k: Kit): Partial<Record<AnchorKey, string>> {
  const { ft, add, A, range, shade, placeShadows, P, rnd, fill, lines, loop, plane, box, shadow, cyl, ring, ringPath, label, at, grain } = k;
  const seg = (a: V3, b: V3): [V3, V3] => [a, b];

  // ── Terreno, acera y calle
  add('lote', loop([[-0.7, -0.7, 0], [7.9, -0.7, 0], [7.9, 11.2, 0], [-0.7, 11.2, 0]], 'dash', 0), 'fade');
  add(
    'acera',
    box(-0.7, 11.2, -0.14, 7.9, 11.95, 0, { y: 'p2', w: 2 }) +
      lines(range(0.25, 7.9, 0.95).map((x) => seg([x, 11.2, 0], [x, 11.95, 0])), 'e4', 0) +
      lines([seg([-0.7, 11.95, 0], [7.9, 11.95, 0]), seg([-0.7, 11.58, 0], [7.9, 11.58, 0])], 'e4', 0) +
      plane([[1.1, 11.95, -0.12], [1.62, 11.95, -0.12], [1.62, 11.95, -0.04], [1.1, 11.95, -0.04]], 'k', 'e3', 0),
    'fade',
  );
  add('carril', lines(range(-0.7, 7.9, 0.9).map((x) => seg([x, 12.45, -0.14], [x + 0.5, 12.45, -0.14])), 'e2', 0), 'fade');
  add('calle', label('CALLE PRINCIPAL', 0.4, 12.72, -0.14, 'xy', 'street', 'start'), 'fade');
  add(
    'norte',
    loop(ring(7.45, 12.45, 0, 0.3, 'xy'), 'e3', 0) +
      fill([[7.45, 11.98, 0], [7.55, 12.55, 0], [7.45, 12.42, 0], [7.35, 12.55, 0]], 'k') +
      label('N', 7.45, 12.05, 0, 'xy', 'room', 'middle'),
    'fade',
  );
  add(
    'piso',
    fill([[0, 0, 0], [7, 0, 0], [7, 11, 0], [0, 11, 0]], 'p') +
      lines(range(1, 7, 1).map((x) => seg([x, 0, 0], [x, 11, 0])), 'e4', 0) +
      lines(range(1, 11, 1).map((y) => seg([0, y, 0], [7, y, 0])), 'e4', 0),
    'fade',
  );
  placeShadows();

  // ── Muro izquierdo: ventana alta y letrero
  let lw = '';
  lw += plane([[0, 2.0, 1.8], [0, 4.4, 1.8], [0, 4.4, 2.55], [0, 2.0, 2.55]], 'g', 'e2', 0);
  lw += lines(range(2.32, 4.4, 0.52).map((y) => seg([0, y, 1.8], [0, y, 2.55])), 'e2', 0);
  lw += lines([seg([0, 2.0, 2.16], [0, 4.4, 2.16])], 'e2', 0);
  lw += lines([seg([0, 2.15, 1.9], [0, 2.55, 2.4]), seg([0, 2.35, 1.86], [0, 2.7, 2.3])], 'e4', 0);
  lw += box(0, 1.9, 1.7, 0.09, 4.5, 1.78, { w: 3, x: 'p' });
  lw += box(0, 1.9, 2.55, 0.09, 4.5, 2.64, { w: 3, x: 'p' });
  lw += plane([[0, 6.2, 2.1], [0, 8.8, 2.1], [0, 8.8, 2.88], [0, 6.2, 2.88]], 'p', 'e2', 0);
  lw += label('TALLER', 0, 7.5, 2.32, 'yz', 'sign', 'middle');
  lw += lines([seg([0, 6.35, 2.15], [0, 6.55, 2.82]), seg([0, 8.45, 2.15], [0, 8.65, 2.82])], 'e3', 0);
  add('muro-izq', box(-0.22, -0.22, 0, 0, 11, 3, { t: 'k', x: 'p2', y: 'p', w: 1, inner: lw }), 'rise');

  // ── Muro del fondo: tablero de herramientas
  let bw = '';
  bw += plane([[3.6, 0, 1.0], [6.6, 0, 1.0], [6.6, 0, 2.2], [3.6, 0, 2.2]], 'p2', 'e2', 0);
  bw += lines(range(3.75, 6.6, 0.3).map((x) => seg([x, 0.02, 1.05], [x, 0.02, 2.15])), 'e4', 0);
  bw += label('HERRAMIENTAS', 5.1, 0.02, 2.08, 'xz', 'tiny', 'middle');
  for (const [hx, hz] of [[3.85, 2.08], [4.65, 2.08], [5.4, 2.08], [6.15, 2.08]] as [number, number][]) {
    bw += fill(ring(hx, 0.02, hz, 0.025, 'xz', 8), 'k');
  }
  // Llave combinada
  bw += lines([seg([3.85, 0.03, 1.12], [3.85, 0.03, 1.82])], 'e2', 0);
  bw += loop(ring(3.85, 0.03, 1.94, 0.075, 'xz', 10), 'e2', 0);
  bw += lines([seg([3.8, 0.03, 1.18], [3.7, 0.03, 1.06]), seg([3.9, 0.03, 1.18], [4.0, 0.03, 1.06])], 'e2', 0);
  // Martillo
  bw += lines([seg([4.55, 0.03, 1.12], [4.68, 0.03, 1.86]), seg([4.5, 0.03, 1.86], [4.9, 0.03, 1.86]), seg([4.55, 0.03, 1.96], [4.85, 0.03, 1.96])], 'e2', 0);
  // Alicate
  bw += lines([seg([5.2, 0.03, 1.2], [5.45, 0.03, 1.9]), seg([5.45, 0.03, 1.2], [5.2, 0.03, 1.9])], 'e2', 0);
  bw += loop(ring(5.18, 0.03, 1.92, 0.045, 'xz', 8), 'e2', 0) + loop(ring(5.47, 0.03, 1.92, 0.045, 'xz', 8), 'e2', 0);
  // Serrucho
  bw += lines([seg([5.78, 0.03, 1.88], [6.48, 0.03, 1.46]), seg([6.48, 0.03, 1.46], [6.55, 0.03, 1.58]), seg([6.55, 0.03, 1.58], [5.84, 0.03, 1.98]), seg([5.78, 0.03, 1.88], [5.84, 0.03, 1.98])], 'e2', 0);
  bw += lines(
    range(5.9, 6.45, 0.06).map((x) => seg([x, 0.03, 1.86 - (x - 5.9) * 0.7], [x, 0.03, 1.8 - (x - 5.9) * 0.7])),
    'e4',
    0,
  );
  add('muro-fondo', box(0, -0.22, 0, 7, 0, 3, { t: 'k', y: 'p', x: 'p2', w: 1, inner: bw }), 'rise');

  // ── Oficinita del fondo izquierda, con mampara de vidrio
  add(
    'oficina-vidrio-a',
    plane([[0.08, 2.6, 0.12], [2.36, 2.6, 0.12], [2.36, 2.6, 2.2], [0.08, 2.6, 2.2]], 'g', 'e2', 0) +
      box(0.06, 2.55, 0, 2.38, 2.65, 0.12, { w: 2, x: 'p' }) +
      box(0.06, 2.55, 2.1, 2.38, 2.65, 2.2, { w: 2, x: 'p' }) +
      lines([0.62, 1.18, 1.74].map((x) => seg([x, 2.62, 0.12], [x, 2.62, 2.1])), 'e2', 0) +
      lines([seg([0.08, 2.62, 1.12], [2.36, 2.62, 1.12])], 'e3', 0) +
      lines([seg([1.9, 2.63, 0.8], [1.9, 2.63, 1.05])], 'e3', 0),
    'rise',
  );
  add(
    'oficina-vidrio-b',
    plane([[2.4, 0.08, 0.12], [2.4, 2.5, 0.12], [2.4, 2.5, 2.2], [2.4, 0.08, 2.2]], 'g', 'e2', 0) +
      box(2.35, 0.06, 0, 2.45, 2.52, 0.12, { w: 2, x: 'p' }) +
      box(2.35, 0.06, 2.1, 2.45, 2.52, 2.2, { w: 2, x: 'p' }) +
      lines([0.55, 1.05, 1.55, 2.05].map((y) => seg([2.42, y, 0.12], [2.42, y, 2.1])), 'e2', 0),
    'rise',
  );

  if (ft.archivero) {
    let d = lines([0.45, 0.9].map((z) => seg([0.18, 0.7, z], [0.52, 0.7, z])), 'e2', 0);
    for (const zc of [0.24, 0.68, 1.12]) {
      d += fill([[0.29, 0.7, zc], [0.43, 0.7, zc], [0.43, 0.7, zc + 0.04], [0.29, 0.7, zc + 0.04]], 'k');
    }
    add('archivero', box(0.12, 0.24, 0, 0.56, 0.7, 1.35, { w: 1, inner: d }));
    add('archivero-carpeta', box(0.2, 0.32, 1.35, 0.48, 0.6, 1.4, { t: 'p2', x: 'p2', w: 3 }));
    A.archivero = P(0.34, 0.47, 1.4);
    shade(shadow(0.12, 0.24, 0.56, 0.7, 1.35, LOT));
  }

  add(
    'escritorio-oficina-patas',
    lines(
      [
        seg([0.6, 0.58, 0], [0.6, 0.58, 0.74]),
        seg([2.0, 0.58, 0], [2.0, 0.58, 0.74]),
        seg([0.6, 1.2, 0], [0.6, 1.2, 0.74]),
        seg([2.0, 1.2, 0], [2.0, 1.2, 0.74]),
      ],
      'e2',
      0,
    ),
  );
  add('escritorio-oficina', box(0.55, 0.5, 0.74, 2.05, 1.28, 0.79, { y: 'p2', w: 1, inner: grain(0.55, 0.5, 2.05, 1.28, 0.79, 4) }));
  add(
    'papeles',
    box(0.8, 0.66, 0.79, 1.18, 1.0, 0.805, { w: 3 }) +
      box(0.84, 0.63, 0.805, 1.22, 0.97, 0.82, {
        w: 3,
        inner: lines(range(0.68, 0.94, 0.045).map((y) => seg([0.89, y, 0.82], [1.13 - ((y * 7) % 0.1), y, 0.82])), 'e4', 0),
      }),
  );
  A.papeles = P(1.02, 0.82, 0.82);
  shade(shadow(0.55, 0.5, 2.05, 1.28, 0.82, LOT));

  if (ft.computadora) {
    add('monitor-pie', box(1.52, 0.56, 0.79, 1.72, 0.66, 0.82, { w: 3 }) + box(1.59, 0.55, 0.82, 1.65, 0.59, 0.92, { w: 3 }));
    const scr = lines(range(0.98, 1.32, 0.06).map((z) => seg([1.3, 0.56, z], [1.94, 0.56, z])), 'rf', 0);
    add('monitor', box(1.22, 0.5, 0.88, 2.0, 0.56, 1.38, { t: 'p2', x: 'p3', y: 'k', w: 1, inner: scr }));
    add(
      'teclado',
      box(1.35, 0.78, 0.79, 1.88, 0.94, 0.805, {
        w: 3,
        inner: lines(range(0.82, 0.92, 0.035).map((y) => seg([1.38, y, 0.805], [1.85, y, 0.805])), 'e4', 0),
      }),
    );
    A.monitor = P(1.61, 0.53, 1.38);
  }

  add(
    'silla-oficina-base',
    lines(
      [
        seg([1.35, 1.55, 0.06], [1.13, 1.77, 0.03]),
        seg([1.35, 1.55, 0.06], [1.57, 1.77, 0.03]),
        seg([1.35, 1.55, 0.06], [1.13, 1.33, 0.03]),
        seg([1.35, 1.55, 0.06], [1.57, 1.33, 0.03]),
        seg([1.35, 1.55, 0.06], [1.35, 1.55, 0.42]),
      ],
      'e2',
      0,
    ),
  );
  add('silla-oficina', box(1.13, 1.33, 0.42, 1.57, 1.77, 0.48, { t: 'p2', w: 2 }));
  if (ft.equipo >= 2) add('persona-escritorio', at(1.35, 1.55, 0, sentado(), [-13, -63, 13, 0]));
  add('silla-oficina-respaldo', box(1.13, 1.74, 0.52, 1.57, 1.8, 0.98, { t: 'p2', y: 'p2', w: 2 }));
  shade(shadow(1.13, 1.33, 1.57, 1.8, 0.98, LOT));

  // ── Elevador de dos postes y el carro
  add(
    'elevador-postes',
    box(2.2, 4.4, 0, 2.4, 4.6, 2.6, {
      w: 1,
      inner: lines(range(0.4, 2.5, 0.35).map((z) => seg([2.2, 4.6, z], [2.4, 4.6, z])), 'e4', 0),
    }) +
      box(6.0, 4.4, 0, 6.2, 4.6, 2.6, {
        w: 1,
        inner: lines(range(0.4, 2.5, 0.35).map((z) => seg([6.0, 4.6, z], [6.2, 4.6, z])), 'e4', 0),
      }),
  );
  add(
    'elevador-brazos',
    lines(
      [
        seg([2.4, 4.5, 1.08], [2.7, 4.5, 1.08]),
        seg([6.0, 4.5, 1.08], [5.7, 4.5, 1.08]),
        seg([2.4, 4.5, 1.6], [2.7, 4.5, 1.6]),
        seg([6.0, 4.5, 1.6], [5.7, 4.5, 1.6]),
      ],
      'e1',
      0,
    ),
  );
  shade(shadow(2.2, 4.4, 2.4, 4.6, 2.6, LOT));
  shade(shadow(6.0, 4.4, 6.2, 4.6, 2.6, LOT));

  const ruedaCarro = (cx: number, cy: number, cz: number, r: number) =>
    ringPath(ring(cx, cy, cz, r, 'xz', 20), 'k', 2) +
    ringPath(ring(cx, cy, cz, r * 0.56, 'xz', 16), 'p', 3) +
    fill(ring(cx, cy, cz, r * 0.14, 'xz', 10), 'k');

  add('carro-ruedas-fondo', ruedaCarro(2.95, 3.68, 1.22, 0.3) + ruedaCarro(5.45, 3.68, 1.22, 0.3));
  let carro = box(2.6, 3.6, 1.1, 5.8, 5.4, 1.6, {
    t: 'p2',
    x: 'p',
    y: 'p hv',
    w: 1,
    inner:
      lines([seg([3.0, 5.4, 1.18], [5.4, 5.4, 1.18]), seg([3.0, 5.4, 1.36], [5.4, 5.4, 1.36])], 'e3', 0) +
      lines([seg([3.2, 5.4, 1.1], [3.2, 5.4, 1.6]), seg([5.15, 5.4, 1.1], [5.15, 5.4, 1.6])], 'e2', 0) +
      box(2.48, 3.92, 1.18, 2.62, 5.08, 1.38, { t: 'p3', w: 3 }) +
      box(5.78, 3.92, 1.18, 5.94, 5.08, 1.38, { t: 'p3', w: 3 }),
  });
  carro += box(3.1, 3.8, 1.6, 5.3, 5.2, 2.08, {
    t: 'p2',
    x: 'p2',
    y: 'p',
    w: 1,
    inner:
      plane([[3.25, 5.2, 1.72], [5.15, 5.2, 1.72], [5.15, 5.2, 2.0], [3.25, 5.2, 2.0]], 'g', 'e2', 0) +
      lines([seg([4.2, 5.21, 1.72], [4.2, 5.21, 2.0])], 'e2', 0) +
      plane([[5.3, 3.95, 1.72], [5.3, 5.05, 1.72], [5.3, 5.05, 2.0], [5.3, 3.95, 2.0]], 'g', 'e2', 0) +
      lines([seg([5.31, 4.5, 1.72], [5.31, 4.5, 2.0])], 'e2', 0),
  });
  add('carro', carro);
  add('carro-ruedas', ruedaCarro(2.95, 5.32, 1.22, 0.3) + ruedaCarro(5.45, 5.32, 1.22, 0.3));
  shade(shadow(2.48, 3.6, 5.94, 5.4, 2.08, LOT));

  if (ft.equipo >= 3) {
    add('persona-sala', at(4.2, 6.2, 0, reponedor('caja'), [-25, -75, 13, 0]));
    shade(shadow(4.08, 6.08, 4.32, 6.32, 1.6, LOT));
  }

  // ── Banco de trabajo contra el muro izquierdo
  add(
    'banco-patas',
    lines(
      [
        seg([0.2, 4.15, 0], [0.2, 4.15, 0.9]),
        seg([0.2, 6.65, 0], [0.2, 6.65, 0.9]),
        seg([0.8, 4.15, 0], [0.8, 4.15, 0.9]),
        seg([0.8, 6.65, 0], [0.8, 6.65, 0.9]),
        seg([0.2, 5.4, 0.24], [0.8, 5.4, 0.24]),
      ],
      'e2',
      0,
    ),
  );
  add('banco-trabajo', box(0.1, 4.0, 0.9, 0.9, 6.8, 0.95, { y: 'p2', w: 1, inner: grain(0.1, 4.0, 0.9, 6.8, 0.95, 5) }));
  add(
    'tornillo-banco',
    box(0.78, 4.35, 0.95, 0.98, 4.62, 1.12, { t: 'k', y: 'k', w: 2 }) +
      lines([seg([0.98, 4.48, 1.04], [1.18, 4.48, 1.04]), seg([1.16, 4.48, 1.04], [1.16, 4.48, 1.16])], 'e1', 0),
  );
  add(
    'tablones',
    plane([[0.9, 4.45, 0], [1.08, 4.45, 0], [1.0, 4.45, 1.55], [0.82, 4.45, 1.55]], 'p2', 'e2', 0) +
      plane([[0.91, 4.7, 0], [1.05, 4.7, 0], [0.98, 4.7, 1.5], [0.84, 4.7, 1.5]], 'p', 'e2', 0) +
      plane([[0.89, 4.95, 0], [1.07, 4.95, 0], [0.99, 4.95, 1.58], [0.81, 4.95, 1.58]], 'p2', 'e2', 0),
  );
  shade(shadow(0.1, 4.0, 1.05, 6.8, 1.0, LOT));

  // ── Llantas, compresor y mancha de aceite
  let llantas = '';
  for (let i = 0; i < 4; i++) {
    const z0 = i * 0.17;
    llantas += cyl(6.35, 7.55, z0, z0 + 0.16, 0.3, { body: 'k', top: 'p3', w: 3 });
  }
  add('llantas', llantas);
  shade(shadow(6.0, 7.2, 6.7, 7.9, 0.7, LOT));

  add(
    'compresor',
    box(5.9, 2.3, 0.2, 6.55, 2.85, 0.78, {
      t: 'p2',
      x: 'p',
      y: 'p2',
      w: 1,
      inner: lines([seg([5.98, 2.85, 0.3], [6.47, 2.85, 0.3]), seg([5.98, 2.85, 0.66], [6.47, 2.85, 0.66])], 'e4', 0),
    }) +
      lines([seg([6.55, 2.45, 0.72], [6.9, 2.45, 0.9]), seg([6.9, 2.45, 0.9], [6.9, 2.75, 0.9])], 'e2', 0) +
      ringPath(ring(6.05, 2.86, 0.2, 0.14, 'xz', 16), 'k', 2) +
      ringPath(ring(6.4, 2.86, 0.2, 0.14, 'xz', 16), 'k', 2),
  );
  shade(shadow(5.9, 2.3, 6.55, 2.86, 0.9, LOT));

  const aceite: V3[] = [
    [4.3, 7.25, 0],
    [4.82 + rnd() * 0.15, 7.05, 0],
    [5.42, 7.3 + rnd() * 0.12, 0],
    [5.3, 7.85, 0],
    [4.62, 8.02 + rnd() * 0.08, 0],
    [4.12, 7.68, 0],
  ];
  add(
    'mancha-aceite',
    fill(aceite, 'p3') +
      loop(aceite, 'e4', 0) +
      lines([seg([4.5, 7.4, 0], [4.8, 7.7, 0]), seg([4.8, 7.7, 0], [5.1, 7.55, 0])], 'e4', 0),
  );

  // ── Mostrador de recepción
  add('persona-mostrador', at(1.7, 7.9, 0, atiende('polo'), [-14, -75, 14, 0]));
  A.equipo = P(1.7, 7.9, 1.62);
  shade(shadow(1.58, 7.78, 1.82, 8.02, 1.6, LOT));

  add(
    'mostrador-patas',
    lines(
      [
        seg([0.66, 8.46, 0], [0.66, 8.46, 1.0]),
        seg([2.74, 8.46, 0], [2.74, 8.46, 1.0]),
        seg([0.66, 8.94, 0], [0.66, 8.94, 1.0]),
        seg([2.74, 8.94, 0], [2.74, 8.94, 1.0]),
      ],
      'e2',
      0,
    ),
  );
  add(
    'mostrador',
    box(0.6, 8.4, 0, 2.8, 9.0, 1.0, {
      w: 1,
      inner:
        fill([[0.6, 9.0, 0.9], [2.8, 9.0, 0.9], [2.8, 9.0, 1.0], [0.6, 9.0, 1.0]], 'hd') +
        lines(range(0.8, 2.8, 0.35).map((x) => seg([x, 9.0, 0.1], [x, 9.0, 0.9])), 'e4', 0) +
        lines([seg([0.6, 9.0, 0.1], [2.8, 9.0, 0.1])], 'e3', 0) +
        label('RECEPCIÓN', 1.7, 9.0, 0.55, 'xz', 'tiny', 'middle'),
    }),
  );
  add('mostrador-tope', box(0.55, 8.35, 1.0, 2.85, 9.05, 1.05, { y: 'p2', x: 'p2', w: 1, inner: grain(0.55, 8.35, 2.85, 9.05, 1.05, 4) }));
  shade(shadow(0.55, 8.35, 2.85, 9.05, 1.05, LOT));

  add(
    'libreta',
    box(0.95, 8.52, 1.05, 1.25, 8.88, 1.065, {
      w: 3,
      inner: lines(
        range(8.58, 8.84, 0.05).map((y) => seg([0.98, y, 1.065], [1.12 + rnd() * 0.08, y, 1.065])),
        'e4',
        0,
      ),
    }) +
      box(1.25, 8.52, 1.05, 1.55, 8.88, 1.065, {
        w: 3,
        inner: lines(
          range(8.58, 8.76, 0.05).map((y) => seg([1.28, y, 1.065], [1.42 + rnd() * 0.08, y, 1.065])),
          'e4',
          0,
        ),
      }) +
      lines([seg([1.58, 8.62, 1.07], [1.72, 8.84, 1.07])], 'e1', 0),
  );
  A.libreta = P(1.42, 8.7, 1.065);

  add(
    'caja',
    box(2.02, 8.5, 1.05, 2.42, 8.72, 1.16, {
      t: 'p2',
      w: 1,
      inner: lines([seg([2.14, 8.72, 1.13], [2.3, 8.72, 1.13])], 'e3', 0),
    }) +
      box(2.08, 8.45, 1.16, 2.36, 8.5, 1.38, {
        t: 'p2',
        x: 'p3',
        y: 'k',
        w: 2,
        inner: lines([seg([2.12, 8.45, 1.22], [2.2, 8.45, 1.33])], 'rf', 0),
      }),
  );
  A.caja = P(2.22, 8.47, 1.38);

  if (ft.celular) {
    add(
      'celular',
      box(1.76, 8.62, 1.05, 1.88, 8.84, 1.07, {
        t: 'k',
        x: 'p3',
        y: 'p3',
        w: 2,
        inner: lines([seg([1.79, 8.68, 1.07], [1.83, 8.78, 1.07])], 'rf', 0),
      }),
    );
    A.celular = P(1.82, 8.73, 1.07);
  }

  add(
    'aviso',
    box(2.56, 8.58, 1.05, 2.76, 8.7, 1.08, { w: 3 }) +
      box(2.5, 8.6, 1.08, 2.82, 8.64, 1.44, {
        x: 'p2',
        w: 2,
        inner:
          label('PRIVACIDAD', 2.66, 8.64, 1.36, 'xz', 'tiny', 'middle') +
          lines([seg([2.55, 8.64, 1.33], [2.77, 8.64, 1.33])], 'e3', 0) +
          lines(range(1.15, 1.3, 0.035).map((z) => seg([2.55, 8.64, z], [2.75 + ((z * 31) % 0.06), 8.64, z])), 'e4', 0),
      }),
  );
  A.aviso = P(2.66, 8.62, 1.44);

  if (ft.biometria) {
    add(
      'huellero',
      box(2.42, 8.78, 1.05, 2.6, 8.94, 1.11, {
        t: 'p2',
        w: 2,
        inner: plane([[2.46, 8.84, 1.11], [2.56, 8.84, 1.11], [2.56, 8.92, 1.11], [2.46, 8.92, 1.11]], 'g', 'e3', 0),
      }),
    );
  }

  add('cliente', at(1.9, 9.8, 0, cliente(), [-13, -75, 20, 0]));
  A.cliente = P(1.9, 9.8, 1.62);
  shade(shadow(1.78, 9.68, 2.02, 9.92, 1.6, LOT));

  // ── Portón enrollable, abierto
  add('marco-a', box(2.2, 10.98, 0, 2.35, 11.18, 2.9, { w: 1 }), 'rise');
  add('marco-b', box(5.65, 10.98, 0, 5.8, 11.18, 2.9, { w: 1 }), 'rise');
  add('dintel', box(2.15, 10.98, 2.9, 5.85, 11.18, 3.02, { w: 1 }), 'rise');
  add(
    'cortina',
    plane([[2.35, 11.22, 2.36], [5.65, 11.22, 2.36], [5.65, 11.22, 2.88], [2.35, 11.22, 2.88]], 'p2', 'e2', 0) +
      lines(range(2.4, 2.88, 0.04).map((z) => seg([2.35, 11.22, z], [5.65, 11.22, z])), 'e4', 0) +
      box(2.35, 11.18, 2.33, 5.65, 11.24, 2.39, { w: 2, x: 'p3' }) +
      box(2.3, 10.98, 2.86, 5.7, 11.25, 3.12, {
        w: 1,
        inner: lines(range(2.92, 3.1, 0.045).map((z) => seg([2.34, 11.25, z], [5.66, 11.25, z])), 'e4', 0),
      }),
    'rise',
  );
  A.entrada = P(4.0, 11.12, 3.12);
  if (ft.camaras) {
    add(
      'camara',
      box(5.62, 10.99, 2.2, 5.84, 11.1, 2.34, { t: 'p3', x: 'k', y: 'p3', w: 2 }) +
        lines([seg([5.62, 11.05, 2.27], [5.55, 11.05, 2.27])], 'e2', 0),
    );
  }

  // ── Muros bajos del frente y del lado derecho
  add('muro-der', box(7, -0.22, 0, 7.22, 11, 0.4, { t: 'k', w: 1 }), 'rise');
  add('muro-frente-a', box(-0.22, 11, 0, 2.2, 11.2, 0.4, { t: 'k', w: 1 }), 'rise');
  add('muro-frente-b', box(5.8, 11, 0, 7.22, 11.2, 0.4, { t: 'k', w: 1 }), 'rise');

  return {
    archivero: 'El archivero de la oficina',
    papeles: 'Los papeles del escritorio',
    libreta: 'El cuaderno de órdenes',
    celular: 'El celular del taller',
    caja: 'La caja del mostrador',
    aviso: 'El aviso de privacidad',
    cliente: 'El cliente del taller',
    entrada: 'El portón del taller',
    equipo: 'Quien recibe los trabajos',
    monitor: 'La computadora de la oficina',
  };
}
