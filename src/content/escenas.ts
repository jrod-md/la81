import type { Escena } from '../engine/types';

// "Un día en tu negocio": cada pregunta esencial se vive como algo que pasa en el local.
// La clave es el id de la pregunta; las opciones usan los mismos ids que en questions.ts,
// así el puntaje no cambia. `efecto` es lo que se aprende al elegir: una frase, con el dato de la norma.

export const escenas: Record<string, Escena> = {
  'inv-lista': {
    hora: '08:00',
    quien: 'El banco, por correo',
    texto: '«Para renovar la cuenta del negocio necesitamos saber qué datos personales guarda y dónde.»',
    habla: true,
    tarea: 'Anotar qué datos guardo y dónde',
    opciones: {
      escrito: { accion: 'Le mando mi lista', efecto: 'Esa lista es la base de la ficha técnica que pide la ley. Mantenla al día.' },
      memoria: {
        accion: 'Se lo explico de memoria',
        efecto: 'Funciona hasta que algo se olvida. La ley pide tenerlo por escrito, y una hoja basta.',
      },
      no: {
        accion: 'No sabría qué poner',
        efecto: 'Es el primer paso: no se puede cuidar lo que no se sabe que se tiene. Anota qué guardas, de quién y dónde.',
      },
    },
  },
  'lic-marketing': {
    hora: '09:30',
    quien: 'Se acerca el Día de la Madre',
    texto: 'Tienes lista la promoción y, en el celular, los números de todos tus clientes.',
    tarea: 'Pedir permiso para promociones',
    opciones: {
      permiso: {
        accion: 'La mando a quienes aceptaron',
        efecto: 'Bien. Con el permiso guardado puedes demostrarlo si alguien reclama.',
      },
      'sin-prueba': {
        accion: 'Pregunté, pero no lo anoté',
        efecto: 'El permiso existe, pero no podrías probarlo. Guarda el mensaje o la casilla donde aceptaron.',
      },
      todos: {
        accion: 'La mando a toda la lista',
        efecto: 'Haber comprado no es permiso para recibir publicidad. Pídelo aparte y ofrece siempre cómo darse de baja.',
      },
    },
  },
  'lic-sensibles': {
    hora: '10:00',
    quien: 'Un paciente nuevo',
    texto: '«¿Aquí anoto mis enfermedades y los medicamentos que tomo?»',
    habla: true,
    tarea: 'Autorización para datos de salud',
    opciones: {
      si: {
        accion: 'Antes firma una autorización',
        efecto: 'Correcto. Los datos de salud son sensibles y piden autorización expresa, que tú guardas.',
      },
      verbal: {
        accion: 'Le explico y me dice que sí',
        efecto: 'De palabra no queda constancia. Para datos de salud, la autorización debe poder demostrarse.',
      },
      no: {
        accion: 'Solo llena la ficha',
        efecto: 'Los datos de salud son sensibles. Pide una autorización expresa antes de anotarlos.',
      },
    },
  },
  'lic-biometria': {
    hora: '10:15',
    quien: 'Alguien nuevo en el equipo',
    texto: '«¿Pongo el dedo aquí para marcar la entrada?»',
    habla: true,
    tarea: 'Autorización para usar la huella',
    opciones: {
      si: {
        accion: 'Antes firma su autorización',
        efecto: 'Bien. La huella es un dato sensible y la persona sabe para qué se usa.',
      },
      implicito: {
        accion: 'Sí, así marcamos todos',
        efecto: 'Empezar a trabajar no equivale a autorizar. Pide una autorización escrita para usar la huella.',
      },
      nose: { accion: 'No sé si firmó algo' },
    },
  },
  'lic-menores': {
    hora: '10:40',
    quien: 'Una mamá',
    texto: '«Vengo a inscribir a mi hijo. Tiene nueve años.»',
    habla: true,
    tarea: 'Autorización del acudiente',
    opciones: {
      si: {
        accion: 'Ella firma la autorización',
        efecto: 'Correcto. Los datos de un menor requieren la autorización previa de su acudiente.',
      },
      'a-veces': {
        accion: 'A veces la pido',
        efecto: 'Debe ser siempre. Ponla en la hoja de inscripción para que no dependa de la memoria.',
      },
      no: {
        accion: 'Solo anoto sus datos',
        efecto: 'Para guardar datos de un menor necesitas la autorización previa de su acudiente.',
      },
    },
  },
  'tra-aviso': {
    hora: '11:15',
    quien: 'Una clienta',
    texto: '«¿Y para qué quieren mi cédula y mi teléfono?»',
    habla: true,
    tarea: 'Poner un aviso donde pido datos',
    opciones: {
      si: {
        accion: 'Le muestro el aviso',
        efecto: 'Bien. La ley pide decir quién eres y para qué usas los datos en el momento de pedirlos.',
      },
      parcial: {
        accion: 'Se lo explico si pregunta',
        efecto: 'La información se da siempre, no solo a quien pregunta. Un aviso corto junto a la caja lo resuelve.',
      },
      no: {
        accion: 'Es lo que pedimos siempre',
        efecto: 'La persona tiene derecho a saber para qué se usan sus datos antes de darlos. Pon un aviso corto donde los pides.',
      },
    },
  },
  'der-acceso': {
    hora: '12:00',
    quien: 'Un cliente',
    texto: '«Quiero saber qué datos míos tienen ustedes.»',
    habla: true,
    tarea: 'Saber cómo responder solicitudes',
    opciones: {
      proceso: {
        accion: 'Busco y respondo esta semana',
        efecto: 'Bien. La ley da diez días hábiles y tú sabes dónde buscar.',
      },
      improvisado: {
        accion: 'Veo cómo lo resuelvo',
        efecto: 'Tienes diez días hábiles. Sin saber quién busca y dónde, el plazo se pasa fácil.',
      },
      no: {
        accion: 'No sabría qué responder',
        efecto: 'Es su derecho, y el plazo es de diez días hábiles. Escribe quién recibe la solicitud y dónde se busca.',
      },
    },
  },
  'seg-acceso': {
    hora: '13:30',
    quien: 'Hora del almuerzo',
    texto: 'La computadora quedó encendida. Ahí están la lista de clientes y la planilla.',
    tarea: 'Una clave por persona',
    opciones: {
      necesario: {
        accion: 'Cada quien ve solo lo suyo',
        efecto: 'Bien. Mientras menos personas ven un dato, menos puede salir mal.',
      },
      todos: {
        accion: 'Todo el equipo puede verlo',
        efecto: 'No hace falta que todos vean la planilla. Separa carpetas y permisos según el trabajo de cada quien.',
      },
      cualquiera: {
        accion: 'Cualquiera que pase la abre',
        efecto: 'Una computadora sin clave deja todo a la vista. Pon una clave por persona hoy mismo.',
      },
    },
  },
  'seg-respaldo': {
    hora: '14:45',
    quien: 'Se fue la luz',
    texto: 'Volvió la corriente, pero la computadora no enciende.',
    tarea: 'Copia automática y probada',
    opciones: {
      automatico: {
        accion: 'Recupero todo de la copia',
        efecto: 'Bien. La copia es automática, está aparte y ya comprobaste que funciona.',
      },
      manual: {
        accion: 'Recupero lo de hace semanas',
        efecto: 'Lo que cambió desde la última copia se pierde. Hazla automática y prueba restaurar un archivo.',
      },
      no: {
        accion: 'Se perdió lo que había',
        efecto: 'Sin copia, un daño o un virus se lleva todo. Configura una copia automática fuera del equipo.',
      },
    },
  },
  'ter-contrato': {
    hora: '15:30',
    quien: 'Un proveedor',
    texto: '«Mándame la planilla y la lista de clientes para poder trabajar.»',
    habla: true,
    tarea: 'Anexo de datos con proveedores',
    opciones: {
      si: {
        accion: 'Va, el contrato lo cubre',
        efecto: 'Bien. El contrato dice cómo debe cuidar esos datos y qué pasa con ellos al terminar.',
      },
      generico: {
        accion: 'Va, hay un contrato general',
        efecto: 'Ese contrato no habla de datos. Agrega un anexo: usarlos solo por encargo, guardar secreto y avisarte de incidentes.',
      },
      no: {
        accion: 'Va, es de confianza',
        efecto: 'La confianza no reemplaza la constancia escrita que pide la ley. Un anexo de una página basta.',
      },
    },
  },
  'ter-compartir': {
    hora: '16:15',
    quien: 'Una llamada',
    texto: '«Le compramos su lista de clientes. Pagamos bien.»',
    habla: true,
    tarea: 'Constancia de cada entrega',
    opciones: {
      nunca: { accion: 'No está en venta', efecto: 'Bien. Los datos de tus clientes no se entregan sin su consentimiento.' },
      'con-permiso': {
        accion: 'Solo de quienes den permiso',
        efecto: 'Correcto: con consentimiento de cada persona y dejando constancia de la entrega.',
      },
      'sin-permiso': {
        accion: 'Ya lo he hecho antes',
        efecto: 'La ley solo permite entregar datos con consentimiento de la persona u otra base legal. Deja constancia de cada entrega.',
      },
    },
  },
  'inc-plan': {
    hora: '17:00',
    quien: 'Aviso urgente',
    texto: 'Alguien entró al correo del negocio y descargó la lista de clientes.',
    tarea: 'Plan de una página para incidentes',
    opciones: {
      pasos: {
        accion: 'Sigo los pasos que tenemos',
        efecto: 'Bien. Con un plan, las 72 horas para avisar a la ANTAI y a los afectados alcanzan.',
      },
      idea: {
        accion: 'Cambio la clave y veo',
        efecto: 'Es un comienzo. Falta saber qué datos salieron y avisar a la ANTAI y a los afectados en 72 horas.',
      },
      no: {
        accion: 'No sé por dónde empezar',
        efecto: 'Hay 72 horas para avisar a la ANTAI y a los afectados. Escribe hoy un plan de una página.',
      },
    },
  },
  'cul-confidencialidad': {
    hora: '18:00',
    quien: 'Hora de cerrar',
    texto: 'Tu equipo se va a casa. Hoy vio nombres, direcciones y cuentas de clientes.',
    tarea: 'Compromiso de confidencialidad',
    opciones: {
      si: {
        accion: 'Todos firmaron confidencialidad',
        efecto: 'Bien. El deber de guardar secreto sigue incluso cuando alguien deja el negocio.',
      },
      algunos: {
        accion: 'Algunos, o de forma general',
        efecto: 'Que lo firmen todos y que mencione los datos personales. Es una hoja.',
      },
      no: {
        accion: 'Nunca firmaron nada',
        efecto: 'La ley obliga a guardar secreto a quien ve datos. Déjalo por escrito con un compromiso breve.',
      },
      na: { accion: 'Trabajo solo' },
    },
  },
};
