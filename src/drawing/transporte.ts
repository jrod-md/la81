// La bodega de despacho: transporte y carga (taxi, bus, acarreo, mensajería, bodega).
// Racks con cajas al fondo, un camión en la zona de carga y el mostrador donde se reciben los paquetes.
import { reponedor } from './figures';
import { LOT, archivero, baldosas, clienteEn, escritorio, fachada, letrero, mostrador, murosAltos, seg, suelo } from './piezas';
import type { AnchorKey, Kit } from './scene';

export function transporte(k: Kit): Partial<Record<AnchorKey, string>> {
  const { ft, add, at, box, fill, lines, loop, plane, label, range, ring, ringPath, rnd, shade, shadow, placeShadows } = k;

  suelo(k);
  baldosas(k, 'piso', [0, 0, 7, 11], 1.0, 'p');
  // Zona de carga pintada en el piso
  add('zona-carga', fill([[3.2, 5.4, 0], [6.8, 5.4, 0], [6.8, 10.6, 0], [3.2, 10.6, 0]], 'hd') + loop([[3.2, 5.4, 0], [6.8, 5.4, 0], [6.8, 10.6, 0], [3.2, 10.6, 0]], 'e2', 0), 'fade');
  placeShadows();

  // Muro izquierdo: mapa de rutas y letrero
  let izq = plane([[0, 5.4, 1.2], [0, 3.4, 1.2], [0, 3.4, 2.3], [0, 5.4, 2.3]], 'p', 'e2');
  izq += lines([seg([0, 3.6, 1.4], [0, 4.1, 1.9]), seg([0, 4.1, 1.9], [0, 4.6, 1.6]), seg([0, 4.6, 1.6], [0, 5.2, 2.1]), seg([0, 4.1, 1.9], [0, 4.3, 2.15])], 'e3', 0);
  for (const [y, z] of [[3.6, 1.4], [4.1, 1.9], [4.6, 1.6], [5.2, 2.1], [4.3, 2.15]] as [number, number][]) izq += fill(ring(0, y, z, 0.04, 'yz', 8), 'k');
  izq += label('RUTAS', 0, 4.4, 1.27, 'yz', 'tiny', 'middle');
  izq += letrero(k, 'FLETES', 6.4, 8.8);
  // Muro del fondo: rejillas de ventilación
  let fondo = '';
  for (const x of [3.4, 5.4]) {
    fondo += plane([[x, 0, 2.4], [x + 0.9, 0, 2.4], [x + 0.9, 0, 2.8], [x, 0, 2.8]], 'p2', 'e2');
    fondo += lines(range(2.46, 2.8, 0.07).map((z) => seg([x + 0.04, 0, z], [x + 0.86, 0, z])), 'e4', 0);
  }
  murosAltos(k, izq, fondo);

  // Oficina de despacho al fondo-izquierda, con ventanilla de vidrio
  escritorio(k, 0.2, 0.4, 1.4);
  archivero(k, 1.66, 0.2);
  add(
    'oficina-vidrio',
    box(0, 2.95, 0, 2.4, 3.05, 1.0, { t: 'k', w: 1 }) +
      plane([[0, 3.0, 1.0], [2.4, 3.0, 1.0], [2.4, 3.0, 2.2], [0, 3.0, 2.2]], 'g', 'e2') +
      lines([0.8, 1.6].map((x) => seg([x, 3.0, 1.0], [x, 3.0, 2.2])), 'e2', 0) +
      box(2.35, 0, 0, 2.45, 2.95, 1.0, { t: 'k', w: 1 }) +
      plane([[2.4, 0, 1.0], [2.4, 2.95, 1.0], [2.4, 2.95, 2.2], [2.4, 0, 2.2]], 'g', 'e2') +
      label('DESPACHO', 1.2, 3.0, 2.0, 'xz', 'tiny', 'middle'),
    'rise',
  );

  // Racks con cajas a lo largo del fondo
  add('rack-postes', [2.8, 4.85, 6.9].map((x) => box(x - 0.05, 0.1, 0, x + 0.05, 1.0, 2.5, { x: 'p', w: 2 })).join(''));
  [0.1, 0.95, 1.8].forEach((z0, n) => {
    let cajas = box(2.75, 0.1, z0, 6.95, 1.0, z0 + 0.05, { x: 'p', w: 2 });
    let x = 2.9;
    while (x < 6.7) {
      const w = 0.35 + rnd() * 0.35;
      const h = 0.3 + rnd() * 0.35;
      if (x + w > 6.82) break;
      const top = z0 + 0.05 + h;
      cajas += box(x, 0.2, z0 + 0.05, x + w, 0.9, top, {
        t: 'p2',
        w: 2,
        inner: lines([seg([x + w / 2, 0.2, top], [x + w / 2, 0.9, top])], 'e3', 0) + plane([[x + 0.06, 0.9, z0 + 0.1], [x + 0.2, 0.9, z0 + 0.1], [x + 0.2, 0.9, z0 + 0.2], [x + 0.06, 0.9, z0 + 0.2]], 'p', 'e4', 0),
      });
      x += w + 0.06;
    }
    add(`rack-${n}`, cajas);
  });
  shade(shadow(2.75, 0.1, 6.95, 1.0, 2.5, LOT));

  // Paleta envuelta y gato hidráulico
  let paleta = box(3.0, 2.6, 0, 4.2, 3.6, 0.14, { t: 'p2', w: 2, inner: lines(range(3.15, 4.2, 0.2).map((x) => seg([x, 2.6, 0.14], [x, 3.6, 0.14])), 'e4', 0) });
  paleta += box(3.05, 2.65, 0.14, 4.15, 3.55, 1.2, { t: 'p', x: 'p2', y: 'p', w: 1, inner: lines(range(0.25, 1.2, 0.12).map((z) => seg([3.05, 3.55, z], [4.15, 3.55, z])), 'e4', 0) });
  add('paleta', paleta);
  shade(shadow(3.0, 2.6, 4.2, 3.6, 1.2, LOT));
  add(
    'gato',
    box(4.4, 2.8, 0, 4.55, 3.9, 0.08, { t: 'k', w: 2 }) +
      box(4.75, 2.8, 0, 4.9, 3.9, 0.08, { t: 'k', w: 2 }) +
      box(4.4, 3.9, 0, 4.9, 4.2, 0.3, { t: 'p3', w: 2 }) +
      lines([seg([4.65, 4.1, 0.3], [4.65, 4.35, 1.2]), seg([4.5, 4.35, 1.2], [4.8, 4.35, 1.2])], 'e1', 0),
  );

  // Camión de carga de reversa hacia el fondo
  const rueda = (y: number) => ringPath(ring(5.42, y, 0.36, 0.36, 'yz'), 'k', 2) + ringPath(ring(5.43, y, 0.36, 0.2, 'yz', 18), 'p', 3);
  add(
    'camion-cajon',
    box(3.6, 5.8, 0.55, 5.4, 8.6, 2.5, {
      t: 'p2',
      x: 'p',
      y: 'p',
      w: 1,
      inner: lines(range(6.2, 8.6, 0.4).map((y) => seg([5.4, y, 0.6], [5.4, y, 2.45])), 'e4', 0) + label('CARGA', 5.4, 7.2, 1.4, 'yz', 'sign', 'middle'),
    }) +
      plane([[3.6, 5.8, 0.6], [3.6, 5.2, 0.6], [3.6, 5.2, 2.45], [3.6, 5.8, 2.45]], 'p2', 'e2') +
      plane([[5.4, 5.8, 0.6], [5.4, 5.2, 0.6], [5.4, 5.2, 2.45], [5.4, 5.8, 2.45]], 'p2', 'e2'),
  );
  add('camion-ruedas', rueda(6.4) + rueda(8.0));
  add(
    'camion-cabina',
    box(3.7, 8.6, 0.5, 5.3, 10.0, 1.4, { t: 'p2', x: 'p', y: 'p', w: 1 }) +
      box(3.7, 8.6, 1.4, 5.3, 9.5, 2.05, {
        t: 'p2',
        x: 'p',
        y: 'p',
        w: 1,
        inner: plane([[3.85, 9.5, 1.5], [5.15, 9.5, 1.5], [5.15, 9.5, 1.95], [3.85, 9.5, 1.95]], 'g', 'e2', 0) + plane([[5.3, 8.75, 1.5], [5.3, 9.35, 1.5], [5.3, 9.35, 1.95], [5.3, 8.75, 1.95]], 'g', 'e2', 0),
      }) +
      plane([[3.7, 9.5, 1.4], [5.3, 9.5, 1.4], [5.3, 10.0, 1.4], [3.7, 10.0, 1.4]], 'p2', 'e2') +
      plane([[3.9, 10.0, 0.6], [5.1, 10.0, 0.6], [5.1, 10.0, 1.1], [3.9, 10.0, 1.1]], 'p3', 'e3') +
      lines(range(0.68, 1.1, 0.08).map((z) => seg([3.95, 10.0, z], [5.05, 10.0, z])), 'e4', 0),
  );
  add('camion-ruedas-frente', rueda(9.5));
  shade(shadow(3.6, 5.2, 5.4, 10.0, 2.5, LOT));
  if (ft.equipo >= 3) add('persona-sala', at(6.1, 5.2, 0, reponedor('caja'), [-25, -75, 13, 0]));

  // Mostrador de despacho con báscula de paquetes
  const ym = 7.7;
  const zt = 1.05;
  mostrador(k, {
    r: [0.4, 7.4, 3.4, 8.0],
    ropa: 'polo',
    rotulo: 'DESPACHO',
    encima:
      box(1.82, ym - 0.18, zt, 2.32, ym + 0.18, zt + 0.04, { t: 'p3', w: 2 }) +
      box(1.88, ym - 0.13, zt + 0.04, 2.26, ym + 0.13, zt + 0.3, { t: 'p2', w: 2, inner: lines([seg([2.07, ym - 0.13, zt + 0.3], [2.07, ym + 0.13, zt + 0.3])], 'e3', 0) }),
  });
  // Paquetes esperando junto al cliente
  add('paquetes', box(2.5, 8.9, 0, 3.0, 9.3, 0.36, { t: 'p2', w: 2 }) + box(2.56, 8.95, 0.36, 2.9, 9.24, 0.6, { t: 'p2', w: 2 }));
  clienteEn(k, 1.6, 9.0);

  fachada(k, 3.1, 6.3, 3.0);
  add(
    'cortina',
    box(3.1, 10.98, 2.75, 6.3, 11.25, 3.1, { w: 1, inner: lines(range(2.8, 3.08, 0.045).map((z) => seg([3.14, 11.25, z], [6.26, 11.25, z])), 'e4', 0) }),
    'rise',
  );

  return {
    archivero: 'El archivo de despachos',
    papeles: 'Las guías de envío',
    libreta: 'El libro de guías',
    celular: 'El WhatsApp de despachos',
    caja: 'La caja del despacho',
    aviso: 'El aviso del mostrador',
    cliente: 'Quien envía un paquete',
    entrada: 'El portón de carga',
    equipo: 'Quien despacha',
    monitor: 'La computadora de despacho',
  };
}
