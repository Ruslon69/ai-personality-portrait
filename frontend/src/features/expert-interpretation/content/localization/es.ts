import type { ContentDictionary } from './types';

export const esContent: ContentDictionary = {
  closing: [
    'Usa esta lectura como una invitación a reflexionar. La decisión sigue siendo tuya.',
    'Conserva lo que te ayude a ver la situación con más claridad y elige después un pequeño paso.',
    'Contrasta la interpretación con lo que ocurre; no la tomes como una respuesta ya hecha.',
  ],
  connection: {
    reinforcement: [
      '{left} propone el primer paso, mientras {right} ayuda a mantener el rumbo elegido.',
      'Los temas de {left} y {right} se repiten juntos; conviene leerlos como un mismo hilo.',
    ],
    contrast: [
      'Una línea lleva hacia {left} y la otra vuelve a {right}; la distancia entre ambas invita a elegir con intención.',
      '{left} invita a moverte, mientras {right} pide aclarar primero las condiciones de ese paso.',
    ],
    progression: [
      '{left} abre el tema y {right} muestra cómo podría desarrollarse.',
      'La lectura pasa de {left} a {right}, con una pausa para comprobar qué ha cambiado.',
    ],
    blockage: [
      '{left} y {right} señalan un punto donde el esfuerzo aún no produce avances.',
      'En esta combinación, {left} encuentra una limitación relacionada con {right}.',
    ],
    opportunity: [
      '{left} ofrece un punto de entrada y {right} sugiere qué apoyo podría ayudar.',
      'La conexión entre {left} y {right} abre una opción que puedes probar con un pequeño paso.',
    ],
    'unresolved-tension': [
      '{left} y {right} apuntan en direcciones distintas; merece la pena mantener visible esa diferencia.',
      'Entre {left} y {right} queda una pregunta que necesita contexto, no una conclusión rápida.',
    ],
    'practical-direction': [
      '{left} se convierte en una orientación para observar algo concreto, no en una promesa.',
      'Puedes llevar el tema de {left} a un pequeño paso y comprobar la respuesta real.',
    ],
  },
  contextual: [
    'Relaciona el significado de la carta con lo que ocurre ahora en torno a {context}.',
    'Para tu pregunta, céntrate en lo que realmente ocurre en torno a {context}.',
    'El tema de {context} ayuda a acercar el significado de la carta a tu situación.',
  ],
  headline: {
    'card-of-the-day': ['Presta atención a {focus} hoy', 'El día devuelve tu atención a {focus}'],
    week: ['Presta atención a {focus} esta semana', 'Puede ayudar volver a {focus} esta semana'],
    month: ['Presta atención a {focus} este mes', 'Puede ayudar volver a {focus} este mes'],
    'compact-year': ['Presta atención a {focus} este año', 'Vuelve a {focus} a lo largo del año'],
    love: [
      'Presta atención a {focus} en esta relación',
      'Una conversación honesta puede ayudar con {focus}',
    ],
    'work-study': [
      'Presta atención a {focus} en el trabajo',
      'Puede ayudar volver a {focus} en el trabajo',
    ],
    money: [
      'Presta atención a {focus} en cuestiones de dinero',
      'Vuelve a {focus} antes de una decisión económica',
    ],
    decision: [
      'Presta atención a {focus} antes de elegir',
      'Puede ayudar volver a {focus} antes de decidir',
    ],
  },
  interestExamples: {
    music: ['encontrar un ritmo en el que una pausa no detenga el movimiento'],
    travel: ['revisar la ruta antes de la siguiente transición'],
    technology: ['comprobar la señal antes de actualizar todo el sistema'],
    sport: ['elegir un ritmo que deje espacio para recuperarte'],
    creativity: ['dar forma a una idea con un pequeño experimento'],
    learning: ['convertir una observación en práctica para una habilidad nueva'],
    relationships: ['nombrar un límite y dejar espacio para el diálogo'],
    'people-relationships': ['nombrar un límite y dejar espacio para el diálogo'],
  },
  localeSignature: ['tu', 'tú'],
  numberThemes: {
    1: 'un comienzo independiente',
    2: 'la cooperación y el equilibrio',
    3: 'la expresión y el intercambio',
    4: 'la estructura y una forma estable',
    5: 'el cambio y la libertad de elección',
    6: 'la responsabilidad y el cuidado',
    7: 'la reflexión y la revisión de tu propia reacción',
    8: 'la administración de recursos',
    9: 'el cierre y una mirada más amplia',
    11: 'una mayor sensibilidad al rumbo',
    22: 'dar forma práctica a una gran idea',
    33: 'el apoyo responsable sin perder los límites',
  },
  numerology: {
    core: ['El número principal invita a prestar atención a {numberTheme}.'],
    social: [
      'El número de primera impresión ofrece una mirada a {numberTheme} en el contacto con otras personas.',
    ],
    period: [
      'El número del periodo actual apunta a {numberTheme}; es un contexto, no una predicción de acontecimientos.',
    ],
    practical: ['El número {number} propone un pequeño paso y atención a {numberTheme}.'],
    relational: [
      'En las relaciones, el contexto numérico destaca {numberTheme}, sin pretender conocer los pensamientos de otra persona.',
    ],
    tension: [
      'La diferencia entre los números muestra dos énfasis simbólicos que no tienen por qué coincidir.',
    ],
    tarot: [
      'El número {number} invita a atender a {numberTheme} sin cambiar el significado de la carta.',
    ],
  },
  opening: {
    'card-of-the-day': [
      'Una carta ofrece un enfoque breve para hoy.',
      'Esta lectura empieza con un hilo claro.',
    ],
    week: [
      'Cinco posiciones muestran el recorrido de la semana desde su comienzo hasta un resultado posible.',
      'La lectura semanal muestra un comienzo, una posible dificultad, el apoyo y un resultado.',
    ],
    month: [
      'La lectura mensual conecta el trabajo, las relaciones, el estado interior y la orientación práctica.',
      'Seis posiciones presentan el mes como un ciclo conectado, no como promesas aisladas.',
    ],
    'compact-year': [
      'La lectura anual señala una base, cuatro etapas y el tema que las conecta.',
      'Este formato muestra el ritmo general del año sin asignar acontecimientos a fechas exactas.',
    ],
    love: [
      'La lectura separa tu postura, lo que ocurre entre ambas personas, la dificultad y una posible conversación.',
      'El foco está en la conexión observable, sin adivinar lo que piensa otra persona.',
    ],
    'work-study': [
      'Cinco posiciones conectan la situación actual, el recurso, el obstáculo y el siguiente paso.',
      'Esta lectura distingue un punto fuerte disponible de lo que aún conviene comprobar.',
    ],
    money: [
      'La lectura de recursos separa la reflexión de una promesa económica.',
      'Cinco posiciones exploran el enfoque, el recurso, el riesgo y un límite práctico.',
    ],
    decision: [
      'Esta lectura no elige por ti; muestra cinco perspectivas de la situación.',
      'Las posiciones separan lo visible, lo que puede pasar desapercibido y la acción disponible.',
    ],
  },
  orientation: {
    upright: ['La carta al derecho invita a abordar {focus} directamente.'],
    'inner-expression': ['La carta invertida invita a observar lo que sientes sobre {focus}.'],
    delay: [
      'La carta invertida muestra una demora en torno a {focus}, no una prohibición definitiva.',
    ],
    blockage: [
      'La carta invertida señala un obstáculo en torno a {focus}. Nómbralo con la mayor claridad posible.',
    ],
    excess: ['La carta invertida invita a revisar si {focus} ha cobrado demasiado peso.'],
    lack: ['En esta posición puede faltar la cualidad relacionada con {focus}.'],
    reassessment: ['La posición invertida trae de vuelta {focus} para revisarlo.'],
    revision: ['Esta carta invita a revisar tu manera habitual de abordar {focus}.'],
  },
  position: {
    temporal: ['En esta etapa, {focus} marca un ritmo, no un acontecimiento fijo.'],
    supportive: ['En una posición de apoyo, {focus} apunta a un recurso que quizá ya tengas.'],
    restrictive: [
      'En una posición de limitación, {focus} indica dónde puede ayudar bajar el ritmo y comprobar las condiciones.',
    ],
    hidden: ['Aquí, {focus} señala algo que puede pasar desapercibido al principio.'],
    relational: [
      'Aquí, {focus} describe lo que puedes observar entre ambas personas, no lo que la otra pueda estar pensando.',
    ],
    directional: [
      'Como orientación, {focus} se convierte en una opción para probar con una acción.',
    ],
    reflective: ['Esta carta invita a observar más de cerca {focus}.'],
    'outcome-oriented': [
      'En una posición de resultado, {focus} describe un rumbo posible, no un final garantizado.',
    ],
  },
  practical: [
    'Elige un pequeño paso relacionado con {focus} y observa después la respuesta real.',
    'Prueba este tema en un contexto limitado en lugar de cambiarlo todo a la vez.',
    'Nombra el apoyo que ya tienes y elige una acción que aún puedas ajustar.',
  ],
  psychological: [
    'Tus respuestas sugieren que {context} importa más ahora, sin convertirlo en un rasgo permanente.',
    'Tus elecciones apuntan a {context} en esta situación. Esto ayuda a adaptar la orientación sin definir tu carácter.',
    'Tus respuestas conectan la lectura con {context}. Tu reacción puede ser distinta en otra situación.',
  ],
  reflection: [
    '¿Dónde aparece ya {focus} en los hechos y dónde sigue siendo solo una expectativa?',
    '¿Qué pequeño ejemplo te ayudaría a comprobar {focus} sin llegar demasiado pronto a una conclusión?',
    '¿Qué cambia si tomas {focus} como una pregunta y no como una respuesta ya hecha?',
  ],
  safeFallback: {
    boundary:
      'Conserva un límite práctico: apóyate en hechos comprobables y no tomes una decisión importante solo a partir de una lectura simbólica.',
    conversation:
      'En lugar de suponer lo que piensa otra persona, puedes formular una pregunta directa y respetuosa.',
    reflection:
      'Es más prudente usar este tema como una invitación a reflexionar que como una afirmación sobre el futuro.',
  },
  sectionHeadline: [
    'Presta atención a {focus}',
    'Mira más de cerca {focus}',
    'La pregunta principal vuelve a {focus}',
  ],
  transitions: [
    'Al mismo tiempo',
    'La siguiente parte',
    'En relación con esto',
    'También conviene observar',
  ],
  uncertainty: [
    'Es una posible interpretación simbólica, no la promesa de un acontecimiento.',
    'La lectura puede ayudarte a reflexionar, pero no sustituye tu decisión.',
    'Contrasta esta conexión con el contexto real en lugar de tomarla como un hecho demostrado.',
  ],
};
