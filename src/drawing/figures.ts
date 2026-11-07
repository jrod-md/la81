// Figuras en 2D, como las de escala de una lámina de arquitectura.
// Coordenadas locales en px con los pies en (0, 0): una persona mide unos 73 px (1,66 m con S = 44).
// Brazos y piernas son trazos dobles (tinta por fuera, tono por dentro), así se leen como contorno.

type XY = [number, number];

const path = (pts: XY[]) => 'M' + pts.map(([x, y]) => `${x} ${y}`).join('L');
const limb = (pts: XY[], w: number, tone = 'li') =>
  `<path class="lo" stroke-width="${(w + 1.6).toFixed(1)}" d="${path(pts)}"/><path class="${tone}" stroke-width="${w}" d="${path(pts)}"/>`;
const shoe = (x: number) => `<ellipse class="k" cx="${x}" cy="-1.3" rx="3.3" ry="1.6"/>`;
const hand = (x: number, y: number) => `<circle class="p s3" cx="${x}" cy="${y}" r="1.9"/>`;
const neck = (y0: number, y1: number) => limb([[0, y0], [0, y1]], 3.2);
const head = (cy: number, hair: string) => `<circle class="p s2" cx="0" cy="${cy}" r="5.4"/><path class="k" d="${hair}"/>`;

/** Camisa o bata: hombros redondeados que bajan hasta `bottom`. */
const torso = (top: number, bottom: number, half: number, flare: number, cls: string) => {
  const s = top + 0.5;
  return (
    `<path class="${cls} s2" d="M${-half + 0.2} ${s}C${-half - 1.6} ${s + 1.5} ${-half - 1.8} ${s + 6.5} ${-half - 1.4} ${s + 11.5}` +
    `L${-half - flare} ${bottom}L${half + flare} ${bottom}L${half + 1.4} ${s + 11.5}C${half + 1.8} ${s + 6.5} ${half + 1.6} ${s + 1.5} ${half - 0.2} ${s}` +
    `C${half - 3.5} ${s - 2.3} ${-half + 3.5} ${s - 2.3} ${-half + 0.2} ${s}Z"/>`
  );
};

export type Dress = 'bata' | 'delantal' | 'polo' | 'camisa';

const BUN = 'M-5.6 -65.4C-6.6 -72.6 5 -74.2 5.8 -66.4C3.4 -69.6 -2.6 -70 -5.6 -65.4Z';
const SHORT = 'M-5.7 -64.6C-6.6 -73 6.2 -73.6 5.8 -65.4C4.6 -67.4 2 -68.4 -0.6 -68C-2.8 -67.6 -4.6 -66.4 -5.7 -64.6Z';

/** Quien atiende detrás del mostrador, con las manos apoyadas. La ropa cambia según el negocio. */
export function atiende(dress: Dress = 'bata'): string {
  const long = dress === 'bata';
  const shirt = dress === 'polo' ? 'p2' : 'p';
  let clothes = torso(-57, long ? -23 : -31, 9, long ? 2.4 : 0.8, shirt);
  if (dress === 'bata') clothes += `<path class="e3" d="M-3.2 -57.8L0 -48.4L3.2 -57.8M0 -48.4L0.3 -23M-8.8 -37.5H-4.6M4.6 -37.5H8.8M6.2 -40.6V-37.5"/>`;
  if (dress === 'delantal')
    clothes += `<path class="p2 s3" d="M-5.4 -50L5.4 -50L6.6 -24L-6.6 -24Z"/><path class="e3" d="M-5.4 -50L-3.2 -57.6M5.4 -50L3.2 -57.6M-6.4 -36H6.4"/>`;
  if (dress === 'polo') clothes += `<path class="e3" d="M-3.4 -58Q0 -55.6 3.4 -58M0 -55.6V-49"/>`;
  if (dress === 'camisa') clothes += `<path class="e3" d="M-3.2 -57.8L0 -54.4L3.2 -57.8M0 -54.4V-31"/><path class="k" d="M-1 -54.4L1 -54.4L1.4 -44L0 -42.4L-1.4 -44Z"/>`;
  return (
    limb([[-3.4, -34], [-3.6, -18], [-3.9, -2.6]], 6, 'li2') +
    limb([[3.4, -34], [3.8, -18], [4.1, -2.6]], 6, 'li2') +
    shoe(-4.4) +
    shoe(4.6) +
    neck(-61, -57) +
    clothes +
    limb([[-9, -55], [-11.8, -44], [-8.2, -31]], 4.6, dress === 'polo' ? 'li2' : 'li') +
    limb([[9, -55], [11.8, -44], [8.2, -31]], 4.6, dress === 'polo' ? 'li2' : 'li') +
    hand(-7.6, -30.4) +
    hand(7.6, -30.4) +
    head(-65.5, dress === 'bata' || dress === 'delantal' ? BUN : SHORT) +
    (dress === 'bata' || dress === 'delantal' ? `<circle class="k" cx="4.7" cy="-70.4" r="2.7"/>` : '')
  );
}

/** Cliente de espaldas, con guayabera y una bolsa en la mano. */
export function cliente(): string {
  return (
    limb([[-3.6, -34], [-4.4, -18], [-5.3, -2.6]], 6.4, 'li3') +
    limb([[3.6, -34], [4.2, -18], [4.8, -2.6]], 6.4, 'li3') +
    shoe(-5.8) +
    shoe(5.2) +
    neck(-61, -57) +
    torso(-57, -29.5, 9, 1.2, 'p') +
    // Guayabera: alforzas, bolsillos y costura del centro
    `<path class="e3" d="M-6.4 -55.4V-31M-5 -55.8V-31M5 -55.8V-31M6.4 -55.4V-31M-8.8 -40H-3.2M3.2 -40H8.8M-8.4 -51H-3.6M3.6 -51H8.4"/>` +
    `<path class="e4" d="M0 -57.6V-29.5"/>` +
    limb([[-9.2, -55], [-11.2, -44], [-10.6, -33]], 4.6) +
    hand(-10.6, -32.4) +
    limb([[9.2, -55], [11.8, -45], [13.2, -36.5]], 4.6) +
    `<path class="e3" d="M11.4 -35.4Q14 -40.6 16.4 -35.4"/>` +
    `<path class="p2 s2" d="M10.2 -35.4L17.6 -35.4L18.8 -22.4L9.4 -22.4Z"/><path class="e4" d="M10.6 -32.6H17.8"/>` +
    hand(13.6, -36.2) +
    head(-65.5, 'M-5.8 -63.4C-6.8 -72.4 4.8 -74.4 5.8 -67C4.2 -66.4 2.8 -66.8 1.8 -68.4C0 -65.8 -3.2 -63.6 -5.8 -63.4Z')
  );
}

/** Alguien del equipo sentado al escritorio, visto de espaldas. */
export function sentado(): string {
  return (
    neck(-52, -48.5) +
    torso(-49, -19, 8.4, 0.4, 'p2') +
    `<path class="e3" d="M-3.6 -50.2Q0 -47.8 3.6 -50.2M0 -47.8V-41"/>` +
    limb([[-8.8, -47], [-10.8, -37], [-9.6, -28]], 4.4, 'li2') +
    limb([[8.8, -47], [10.8, -37], [9.6, -28]], 4.4, 'li2') +
    `<circle class="p s2" cx="0" cy="-56" r="5.3"/>` +
    `<path class="k" d="M-5.4 -55C-6 -62.8 6 -62.8 5.4 -55C3.6 -52.4 -3.6 -52.4 -5.4 -55Z"/>`
  );
}

/** Alguien del equipo con el brazo en alto: acomodando la góndola o cortando el pelo. */
export function reponedor(hold: 'caja' | 'tijera' = 'caja'): string {
  return (
    limb([[-3.6, -34], [-4.6, -18], [-5.6, -2.6]], 6.4, 'li3') +
    limb([[3.6, -34], [4, -18], [4.4, -2.6]], 6.4, 'li3') +
    shoe(-6.1) +
    shoe(4.8) +
    neck(-61, -57) +
    torso(-57, -31, 9, 0.8, 'p2') +
    `<path class="e3" d="M-3.4 -58Q0 -55.6 3.4 -58M0 -55.6V-49"/>` +
    limb([[9, -55], [10.8, -44], [10.2, -33]], 4.6, 'li2') +
    hand(10.2, -32.4) +
    limb([[-9, -55], [-14.6, -59.4], [-18, -66]], 4.6, 'li2') +
    (hold === 'caja'
      ? `<path class="p s2" d="M-23.6 -73.4H-14.4V-65.8H-23.6Z"/><path class="e4" d="M-23.6 -70.6H-14.4"/>`
      : `<path class="e2" d="M-18.6 -66.6L-24.4 -71.6M-18.2 -67.2L-22.6 -73.4"/><circle class="e3" cx="-17.4" cy="-65.4" r="1.4"/><circle class="e3" cx="-16.6" cy="-67" r="1.4"/>`) +
    hand(-18.2, -66.4) +
    head(-65.5, 'M5.8 -63.4C6.8 -72.4 -4.8 -74.4 -5.8 -67C-4.2 -66.4 -2.8 -66.8 -1.8 -68.4C0 -65.8 3.2 -63.6 5.8 -63.4Z')
  );
}

/** Abanico de pie, girado hacia el mostrador. */
export function abanico(): string {
  let rays = '';
  for (let i = 0; i < 10; i++) {
    const t = (i / 10) * Math.PI * 2;
    rays += `M${(Math.cos(t) * 1.8).toFixed(1)} ${(-52 + Math.sin(t) * 2.5).toFixed(1)}L${(Math.cos(t) * 7.3).toFixed(1)} ${(-52 + Math.sin(t) * 10).toFixed(1)}`;
  }
  return (
    `<ellipse class="p s2" cx="0" cy="0" rx="8" ry="4.2"/>` +
    limb([[0, -1.5], [0, -43]], 2.2, 'li2') +
    `<path class="e3" d="M-2.4 -24H2.4"/>` +
    `<ellipse class="p2 s2" cx="6" cy="-51.4" rx="3.2" ry="4.4"/>` +
    `<ellipse class="p s2" cx="0" cy="-52" rx="7.6" ry="10.4"/>` +
    `<path class="e4" d="${rays}"/>` +
    `<ellipse class="e4" cx="0" cy="-52" rx="4.8" ry="6.6"/>` +
    `<ellipse class="k" cx="0" cy="-52" rx="1.5" ry="2"/>`
  );
}

/** Lengua de suegra en su maceta (la maceta se dibuja aparte, en 3D). */
export function planta(): string {
  const leaves: [number, number, number, number][] = [
    [-3.2, -10.5, -40, 2.8],
    [-1.2, -4.5, -55, 3.2],
    [3.6, 10.5, -42, 2.8],
    [1.4, 3.2, -60, 3.4],
    [0, -0.6, -34, 2.6],
  ];
  return leaves
    .map(([bx, tx, ty, w]) => {
      const mx = bx + (tx - bx) * 0.45;
      const leaf = `M${bx - w} 0Q${(mx - w * 1.1).toFixed(1)} ${(ty * 0.55).toFixed(1)} ${tx} ${ty}Q${(mx + w * 1.1).toFixed(1)} ${(ty * 0.55).toFixed(1)} ${bx + w} 0Z`;
      let bands = '';
      for (const k of [0.25, 0.45, 0.65]) {
        const cx = bx + (tx - bx) * k * 0.9;
        const cy = ty * k;
        const half = w * (1 - k) * 0.9;
        bands += `M${(cx - half).toFixed(1)} ${(cy + 1).toFixed(1)}L${(cx + half).toFixed(1)} ${(cy - 0.6).toFixed(1)}`;
      }
      return `<path class="p2 s2" d="${leaf}"/><path class="e4" d="${bands}"/>`;
    })
    .join('');
}
