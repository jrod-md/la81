// La casa: negocios en línea o desde casa (tienda en línea, freelance, tecnología).
// El negocio vive en la mesa del comedor y en un rincón con cajas de envío; los pedidos salen por la puerta.
import { abanico, planta, reponedor } from './figures';
import { LOT, archivero, baldosas, clienteEn, escritorio, mostrador, murosAltos, seg, suelo, ventanaIzq } from './piezas';
import type { AnchorKey, Kit } from './scene';

export function casa(k: Kit): Partial<Record<AnchorKey, string>> {
  const { ft, add, A, P, at, box, cyl, fill, lines, plane, label, range, ring, ringPath, rnd, shade, shadow, placeShadows } = k;

  suelo(k);
  baldosas(k, 'piso', [0, 0, 7, 9.0], 0.6, 'p');
  // Patio de grama delante de la casa
  let pasto = fill([[0, 9.0, 0], [7, 9.0, 0], [7, 11, 0], [0, 11, 0]], 'p2');
  const tufts: [[number, number, number], [number, number, number]][] = [];
  for (let i = 0; i < 40; i++) {
    const x = 0.1 + rnd() * 6.8;
    const y = 9.1 + rnd() * 1.8;
    tufts.push(seg([x, y, 0], [x - 0.04, y, 0.1]), seg([x + 0.06, y, 0], [x + 0.08, y, 0.12]));
  }
  pasto += lines(tufts, 'e4', 0);
  pasto += fill([[2.95, 9.0, 0], [4.0, 9.0, 0], [4.0, 11, 0], [2.95, 11, 0]], 'p') + lines(range(9.4, 11, 0.4).map((y) => seg([2.95, y, 0], [4.0, y, 0])), 'e4', 0);
  add('patio', pasto, 'fade');
  placeShadows();

  // Muros: ventana con persiana al fondo, foto familiar y número de casa
  let izq = ventanaIzq(k, 4.0, 5.6);
  izq += plane([[0, 7.2, 1.4], [0, 6.6, 1.4], [0, 6.6, 1.85], [0, 7.2, 1.85]], 'p', 'e2') + plane([[0, 7.12, 1.47], [0, 6.68, 1.47], [0, 6.68, 1.78], [0, 7.12, 1.78]], 'p2', 'e4');
  izq += plane([[0, 8.7, 2.2], [0, 8.2, 2.2], [0, 8.2, 2.42], [0, 8.7, 2.42]], 'p', 'e2') + label('12-B', 0, 8.45, 2.25, 'yz', 'tiny', 'middle');
  let fondo = plane([[3.6, 0, 1.1], [4.9, 0, 1.1], [4.9, 0, 2.2], [3.6, 0, 2.2]], 'g', 'e2');
  fondo += lines(range(1.18, 2.2, 0.08).map((z) => seg([3.62, 0, z], [4.88, 0, z])), 'e4', 0);
  fondo += ringPath(ring(5.6, 0, 2.3, 0.16, 'xz'), 'p', 2) + lines([seg([5.6, 0, 2.3], [5.6, 0, 2.41]), seg([5.6, 0, 2.3], [5.68, 0, 2.28])], 'e2', 0);
  murosAltos(k, izq, fondo);

  // Cocina al fondo-izquierda
  add('alacena', box(0.05, 0.05, 1.55, 2.4, 0.4, 2.15, { w: 2, inner: lines([0.8, 1.6].map((x) => seg([x, 0.4, 1.6], [x, 0.4, 2.1])), 'e3', 0) }));
  add(
    'meseta',
    box(0.05, 0.05, 0, 2.4, 0.65, 0.9, { w: 1, inner: lines([0.8, 1.6].map((x) => seg([x, 0.65, 0.08], [x, 0.65, 0.82])), 'e3', 0) }) +
      plane([[0.3, 0.15, 0.9], [0.75, 0.15, 0.9], [0.75, 0.55, 0.9], [0.3, 0.55, 0.9]], 'p3', 'e2') +
      lines([seg([0.52, 0.12, 0.9], [0.52, 0.12, 1.12]), seg([0.52, 0.12, 1.12], [0.52, 0.28, 1.1])], 'e2', 0) +
      cyl(1.9, 0.35, 0.9, 1.1, 0.14, { body: 'p2' }),
  );
  shade(shadow(0.05, 0.05, 2.4, 0.65, 0.9, LOT));
  add('nevera', box(0.05, 0.85, 0, 0.75, 1.55, 1.8, { w: 1, inner: lines([seg([0.75, 0.95, 1.1], [0.75, 1.45, 1.1]), seg([0.75, 1.42, 1.2], [0.75, 1.42, 1.6]), seg([0.75, 1.42, 0.6], [0.75, 1.42, 0.95])], 'e2', 0) }));
  shade(shadow(0.05, 0.85, 0.75, 1.55, 1.8, LOT));
  archivero(k, 0.1, 2.3);

  // Rincón de envíos contra el lado derecho
  add('repisa-postes', [5.9, 6.9].map((x) => box(x - 0.04, 0.4, 0, x + 0.04, 4.6, 1.9, { x: 'p', w: 3 })).join(''));
  [0.05, 0.75, 1.45].forEach((z0, n) => {
    let h = box(5.85, 0.4, z0, 6.95, 4.6, z0 + 0.04, { x: 'p', w: 2 });
    let y = 0.5;
    while (y < 4.4) {
      const d = 0.35 + rnd() * 0.4;
      const hh = 0.2 + rnd() * 0.35;
      if (y + d > 4.55) break;
      h += box(6.0, y, z0 + 0.04, 6.8, y + d, z0 + 0.04 + hh, {
        t: 'p2',
        w: 2,
        inner: plane([[6.8, y + 0.06, z0 + 0.08], [6.8, y + 0.22, z0 + 0.08], [6.8, y + 0.22, z0 + 0.16], [6.8, y + 0.06, z0 + 0.16]], 'p', 'e4', 0),
      });
      y += d + 0.05;
    }
    add(`envios-${n}`, h);
  });
  shade(shadow(5.85, 0.4, 6.95, 4.6, 1.9, LOT));
  if (ft.equipo >= 3) add('persona-sala', at(5.3, 3.1, 0, reponedor('caja'), [-25, -75, 13, 0]));

  // Comedor que es la oficina: mesa con laptop, pedidos, taza e impresora de etiquetas
  const silla = (x: number, y: number) => box(x, y, 0.42, x + 0.42, y + 0.42, 0.46, { t: 'p2', w: 2 }) + lines([seg([x + 0.05, y + 0.37, 0], [x + 0.05, y + 0.37, 0.42]), seg([x + 0.37, y + 0.37, 0], [x + 0.37, y + 0.37, 0.42])], 'e3', 0);
  add('silla-comedor-a', silla(2.0, 2.9) + silla(4.95, 2.9));
  escritorio(k, 2.6, 2.6, 2.2);
  add(
    'mesa-cosas',
    cyl(2.95, 3.05, 0.77, 0.88, 0.05, { w: 2 }) + box(3.4, 2.75, 0.77, 3.75, 3.0, 0.9, { t: 'p2', w: 2, inner: lines([seg([3.45, 3.0, 0.85], [3.7, 3.0, 0.85])], 'e3', 0) }),
  );

  // Sala: sofá, mesa de centro, televisor, planta y abanico
  add('sofa', box(0.1, 4.8, 0, 0.9, 6.8, 0.42, { t: 'p2', w: 2 }) + box(0.1, 4.8, 0.42, 0.28, 6.8, 0.95, { t: 'p2', x: 'p', w: 2 }) + box(0.28, 4.95, 0.42, 0.85, 5.8, 0.55, { t: 'p', w: 3 }) + box(0.28, 5.85, 0.42, 0.85, 6.65, 0.55, { t: 'p', w: 3 }));
  shade(shadow(0.1, 4.8, 0.9, 6.8, 0.95, LOT));
  add('mesa-centro', box(1.4, 5.3, 0.36, 2.2, 6.3, 0.4, { w: 1 }) + lines([seg([1.45, 6.25, 0], [1.45, 6.25, 0.36]), seg([2.15, 6.25, 0], [2.15, 6.25, 0.36])], 'e2', 0));
  add('tv', box(3.0, 5.0, 0, 3.4, 6.6, 0.5, { w: 1 }) + box(3.1, 5.2, 0.5, 3.18, 6.4, 1.25, { t: 'k', x: 'k', y: 'p3', w: 1 }));
  add('abanico', at(4.8, 6.9, 0, abanico(), [-8, -63, 8, 0]));
  add('maceta', cyl(6.4, 7.8, 0, 0.36, 0.2, { body: 'p2' }) + at(6.4, 7.8, 0.36, planta(), [-14, -62, 14, 0]));

  // Mesita junto a la puerta: el cuaderno de pedidos, el cobro y el aviso
  mostrador(k, { r: [0.5, 7.9, 3.0, 8.4], alto: 0.8, ropa: 'camisa' });

  // Frente de la casa con la puerta abierta
  add('muro-der', box(7, -0.22, 0, 7.22, 9.0, 0.4, { t: 'k', w: 1 }), 'rise');
  add('muro-frente-a', box(-0.22, 9.0, 0, 3.0, 9.2, 0.4, { t: 'k', w: 1 }), 'rise');
  add('muro-frente-b', box(4.0, 9.0, 0, 7.22, 9.2, 0.4, { t: 'k', w: 1 }), 'rise');
  add('marco-a', box(2.95, 9.0, 0, 3.07, 9.2, 2.1, { w: 1 }), 'rise');
  add('marco-b', box(3.93, 9.0, 0, 4.05, 9.2, 2.1, { w: 1 }), 'rise');
  add('dintel', box(2.95, 9.0, 2.0, 4.05, 9.2, 2.1, { w: 1 }), 'rise');
  add('puerta', plane([[3.07, 9.1, 0], [3.07, 8.35, 0], [3.07, 8.35, 2.0], [3.07, 9.1, 2.0]], 'p2', 'e2'), 'rise');
  if (ft.camaras) add('camara', box(4.05, 9.02, 1.8, 4.22, 9.14, 1.94, { t: 'p3', x: 'k', y: 'p3', w: 2 }), 'rise');
  A.entrada = P(3.5, 9.1, 2.1);

  // El mensajero recoge el pedido en el patio
  clienteEn(k, 3.6, 9.9);
  add('pedido', box(3.95, 9.7, 0, 4.35, 10.05, 0.3, { t: 'p2', w: 2, inner: lines([seg([4.15, 9.7, 0.3], [4.15, 10.05, 0.3])], 'e3', 0) }));

  // Reja baja del frente con su portoncito
  const reja = (x0: number, x1: number) => lines(range(x0, x1 + 0.01, 0.15).map((x) => seg([x, 11.05, 0], [x, 11.05, 0.9])), 'e3', 0) + lines([seg([x0, 11.05, 0.9], [x1, 11.05, 0.9]), seg([x0, 11.05, 0.1], [x1, 11.05, 0.1])], 'e2', 0);
  add('reja', reja(-0.5, 2.8) + reja(4.2, 7.7), 'rise');

  return {
    archivero: 'Las gavetas de la casa',
    papeles: 'Los pedidos impresos',
    libreta: 'El cuaderno de pedidos',
    celular: 'El WhatsApp de ventas',
    caja: 'El cobro por Yappy',
    aviso: 'El aviso de los pedidos',
    cliente: 'El mensajero',
    entrada: 'La puerta de la casa',
    equipo: 'Quien atiende los pedidos',
    monitor: 'La laptop',
  };
}
