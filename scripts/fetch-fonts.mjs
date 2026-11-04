// Descarga Gambarino desde Fontshare a public/fonts/ antes de compilar.
// La licencia ITF FFL permite servirla desde nuestro sitio, pero no redistribuirla,
// así que el archivo no se guarda en Git (ver .gitignore).
// Si la descarga falla, no rompe la compilación: el CSS cae a una serif del sistema.
import { mkdir, writeFile, access } from 'node:fs/promises';

const OUT_DIR = new URL('../public/fonts/', import.meta.url);
const OUT = new URL('Gambarino-Regular.woff2', OUT_DIR);
const CSS_URL = 'https://api.fontshare.com/v2/css?f[]=gambarino@400&display=swap';

async function main() {
  try {
    await access(OUT);
    console.log('[fuentes] Gambarino ya está en public/fonts/.');
    return;
  } catch {
    // No existe todavía: se descarga.
  }
  try {
    const css = await (await fetch(CSS_URL)).text();
    const match = css.match(/url\(['"]?(\/\/[^'")]+\.woff2|https:[^'")]+\.woff2)['"]?\)/);
    if (!match) throw new Error('no se encontró el woff2 en el CSS de Fontshare');
    const src = match[1].startsWith('//') ? `https:${match[1]}` : match[1];
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(OUT, Buffer.from(await res.arrayBuffer()));
    console.log('[fuentes] Gambarino descargada en public/fonts/.');
  } catch (err) {
    console.warn(`[fuentes] No se pudo descargar Gambarino (${err.message}). Se usará la serif de respaldo.`);
  }
}

await main();
