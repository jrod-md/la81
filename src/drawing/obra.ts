import { atiende, cliente, reponedor, sentado } from './figures';
import type { Rect, V3 } from './ink';
import type { AnchorKey, Kit } from './scene';

const LOT: Rect = [-0.7, -0.6, 7.9, 11.3];

const casco = (cy: number): string =>
  `<path class='p s2' d='M-7.2 ${cy + 1.2}Q0 ${cy - 6.4} 7.2 ${cy + 1.2}Z'/>` +
  `<path class='k' d='M-9.4 ${cy + 1.1}Q0 ${cy - 0.9} 9.4 ${cy + 1.1}'/>`;

export function obra(k: Kit): Partial<Record<AnchorKey, string>> {
  const { ft, add, A, range, shade, placeShadows, P, rnd, fill, lines, loop, plane, box, shadow, cyl, ring, ringPath, label, at, grain } = k;
  const seg = (a: V3, b: V3): [V3, V3] => [a, b];

  // ── Terreno, acera y calle
  add('lote', loop([[-0.7, -0.6, 0], [7.9, -0.6, 0], [7.9, 11.3, 0], [-0.7, 11.3, 0]], 'dash', 0), 'fade');
  add(
    'acera',
    box(-0.7, 11.3, -0.14, 7.9, 12.05, 0, { y: 'p2', w: 2 }) +
      lines(range(0.25, 7.9, 0.95).map((x) => seg([x, 11.3, 0], [x, 12.05, 0])), 'e4', 0) +
      lines([seg([-0.7, 12.05, 0], [7.9, 12.05, 0]), seg([-0.7, 11.68, 0], [7.9, 11.68, 0])], 'e4', 0) +
      plane([[1.1, 12.05, -0.12], [1.62, 12.05, -0.12], [1.62, 12.05, -0.04], [1.1, 12.05, -0.04]], 'k', 'e3', 0),
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
  let tierra = '';
  for (let i = 0; i < 24; i++) {
    tierra += fill(ring(-0.4 + rnd() * 7.2, -0.3 + rnd() * 11.2, 0.008, 0.018 + rnd() * 0.02, 'xy', 5), 'e4');
  }
  add('piso', fill([[0, 0, 0], [7, 0, 0], [7, 11, 0], [0, 11, 0]], 'p2') + tierra, 'fade');
  placeShadows();

  // ── Cerca de malla ciclón
  let cerca = lines(range(-0.5, 7.6, 1).map((x) => seg([x, -0.5, 0], [x, -0.5, 1.6])), 'e2', 1);
  for (let x = -0.5; x < 7.3; x += 0.55) {
    cerca += lines([seg([x, -0.5, 0.1], [x + 0.65, -0.5, 1.5]), seg([x, -0.5, 1.5], [x + 0.65, -0.5, 0.1])], 'e4', 0);
  }
  cerca += lines([seg([-0.5, -0.5, 1.6], [7.6, -0.5, 1.6])], 'e3', 0);
  cerca += lines(range(-0.5, 10.9, 1).map((y) => seg([-0.5, y, 0], [-0.5, y, 1.6])), 'e2', 1);
  for (let y = -0.5; y < 10.4; y += 0.55) {
    cerca += lines([seg([-0.5, y, 0.1], [-0.5, y + 0.65, 1.5]), seg([-0.5, y, 1.5], [-0.5, y + 0.65, 0.1])], 'e4', 0);
  }
  cerca += lines([seg([-0.5, -0.5, 1.6], [-0.5, 10.9, 1.6])], 'e3', 0);
  add('cerca', cerca);

  // ── Contenedor-oficina
  let ranuras = '';
  for (let y = 0.55; y < 2.55; y += 0.34) {
    ranuras += lines([seg([0.09, y, 0.1], [0.09, y, 2.45]), seg([2.91, y, 0.1], [2.91, y, 2.45])], 'e4', 0);
  }
  for (let x = 0.4; x < 2.7; x += 0.34) ranuras += lines([seg([x, 0.29, 0.1], [x, 0.29, 2.45])], 'e4', 0);
  add(
    'contenedor',
    box(0.1, 0.3, 0, 2.9, 0.42, 2.6, { t: 'p2', y: 'p2', w: 1 }) +
      box(0.1, 0.42, 0.08, 0.22, 2.6, 2.6, { t: 'p2', x: 'p2', w: 1 }) +
      box(2.78, 0.42, 0.08, 2.9, 2.6, 2.6, { t: 'p2', x: 'p2', w: 1 }) +
      box(0.1, 0.3, 2.52, 2.9, 2.6, 2.6, { t: 'p3', x: 'p', y: 'p', w: 1 }) +
      ranuras,
  );
  shade(shadow(0.1, 0.3, 2.9, 2.6, 2.6, LOT));

  add(
    'escritorio-oficina-patas',
    lines(
      [
        seg([0.7, 0.95, 0], [0.7, 0.95, 0.68]),
        seg([2.2, 0.95, 0], [2.2, 0.95, 0.68]),
        seg([0.7, 1.55, 0], [0.7, 1.55, 0.68]),
        seg([2.2, 1.55, 0], [2.2, 1.55, 0.68]),
      ],
      'e2',
      0,
    ),
  );
  add('escritorio-oficina', box(0.55, 0.85, 0.68, 2.35, 1.65, 0.78, { y: 'p2', w: 1, inner: grain(0.55, 0.85, 2.35, 1.65, 0.78, 4) }));
  let planos = '';
  for (const [px, py] of [[1.28, 1.12], [1.46, 1.28], [1.64, 1.08]] as [number, number][]) {
    planos += cyl(px, py, 0.78, 1.1, 0.045, { body: 'p', top: 'p3', w: 2 });
  }
  add(
    'papeles',
    planos +
      box(0.78, 1.0, 0.78, 1.18, 1.38, 0.8, {
        w: 3,
        inner: lines(range(1.06, 1.34, 0.05).map((y) => seg([0.82, y, 0.8], [1.12 + rnd() * 0.05, y, 0.8])), 'e4', 0),
      }),
  );
  A.papeles = P(0.98, 1.2, 0.82);

  if (ft.archivero) {
    let cajones = lines([0.4, 0.75].map((z) => seg([0.3, 0.85, z], [0.58, 0.85, z])), 'e2', 0);
    for (const zc of [0.2, 0.58, 0.96]) {
      cajones += fill([[0.39, 0.85, zc], [0.51, 0.85, zc], [0.51, 0.85, zc + 0.04], [0.39, 0.85, zc + 0.04]], 'k');
    }
    add('archivero', box(0.3, 0.55, 0.08, 0.58, 0.85, 1.3, { w: 1, inner: cajones }));
    A.archivero = P(0.44, 0.85, 1.3);
  }

  if (ft.computadora) {
    const scr = lines(range(1.68, 2.1, 0.06).map((x) => seg([x, 1.12, 0.96], [x, 1.12, 1.23])), 'rf', 0);
    add(
      'monitor',
      box(1.58, 1.08, 0.78, 2.2, 1.12, 1.34, { t: 'p2', x: 'p2', y: 'k', w: 1, inner: scr }) +
        box(1.78, 1.04, 0.78, 2.0, 1.08, 0.82, { w: 1 }),
    );
    A.monitor = P(1.89, 1.12, 1.34);
  }

  if (ft.equipo >= 2) add('persona-escritorio', at(1.35, 1.95, 0, sentado(), [-14, -72, 8, 0]));

  add(
    'letrero-obras',
    label('OBRAS', 1.2, 2.6, 2.74, 'xz', 'sign', 'middle') +
      lines([seg([0.55, 2.6, 2.58], [1.85, 2.6, 2.58])], 'e3', 0),
  );

  // ── Estructura al fondo-derecha
  add('losa', box(3.2, 0.3, 0, 7.0, 5.5, 0.25, { t: 'p2', x: 'p', y: 'p', w: 1 }));
  add('losa-2', box(3.2, 0.3, 2.8, 7.0, 2.9, 3.0, { t: 'p2', x: 'p', y: 'p', w: 1 }));
  const xs = [3.3, 5.1, 6.8];
  const ys = [0.4, 2.9, 5.3];
  let columnas = '';
  for (const x of xs) {
    for (const y of ys) {
      columnas += box(x - 0.125, y - 0.125, 0.25, x + 0.125, y + 0.125, 2.8, { t: 'p2', x: 'p2', y: 'p2', w: 1 });
    }
  }
  add('columnas', columnas);
  let varillas = '';
  for (const x of xs) for (const dx of [-0.06, 0.06]) for (const dy of [-0.06, 0.06]) {
    varillas += lines([seg([x + dx, 5.3 + dy, 2.8], [x + dx, 5.3 + dy, 3.5])], 'e2', 1);
  }
  add('varillas', varillas);
  const panel = (x0: number, x1: number): string => {
    let j = '';
    for (let z = 0.32; z < 1.82; z += 0.18) j += lines([seg([x0, 0.55, z], [x1, 0.55, z])], 'e4', 0);
    for (let x = x0 + 0.22; x < x1; x += 0.38) j += lines([seg([x, 0.55, 0.25], [x, 0.55, 0.9])], 'e4', 0);
    return box(x0, 0.28, 0.25, x1, 0.54, 1.8, { t: 'p', x: 'p2', y: 'p', w: 1, inner: j });
  };
  add('muro-bloque-a', panel(3.43, 4.98));
  add('muro-bloque-b', panel(5.22, 6.68));
  shade(shadow(3.2, 0.3, 7.0, 5.5, 3.0, LOT));

  let andamio = '';
  for (const x of [3.4, 4.5, 5.6, 6.6]) for (const y of [5.7, 6.2]) andamio += lines([seg([x, y, 0], [x, y, 2.8])], 'e2', 1);
  for (const z of [0.9, 1.4, 2.2, 2.8]) andamio += lines([seg([3.4, 6.2, z], [6.6, 6.2, z])], 'e3', 0);
  andamio += lines([seg([3.4, 6.2, 0.9], [6.6, 6.2, 2.2]), seg([3.4, 6.2, 2.2], [6.6, 6.2, 0.9])], 'e3', 0);
  add('andamio', andamio);
  add(
    'andamio-tablones',
    box(3.35, 5.65, 1.36, 6.65, 6.25, 1.44, { t: 'p2', y: 'p2', w: 1, inner: grain(3.35, 5.65, 6.65, 6.25, 1.44, 4) }) +
      box(3.35, 5.65, 2.68, 6.65, 6.25, 2.76, { t: 'p2', y: 'p2', w: 1, inner: grain(3.35, 5.65, 6.65, 6.25, 2.76, 4) }),
  );
  if (ft.equipo >= 3) add('persona-sala', at(5.0, 6.0, 1.4, reponedor('caja') + casco(-65.5), [-20, -70, 12, 0]));

  add(
    'mezcladora',
    box(2.05, 6.45, 0.18, 2.75, 6.98, 0.72, { t: 'p2', x: 'p', y: 'p2', w: 1 }) +
      box(2.18, 6.55, 0.68, 2.62, 6.92, 1.34, { t: 'p3', x: 'p2', y: 'p', w: 1 }) +
      ringPath(ring(2.12, 6.99, 0.26, 0.2, 'xz', 14), 'k', 2) +
      ringPath(ring(2.68, 6.99, 0.26, 0.2, 'xz', 14), 'k', 2) +
      lines([seg([2.62, 6.7, 0.68], [2.96, 6.55, 0.46]), seg([2.96, 6.55, 0.46], [2.96, 6.55, 0.18])], 'e2', 1),
  );
  shade(shadow(2.05, 6.45, 2.75, 6.99, 1.34, LOT));

  const loma: V3[] = [[0.6, 7.45, 0], [0.95, 8.05, 0], [1.55, 8.0, 0], [1.8, 7.5, 0], [1.48, 6.92, 0], [0.88, 6.88, 0]];
  const arenaAlta: V3[] = [[0.85, 7.55, 0.02], [1.15, 7.9, 0.02], [1.5, 7.6, 0.02], [1.25, 7.3, 0.02]];
  let arena = '';
  for (let i = 0; i < 18; i++) {
    arena += fill(ring(0.68 + rnd() * 1.02, 6.98 + rnd() * 0.96, 0.012, 0.02 + rnd() * 0.018, 'xy', 5), 'e4');
  }
  add('arena', fill(loma, 'p3') + loop(loma, 'e4', 0) + fill(arenaAlta, 'p3') + arena);

  let bloques = '';
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let l = 0; l < 2; l++) {
    const x = 2.92 + i * 0.3;
    const y = 7.62 + j * 0.22;
    const z = l * 0.16;
    bloques += box(x, y, z, x + 0.27, y + 0.19, z + 0.15, { t: 'p3', x: 'p2', y: 'p2', w: 1 });
  }
  add('bloques', bloques);
  shade(shadow(2.9, 7.6, 3.8, 8.3, 0.31, LOT));

  add(
    'carretilla',
    ringPath(ring(2.9, 8.88, 0.17, 0.17, 'xz', 14), 'k', 2) +
      fill([[2.38, 8.72, 0.34], [2.95, 8.68, 0.36], [2.98, 8.98, 0.34], [2.45, 9.04, 0.34]], 'p2') +
      loop([[2.38, 8.72, 0.34], [2.95, 8.68, 0.36], [2.98, 8.98, 0.34], [2.45, 9.04, 0.34]], 'e2', 0) +
      lines([seg([2.4, 8.78, 0.34], [2.05, 8.58, 0.58]), seg([2.4, 8.95, 0.34], [2.05, 8.88, 0.58])], 'e2', 1) +
      lines([seg([2.55, 8.82, 0.4], [2.2, 8.62, 0.9])], 'e2', 1) +
      fill([[2.15, 8.6, 0.9], [2.28, 8.58, 0.94], [2.24, 8.72, 0.88], [2.1, 8.74, 0.85]], 'p3'),
  );
  shade(shadow(2.38, 8.58, 2.98, 9.04, 0.94, LOT));

  // ── Despacho al frente-izquierda
  add(
    'mesa-despacho-patas',
    lines(
      [
        seg([0.6, 9.1, 0], [0.6, 9.1, 0.88]),
        seg([2.2, 9.1, 0], [2.2, 9.1, 0.88]),
        seg([0.6, 9.5, 0], [0.6, 9.5, 0.88]),
        seg([2.2, 9.5, 0], [2.2, 9.5, 0.88]),
      ],
      'e2',
      0,
    ),
  );
  add('mesa-despacho', box(0.4, 9.0, 0.88, 2.4, 9.6, 0.9, { y: 'p2', w: 1, inner: grain(0.4, 9.0, 2.4, 9.6, 0.9, 4) }));
  shade(shadow(0.4, 9.0, 2.4, 9.6, 0.9, LOT));

  add(
    'libreta',
    box(0.65, 9.15, 0.9, 0.95, 9.45, 0.925, {
      w: 3,
      inner: lines(range(9.2, 9.42, 0.05).map((y) => seg([0.68, y, 0.925], [0.84 + rnd() * 0.06, y, 0.925])), 'e4', 0),
    }) + lines([seg([0.99, 9.22, 0.94], [1.12, 9.38, 0.94])], 'e1', 0),
  );
  A.libreta = P(0.82, 9.3, 0.925);

  add(
    'caja',
    box(1.05, 9.13, 0.9, 1.45, 9.38, 1.02, {
      t: 'p2',
      w: 1,
      inner: lines([seg([1.16, 9.38, 0.99], [1.34, 9.38, 0.99])], 'e3', 0),
    }) +
      box(1.11, 9.08, 1.02, 1.39, 9.12, 1.24, {
        t: 'p2',
        x: 'p3',
        y: 'k',
        w: 2,
        inner: lines([seg([1.15, 9.08, 1.08], [1.23, 9.08, 1.19])], 'rf', 0),
      }),
  );
  A.caja = P(1.25, 9.1, 1.24);

  if (ft.celular) {
    add(
      'celular',
      box(1.7, 9.2, 0.9, 1.82, 9.4, 0.92, {
        t: 'k',
        x: 'p3',
        y: 'p3',
        w: 2,
        inner: lines([seg([1.73, 9.25, 0.92], [1.77, 9.35, 0.92])], 'rf', 0),
      }),
    );
    A.celular = P(1.76, 9.3, 0.92);
  }

  if (ft.biometria) {
    add(
      'huellero',
      box(1.48, 9.15, 0.9, 1.66, 9.32, 0.96, {
        t: 'p2',
        w: 2,
        inner: plane([[1.51, 9.2, 0.96], [1.63, 9.2, 0.96], [1.63, 9.28, 0.96], [1.51, 9.28, 0.96]], 'g', 'e3', 0),
      }),
    );
  }

  add(
    'aviso',
    box(1.98, 9.2, 0.9, 2.26, 9.3, 0.94, { w: 3 }) +
      box(1.95, 9.12, 0.94, 2.3, 9.16, 1.3, {
        x: 'p2',
        w: 2,
        inner:
          label('PRIVACIDAD', 2.12, 9.16, 1.23, 'xz', 'tiny', 'middle') +
          lines([seg([2.0, 9.16, 1.18], [2.24, 9.16, 1.18])], 'e3', 0) +
          lines(range(1.0, 1.15, 0.035).map((z) => seg([2.0, 9.16, z], [2.23 + ((z * 31) % 0.06), 9.16, z])), 'e4', 0),
      }),
  );
  A.aviso = P(2.12, 9.14, 1.3);

  add('persona-mostrador', at(1.4, 8.5, 0, atiende('camisa') + casco(-65.5), [-14, -75, 14, 0]));
  A.equipo = P(1.4, 8.5, 1.62);
  shade(shadow(1.28, 8.38, 1.52, 8.62, 1.6, LOT));

  add('cliente', at(1.6, 10.3, 0, cliente(), [-13, -75, 20, 0]));
  A.cliente = P(1.6, 10.3, 1.62);
  shade(shadow(1.48, 10.18, 1.72, 10.42, 1.6, LOT));

  add(
    'letrero-obra',
    lines([seg([5.05, 10.6, 0], [5.05, 10.6, 2.0]), seg([6.55, 10.6, 0], [6.55, 10.6, 2.0])], 'e2', 2) +
      plane([[5.0, 10.6, 1.05], [6.6, 10.6, 1.05], [6.6, 10.6, 2.0], [5.0, 10.6, 2.0]], 'p2', 'e2', 0) +
      label('PERMISO DE CONSTRUCCIÓN', 5.8, 10.6, 1.55, 'xz', 'tiny', 'middle') +
      lines([seg([5.1, 10.6, 1.38], [6.5, 10.6, 1.38]), seg([5.1, 10.6, 1.2], [6.1, 10.6, 1.2])], 'e4', 0),
  );

  add('marco-a', box(2.6, 10.98, 0, 2.75, 11.18, 2.2, { w: 1 }), 'rise');
  add('marco-b', box(4.6, 10.98, 0, 4.75, 11.18, 2.2, { w: 1 }), 'rise');
  add(
    'porton-malla',
    plane([[2.65, 11.0, 0.05], [2.65, 10.35, 0.05], [2.65, 10.35, 2.0], [2.65, 11.0, 2.0]], 'g', 'e2', 0) +
      plane([[4.7, 11.0, 0.05], [4.7, 10.35, 0.05], [4.7, 10.35, 2.0], [4.7, 11.0, 2.0]], 'g', 'e2', 0) +
      lines([seg([2.66, 11, 0.15], [2.66, 10.36, 1.95]), seg([2.66, 10.36, 0.15], [2.66, 11, 1.95])], 'e4', 0) +
      lines([seg([4.69, 11, 0.15], [4.69, 10.36, 1.95]), seg([4.69, 10.36, 0.15], [4.69, 11, 1.95])], 'e4', 0),
  );
  A.entrada = P(3.7, 11, 2.2);

  if (ft.camaras) {
    add(
      'camara',
      box(4.55, 10.98, 1.65, 4.8, 11.1, 1.82, { t: 'p3', x: 'k', y: 'p3', w: 2 }) +
        lines([seg([4.55, 11.04, 1.73], [4.48, 11.04, 1.73])], 'e2', 1),
    );
  }

  return {
    archivero: 'El archivo de la obra',
    papeles: 'Los planos',
    libreta: 'La bitácora',
    celular: 'El WhatsApp de la obra',
    caja: 'La caja de pagos',
    aviso: 'El aviso del despacho',
    cliente: 'El dueño de la casa',
    entrada: 'El portón de la obra',
    equipo: 'El maestro de obra',
    monitor: 'La computadora de la obra',
  };
}