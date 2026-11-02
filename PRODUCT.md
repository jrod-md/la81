# Radar 81 (nombre provisional)

Autoevaluación gratuita y visual para que micro y pequeñas empresas de Panamá vean qué tan bien manejan los datos personales según la **Ley 81 de 2019** y su reglamento, el **Decreto Ejecutivo 285 de 2021**.

## Para quién

- **Principal:** dueño o administrador de una micro o pequeña empresa, **sin conocimientos técnicos ni legales**. Ejemplos: farmacia, clínica dental, tienda con delivery, contador independiente, academia, taller.
- **Secundario:** quien sabe un poco más (encargado de TI, administrador). Ve detalle opcional: el artículo exacto y la explicación técnica.
- **Fuera de alcance en v1:** empleados que quieran evaluar a su empresa, y modo consultor/abogado (varios clientes). Se puede considerar después.

## Qué resuelve

1. Explicar en lenguaje sencillo qué pide la ley, con situaciones del día a día.
2. Mostrar de forma visual dónde la empresa tiene buenas prácticas y dónde puede mejorar.
3. Dar un plan de acción priorizado: primero lo urgente y lo rápido de arreglar.
4. Exportar un reporte (PDF) con fecha, resultados, recomendaciones y el artículo de cada una.

## Qué NO es (y lo decimos claro)

- No es asesoría legal ni una auditoría. Es una **autoevaluación orientativa**.
- No certifica cumplimiento ni dice "estás seguro".
- No reemplaza a un abogado ni a un profesional de seguridad.

## Tono de los resultados

Tres niveles, nunca "seguro" / "inseguro":

| Nivel | Texto | Uso |
|---|---|---|
| `buena` | **Buena práctica** | Lo que la empresa ya hace bien. |
| `mejorable` | **Puedes mejorar esto** | Falta algo, o el usuario no sabe. |
| `atender` | **Te recomendamos atender esto pronto** | Brecha clara frente a una obligación de la ley. |

Voz: cercana, directa, sin miedo ni amenazas, y sin jerga si no se explica. Las multas se mencionan como dato, no como amenaza.

## Privacidad desde el diseño (no negociable)

- **Todo corre en el navegador.** Las respuestas nunca salen del dispositivo: no hay backend, base de datos ni analítica sobre las respuestas.
- El progreso se guarda en el propio navegador (`localStorage`) solo para poder continuar después, y hay un botón visible para borrarlo.
- El PDF se genera en el navegador.

## Decisiones técnicas

- **Stack:** Vite + React + TypeScript; sitio estático en Cloudflare Pages.
- **Contenido** (preguntas, opciones, recomendaciones, referencias legales) separado del código en `src/content/`. Cada pregunta cita su artículo.
- **Motor de puntaje** como funciones puras en `src/engine/`, con tests (Vitest).
- **PDF v1:** página de reporte con estilos de impresión y "Guardar como PDF" del navegador, que no agrega dependencias. Si en pruebas con usuarios resulta confuso, se cambia a generación directa.
- **IA:** no en v1. Las recomendaciones salen de reglas escritas y revisadas.

## Fuentes (en `docs/fuentes/`)

- Ley 81 de 26 de marzo de 2019 (G.O. 28743-A).
- Decreto Ejecutivo 285 de 28 de mayo de 2021 (G.O. 29296-A).
- Guía de la ANTAI para el sector privado (junio 2023).

Regla: **ninguna pregunta ni recomendación sin referencia a una de estas fuentes.** Las recomendaciones de higiene de seguridad (respaldos, MFA, actualizaciones) se marcan como buena práctica que desarrolla el deber general de seguridad (Ley art. 2.5; DE 285 art. 36), no como requisito literal.

## Pendientes conocidos

- Revisar si la ANTAI publicó normas técnicas mínimas para PyMEs (DE 285 art. 36, último párrafo).
- Nombre final, dominio y aviso legal revisado.
