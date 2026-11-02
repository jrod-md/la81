# La 81

**Autoevaluación de protección de datos para PyMEs · Ley 81 de 2019, Panamá**

Herramienta web gratuita para que dueños de micro y pequeñas empresas, sin conocimientos técnicos ni legales, vean de forma visual cómo manejan los datos personales de sus clientes y empleados. Como resultado obtienen un plan de acción priorizado, con el artículo de la ley que respalda cada recomendación.

> **Estado:** en desarrollo. Ya existen el contenido (banco de preguntas), el motor de puntaje y el guardado local, todos con tests. La interfaz está en construcción.

## Por qué

La Ley 81 de 2019 y su reglamento (Decreto Ejecutivo 285 de 2021) aplican a cualquier negocio que guarde datos personales: una lista de clientes en Excel, la planilla, las fotos de cédulas en WhatsApp. La mayoría de las PyMEs no puede pagar una consultoría o una auditoría para saber dónde está parada. La 81 busca cerrar esa brecha con una autoevaluación clara y sin tecnicismos.

## Principios

- **Privacidad desde el diseño.** Todo corre en el navegador: las respuestas nunca salen del dispositivo y no hay backend ni analítica sobre ellas.
- **Cada recomendación cita su fuente.** Ninguna pregunta existe sin una referencia a la Ley 81, al DE 285 o a la guía oficial de la ANTAI. Un test lo verifica.
- **Orientar, no asustar.** Los resultados usan tres niveles: *Buena práctica*, *Puedes mejorar esto* y *Te recomendamos atender esto pronto*. Nunca dicen "seguro" ni "inseguro".
- **Adaptado al negocio.** Un perfil inicial corto muestra solo las preguntas que aplican: datos de salud, menores, cámaras, tienda en línea, proveedores, nube.

## Cómo funciona

1. **Perfil:** tamaño del negocio, de quiénes guarda datos, por dónde le llegan, dónde los guarda y quién más los maneja.
2. **Cuestionario:** 39 situaciones en 8 áreas: conoce tus datos, permiso y base legal, avisar con claridad, derechos de las personas, seguridad del día a día, proveedores y nube, incidentes, y equipo.
3. **Resultados:** puntaje por área (ponderado por importancia), fortalezas y un plan de acción ordenado por urgencia, importancia y esfuerzo.
4. **Reporte:** exportable a PDF desde el navegador.

## Stack

- Vite + React + TypeScript (modo estricto)
- Vitest
- Sitio estático (destino: Cloudflare Pages)

## Estructura

```
src/
  content/   Banco de preguntas, perfil y áreas (con referencias legales)
  engine/    Funciones puras: visibilidad, puntaje, prioridades, guardado local
docs/
  fuentes/   Textos oficiales: Ley 81, DE 285, guía ANTAI (PDF + texto extraído)
PRODUCT.md   Decisiones de producto: público, alcance, tono, privacidad
```

## Desarrollo

```bash
npm install
npm run dev        # servidor local
npm test           # tests
npm run typecheck  # chequeo de tipos
npm run build      # build de producción
```

Requiere Node.js 22 o superior.

## Fuentes

- Ley 81 de 26 de marzo de 2019, sobre Protección de Datos Personales (G.O. 28743-A).
- Decreto Ejecutivo 285 de 28 de mayo de 2021, que la reglamenta (G.O. 29296-A).
- ANTAI, *Guía para cumplir la normativa sobre protección de datos personales: sector privado* (junio 2023).

## Aviso

La 81 es una **autoevaluación orientativa**. No es asesoría legal ni una auditoría, y no certifica el cumplimiento de la ley. Para casos concretos, consulta a un abogado o a un profesional de seguridad.

## Licencia

El código está bajo licencia [MIT](LICENSE). Los documentos de `docs/fuentes/` son publicaciones oficiales de la República de Panamá y se incluyen solo como referencia.
