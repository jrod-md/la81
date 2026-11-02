import type { Area, ProfileQuestion } from '../engine/types';

/** Preguntas iniciales: adaptan qué preguntas del cuestionario se muestran. */
export const profileQuestions: ProfileQuestion[] = [
  {
    id: 'tamano',
    prompt: '¿Cuántas personas trabajan en tu negocio, contándote a ti?',
    multi: false,
    options: [
      { id: 'solo', label: 'Solo yo' },
      { id: '2-10', label: 'De 2 a 10' },
      { id: '11-50', label: 'De 11 a 50' },
      { id: '50+', label: 'Más de 50' },
    ],
  },
  {
    id: 'personas',
    prompt: '¿De quiénes guardas datos?',
    help: 'Nombre, teléfono, cédula, dirección, correo... todo eso cuenta como dato personal.',
    multi: true,
    options: [
      { id: 'clientes', label: 'Clientes' },
      { id: 'empleados', label: 'Empleados o colaboradores' },
      { id: 'proveedores', label: 'Proveedores (personas naturales)' },
      { id: 'pacientes', label: 'Pacientes o datos de salud' },
      { id: 'menores', label: 'Menores de edad (estudiantes, niños)' },
    ],
  },
  {
    id: 'canales',
    prompt: '¿Por dónde te llegan esos datos?',
    multi: true,
    options: [
      { id: 'papel', label: 'En persona o en papel (fichas, formularios)' },
      { id: 'whatsapp', label: 'WhatsApp o redes sociales' },
      { id: 'web', label: 'Formulario en mi página web' },
      { id: 'tienda', label: 'Tienda en línea o pagos en línea' },
      { id: 'camaras', label: 'Cámaras de seguridad' },
      { id: 'biometria', label: 'Huella o reconocimiento facial' },
    ],
  },
  {
    id: 'herramientas',
    prompt: '¿Dónde guardas la información?',
    multi: true,
    options: [
      { id: 'excel', label: 'Excel u hojas de cálculo' },
      { id: 'sistema', label: 'Sistema de facturación, contable o de citas' },
      { id: 'nube', label: 'En la nube (Google Drive, OneDrive, Dropbox...)' },
      { id: 'celular', label: 'En el celular (fotos, chats, contactos)' },
      { id: 'archivo', label: 'Archivos físicos (carpetas, gavetas)' },
    ],
  },
  {
    id: 'terceros',
    prompt: '¿Alguien de afuera maneja datos por ti?',
    help: 'La ley los llama "custodios": trabajan con tus datos por encargo tuyo.',
    multi: true,
    options: [
      { id: 'contador', label: 'Contador o gestoría externa' },
      { id: 'ti', label: 'Proveedor de sistema o soporte técnico' },
      { id: 'marketing', label: 'Agencia de marketing o publicidad' },
      { id: 'delivery', label: 'Servicio de mensajería o delivery' },
      { id: 'ninguno', label: 'Nadie, todo lo hacemos nosotros' },
    ],
  },
];

export const areas: Area[] = [
  { id: 'inventario', title: 'Conoce tus datos', summary: 'Qué datos guardas, para qué y por cuánto tiempo.' },
  { id: 'licitud', title: 'Permiso y base legal', summary: 'Con qué derecho usas los datos de cada persona.' },
  { id: 'transparencia', title: 'Avisar con claridad', summary: 'Que la gente sepa quién eres y qué haces con sus datos.' },
  { id: 'derechos', title: 'Derechos de las personas', summary: 'Responder cuando alguien pide ver, corregir o borrar sus datos.' },
  { id: 'seguridad', title: 'Seguridad del día a día', summary: 'Claves, respaldos, accesos y papeles.' },
  { id: 'terceros', title: 'Proveedores y nube', summary: 'Quién más toca tus datos y con qué garantías.' },
  { id: 'incidentes', title: 'Si algo sale mal', summary: 'Qué hacer ante una filtración o un hackeo.' },
  { id: 'cultura', title: 'Tu equipo', summary: 'Confidencialidad, capacitación y responsables.' },
];
