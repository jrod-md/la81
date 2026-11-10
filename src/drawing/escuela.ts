// La escuela: educación y cuidado (escuela, academia, guardería, tutorías).
// Un aula con pizarra y pupitres al fondo; adelante, la secretaría donde se matricula.
import { atiende } from './figures';
import { LOT, archivero, baldosas, clienteEn, escritorio, fachada, letrero, mostrador, murosAltos, seg, suelo, ventanaIzq } from './piezas';
import type { AnchorKey, Kit } from './scene';

/** Niño con mochila, de unos 1,1 m (el pie en 0,0). */
export function nino(): string {
  const leg = (x0: number, x1: number) => `<path class="lo" stroke-width="5" d="M${x0} -21L${x1} -2"/><path class="li3" stroke-width="3.4" d="M${x0} -21L${x1} -2"/>`;
  return (
    leg(-2.2, -2.8) +
    leg(2.2, 2.6) +
    `<ellipse class="k" cx="-3.2" cy="-1.1" rx="2.6" ry="1.3"/><ellipse class="k" cx="3" cy="-1.1" rx="2.6" ry="1.3"/>` +
    `<path class="p3 s2" d="M4 -37H10.5V-24H4Z"/><path class="e4" d="M4 -31H10.5"/>` +
    `<path class="p2 s2" d="M-6 -38C-6.6 -33 -6.4 -26 -6 -20H6C6.4 -26 6.6 -33 6 -38C3 -40 -3 -40 -6 -38Z"/>` +
    `<path class="e3" d="M-3 -38L4.4 -24M3 -38L5 -36"/>` +
    `<path class="lo" stroke-width="4" d="M-6 -36L-8 -27"/><path class="li" stroke-width="2.6" d="M-6 -36L-8 -27"/>` +
    `<circle class="p s2" cx="0" cy="-44" r="4.6"/>` +
    `<path class="k" d="M-4.7 -43.4C-5.4 -50.6 5.2 -51 4.8 -44C3.4 -46.4 -1.4 -46.6 -4.7 -43.4Z"/>`
  );
}

export function escuela(k: Kit): Partial<Record<AnchorKey, string>> {
  const { ft, add, at, box, cyl, lines, loop, plane, label, range, ring, ringPath, rnd, shade, shadow, placeShadows } = k;

  suelo(k);
  baldosas(k, 'piso', [0, 0, 7, 6.6], 1.0, 'p');
  baldosas(k, 'piso-secretaria', [0, 6.75, 7, 11], 0.5, 'p2');
  placeShadows();

  // Muro izquierdo: ventana, mural de dibujos, letrero y tablero de anuncios
  let izq = ventanaIzq(k, 0.9, 2.5);
  for (let i = 0; i < 6; i++) {
    const y0 = 3.0 + (i % 3) * 0.62;
    const z0 = i < 3 ? 1.55 : 1.0;
    izq += plane([[0, y0 + 0.5, z0], [0, y0, z0], [0, y0, z0 + 0.42], [0, y0 + 0.5, z0 + 0.42]], i % 2 ? 'p2' : 'p', 'e3');
    izq += lines([seg([0, y0 + 0.08, z0 + 0.1], [0, y0 + 0.25, z0 + 0.32]), seg([0, y0 + 0.25, z0 + 0.32], [0, y0 + 0.42, z0 + 0.12])], 'e3', 0);
    izq += loop(ring(0, y0 + 0.36, z0 + 0.3, 0.06, 'yz', 10), 'e3', 0);
  }
  izq += letrero(k, 'ESCUELA', 7.0, 9.2);
  izq += plane([[0, 10.6, 1.0], [0, 9.5, 1.0], [0, 9.5, 1.8], [0, 10.6, 1.8]], 'p3', 'e2');
  for (const [y, z] of [[9.6, 1.45], [9.95, 1.1], [10.2, 1.4]] as [number, number][]) {
    izq += plane([[0, y + 0.3, z], [0, y, z], [0, y, z + 0.3], [0, y + 0.3, z + 0.3]], 'p', 'e3');
    izq += lines(range(z + 0.06, z + 0.25, 0.06).map((zz) => seg([0, y + 0.04, zz], [0, y + 0.24, zz])), 'e4', 0);
  }

  // Muro del fondo: pizarra con tiza, abecedario y reloj
  let fondo = plane([[1.8, 0, 1.0], [5.6, 0, 1.0], [5.6, 0, 2.2], [1.8, 0, 2.2]], 'k', 'e1');
  fondo += box(1.75, 0, 0.94, 5.65, 0.1, 1.0, { w: 3, x: 'p' });
  fondo += label('ABC', 2.4, 0, 1.8, 'xz', 'chalk', 'middle');
  fondo += label('2 + 3 = 5', 3.6, 0, 1.8, 'xz', 'chalk', 'middle');
  fondo += label('Lunes 10 de noviembre', 2.0, 0, 1.4, 'xz', 'chalk-s', 'start');
  fondo += label('Tarea: leer pág. 12', 2.0, 0, 1.2, 'xz', 'chalk-s', 'start');
  const abc = 'ABCDEFGHIJ';
  for (let i = 0; i < abc.length; i++) {
    const x = 1.85 + i * 0.38;
    fondo += plane([[x, 0, 2.35], [x + 0.3, 0, 2.35], [x + 0.3, 0, 2.65], [x, 0, 2.65]], 'p', 'e3');
    fondo += label(abc[i]!, x + 0.15, 0, 2.44, 'xz', 'tiny', 'middle');
  }
  fondo += ringPath(ring(6.2, 0, 2.3, 0.18, 'xz'), 'p', 2) + lines([seg([6.2, 0, 2.3], [6.2, 0, 2.42]), seg([6.2, 0, 2.3], [6.29, 0, 2.27])], 'e2', 0);
  murosAltos(k, izq, fondo);

  // Estante de libros contra el muro izquierdo
  let libros = '';
  for (const z0 of [0.05, 0.6, 1.15]) {
    let y = 0.95;
    while (y < 2.85) {
      const d = 0.06 + rnd() * 0.06;
      const h = 0.28 + rnd() * 0.18;
      libros += box(0.08, y, z0 + 0.04, 0.4, y + d, z0 + 0.04 + h, { t: 'p2', y: rnd() < 0.3 ? 'p3' : 'p', x: 'p', w: 3 });
      y += d + 0.01;
    }
  }
  add('estante', box(0.04, 0.9, 0, 0.44, 2.95, 1.65, { x: 'p', w: 2 }) + libros);
  shade(shadow(0.04, 0.9, 0.44, 2.95, 1.65, LOT));

  // Escritorio de la maestra, frente a la pizarra
  escritorio(k, 4.6, 0.55, 1.6);

  // Pupitres en tres filas, con algunos niños
  const ninos = new Set(['1-0', '2-1', '0-2']);
  [2.6, 3.8, 5.0].forEach((y, r) => {
    [1.3, 2.8, 4.3].forEach((x, c) => {
      const id = `pupitre-${r}-${c}`;
      let h = lines([seg([x + 0.05, y + 0.05, 0], [x + 0.05, y + 0.05, 0.62]), seg([x + 0.85, y + 0.05, 0], [x + 0.85, y + 0.05, 0.62])], 'e2', 0);
      h += box(x, y, 0.62, x + 0.9, y + 0.5, 0.66, { y: 'p2', w: 2 });
      if ((r + c) % 2 === 0) h += box(x + 0.2, y + 0.12, 0.66, x + 0.5, y + 0.38, 0.68, { w: 3, t: 'p2' });
      h += box(x + 0.25, y + 0.65, 0.36, x + 0.65, y + 1.0, 0.4, { t: 'p2', w: 2 }) + lines([seg([x + 0.3, y + 0.95, 0], [x + 0.3, y + 0.95, 0.36]), seg([x + 0.6, y + 0.95, 0], [x + 0.6, y + 0.95, 0.36])], 'e3', 0);
      add(id, h);
      shade(shadow(x, y, x + 0.9, y + 1.0, 0.66, LOT));
      if (ninos.has(`${r}-${c}`)) add(`nino-${r}-${c}`, at(x + 0.45, y + 0.85, 0, nino(), [-10, -50, 12, 0]));
      add(`${id}-respaldo`, box(x + 0.25, y + 0.98, 0.4, x + 0.65, y + 1.03, 0.72, { t: 'p2', y: 'p2', w: 2 }));
    });
  });
  // Cubetas de colores y mochilas en el piso
  add('cubetas', [5.9, 6.3].map((x, i) => box(x, 5.6, 0, x + 0.34, 5.9, 0.24, { t: i ? 'p3' : 'p2', w: 2 })).join(''));
  if (ft.equipo >= 3) add('persona-sala', at(3.4, 1.7, 0, atiende('camisa'), [-14, -75, 14, 0]));

  // Tabique con puerta entre el aula y la secretaría
  add('tabique-a', box(0, 6.6, 0, 3.0, 6.75, 0.9, { t: 'k', w: 1 }), 'rise');
  add('tabique-b', box(4.0, 6.6, 0, 7, 6.75, 0.9, { t: 'k', w: 1 }), 'rise');

  // Secretaría
  archivero(k, 0.1, 7.0);
  add(
    'banca',
    lines([[5.05, 10.3], [6.55, 10.3], [6.55, 9.95]].map(([x, y]) => seg([x!, y!, 0], [x!, y!, 0.42])), 'e2', 0) +
      box(5.0, 9.9, 0.42, 6.6, 10.35, 0.47, { w: 1 }) +
      box(5.0, 10.35, 0.47, 6.6, 10.41, 0.9, { w: 2 }),
  );
  shade(shadow(5.0, 9.9, 6.6, 10.41, 0.9, LOT));
  mostrador(k, { r: [1.2, 7.9, 4.2, 8.5], ropa: 'camisa', rotulo: 'MATRÍCULA' });
  clienteEn(k, 2.5, 9.5);
  add('nino-cliente', at(3.1, 9.7, 0, nino(), [-10, -50, 12, 0]));
  shade(shadow(3.0, 9.6, 3.2, 9.8, 1.1, LOT));

  fachada(k);
  // Asta de bandera en la acera
  add('bandera', lines([seg([5.8, 11.7, 0], [5.8, 11.7, 3.2])], 'e1', 0) + plane([[5.8, 11.7, 3.15], [6.6, 11.7, 3.05], [6.6, 11.7, 2.65], [5.8, 11.7, 2.75]], 'p2', 'e2') + cyl(5.8, 11.7, 0, 0.12, 0.14, { w: 2 }), 'rise');

  return {
    archivero: 'Los expedientes',
    papeles: 'La lista de asistencia',
    libreta: 'El libro de matrícula',
    celular: 'El WhatsApp de los padres',
    caja: 'El cobro de mensualidades',
    aviso: 'El aviso de la secretaría',
    cliente: 'Una mamá que matricula',
    entrada: 'La entrada de la escuela',
    equipo: 'La secretaria',
    monitor: 'La computadora de la maestra',
  };
}
