// Piezas que comparten los lugares propios: suelo, muros, puerta, mostrador, escritorio y archivero.
// Cada pieza deja sus anclas en A, así cada lugar solo dibuja lo que lo hace distinto.
import { atiende, cliente, sentado, type Dress } from './figures';
import type { Rect, V3 } from './ink';
import type { Kit } from './scene';

export const LOT: Rect = [-0.7, -0.7, 7.9, 11.2];
export const seg = (a: V3, b: V3): [V3, V3] => [a, b];

/** Lote, acera, calle y norte. Después de esto cada lugar pone su piso y llama a placeShadows. */
export function suelo(k: Kit) {
  const { add, loop, box, lines, plane, range, label, ring, fill } = k;
  add('lote', loop([[-0.7, -0.7, 0], [7.9, -0.7, 0], [7.9, 11.2, 0], [-0.7, 11.2, 0]], 'dash', 0), 'fade');
  add(
    'acera',
    box(-0.7, 11.2, -0.14, 7.9, 12.9, 0, { y: 'p2', w: 2 }) +
      lines(range(0.25, 7.9, 0.95).map((x) => seg([x, 11.2, 0], [x, 12.9, 0])), 'e4', 0) +
      lines([seg([-0.7, 12.05, 0], [7.9, 12.05, 0])], 'e4', 0) +
      plane([[1.1, 12.9, -0.12], [1.62, 12.9, -0.12], [1.62, 12.9, -0.04], [1.1, 12.9, -0.04]], 'k', 'e3', 0),
    'fade',
  );
  add('carril', lines(range(-0.7, 7.9, 0.9).map((x) => seg([x, 14.4, -0.14], [x + 0.5, 14.4, -0.14])), 'e2', 0), 'fade');
  add('calle', label('CALLE PRINCIPAL', 0.4, 13.75, -0.14, 'xy', 'street', 'start'), 'fade');
  add(
    'norte',
    loop(ring(9.5, 12.5, 0, 0.32, 'xy'), 'e3', 0) +
      fill([[9.5, 12.0, 0], [9.6, 12.62, 0], [9.5, 12.5, 0], [9.4, 12.62, 0]], 'k') +
      label('N', 9.5, 11.86, 0, 'xy', 'room', 'middle'),
    'fade',
  );
}

/** Piso de baldosas cuadradas de lado `paso`, en un rectángulo. */
export function baldosas(k: Kit, id: string, r: Rect, paso: number, cls = 'p') {
  const { add, fill, lines, range } = k;
  const [x0, y0, x1, y1] = r;
  add(
    id,
    fill([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], cls) +
      lines(range(x0 + paso, x1, paso).map((x) => seg([x, y0, 0], [x, y1, 0])), 'e4', 0) +
      lines(range(y0 + paso, y1, paso).map((y) => seg([x0, y, 0], [x1, y, 0])), 'e4', 0),
    'fade',
  );
}

/** Muros altos del fondo y la izquierda, con lo que va pintado o colgado en cada uno. */
export function murosAltos(k: Kit, izq: string, fondo: string) {
  const { add, box } = k;
  add('muro-izq', box(-0.22, -0.22, 0, 0, 11, 3, { t: 'k', x: 'p2', y: 'p', w: 1, inner: izq }), 'rise');
  add('muro-fondo', box(0, -0.22, 0, 7, 0, 3, { t: 'k', y: 'p', x: 'p2', w: 1, inner: fondo }), 'rise');
}

/** Letrero grande sobre el muro izquierdo. */
export function letrero(k: Kit, txt: string, y0 = 3.45, y1 = 5.5): string {
  const { plane, label } = k;
  return plane([[0, y1, 2.36], [0, y0, 2.36], [0, y0, 2.84], [0, y1, 2.84]], 'p', 'e2') + label(txt, 0, (y0 + y1) / 2, 2.49, 'yz', 'sign', 'middle');
}

/** Ventana con marco sobre el muro izquierdo (x = 0). */
export function ventanaIzq(k: Kit, y0: number, y1: number, z0 = 1.0, z1 = 2.1): string {
  const { plane, lines, range } = k;
  return (
    plane([[0, y0, z0], [0, y1, z0], [0, y1, z1], [0, y0, z1]], 'g', 'e2') +
    lines(range(y0 + 0.35, y1, 0.35).map((y) => seg([0, y, z0], [0, y, z1])), 'e3', 0) +
    lines([seg([0, y0, (z0 + z1) / 2], [0, y1, (z0 + z1) / 2])], 'e3', 0)
  );
}

/** Muros bajos del frente y la derecha, con la puerta entre x0 y x1; marcos, dintel y A.entrada. */
export function fachada(k: Kit, x0 = 2.7, x1 = 4.7, alto = 2.55) {
  const { ft, add, box, fill, A, P } = k;
  add('muro-der', box(7, -0.22, 0, 7.22, 11, 0.4, { t: 'k', w: 1 }), 'rise');
  add('muro-frente-a', box(-0.22, 11, 0, x0, 11.2, 0.4, { t: 'k', w: 1 }), 'rise');
  add('muro-frente-b', box(x1, 11, 0, 7.22, 11.2, 0.4, { t: 'k', w: 1 }), 'rise');
  add('marco-a', box(x0, 11, 0, x0 + 0.12, 11.2, alto, { w: 1 }), 'rise');
  add(
    'marco-b',
    box(x1 - 0.12, 11, 0, x1, 11.2, alto, {
      w: 1,
      inner: ft.camaras ? fill([[x1 - 0.12, 11.2, alto - 1.1], [x1, 11.2, alto - 1.1], [x1, 11.2, alto - 0.9], [x1 - 0.12, 11.2, alto - 0.9]], 'k') : '',
    }),
    'rise',
  );
  add('dintel', box(x0, 11, alto - 0.1, x1, 11.2, alto, { w: 1 }), 'rise');
  if (ft.camaras) add('camara', box(x1, 11.02, alto - 0.32, x1 + 0.22, 11.14, alto - 0.18, { t: 'p3', x: 'k', y: 'p3', w: 2 }), 'rise');
  A.entrada = P((x0 + x1) / 2, 11.1, alto);
}

export interface Mostrador {
  /** Rectángulo en planta; la cara que se ve es la del frente (y1). */
  r: Rect;
  alto?: number;
  ropa: Dress;
  /** Encima de la figura de quien atiende (sombrero, casco). */
  extra?: string;
  /** Rótulo pequeño en el frente del mostrador. */
  rotulo?: string;
  /** Algo más sobre el mostrador, entre la libreta y la caja. */
  encima?: string;
}

/** Mostrador con libreta, celular, caja y aviso; quien atiende detrás y el cliente adelante. Deja sus anclas. */
export function mostrador(k: Kit, m: Mostrador) {
  const { ft, add, A, P, box, lines, fill, plane, label, range, rnd, at, grain, shade, shadow } = k;
  const [x0, y0, x1, y1] = m.r;
  const z = m.alto ?? 1.0;
  const zt = z + 0.05;
  const xm = (x0 + x1) / 2;
  add('persona-mostrador', at(xm, y0 - 0.5, 0, atiende(m.ropa) + (m.extra ?? ''), [-14, -80, 14, 0]));
  A.equipo = P(xm, y0 - 0.5, 1.62);
  add(
    'mostrador',
    box(x0, y0, 0, x1, y1, z, {
      w: 1,
      inner:
        fill([[x0, y1, z - 0.1], [x1, y1, z - 0.1], [x1, y1, z], [x0, y1, z]], 'hd') +
        lines(range(x0 + 0.3, x1, 0.3).map((x) => seg([x, y1, 0.1], [x, y1, z - 0.1])), 'e4', 0) +
        (m.rotulo ? label(m.rotulo, xm, y1, z * 0.5, 'xz', 'tiny', 'middle') : ''),
    }),
  );
  add('mostrador-tope', box(x0 - 0.05, y0 - 0.05, z, x1 + 0.05, y1 + 0.05, zt, { y: 'p2', x: 'p2', w: 1, inner: grain(x0, y0, x1, y1, zt, 4) }));
  shade(shadow(x0, y0, x1, y1, zt, LOT));
  const ym = (y0 + y1) / 2;
  const lx = x0 + 0.25;
  add(
    'libreta',
    box(lx, ym - 0.2, zt, lx + 0.28, ym + 0.2, zt + 0.015, {
      w: 3,
      inner: lines(range(ym - 0.13, ym + 0.15, 0.05).map((y) => seg([lx + 0.03, y, zt + 0.015], [lx + 0.12 + rnd() * 0.12, y, zt + 0.015])), 'e4', 0),
    }) +
      box(lx + 0.28, ym - 0.2, zt, lx + 0.56, ym + 0.2, zt + 0.015, {
        w: 3,
        inner: lines(range(ym - 0.13, ym + 0.05, 0.05).map((y) => seg([lx + 0.31, y, zt + 0.015], [lx + 0.4 + rnd() * 0.12, y, zt + 0.015])), 'e4', 0),
      }) +
      lines([seg([lx + 0.62, ym - 0.14, zt + 0.02], [lx + 0.75, ym + 0.14, zt + 0.02])], 'e1', 0),
  );
  A.libreta = P(lx + 0.28, ym, zt + 0.015);
  if (m.encima) add('mostrador-encima', m.encima);
  if (ft.celular) {
    const cx = lx + 0.95;
    add('celular', box(cx, ym - 0.12, zt, cx + 0.15, ym + 0.12, zt + 0.02, { t: 'k', x: 'p3', y: 'p3', w: 2, inner: lines([seg([cx + 0.03, ym - 0.06, zt + 0.02], [cx + 0.08, ym + 0.06, zt + 0.02])], 'rf', 0) }));
    A.celular = P(cx + 0.08, ym, zt + 0.02);
  }
  const kx = x1 - 0.95;
  add(
    'caja',
    box(kx, ym - 0.18, zt, kx + 0.4, ym + 0.16, zt + 0.09, { w: 1 }) +
      box(kx + 0.06, ym - 0.2, zt + 0.09, kx + 0.34, ym - 0.14, zt + 0.3, { t: 'p2', x: 'p3', y: 'k', w: 2, inner: lines([seg([kx + 0.1, ym - 0.14, zt + 0.14], [kx + 0.18, ym - 0.14, zt + 0.25])], 'rf', 0) }),
  );
  A.caja = P(kx + 0.2, ym - 0.17, zt + 0.3);
  if (ft.biometria) add('huellero', box(kx - 0.3, ym - 0.1, zt, kx - 0.08, ym + 0.1, zt + 0.06, { t: 'p2', w: 2, inner: plane([[kx - 0.26, ym - 0.06, zt + 0.06], [kx - 0.12, ym - 0.06, zt + 0.06], [kx - 0.12, ym + 0.06, zt + 0.06], [kx - 0.26, ym + 0.06, zt + 0.06]], 'k', 'e3', 0) }));
  const ax = x1 - 0.3;
  add(
    'aviso',
    box(ax - 0.18, ym - 0.05, zt, ax + 0.18, ym + 0.09, zt + 0.03, { w: 3 }) +
      box(ax - 0.22, ym, zt + 0.03, ax + 0.22, ym + 0.04, zt + 0.39, {
        x: 'p2',
        w: 2,
        inner:
          label('PRIVACIDAD', ax, ym + 0.04, zt + 0.31, 'xz', 'tiny', 'middle') +
          lines([seg([ax - 0.16, ym + 0.04, zt + 0.28], [ax + 0.16, ym + 0.04, zt + 0.28])], 'e3', 0) +
          lines(range(zt + 0.1, zt + 0.25, 0.035).map((zz) => seg([ax - 0.16, ym + 0.04, zz], [ax + 0.1 + ((zz * 31) % 0.06), ym + 0.04, zz])), 'e4', 0),
      }),
  );
  A.aviso = P(ax, ym + 0.02, zt + 0.39);
}

/** El cliente parado en (x, y), con su sombra. */
export function clienteEn(k: Kit, x: number, y: number) {
  const { add, A, P, at, shade, shadow } = k;
  add('cliente', at(x, y, 0, cliente(), [-13, -75, 20, 0]));
  A.cliente = P(x, y, 1.62);
  shade(shadow(x - 0.12, y - 0.12, x + 0.12, y + 0.12, 1.6, LOT));
}

/** Escritorio con papeles; computadora y alguien sentado según el perfil. La cara de trabajo mira al frente (y crece). */
export function escritorio(k: Kit, x0: number, y0: number, ancho = 1.8) {
  const { ft, add, A, P, box, lines, range, grain, at, shade, shadow } = k;
  const x1 = x0 + ancho;
  const y1 = y0 + 0.72;
  add('escritorio-panel', box(x0, y0, 0.1, x1, y0 + 0.05, 0.72, { w: 2 }));
  add('escritorio-patas', box(x0 + 0.02, y1 - 0.08, 0, x0 + 0.08, y1 - 0.02, 0.72, { w: 2 }) + box(x1 - 0.08, y1 - 0.08, 0, x1 - 0.02, y1 - 0.02, 0.72, { w: 2 }));
  add('escritorio', box(x0, y0, 0.72, x1, y1, 0.77, { y: 'p2', w: 1, inner: grain(x0, y0, x1, y1, 0.77, 4) }));
  shade(shadow(x0, y0, x1, y1, 0.77, LOT));
  add(
    'papeles',
    box(x0 + 0.1, y0 + 0.2, 0.77, x0 + 0.48, y0 + 0.56, 0.785, { w: 3 }) +
      box(x0 + 0.14, y0 + 0.17, 0.785, x0 + 0.52, y0 + 0.53, 0.8, { w: 3, inner: lines(range(y0 + 0.23, y0 + 0.5, 0.045).map((y) => seg([x0 + 0.19, y, 0.8], [x0 + 0.45 - ((y * 7) % 0.12), y, 0.8])), 'e4', 0) }),
  );
  A.papeles = P(x0 + 0.33, y0 + 0.35, 0.8);
  if (ft.computadora) {
    const mx = x0 + ancho * 0.6;
    add('monitor-pie', box(mx - 0.1, y0 + 0.2, 0.77, mx + 0.1, y0 + 0.32, 0.8, { w: 3 }) + box(mx - 0.03, y0 + 0.19, 0.8, mx + 0.03, y0 + 0.23, 0.92, { w: 3 }));
    add(
      'monitor',
      box(mx - 0.45, y0 + 0.15, 0.88, mx + 0.45, y0 + 0.21, 1.4, {
        t: 'p2',
        x: 'p3',
        y: 'k',
        w: 1,
        inner: lines(range(0.98, 1.32, 0.06).map((z) => seg([mx - 0.37, y0 + 0.21, z], [mx + 0.37, y0 + 0.21, z])), 'rf', 0),
      }),
    );
    add('teclado', box(mx - 0.3, y0 + 0.4, 0.77, mx + 0.25, y0 + 0.56, 0.795, { w: 3 }));
    A.monitor = P(mx, y0 + 0.18, 1.4);
  }
  const sx = x0 + ancho * 0.5;
  const sy = y1 + 0.35;
  add('silla', box(sx - 0.22, sy - 0.22, 0.42, sx + 0.22, sy + 0.22, 0.48, { t: 'p2', w: 2 }) + lines([seg([sx, sy, 0.05], [sx, sy, 0.42])], 'e1', 0));
  if (ft.equipo >= 2) add('persona-escritorio', at(sx, sy, 0, sentado(), [-13, -63, 13, 0]));
  add('silla-respaldo', box(sx - 0.2, sy + 0.2, 0.52, sx + 0.2, sy + 0.27, 0.96, { t: 'p2', y: 'p2', w: 2 }));
}

/** Archivero de tres gavetas, solo si el negocio guarda papeles. */
export function archivero(k: Kit, x0: number, y0: number) {
  const { ft, add, A, P, box, lines, fill, shade, shadow } = k;
  if (!ft.archivero) return;
  const x1 = x0 + 0.66;
  const y1 = y0 + 0.6;
  let d = lines([0.46, 0.9].map((z) => seg([x0 + 0.03, y1, z], [x1 - 0.03, y1, z])), 'e2', 0);
  for (const zc of [0.28, 0.72, 1.16]) d += fill([[x0 + 0.24, y1, zc], [x0 + 0.42, y1, zc], [x0 + 0.42, y1, zc + 0.04], [x0 + 0.24, y1, zc + 0.04]], 'k');
  add('archivero', box(x0, y0, 0, x1, y1, 1.35, { w: 1, inner: d }));
  add('archivero-carpeta', box(x0 + 0.1, y0 + 0.12, 1.35, x1 - 0.14, y1 - 0.14, 1.4, { t: 'p2', x: 'p2', w: 3 }));
  A.archivero = P(x0 + 0.31, y0 + 0.3, 1.4);
  shade(shadow(x0, y0, x1, y1, 1.35, LOT));
}
