# DESIGN.md: La 81

## Idea central: «Anatomía de tu negocio»

La 81 se ve como una revista. Su pieza principal es una **ilustración axonométrica anotada** del negocio del usuario, al estilo de las láminas de arquitectura o de las infografías tipo "anatomía de...".

- Cada uno de los 8 puntos numerados está en el lugar físico donde de verdad viven los datos:

  | Punto | Área | Lugar |
  |---|---|---|
  | 1 | Conoce tus datos | Archivero |
  | 2 | Permiso y base legal | Celular del mostrador |
  | 3 | Avisar con claridad | Aviso junto a la caja |
  | 4 | Derechos de las personas | Cliente en el mostrador |
  | 5 | Seguridad del día a día | Computadora de la trastienda |
  | 6 | Proveedores y nube | Nube, contador y delivery, fuera del local |
  | 7 | Si algo sale mal | Entrada con cortina metálica |
  | 8 | Tu equipo | Quien atiende |

- **El dibujo se arma con tus respuestas del perfil.** Si no usas cámaras, la cámara no aparece; sin delivery, no hay moto en la acera. Lo que sale del local se dibuja con líneas punteadas rotuladas.
- **Mientras respondes, la cámara viaja** (con animación del `viewBox`) al objeto de la pregunta. El punto del área activa gira y los respondidos toman su color.
- El resultado es tu negocio completo, con cada punto marcado.

Rechazado (versión 1): un tema crema genérico con tarjetas y barras, que se veía hecho por IA. Las 4 primeras maquetas del mapa se descartaron por ser esquemáticas y sin lógica.

## Escena

Una dueña de farmacia en David lo abre en el celular en una pausa, bajo luz fluorescente. El contador lo abre en la laptop al final del día. Ninguno sabe de leyes. Debe sentirse como hojear una revista bien hecha sobre su propio negocio: con calma, sin regaños y sin alarma.

→ **Tema claro**, papel blanco neutro (no crema), tinta casi negra.

## Color

El color solo significa algo:

- **Base:** papel `oklch(0.972 0.004 85)`, tinta `oklch(0.2 0.01 60)`, tinta secundaria `oklch(0.46 0.01 60)` y filetes `oklch(0.82 0.006 60)`.
- **Dibujo:** grises cálidos para las caras (superior, lateral y frontal) y materiales sobrios (madera, cartón, vidrio). Los cortes de muro van en tinta sólida, como en los planos de arquitectura.
- **Estados** (los únicos colores con significado, siempre acompañados de forma y texto):
  - Bien encaminado ● `oklch(0.56 0.12 152)`
  - Puede mejorar ◐ `oklch(0.74 0.15 74)`
  - Atender pronto ○ `oklch(0.57 0.19 32)`, con un pulso suave
- **Resaltado:** amarillo marcatextos `oklch(0.93 0.09 98)` al pasar el mouse por una nota o un punto.

## Tipografía

- **Títulos:** Gambarino (Fontshare, licencia ITF FFL). Se sirve desde el propio sitio. El archivo no se guarda en Git, porque la licencia prohíbe redistribuirlo: `scripts/fetch-fonts.mjs` lo descarga antes de `dev` y `build`. Si falla, se usa Georgia.
- **Texto:** Hanken Grotesk variable (`@fontsource-variable/hanken-grotesk`, licencia OFL), empaquetada en el sitio.
- Ninguna visita pide fuentes a terceros.
- **Escala:**
  - Titular de portada: `clamp(3.4rem, 10.5vw, 10.5rem)`.
  - Preguntas: `clamp(1.6rem, 2.6vw, 2.25rem)`.
  - Cuerpo: 1.0625rem.
  - Rótulos: versalitas de 0.75rem con tracking de 0.12–0.14em.

## Composición

- **Cabecera:** número de edición, logotipo centrado y navegación.
- **Rótulos:** filetes de 1px separan las secciones, como en una maqueta de revista.
- **Pies de figura:** «Fig. 1», «Fig. 2.3».
- **Respuestas:** renglones con a., b., c., separados por filetes. No son tarjetas ni botones redondeados.
- **Escritorio:** lámina a la izquierda y columna de notas o la pregunta al costado. En la pregunta, la lámina queda fija mientras haces scroll.
- **Celular:** la lámina va arriba y el texto debajo. Tocar un punto acerca el dibujo.

## Flujo

1. **Inicio:** portada con la lámina de ejemplo (una farmacia de barrio), que se dibuja sola, y las 8 notas.
2. **Perfil:** 5 preguntas. A la derecha, tu dibujo se arma en vivo con cada respuesta.
3. **Cuestionario:** una situación por pantalla. La lámina hace zoom al lugar del área.
4. **Resultados:** titular, lámina completa con tus estados, notas por área, plan de acción, fortalezas, PDF y borrar datos.
5. **Reporte (impresión):** la lámina, el perfil, el plan con sus fuentes y el aviso legal.

## Movimiento

- **Al entrar:**
  - los muros suben;
  - los muebles caen escalonados (26ms entre uno y otro);
  - las líneas de llamada se trazan;
  - los puntos aparecen.
- **Cámara:** 1.1s con ease-out-quart.
- **Flujos:** guiones que avanzan despacio.
- Sin rebotes. Con `prefers-reduced-motion`, todo aparece en su estado final.

## Accesibilidad

- `fieldset` y `legend` en cada pregunta, con controles nativos.
- El foco va al título al cambiar de pantalla.
- Los puntos del dibujo son botones con nombre accesible. Toda la información del dibujo está repetida en texto (las notas).
- Contraste AA. Objetivos táctiles de 44px o más. Se puede usar de principio a fin con teclado.
