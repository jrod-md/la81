import type { AnswerOption, Question } from '../engine/types';

// Banco de preguntas. Regla: cada pregunta cita al menos una fuente de docs/fuentes/.
// Ley 81 = Ley 81 de 2019. DE 285 = Decreto Ejecutivo 285 de 2021.

const NO_SE: AnswerOption = {
  id: 'nose',
  label: 'No estoy seguro',
  level: 'mejorable',
  note: 'No pasa nada: averiguarlo ya es un buen primer paso.',
};

const SOLO_YO: AnswerOption = { id: 'na', label: 'Trabajo solo/a', level: 'na' };

export const questions: Question[] = [
  // ───────────── Conoce tus datos ─────────────
  {
    id: 'inv-lista',
    area: 'inventario',
    prompt:
      'Si mañana alguien te pregunta qué datos personales guarda tu negocio y dónde están (Excel, WhatsApp, gavetas, sistema), ¿podrías responder?',
    help: 'No se puede proteger lo que no se sabe que se tiene. Es el primer paso que recomienda la ANTAI.',
    options: [
      { id: 'escrito', label: 'Sí, lo tengo anotado en una lista o documento', level: 'buena' },
      { id: 'memoria', label: 'Más o menos, lo sé de memoria', level: 'mejorable' },
      { id: 'no', label: 'No podría decirlo con certeza', level: 'atender' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '4.13' },
      { norma: 'DE 285', articulo: '33' },
      { norma: 'Guía ANTAI', articulo: 'Hoja de ruta' },
    ],
    recommendation:
      'Haz una lista sencilla (una hoja basta): qué datos guardas, de quién, para qué, dónde están y quién puede verlos. Es la base de la "ficha técnica" que pide la ley.',
    weight: 3,
    effort: 'medio',
    core: true,
  },
  {
    id: 'inv-finalidad',
    area: 'inventario',
    prompt: '¿Tienes claro para qué usas cada dato que le pides a la gente?',
    help: 'La ley pide usar los datos solo para el fin por el que se pidieron, no para otra cosa sin avisar.',
    options: [
      { id: 'si', label: 'Sí, cada dato tiene un uso concreto', level: 'buena' },
      { id: 'algunos', label: 'Para la mayoría, pero algunos los pedimos "por si acaso"', level: 'mejorable' },
      { id: 'no', label: 'No lo hemos pensado', level: 'atender' },
      NO_SE,
    ],
    refs: [
      { norma: 'Ley 81', articulo: '2.2' },
      { norma: 'Ley 81', articulo: '11' },
      { norma: 'DE 285', articulo: '7' },
    ],
    recommendation:
      'Al lado de cada dato de tu lista, escribe para qué lo usas. Si no encuentras un uso claro, deja de pedirlo.',
    weight: 2,
    effort: 'rapido',
  },
  {
    id: 'inv-minimo',
    area: 'inventario',
    prompt: 'Un cliente te pide un delivery por primera vez. ¿Qué datos le pides?',
    help: 'Pedir solo lo necesario reduce el riesgo: lo que no guardas, no se puede filtrar.',
    options: [
      { id: 'minimo', label: 'Nombre, teléfono y dirección de entrega', level: 'buena' },
      {
        id: 'extra',
        label: 'Eso, más cédula o fecha de nacimiento por si acaso',
        level: 'mejorable',
        note: 'La cédula no hace falta para entregar un pedido.',
      },
      { id: 'foto', label: 'Le pedimos foto de la cédula', level: 'atender' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '2.3' },
      { norma: 'DE 285', articulo: '8' },
    ],
    recommendation:
      'Revisa tus formularios y fichas: quita los campos que no necesitas para dar el servicio. Menos datos, menos riesgo.',
    weight: 2,
    effort: 'rapido',
  },
  {
    id: 'inv-conservacion',
    area: 'inventario',
    prompt: '¿Qué pasa con los datos de clientes o empleados que ya no tienen relación contigo?',
    help: 'Los datos se guardan el tiempo necesario para su fin y para cumplir obligaciones legales (por ejemplo, facturas). Después, se eliminan o se anonimizan.',
    options: [
      { id: 'plazo', label: 'Tenemos un plazo definido y luego los eliminamos', level: 'buena' },
      { id: 'siempre', label: 'Se quedan guardados indefinidamente', level: 'mejorable' },
      NO_SE,
    ],
    refs: [
      { norma: 'Ley 81', articulo: '2.2' },
      { norma: 'DE 285', articulo: '7' },
    ],
    recommendation:
      'Define cuánto tiempo guardas cada tipo de dato (por ejemplo, lo que exija la ley contable o laboral) y programa una limpieza una vez al año.',
    weight: 2,
    effort: 'medio',
  },
  {
    id: 'inv-registro-transferencias',
    area: 'inventario',
    prompt: '¿Llevas registro de a quién le entregas bases de datos (tu contador, una agencia, otra empresa)?',
    help: 'La ley pide un registro escrito de las bases de datos que se transfieren a terceros, disponible si la ANTAI lo pide.',
    options: [
      { id: 'si', label: 'Sí, anotamos qué se entrega, a quién y para qué', level: 'buena' },
      { id: 'parcial', label: 'Algunas veces, sin un formato fijo', level: 'mejorable' },
      { id: 'no', label: 'No llevamos registro', level: 'atender' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '31' },
      { norma: 'DE 285', articulo: '35' },
    ],
    recommendation:
      'Crea una tabla simple: qué base de datos, a quién se entregó, para qué, qué medidas de seguridad tiene y por cuánto tiempo la usará.',
    weight: 2,
    effort: 'medio',
    showIf: { profile: 'terceros', anyOf: ['contador', 'ti', 'marketing', 'delivery'] },
  },

  // ───────────── Permiso y base legal ─────────────
  {
    id: 'lic-base',
    area: 'licitud',
    prompt:
      'Cuando usas datos de alguien, ¿sabes en qué te apoyas: un contrato con esa persona, una obligación legal o su permiso?',
    help: 'La ley solo permite usar datos personales si hay una razón válida: consentimiento, contrato, obligación legal u otra que la ley reconozca.',
    options: [
      { id: 'si', label: 'Sí, lo tenemos claro para cada uso', level: 'buena' },
      { id: 'algunos', label: 'Para algunos usos sí, para otros no', level: 'mejorable' },
      { id: 'no', label: 'No lo habíamos pensado', level: 'atender' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '6' },
      { norma: 'Ley 81', articulo: '8' },
      { norma: 'DE 285', articulo: '17' },
    ],
    recommendation:
      'En tu lista de datos, anota la razón de cada uso: "contrato" (para darle el servicio), "obligación legal" (planilla, facturas) o "permiso" (promociones).',
    weight: 2,
    effort: 'rapido',
  },
  {
    id: 'lic-marketing',
    area: 'licitud',
    prompt: 'Quieres enviar promociones por WhatsApp o correo a tu lista de clientes. ¿Qué haces?',
    help: 'Para usos que van más allá del servicio que el cliente pidió, lo más seguro es tener su permiso, y la persona puede oponerse a recibir publicidad en cualquier momento.',
    options: [
      { id: 'permiso', label: 'Solo a quienes aceptaron recibirlas, y guardo prueba', level: 'buena' },
      { id: 'sin-prueba', label: 'Les pregunto, pero no guardo registro de su respuesta', level: 'mejorable' },
      {
        id: 'todos',
        label: 'A todos los que alguna vez nos compraron',
        level: 'mejorable',
        note: 'Ofrece siempre una forma fácil de dejar de recibirlas.',
      },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '2.8' },
      { norma: 'Ley 81', articulo: '11' },
      { norma: 'DE 285', articulo: '18' },
      { norma: 'DE 285', articulo: '29' },
    ],
    recommendation:
      'Pide el permiso para promociones aparte de la compra (una casilla o un mensaje) y guarda la respuesta. Incluye siempre una forma fácil de darse de baja.',
    weight: 3,
    effort: 'rapido',
    core: true,
  },
  {
    id: 'lic-prueba',
    area: 'licitud',
    prompt: 'Si un cliente dice "yo nunca les di permiso para usar mis datos", ¿podrías demostrar que sí?',
    help: 'Cuando el uso se basa en el permiso de la persona, la ley pide que ese permiso se pueda comprobar ("trazabilidad").',
    options: [
      { id: 'si', label: 'Sí: firma, casilla marcada, mensaje o correo guardado', level: 'buena' },
      { id: 'a-veces', label: 'En algunos casos', level: 'mejorable' },
      { id: 'no', label: 'No, fue de palabra', level: 'atender' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '6' },
      { norma: 'DE 285', articulo: '17.1' },
      { norma: 'DE 285', articulo: '18' },
    ],
    recommendation:
      'Guarda evidencia del permiso: una casilla en el formulario, una firma en la ficha o el mensaje de WhatsApp donde la persona acepta.',
    weight: 2,
    effort: 'rapido',
  },
  {
    id: 'lic-revocar',
    area: 'licitud',
    prompt: 'Si alguien te pide que dejes de usar sus datos o de escribirle, ¿qué tan fácil es lograrlo?',
    help: 'Retirar el permiso debe ser tan fácil como darlo.',
    options: [
      { id: 'facil', label: 'Muy fácil: lo pide una vez y se cumple', level: 'buena' },
      { id: 'lento', label: 'Se hace, pero depende de quién lo reciba', level: 'mejorable' },
      { id: 'dificil', label: 'Es complicado o no tenemos forma', level: 'atender' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '6' },
      { norma: 'DE 285', articulo: '19' },
      { norma: 'DE 285', articulo: '29' },
    ],
    recommendation:
      'Ten una forma clara de darse de baja (responder "BAJA", un correo) y una lista de personas que no quieren ser contactadas, que todo el equipo respete.',
    weight: 2,
    effort: 'rapido',
  },
  {
    id: 'lic-sensibles',
    area: 'licitud',
    prompt: 'Para datos de salud, huellas o reconocimiento facial, ¿pides autorización expresa y la guardas?',
    help: 'Son datos sensibles: su mal uso puede causar discriminación o daño grave. Incumplir las reglas sobre datos sensibles es una falta muy grave.',
    options: [
      { id: 'si', label: 'Sí, por escrito y guardada', level: 'buena' },
      { id: 'verbal', label: 'Se pide de palabra', level: 'atender' },
      { id: 'no', label: 'No se pide', level: 'atender' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '4.11' },
      { norma: 'Ley 81', articulo: '8' },
      { norma: 'Ley 81', articulo: '41.2' },
      { norma: 'DE 285', articulo: '18' },
    ],
    recommendation:
      'Usa un formulario de consentimiento específico para datos sensibles, que explique para qué se usan, y guárdalo firmado (en papel o digital).',
    weight: 3,
    effort: 'medio',
    core: true,
    showIf: { profile: 'personas', anyOf: ['pacientes'] },
  },
  {
    id: 'lic-biometria',
    area: 'licitud',
    prompt: 'Si usas huella o reconocimiento facial (por ejemplo, para marcar asistencia), ¿las personas dieron su autorización expresa?',
    help: 'Los datos biométricos son sensibles. Si hay una alternativa menos invasiva (carné, código), vale la pena ofrecerla.',
    options: [
      { id: 'si', label: 'Sí, por escrito, y saben para qué se usa', level: 'buena' },
      { id: 'implicito', label: 'Se da por hecho al empezar a trabajar', level: 'atender' },
      NO_SE,
    ],
    refs: [
      { norma: 'Ley 81', articulo: '4.11' },
      { norma: 'Ley 81', articulo: '41.2' },
      { norma: 'DE 285', articulo: '4.2' },
      { norma: 'DE 285', articulo: '18' },
    ],
    recommendation:
      'Pide autorización expresa y por escrito para usar datos biométricos, explica para qué se usan y limita quién puede acceder a ellos.',
    weight: 3,
    effort: 'medio',
    core: true,
    showIf: { profile: 'canales', anyOf: ['biometria'] },
  },
  {
    id: 'lic-menores',
    area: 'licitud',
    prompt: 'Cuando guardas datos de menores de edad, ¿tienes la autorización de padres o acudientes?',
    help: 'Para datos de menores, la autorización la dan los padres, acudientes o tutores, y prima el interés superior del menor.',
    options: [
      { id: 'si', label: 'Sí, firmada por el acudiente', level: 'buena' },
      { id: 'a-veces', label: 'No siempre', level: 'atender' },
      { id: 'no', label: 'No la pedimos', level: 'atender' },
    ],
    refs: [
      { norma: 'DE 285', articulo: '3' },
      { norma: 'DE 285', articulo: '18' },
    ],
    recommendation:
      'Incluye en la matrícula o inscripción una autorización del acudiente para el uso de los datos del menor (y aparte para fotos o publicaciones).',
    weight: 3,
    effort: 'rapido',
    core: true,
    showIf: { profile: 'personas', anyOf: ['menores'] },
  },
  {
    id: 'lic-camaras',
    area: 'licitud',
    prompt: '¿Hay un letrero visible que avise que hay cámaras y quién es el responsable?',
    help: 'La imagen de una persona es un dato personal. Avisar es la forma más sencilla de ser transparente.',
    options: [
      { id: 'si', label: 'Sí, con el nombre del negocio y un contacto', level: 'buena' },
      { id: 'generico', label: 'Hay un letrero genérico de "zona vigilada"', level: 'mejorable' },
      { id: 'no', label: 'No hay letrero', level: 'mejorable' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '2.6' },
      { norma: 'DE 285', articulo: '14' },
      { norma: 'DE 285', articulo: '16' },
    ],
    recommendation:
      'Coloca un letrero visible: "Zona videovigilada. Responsable: [tu negocio]. Para consultas: [correo o teléfono]".',
    weight: 1,
    effort: 'rapido',
    showIf: { profile: 'canales', anyOf: ['camaras'] },
  },

  // ───────────── Avisar con claridad ─────────────
  {
    id: 'tra-aviso',
    area: 'transparencia',
    prompt:
      'Cuando pides datos (ficha, formulario, mensaje), ¿le dices a la persona quién eres, para qué los usarás y cómo puede pedir cambios?',
    help: 'Es lo que normalmente se llama "aviso de privacidad". Se puede dar por capas: un resumen corto con un enlace al texto completo.',
    options: [
      { id: 'si', label: 'Sí, siempre, en un texto corto y claro', level: 'buena' },
      { id: 'parcial', label: 'A veces, o solo en algunos formularios', level: 'mejorable' },
      { id: 'no', label: 'No lo hacemos', level: 'atender' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '2.6' },
      { norma: 'DE 285', articulo: '14' },
      { norma: 'DE 285', articulo: '15' },
      { norma: 'DE 285', articulo: '16' },
    ],
    recommendation:
      'Agrega un aviso corto donde pides datos: quién eres y cómo contactarte, para qué usas los datos, con quién los compartes, cuánto tiempo los guardas y cómo pedir verlos, corregirlos o borrarlos.',
    weight: 3,
    effort: 'rapido',
    core: true,
  },
  {
    id: 'tra-web',
    area: 'transparencia',
    prompt: '¿Tu página web o tienda en línea tiene una política de privacidad fácil de encontrar?',
    help: 'Cuando los datos se recogen por internet, la ley pide presentar la política de privacidad o las condiciones del servicio.',
    options: [
      { id: 'si', label: 'Sí, enlazada en el pie de página y en los formularios', level: 'buena' },
      { id: 'escondida', label: 'Existe, pero es difícil de encontrar o es copiada de otro sitio', level: 'mejorable' },
      { id: 'no', label: 'No tenemos', level: 'atender' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '27' },
      { norma: 'DE 285', articulo: '16' },
    ],
    recommendation:
      'Publica una política de privacidad propia, en lenguaje sencillo, y enlázala junto a cada formulario y en el pie de página.',
    weight: 2,
    effort: 'rapido',
    showIf: { profile: 'canales', anyOf: ['web', 'tienda'] },
  },
  {
    id: 'tra-separado',
    area: 'transparencia',
    prompt: 'Cuando pides permiso para usar datos dentro de un contrato o formulario, ¿esa autorización aparece separada del resto del texto?',
    help: 'Si el permiso va mezclado con otros temas (términos, condiciones), debe distinguirse claramente y estar en lenguaje sencillo.',
    options: [
      { id: 'si', label: 'Sí, es una casilla o sección aparte', level: 'buena' },
      { id: 'mezclado', label: 'Va dentro de la letra pequeña', level: 'mejorable' },
      { id: 'na', label: 'No pedimos permisos por escrito', level: 'na' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '27' },
      { norma: 'DE 285', articulo: '18' },
    ],
    recommendation:
      'Separa la autorización de datos en su propia casilla o párrafo, con un título claro como "Uso de tus datos personales".',
    weight: 1,
    effort: 'rapido',
  },

  // ───────────── Derechos de las personas ─────────────
  {
    id: 'der-acceso',
    area: 'derechos',
    prompt: 'Un cliente te escribe: "¿Qué datos míos tienen?". ¿Qué pasaría?',
    help: 'Toda persona puede pedir ver sus datos, saber de dónde salieron y para qué se usan. La respuesta es gratuita y debe darse en un máximo de 10 días hábiles.',
    options: [
      { id: 'proceso', label: 'Sabemos dónde buscar y respondemos en menos de 10 días hábiles', level: 'buena' },
      { id: 'improvisado', label: 'Lo resolveríamos, pero sin un proceso ni un plazo claro', level: 'mejorable' },
      { id: 'no', label: 'Probablemente no sabríamos qué responder', level: 'atender' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '15' },
      { norma: 'Ley 81', articulo: '16' },
      { norma: 'DE 285', articulo: '21' },
      { norma: 'DE 285', articulo: '24' },
    ],
    recommendation:
      'Escribe un procedimiento corto: quién recibe la solicitud, cómo se verifica la identidad, dónde se busca y quién responde, siempre en menos de 10 días hábiles.',
    weight: 3,
    effort: 'medio',
    core: true,
  },
  {
    id: 'der-corregir',
    area: 'derechos',
    prompt: 'Si alguien pide corregir un dato equivocado, ¿lo corriges en todos los lugares donde está, en 5 días hábiles o menos?',
    help: 'Los datos erróneos deben corregirse en un plazo de cinco días hábiles, y avisarles a quienes los recibieron.',
    options: [
      { id: 'si', label: 'Sí, sabemos en qué lugares está cada dato', level: 'buena' },
      { id: 'parcial', label: 'Lo corregimos donde lo vemos, pero puede quedar en otros lados', level: 'mejorable' },
      { id: 'no', label: 'No lo corregimos, o tardamos más de 5 días hábiles', level: 'atender' },
      NO_SE,
    ],
    refs: [
      { norma: 'Ley 81', articulo: '17' },
      { norma: 'DE 285', articulo: '26' },
    ],
    recommendation:
      'Usa tu lista de datos para saber en qué lugares vive cada dato (Excel, sistema, celular) y corrígelo en todos en 5 días hábiles o menos.',
    weight: 2,
    effort: 'rapido',
  },
  {
    id: 'der-borrar',
    area: 'derechos',
    prompt: 'Si alguien pide que borres sus datos, ¿sabes qué puedes borrar y qué debes conservar por ley (por ejemplo, facturas)?',
    help: 'Se pueden cancelar datos que ya no hacen falta, pero hay excepciones, como las obligaciones legales o las reclamaciones.',
    options: [
      { id: 'si', label: 'Sí, sabemos qué se borra y qué se conserva', level: 'buena' },
      { id: 'todo', label: 'Borraríamos todo sin revisar', level: 'mejorable' },
      { id: 'nada', label: 'No borraríamos nada', level: 'atender' },
      NO_SE,
    ],
    refs: [
      { norma: 'Ley 81', articulo: '15.3' },
      { norma: 'Ley 81', articulo: '16' },
      { norma: 'DE 285', articulo: '27' },
      { norma: 'DE 285', articulo: '28' },
    ],
    recommendation:
      'Define qué datos debes conservar por obligación legal (contables, laborales) y borra el resto cuando te lo pidan. Responde a la persona explicando qué se conservó y por qué.',
    weight: 2,
    effort: 'medio',
  },
  {
    id: 'der-canal',
    area: 'derechos',
    prompt: '¿Tienes un canal claro (correo o número) para que la gente pida ver, corregir o borrar sus datos, sin costo?',
    help: 'Los medios deben ser sencillos, accesibles y gratuitos. No se puede cobrar por atender estos derechos.',
    options: [
      { id: 'si', label: 'Sí, está publicado y es gratuito', level: 'buena' },
      { id: 'informal', label: 'Pueden escribirnos, pero no está indicado en ningún lado', level: 'mejorable' },
      {
        id: 'cobro',
        label: 'Cobramos por gestionarlo',
        level: 'atender',
        note: 'Atender estos derechos debe ser gratuito.',
      },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '16' },
      { norma: 'DE 285', articulo: '21' },
      { norma: 'DE 285', articulo: '23' },
    ],
    recommendation:
      'Publica un contacto para temas de datos personales (por ejemplo, privacidad@tunegocio.com) en tu aviso de privacidad y en tu web.',
    weight: 2,
    effort: 'rapido',
  },

  // ───────────── Seguridad del día a día ─────────────
  {
    id: 'seg-acceso',
    area: 'seguridad',
    prompt: '¿Quién puede ver la lista de clientes o la planilla?',
    help: 'Cada persona debe acceder solo a los datos que necesita para su trabajo.',
    options: [
      { id: 'necesario', label: 'Solo quien lo necesita para su trabajo', level: 'buena' },
      { id: 'todos', label: 'Todo el personal', level: 'mejorable' },
      { id: 'cualquiera', label: 'Cualquiera: está en una computadora compartida sin clave', level: 'atender' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '2.5' },
      { norma: 'DE 285', articulo: '8' },
      { norma: 'DE 285', articulo: '36' },
    ],
    recommendation:
      'Separa carpetas y permisos: planilla solo para administración; clientes solo para quien los atiende. En la nube se hace compartiendo con personas específicas, no "con cualquiera que tenga el enlace".',
    weight: 3,
    effort: 'rapido',
    core: true,
  },
  {
    id: 'seg-usuarios',
    area: 'seguridad',
    prompt: '¿Cada persona tiene su propio usuario y contraseña en las computadoras y sistemas?',
    help: 'Compartir la misma clave impide saber quién hizo qué, y si una persona se va, la clave se va con ella.',
    options: [
      { id: 'propio', label: 'Sí, cada quien tiene el suyo', level: 'buena' },
      { id: 'compartido', label: 'Usamos un usuario compartido', level: 'mejorable' },
      { id: 'sin-clave', label: 'Algunos equipos no tienen contraseña', level: 'atender' },
      SOLO_YO,
    ],
    refs: [
      { norma: 'Ley 81', articulo: '2.5' },
      { norma: 'DE 285', articulo: '36' },
    ],
    recommendation:
      'Crea un usuario por persona, con contraseñas largas (frases), y desactiva el acceso el mismo día que alguien deja de trabajar contigo.',
    weight: 2,
    effort: 'rapido',
  },
  {
    id: 'seg-2fa',
    area: 'seguridad',
    prompt: '¿Tienes activada la verificación en dos pasos en el correo, WhatsApp Business y la nube?',
    help: 'Es una de las medidas más efectivas y gratuitas contra el robo de cuentas: aunque roben la contraseña, no pueden entrar.',
    options: [
      { id: 'todas', label: 'Sí, en todas las cuentas importantes', level: 'buena' },
      { id: 'algunas', label: 'Solo en algunas', level: 'mejorable' },
      { id: 'no', label: 'No', level: 'atender' },
      { id: 'nose', label: 'No sé qué es eso', level: 'atender', note: 'Es un código extra que llega al celular al iniciar sesión.' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '2.5' },
      { norma: 'DE 285', articulo: '36' },
    ],
    recommendation:
      'Activa la verificación en dos pasos hoy mismo en el correo, WhatsApp Business, la nube y el banco. Toma pocos minutos por cuenta.',
    weight: 3,
    effort: 'rapido',
  },
  {
    id: 'seg-respaldo',
    area: 'seguridad',
    prompt: 'Si se daña la computadora o un virus secuestra tus archivos, ¿tienes una copia de tus datos?',
    help: 'La ley pide garantizar la disponibilidad y la resiliencia de los datos, no solo su confidencialidad.',
    options: [
      { id: 'automatico', label: 'Sí, copia automática, separada y la hemos probado', level: 'buena' },
      { id: 'manual', label: 'Hacemos copias de vez en cuando', level: 'mejorable' },
      { id: 'no', label: 'No tenemos copia', level: 'atender' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '2.5' },
      { norma: 'DE 285', articulo: '36' },
    ],
    recommendation:
      'Configura una copia automática (en la nube o en un disco que no quede conectado siempre) y prueba restaurar un archivo cada cierto tiempo.',
    weight: 3,
    effort: 'medio',
    core: true,
  },
  {
    id: 'seg-actualizaciones',
    area: 'seguridad',
    prompt: '¿Las computadoras y celulares de trabajo se actualizan y tienen protección antivirus?',
    help: 'La mayoría de los ataques aprovechan fallas que ya tienen solución en una actualización.',
    options: [
      { id: 'si', label: 'Sí, las actualizaciones son automáticas', level: 'buena' },
      { id: 'a-veces', label: 'Cuando nos acordamos', level: 'mejorable' },
      { id: 'no', label: 'Hay equipos viejos que ya no reciben actualizaciones', level: 'atender' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '2.5' },
      { norma: 'DE 285', articulo: '36' },
    ],
    recommendation:
      'Activa las actualizaciones automáticas y la protección incluida en el sistema (por ejemplo, Microsoft Defender). Planifica el reemplazo de equipos sin soporte.',
    weight: 2,
    effort: 'rapido',
  },
  {
    id: 'seg-dispositivos',
    area: 'seguridad',
    prompt: 'Si se pierde una laptop o un celular con datos del negocio, ¿está protegido?',
    help: 'Un equipo perdido sin clave es una filtración de datos.',
    options: [
      { id: 'cifrado', label: 'Sí: tiene clave y el disco está cifrado o se puede borrar a distancia', level: 'buena' },
      { id: 'clave', label: 'Tiene clave de bloqueo, nada más', level: 'mejorable' },
      { id: 'no', label: 'No tiene clave', level: 'atender' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '2.5' },
      { norma: 'DE 285', articulo: '36' },
    ],
    recommendation:
      'Pon clave de bloqueo a todos los equipos, activa el cifrado (BitLocker en Windows, FileVault en Mac; en celulares viene con la clave) y la función de localizar y borrar a distancia.',
    weight: 2,
    effort: 'rapido',
  },
  {
    id: 'seg-cedulas-celular',
    area: 'seguridad',
    prompt: '¿Se guardan fotos de cédulas o documentos de clientes en celulares personales o chats de WhatsApp?',
    help: 'Esas fotos quedan fuera de control: en la galería, en respaldos personales y en el celular de quien se vaya.',
    options: [
      { id: 'no', label: 'No, se guardan solo en el sistema del negocio', level: 'buena' },
      { id: 'a-veces', label: 'A veces pasa', level: 'mejorable' },
      { id: 'habitual', label: 'Sí, es lo normal', level: 'atender' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '2.3' },
      { norma: 'Ley 81', articulo: '2.5' },
      { norma: 'DE 285', articulo: '36' },
    ],
    recommendation:
      'Pide documentos solo si los necesitas; guárdalos en el sistema o carpeta del negocio y bórralos del chat y de la galería.',
    weight: 2,
    effort: 'rapido',
  },
  {
    id: 'seg-papel',
    area: 'seguridad',
    prompt: '¿Qué pasa con los papeles con datos personales que ya no sirven (fichas, copias de cédula)?',
    help: 'Los datos en papel también están protegidos por la ley.',
    options: [
      { id: 'destruye', label: 'Se trituran o destruyen', level: 'buena' },
      { id: 'basura', label: 'Se botan enteros a la basura', level: 'mejorable' },
      { id: 'acumula', label: 'Se acumulan en cajas sin control', level: 'mejorable' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '2.5' },
      { norma: 'Guía ANTAI', articulo: 'Principio de seguridad' },
    ],
    recommendation:
      'Usa una trituradora para papeles con datos y guarda los archivos físicos en un mueble con llave.',
    weight: 1,
    effort: 'rapido',
    showIf: { profile: 'herramientas', anyOf: ['archivo'] },
  },

  // ───────────── Proveedores y nube ─────────────
  {
    id: 'ter-contrato',
    area: 'terceros',
    prompt:
      'Con quienes manejan datos por ti (contador, proveedor de sistema, agencia), ¿tienes un contrato que diga cómo deben cuidarlos?',
    help: 'La ley pide elegir proveedores con garantías suficientes y dejar por escrito sus instrucciones: confidencialidad, seguridad, avisar si hay un incidente y qué hacer con los datos al terminar.',
    options: [
      { id: 'si', label: 'Sí, con cláusulas de protección de datos', level: 'buena' },
      { id: 'generico', label: 'Hay contrato, pero no habla de datos personales', level: 'mejorable' },
      { id: 'no', label: 'No hay contrato escrito', level: 'atender' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '10' },
      { norma: 'Ley 81', articulo: '14' },
      { norma: 'DE 285', articulo: '47' },
      { norma: 'DE 285', articulo: '48' },
    ],
    recommendation:
      'Agrega una cláusula o anexo de protección de datos: usar los datos solo según tus instrucciones, mantener la confidencialidad y la seguridad, avisarte de incidentes y devolver o borrar los datos al terminar.',
    weight: 3,
    effort: 'medio',
    core: true,
    showIf: { profile: 'terceros', anyOf: ['contador', 'ti', 'marketing', 'delivery'] },
  },
  {
    id: 'ter-nube',
    area: 'terceros',
    prompt: '¿Sabes en qué país guarda tus datos tu servicio de nube y si ofrece garantías de protección?',
    help: 'Guardar datos fuera de Panamá es una transferencia internacional: se permite si el destino tiene un nivel de protección adecuado o hay garantías, como cláusulas contractuales.',
    options: [
      { id: 'si', label: 'Sí, revisamos sus términos de privacidad y seguridad', level: 'buena' },
      { id: 'confio', label: 'Usamos un servicio conocido, pero no lo hemos revisado', level: 'mejorable' },
      { id: 'gratis-personal', label: 'Usamos cuentas personales gratuitas para el negocio', level: 'mejorable' },
      NO_SE,
    ],
    refs: [
      { norma: 'Ley 81', articulo: '5' },
      { norma: 'Ley 81', articulo: '33' },
      { norma: 'DE 285', articulo: '51' },
      { norma: 'DE 285', articulo: '53' },
    ],
    recommendation:
      'Usa cuentas de empresa (no personales) y guarda los términos de protección de datos del proveedor. Los grandes proveedores publican sus cláusulas contractuales y certificaciones de seguridad.',
    weight: 2,
    effort: 'medio',
    showIf: { profile: 'herramientas', anyOf: ['nube'] },
  },
  {
    id: 'ter-compartir',
    area: 'terceros',
    prompt: '¿Alguna vez has pasado o vendido listas de clientes a otra empresa?',
    help: 'Transferir datos a otros requiere, por regla general, el consentimiento previo, informado e inequívoco de las personas.',
    options: [
      { id: 'nunca', label: 'Nunca', level: 'buena' },
      { id: 'con-permiso', label: 'Sí, con permiso de las personas y dejando constancia', level: 'buena' },
      { id: 'sin-permiso', label: 'Sí, sin preguntarles', level: 'atender' },
    ],
    refs: [
      { norma: 'Ley 81', articulo: '25' },
      { norma: 'Ley 81', articulo: '32' },
      { norma: 'Ley 81', articulo: '33' },
      { norma: 'DE 285', articulo: '46' },
    ],
    recommendation:
      'No compartas listas sin el permiso de las personas o sin otra base legal clara, y deja constancia escrita de cada entrega: a quién, para qué y por cuánto tiempo.',
    weight: 3,
    effort: 'rapido',
    core: true,
  },

  // ───────────── Si algo sale mal ─────────────
  {
    id: 'inc-plan',
    area: 'incidentes',
    prompt:
      'Un empleado te avisa que alguien entró al correo del negocio y descargó la lista de clientes. ¿Sabes qué hacer?',
    help: 'Actuar rápido limita el daño. La ley pide notificar y documentar las violaciones de seguridad.',
    options: [
      { id: 'pasos', label: 'Sí, tenemos pasos escritos y sabemos a quién llamar', level: 'buena' },
      { id: 'idea', label: 'Tenemos una idea general', level: 'mejorable' },
      { id: 'no', label: 'No sabríamos por dónde empezar', level: 'atender' },
    ],
    refs: [
      { norma: 'DE 285', articulo: '37' },
      { norma: 'DE 285', articulo: '38' },
    ],
    recommendation:
      'Escribe un plan de una página: 1) cambiar contraseñas y cerrar sesiones, 2) averiguar qué datos se afectaron, 3) avisar a la ANTAI y a los afectados en 72 horas si hay riesgo, 4) anotar todo lo ocurrido.',
    weight: 3,
    effort: 'medio',
    core: true,
  },
  {
    id: 'inc-72h',
    area: 'incidentes',
    prompt:
      '¿Sabías que, si una filtración pone en riesgo los datos, debes avisar a la ANTAI y a las personas afectadas en un plazo de 72 horas?',
    help: 'El aviso debe explicar qué pasó, qué datos se comprometieron, qué hiciste y qué puede hacer la persona para protegerse.',
    options: [
      { id: 'si', label: 'Sí, y sabemos cómo hacerlo', level: 'buena' },
      { id: 'sabia', label: 'Lo sabía, pero no sabría cómo hacerlo', level: 'mejorable' },
      { id: 'no', label: 'No lo sabía', level: 'mejorable', note: 'Ahora ya lo sabes: eso cuenta.' },
    ],
    refs: [{ norma: 'DE 285', articulo: '37' }],
    recommendation:
      'Ten listo un modelo de aviso con: la naturaleza del incidente, los datos comprometidos, las acciones tomadas, recomendaciones para la persona y un contacto. El contacto de la ANTAI es protecciondedatos@antai.gob.pa.',
    weight: 2,
    effort: 'rapido',
  },
  {
    id: 'inc-registro',
    area: 'incidentes',
    prompt: '¿Anotas los incidentes de seguridad, aunque sean pequeños (fecha, qué pasó, qué se hizo)?',
    help: 'La ley pide documentar toda violación de seguridad y tener ese registro disponible para la ANTAI.',
    options: [
      { id: 'si', label: 'Sí, llevamos un registro', level: 'buena' },
      { id: 'no', label: 'No llevamos registro', level: 'mejorable' },
    ],
    refs: [{ norma: 'DE 285', articulo: '38' }],
    recommendation:
      'Crea una hoja de registro con cuatro columnas: fecha, qué pasó, qué datos se afectaron y qué medidas se tomaron.',
    weight: 1,
    effort: 'rapido',
  },
  {
    id: 'inc-proveedor',
    area: 'incidentes',
    prompt: '¿Tus proveedores están obligados a avisarte de inmediato si sufren un incidente con tus datos?',
    help: 'El custodio de la base de datos debe informar al responsable de inmediato cuando conoce una violación de seguridad.',
    options: [
      { id: 'si', label: 'Sí, está en el contrato', level: 'buena' },
      { id: 'supongo', label: 'Supongo que nos avisarían', level: 'mejorable' },
      NO_SE,
    ],
    refs: [
      { norma: 'DE 285', articulo: '37' },
      { norma: 'DE 285', articulo: '48.3' },
    ],
    recommendation:
      'Incluye en el contrato con cada proveedor la obligación de avisarte de inmediato de cualquier incidente que afecte tus datos.',
    weight: 2,
    effort: 'rapido',
    showIf: { profile: 'terceros', anyOf: ['contador', 'ti', 'marketing', 'delivery'] },
  },

  // ───────────── Tu equipo ─────────────
  {
    id: 'cul-confidencialidad',
    area: 'cultura',
    prompt: '¿Tus colaboradores firmaron un compromiso de confidencialidad que mencione los datos personales?',
    help: 'El deber de confidencialidad sigue vigente incluso después de que la persona deja de trabajar contigo.',
    options: [
      { id: 'si', label: 'Sí, todos', level: 'buena' },
      { id: 'algunos', label: 'Solo algunos, o es un acuerdo general sin mencionar datos', level: 'mejorable' },
      { id: 'no', label: 'No', level: 'atender' },
      SOLO_YO,
    ],
    refs: [
      { norma: 'Ley 81', articulo: '2.7' },
      { norma: 'Ley 81', articulo: '9' },
      { norma: 'DE 285', articulo: '34' },
    ],
    recommendation:
      'Agrega una cláusula de confidencialidad de datos personales al contrato o pide firmar un compromiso breve, también a los colaboradores actuales.',
    weight: 2,
    effort: 'rapido',
    core: true,
  },
  {
    id: 'cul-capacitacion',
    area: 'cultura',
    prompt: '¿Tu equipo ha recibido alguna charla o guía sobre cómo cuidar los datos de clientes?',
    help: 'La mayoría de los incidentes empiezan con un error humano: un enlace falso, una clave compartida, un archivo enviado a la persona equivocada.',
    options: [
      { id: 'si', label: 'Sí, y la repetimos cada cierto tiempo', level: 'buena' },
      { id: 'una-vez', label: 'Una vez, hace tiempo', level: 'mejorable' },
      { id: 'no', label: 'Nunca', level: 'mejorable' },
      SOLO_YO,
    ],
    refs: [
      { norma: 'DE 285', articulo: '33.8' },
      { norma: 'Guía ANTAI', articulo: 'Principio de seguridad' },
    ],
    recommendation:
      'Haz una charla corta al año (incluso de 30 minutos) sobre contraseñas, mensajes falsos (phishing) y cómo manejar datos de clientes. Puedes usar el reporte de esta evaluación como guía.',
    weight: 2,
    effort: 'medio',
  },
  {
    id: 'cul-responsable',
    area: 'cultura',
    prompt: '¿Hay una persona encargada de los temas de datos personales en tu negocio?',
    help: 'Para empresas privadas, designar un Oficial de Protección de Datos no es obligatorio, pero ayuda y la ANTAI lo toma en cuenta a favor al graduar sanciones.',
    options: [
      { id: 'opd', label: 'Sí, designada formalmente y notificada a la ANTAI', level: 'buena' },
      { id: 'informal', label: 'Sí, alguien se encarga, aunque no sea formal', level: 'buena' },
      { id: 'nadie', label: 'Nadie en particular', level: 'mejorable' },
    ],
    refs: [
      { norma: 'DE 285', articulo: '42' },
      { norma: 'DE 285', articulo: '43' },
      { norma: 'DE 285', articulo: '62.10' },
    ],
    recommendation:
      'Asigna a una persona como punto de contacto para temas de datos personales. Si quieres formalizarla como Oficial de Protección de Datos, notifica su designación a la ANTAI.',
    weight: 1,
    effort: 'rapido',
  },
  {
    id: 'cul-revision',
    area: 'cultura',
    prompt: '¿Revisan, al menos una vez al año, cómo manejan los datos personales?',
    help: 'La seguridad no es algo que se hace una vez: la ley pide revisar y mejorar las medidas de forma periódica.',
    options: [
      { id: 'si', label: 'Sí, tenemos una revisión periódica', level: 'buena' },
      { id: 'no', label: 'No lo hacemos', level: 'mejorable' },
    ],
    refs: [
      { norma: 'DE 285', articulo: '33.2' },
      { norma: 'DE 285', articulo: '36' },
      { norma: 'Guía ANTAI', articulo: 'Hoja de ruta' },
    ],
    recommendation:
      'Pon una fecha fija al año para repetir esta evaluación y revisar tu lista de datos, accesos y proveedores.',
    weight: 1,
    effort: 'rapido',
  },
];
