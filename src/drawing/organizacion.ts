// El salón comunal: organizaciones (asociación, iglesia, cooperativa, fundación, PH).
// Estrado al fondo, filas de sillas, la secretaría a un lado y la mesa de inscripción en la entrada.
import { reponedor, sentado } from './figures';
import { LOT, archivero, baldosas, clienteEn, escritorio, fachada, letrero, mostrador, murosAltos, seg, suelo, ventanaIzq } from './piezas';
import type { AnchorKey, Kit } from './scene';

export function organizacion(k: Kit): Partial<Record<AnchorKey, string>> {
  const { ft, add, at, box, cyl, lines, plane, label, range, rnd, shade, shadow, placeShadows, grain } = k;

  suelo(k);
  baldosas(k, 'piso', [0, 0, 7, 11], 0.8, 'p');
  placeShadows();

  // Muro izquierdo: ventanas altas, letrero y tablero de anuncios
  let izq = ventanaIzq(k, 0.8, 2.6, 1.7, 2.6) + ventanaIzq(k, 6.0, 7.8, 1.7, 2.6);
  izq += letrero(k, 'SEDE', 3.4, 5.4);
  izq += plane([[0, 10.2, 0.95], [0, 8.6, 0.95], [0, 8.6, 1.9], [0, 10.2, 1.9]], 'p3', 'e2');
  for (const [y, z] of [[8.75, 1.4], [9.2, 1.05], [9.5, 1.5], [9.85, 1.1]] as [number, number][]) {
    izq += plane([[0, y + 0.3, z], [0, y, z], [0, y, z + 0.36], [0, y + 0.3, z + 0.36]], 'p', 'e3');
    izq += lines(range(z + 0.06, z + 0.3, 0.06).map((zz) => seg([0, y + 0.04, zz], [0, y + 0.25, zz])), 'e4', 0);
  }
  // Muro del fondo: pancarta y banderines
  let fondo = plane([[1.8, 0, 1.95], [5.2, 0, 1.95], [5.2, 0, 2.5], [1.8, 0, 2.5]], 'p2', 'e2');
  fondo += label('ASAMBLEA GENERAL', 3.5, 0, 2.15, 'xz', 'tiny', 'middle');
  for (let i = 0; i < 9; i++) {
    const x = 0.6 + i * 0.7;
    fondo += plane([[x, 0, 2.85], [x + 0.35, 0, 2.85], [x + 0.175, 0, 2.6]], i % 2 ? 'p2' : 'p3', 'e3');
  }
  fondo += lines([seg([0.4, 0, 2.88], [6.9, 0, 2.86])], 'e3', 0);
  murosAltos(k, izq, fondo);

  // Estrado con la mesa directiva y el podio
  add('estrado', box(1.4, 0.2, 0, 5.4, 1.6, 0.3, { t: 'p2', w: 1, inner: lines(range(1.8, 5.4, 0.4).map((x) => seg([x, 1.6, 0.03], [x, 1.6, 0.27])), 'e4', 0) }));
  shade(shadow(1.4, 0.2, 5.4, 1.6, 0.3, LOT));
  add('sillas-mesa', [2.3, 3.2, 4.1].map((x) => box(x, 0.3, 0.72, x + 0.4, 0.38, 1.2, { t: 'p2', w: 2 })).join(''));
  add(
    'mesa-directiva',
    box(2.0, 0.45, 1.02, 4.9, 1.0, 1.06, { w: 1 }) +
      plane([[2.0, 1.0, 1.06], [4.9, 1.0, 1.06], [4.9, 1.0, 0.45], [2.0, 1.0, 0.45]], 'p', 'e2') +
      lines(range(2.2, 4.9, 0.25).map((x) => seg([x, 1.0, 1.0], [x + 0.05, 1.0, 0.5])), 'e4', 0) +
      cyl(2.4, 0.7, 1.06, 1.2, 0.05, { w: 3 }) + cyl(3.6, 0.7, 1.06, 1.2, 0.05, { w: 3 }),
  );
  add(
    'podio',
    box(3.25, 1.15, 0.3, 3.85, 1.5, 1.35, { y: 'p2', w: 1, inner: grain(3.25, 1.15, 3.85, 1.5, 1.35, 3) }) +
      lines([seg([3.55, 1.25, 1.35], [3.45, 1.35, 1.7])], 'e2', 0) +
      cyl(3.45, 1.35, 1.7, 1.78, 0.04, { body: 'k', top: 'k', w: 3 }),
  );

  // Secretaría a la derecha del estrado
  escritorio(k, 5.85, 2.0, 1.05);
  archivero(k, 6.3, 3.75);
  add('tabique-secretaria', box(5.6, 1.8, 0, 5.72, 4.6, 0.9, { t: 'k', w: 1 }) + box(5.6, 4.5, 0, 7, 4.62, 0.9, { t: 'k', w: 1 }), 'rise');

  // Filas de sillas plegables frente al estrado, con algunos socios sentados
  const sentados = new Set(['0-1', '1-3', '2-0', '2-2']);
  [2.3, 3.2, 4.1, 5.0].forEach((y, r) => {
    [1.2, 2.0, 2.8, 3.6, 4.4].forEach((x, c) => {
      const id = `silla-${r}-${c}`;
      add(id, lines([seg([x + 0.05, y + 0.05, 0], [x + 0.37, y + 0.4, 0.42]), seg([x + 0.37, y + 0.05, 0], [x + 0.05, y + 0.4, 0.42])], 'e3', 0) + box(x, y, 0.42, x + 0.42, y + 0.42, 0.45, { t: 'p2', w: 2 }));
      if (sentados.has(`${r}-${c}`)) add(`socio-${r}-${c}`, at(x + 0.21, y + 0.21, 0, sentado(), [-13, -63, 13, 0]));
      add(`${id}-respaldo`, plane([[x, y + 0.42, 0.5], [x + 0.42, y + 0.42, 0.5], [x + 0.42, y + 0.42, 0.88], [x, y + 0.42, 0.88]], 'p2', 'e2'));
    });
  });
  shade(shadow(1.2, 2.3, 4.82, 5.42, 0.6, LOT));

  // Ventiladores de techo
  for (const [i, [cx, cy]] of ([[2.6, 3.4], [4.6, 7.0]] as [number, number][]).entries()) {
    let aspas = lines([seg([cx, cy, 3.0], [cx, cy, 2.65])], 'e2', 0);
    for (let n = 0; n < 4; n++) {
      const a = (n / 4) * Math.PI * 2 + 0.3;
      const c = Math.cos(a);
      const s = Math.sin(a);
      aspas += plane([[cx + c * 0.1 - s * 0.08, cy + s * 0.1 + c * 0.08, 2.62], [cx + c * 0.6 - s * 0.08, cy + s * 0.6 + c * 0.08, 2.62], [cx + c * 0.6 + s * 0.08, cy + s * 0.6 - c * 0.08, 2.62], [cx + c * 0.1 + s * 0.08, cy + s * 0.1 - c * 0.08, 2.62]], 'p2', 'e3');
    }
    add(`ventilador-${i}`, aspas + cyl(cx, cy, 2.58, 2.66, 0.07, { w: 3, shade: false }));
  }
  if (ft.equipo >= 3) add('persona-sala', at(6.2, 6.4, 0, reponedor('caja'), [-25, -75, 13, 0]));

  // Café en la esquina
  let vasos = '';
  for (let i = 0; i < 4; i++) vasos += cyl(6.0 + i * 0.15, 9.45 + (i % 2) * 0.12, 0.78, 0.88, 0.04, { w: 3, shade: false });
  add(
    'cafe',
    box(5.4, 9.2, 0.74, 6.8, 9.8, 0.78, { w: 1 }) +
      lines([seg([5.45, 9.75, 0], [5.45, 9.75, 0.74]), seg([6.75, 9.75, 0], [6.75, 9.75, 0.74])], 'e2', 0) +
      cyl(5.65, 9.45, 0.78, 1.15, 0.1, { body: 'p2' }) +
      vasos +
      box(6.5, 9.3, 0.78, 6.72, 9.55, 0.82, { t: 'p3', w: 3 }),
  );
  shade(shadow(5.4, 9.2, 6.8, 9.8, 0.78, LOT));

  // Mesa de inscripción con la lista, las cuotas y los gafetes
  let gafetes = '';
  for (let i = 0; i < 3; i++) {
    const x = 1.75 + i * 0.12 + rnd() * 0.02;
    gafetes += box(x, 8.0, 0.85, x + 0.1, 8.14, 0.86, { w: 3 });
  }
  mostrador(k, { r: [0.5, 7.8, 3.3, 8.4], alto: 0.8, ropa: 'camisa', rotulo: 'INSCRIPCIÓN', encima: gafetes });
  clienteEn(k, 1.9, 9.3);

  fachada(k, 2.7, 4.7, 2.5);

  return {
    archivero: 'El archivo de actas',
    papeles: 'Las actas y la lista de socios',
    libreta: 'La lista de asistencia',
    celular: 'El WhatsApp del grupo',
    caja: 'Las cuotas',
    aviso: 'El aviso de la inscripción',
    cliente: 'Un socio que firma',
    entrada: 'La entrada del salón',
    equipo: 'Quien inscribe',
    monitor: 'La computadora de la secretaría',
  };
}
