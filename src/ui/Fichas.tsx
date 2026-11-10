// Fichas del perfil: cada opción con un dibujo a tinta, dos o tres palabras y una línea de apoyo.
// El texto completo de la opción sigue en profile.ts; aquí va la versión corta para la ficha.

type Trazo = string | [string, 'f'];

/** Una persona de pie, con la cabeza en (x, y). */
const persona = (x: number, y: number, s = 1): Trazo[] => [
  `M${x} ${y}m-${4 * s} 0a${4 * s} ${4 * s} 0 1 0 ${8 * s} 0a${4 * s} ${4 * s} 0 1 0 -${8 * s} 0`,
  `M${x - 8 * s} ${y + 18 * s}v-${4 * s}a${8 * s} ${7 * s} 0 0 1 ${16 * s} 0v${4 * s}`,
];

const DIBUJO: Record<string, Trazo[]> = {
  // Tipo de negocio
  'tipo:tienda': [['M9 21h30v18H9z', 'f'], 'M7 13h34l-2 8H9z', 'M15 13l-1.5 8M24 13v8M33 13l1.5 8', 'M14 39V28h8v11', 'M27 27h8v6h-8z', 'M5 39h38'],
  'tipo:fonda': [['M8 28h32a16 12 0 0 1-32 0z', 'f'], 'M5 41h38', 'M18 22c-2-3 2-5 0-8M24 22c-2-3 2-5 0-8M30 22c-2-3 2-5 0-8'],
  'tipo:farmacia': [['M10 9h28v30H10z', 'f'], 'M20 15h8v6h6v8h-6v6h-8v-6h-6v-8h6z', 'M6 39h36'],
  'tipo:salon': [
    'M14 34m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0',
    'M34 34m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0',
    'M17.5 30.5L33 9M30.5 30.5L15 9',
  ],
  'tipo:oficina': [['M10 11h28v18H10z', 'f'], 'M14 15h20v10H14z', 'M24 29v6M16 35h16', 'M6 41h36'],
  // Tamaño
  'tamano:solo': persona(24, 15, 1.25),
  'tamano:2-10': [...persona(16, 16), ...persona(32, 16)],
  'tamano:11-50': [...persona(11, 19, 0.8), ...persona(24, 13), ...persona(37, 19, 0.8)],
  'tamano:50+': [['M12 9h24v31H12z', 'f'], 'M17 14h4v4h-4zM27 14h4v4h-4zM17 22h4v4h-4zM27 22h4v4h-4z', 'M21 40v-8h6v8', 'M6 40h36'],
  // De quiénes
  'personas:clientes': [['M11 17h26l-2 23H13z', 'f'], 'M18 21v-6a6 6 0 0 1 12 0v6'],
  'personas:empleados': [['M13 14h22v26H13z', 'f'], 'M24 5v5M20 14l4-4 4 4', 'M24 24m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0', 'M18 35a6 5 0 0 1 12 0'],
  'personas:proveedores': [['M8 18l16-7 16 7v18l-16 7-16-7z', 'f'], 'M8 18l16 7 16-7M24 25v18', 'M16 14.5l16 7'],
  'personas:pacientes': [['M24 40C11 31 7 24 7 18a8.5 8.5 0 0 1 17-2 8.5 8.5 0 0 1 17 2c0 6-4 13-17 22z', 'f'], 'M11 25h7l3-5 4 9 3-4h9'],
  'personas:menores': [['M15 17h18a3 3 0 0 1 3 3v19H12V20a3 3 0 0 1 3-3z', 'f'], 'M19 17v-3a5 5 0 0 1 10 0v3', 'M17 27h14v7H17z'],
  // Por dónde
  'canales:papel': [['M12 9h24v31H12z', 'f'], 'M19 6h10v6H19z', 'M17 19h14M17 25h14M17 31h9'],
  'canales:whatsapp': [['M24 8a15 14 0 1 1-8 26l-8 3 3-7A15 14 0 0 1 24 8z', 'f'], 'M17 20h14M17 26h9'],
  'canales:web': [['M7 10h34v28H7z', 'f'], 'M7 17h34', 'M11 13.5h0.1M15 13.5h0.1', 'M13 23h22v4H13zM13 31h12'],
  'canales:tienda': [
    'M5 11h6l5 20h20l4-14H13',
    ['M15 17h25l-4 14H18z', 'f'],
    'M19 38m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0',
    'M34 38m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0',
  ],
  'canales:camaras': [['M8 14l24 6-2 10-24-6z', 'f'], 'M32 20l7-2v9l-9 3', 'M17 27l-2 8H7M7 31v8', 'M12 19h0.1'],
  'canales:biometria': [
    'M15 37c-2-4-3-8-3-13a12 12 0 0 1 24 0',
    'M19 39c-2-5-3-10-3-15a8 8 0 0 1 16 0c0 3 0 6-1 9',
    'M24 40c-2-5-3-11-3-16a3 3 0 0 1 6 0c0 6 1 10 3 14',
    'M36 30c0 3 0 6 1 8',
  ],
  // Dónde guardas
  'herramientas:excel': [['M8 9h32v30H8z', 'f'], 'M8 17h32M8 25h32M8 33h32M19 9v30M30 9v30'],
  'herramientas:sistema': [['M13 7h22v34l-3.7-3-3.6 3-3.7-3-3.7 3-3.6-3-3.7 3z', 'f'], 'M18 15h12M18 21h12M18 27h7'],
  'herramientas:nube': [['M14 35a8 8 0 0 1-1-16 11 11 0 0 1 21-2 9 9 0 0 1 1 18z', 'f'], 'M24 31v-9M20 26l4-4 4 4'],
  'herramientas:celular': [
    ['M15 6h18a2 2 0 0 1 2 2v32a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z', 'f'],
    'M13 12h22M13 35h22',
    'M22 38.5h4',
  ],
  'herramientas:archivo': [['M11 6h26v36H11z', 'f'], 'M11 18h26M11 30h26', 'M21 12h6M21 24h6M21 36h6'],
  // Quién de afuera
  'terceros:contador': [
    ['M12 6h24v36H12z', 'f'],
    'M16 10h16v8H16z',
    'M17 24h0.1M24 24h0.1M31 24h0.1M17 30h0.1M24 30h0.1M31 30h0.1M17 36h0.1M24 36h0.1M31 36h0.1',
  ],
  'terceros:ti': [['M7 9h34v22H7z', 'f'], 'M24 31v6M16 37h16', 'M21 16l-4 4 4 4M27 16l4 4-4 4'],
  'terceros:marketing': [['M9 19h7l18-9v28l-18-9H9z', 'f'], 'M16 19v10', 'M13 29l3 10h5l-2-10', 'M39 18c2 2 2 10 0 12'],
  'terceros:delivery': [
    ['M18 14h22v18H18z', 'f'],
    'M18 20H10l-4 7v5h12',
    'M14 36m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
    'M33 36m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
    'M2 17h6M4 23h4',
  ],
  'terceros:ninguno': [['M8 22l16-13 16 13v19H8z', 'f'], 'M20 41V29h8v12'],
};

/** Texto corto de la ficha: título y una línea de apoyo opcional. */
const TEXTO: Record<string, [string, string?]> = {
  'tipo:tienda': ['Tienda', 'Minisúper o abarrotería'],
  'tipo:fonda': ['Fonda', 'Restaurante o cafetería'],
  'tipo:farmacia': ['Farmacia', 'Clínica o consultorio'],
  'tipo:salon': ['Salón', 'Barbería o spa'],
  'tipo:oficina': ['Oficina', 'Servicios profesionales'],
  'tamano:solo': ['Solo yo'],
  'tamano:2-10': ['De 2 a 10', 'personas'],
  'tamano:11-50': ['De 11 a 50', 'personas'],
  'tamano:50+': ['Más de 50', 'personas'],
  'personas:clientes': ['Clientes'],
  'personas:empleados': ['Empleados', 'o colaboradores'],
  'personas:proveedores': ['Proveedores', 'Personas naturales'],
  'personas:pacientes': ['Pacientes', 'Datos de salud'],
  'personas:menores': ['Menores', 'Estudiantes, niños'],
  'canales:papel': ['En papel', 'Fichas o formularios'],
  'canales:whatsapp': ['WhatsApp', 'o redes sociales'],
  'canales:web': ['Mi página web', 'Un formulario'],
  'canales:tienda': ['Venta en línea', 'Tienda o pagos'],
  'canales:camaras': ['Cámaras', 'de seguridad'],
  'canales:biometria': ['Huella o rostro', 'Para marcar o entrar'],
  'herramientas:excel': ['Excel', 'Hojas de cálculo'],
  'herramientas:sistema': ['Un sistema', 'Facturación o citas'],
  'herramientas:nube': ['La nube', 'Drive, OneDrive…'],
  'herramientas:celular': ['El celular', 'Fotos, chats, contactos'],
  'herramientas:archivo': ['Archivo físico', 'Carpetas o gavetas'],
  'terceros:contador': ['Contador', 'o gestoría'],
  'terceros:ti': ['Soporte técnico', 'o proveedor de sistema'],
  'terceros:marketing': ['Marketing', 'Agencia o publicidad'],
  'terceros:delivery': ['Delivery', 'o mensajería'],
  'terceros:ninguno': ['Nadie', 'Todo lo hacemos aquí'],
};

export function fichaTexto(pregunta: string, opcion: string, label: string): [string, string?] {
  return TEXTO[`${pregunta}:${opcion}`] ?? [label];
}

export function FichaDibujo({ pregunta, opcion }: { pregunta: string; opcion: string }) {
  const trazos = DIBUJO[`${pregunta}:${opcion}`];
  if (!trazos) return null;
  return (
    <svg className="ficha__ico" viewBox="0 0 48 48" aria-hidden="true">
      {trazos.map((t, i) => (typeof t === 'string' ? <path key={i} d={t} /> : <path key={i} d={t[0]} className="f" />))}
    </svg>
  );
}
