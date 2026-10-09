import type { TraitId, TraitTemplate } from '../model';

export const spanishTraitTemplates: Readonly<Record<TraitId, TraitTemplate>> = {
  adaptability: {
    strengthDetails:
      'Varias respuestas dan prioridad a adaptarte a las circunstancias en lugar de seguir un único guion.',
    growthDetails:
      'Antes de cambiar un plan, nombra lo que importa conservar. Así puedes adaptarte sin perder el rumbo.',
    energyDetails: 'Alterna formas de descansar y deja un poco de margen para ajustar el plan.',
    recommendationLabel: 'Para un plan que cambia',
    label: 'adaptabilidad',
    strengthTitle: 'Pensamiento flexible',
    strengthDescription: 'Ajustas el enfoque cuando cambia la situación.',
    growthTitle: 'Conserva un punto de apoyo',
    growthDescription: 'La flexibilidad funciona mejor cuando una prioridad sigue clara.',
    energyTitle: 'Libertad para cambiar de ritmo',
    energyDescription:
      'Un ritmo flexible puede ayudarte a recuperarte sin imponer una sola rutina.',
    recommendationTitle: 'Prepara una ruta alternativa',
    recommendationDescription: 'Deja una variación posible en el próximo plan.',
    recommendationDetails:
      'Define el paso principal y una alternativa aceptable antes de que cambien las circunstancias.',
  },
  autonomy: {
    strengthDetails:
      'Tus respuestas valoran el espacio propio para revisar una decisión y recuperar claridad.',
    growthDetails:
      'No tienes que explicarlo todo. Define el límite y cuándo podrás retomar el contacto.',
    energyDetails:
      'Un rato sin nuevas exigencias puede ayudarte a separar tus prioridades del ruido exterior.',
    recommendationLabel: 'Para tu espacio personal',
    label: 'independencia',
    strengthTitle: 'Criterio propio',
    strengthDescription:
      'Valoras el espacio para contrastar las decisiones con tus propios criterios.',
    growthTitle: 'Expresa tu necesidad de espacio',
    growthDescription:
      'Es más fácil que otras personas respeten tu espacio cuando conocen sus límites.',
    energyTitle: 'Tiempo a tu ritmo',
    energyDescription: 'Una pausa breve sin nuevas exigencias puede devolverte claridad.',
    recommendationTitle: 'Define los límites de una pausa',
    recommendationDescription: 'Reserva un breve periodo sin nuevas peticiones.',
    recommendationDetails: 'Di cuándo empieza tu pausa y cuándo prevés retomar el contacto.',
  },
  connection: {
    strengthDetails:
      'Varias respuestas dan importancia a la confianza, a la disposición de la otra persona y a una conversación tranquila.',
    growthDetails:
      'Antes de una conversación importante, expresa una necesidad propia con la misma claridad con la que atiendes al estado de la otra persona.',
    energyDetails: 'Elige una conversación que no exija una decisión inmediata ni un ritmo rápido.',
    recommendationLabel: 'Para una conversación',
    label: 'conexión',
    strengthTitle: 'Atención a las relaciones',
    strengthDescription:
      'Notas cómo la confianza y la forma de conversar influyen en el resultado.',
    growthTitle: 'Inclúyete en la conversación',
    growthDescription: 'Cuidar la relación también puede incluir tus propias necesidades.',
    energyTitle: 'Contacto sin presión',
    energyDescription:
      'Un intercambio tranquilo con alguien de confianza puede devolverte energía.',
    recommendationTitle: 'Empieza por lo que comparten',
    recommendationDescription:
      'Abre una conversación difícil nombrando lo que ambas personas quieren conservar.',
    recommendationDetails: 'Expresa el objetivo común en una frase antes de abordar el desacuerdo.',
  },
  directness: {
    strengthDetails:
      'Tus respuestas valoran las palabras breves y concretas al dar comentarios o mantener una conversación difícil.',
    growthDetails:
      'Añade una frase sobre el propósito de la conversación. Puede ayudar a que la otra persona escuche el sentido, además de la petición.',
    energyDetails:
      'Con acuerdos explícitos, no tienes que adivinar continuamente el siguiente paso.',
    recommendationLabel: 'Para un acuerdo claro',
    label: 'claridad',
    strengthTitle: 'Comunicación directa',
    strengthDescription:
      'Valoras las expectativas y los límites que se entienden sin tener que adivinarlos.',
    growthTitle: 'Da contexto a la claridad',
    growthDescription: 'Una postura clara se recibe mejor cuando su propósito es visible.',
    energyTitle: 'Claridad sin suposiciones',
    energyDescription: 'Los acuerdos explícitos pueden reducir tensiones innecesarias.',
    recommendationTitle: 'Separa el hecho de la petición',
    recommendationDescription: 'Convierte una petición importante en una frase concreta.',
    recommendationDetails: 'Nombra por separado el hecho, la petición y el momento que prefieres.',
  },
  initiative: {
    strengthDetails:
      'Tus respuestas muestran disposición a iniciar una conversación, probar un enfoque o asumir la responsabilidad de avanzar.',
    growthDetails: 'Antes de actuar, pregúntate qué resultado indicaría que ese enfoque funciona.',
    energyDetails:
      'Elige un paso con un resultado visible en lugar de intentar resolver toda la tarea de una vez.',
    recommendationLabel: 'Para empezar',
    label: 'iniciativa',
    strengthTitle: 'Impulso para avanzar',
    strengthDescription: 'Puedes convertir una intención en un primer movimiento concreto.',
    growthTitle: 'Comprueba el rumbo',
    growthDescription: 'Un comienzo rápido gana fuerza con una breve comprobación de la realidad.',
    energyTitle: 'Energía después del primer paso',
    energyDescription: 'Una pequeña acción terminada puede devolverte impulso.',
    recommendationTitle: 'Haz un pequeño experimento',
    recommendationDescription: 'Convierte tu próxima idea en un paso que puedas comprobar.',
    recommendationDetails: 'Elige una acción que termine pronto y te aporte información nueva.',
  },
  openness: {
    strengthDetails:
      'Tus respuestas muestran disposición a cambiar de entorno, probar enfoques y observar tu propia reacción.',
    growthDetails:
      'Antes de probar una opción nueva, decide qué quieres comprobar u obtener de ella.',
    energyDetails: 'Prueba un pequeño cambio de entorno que no te exija otro compromiso grande.',
    recommendationLabel: 'Para una mirada nueva',
    label: 'apertura',
    strengthTitle: 'Apertura a las posibilidades',
    strengthDescription: 'Los enfoques y las perspectivas nuevas pueden mantener tu interés.',
    growthTitle: 'Dale rumbo a la curiosidad',
    growthDescription: 'La variedad resulta más útil cuando sabes qué quieres explorar.',
    energyTitle: 'Un pequeño cambio de entorno',
    energyDescription: 'Un entorno o una idea nueva puede renovar suavemente tu atención.',
    recommendationTitle: 'Cambia un elemento',
    recommendationDescription: 'Añade un enfoque desconocido a una tarea familiar.',
    recommendationDetails: 'Experimenta con una parte del proceso en lugar de sustituirlo todo.',
  },
  practicality: {
    strengthDetails:
      'La ayuda concreta, los avances visibles y un siguiente paso claro se repiten en tus respuestas.',
    growthDetails:
      'Después de elegir una solución viable, comprueba si sirve al objetivo principal, además de facilitar el siguiente paso.',
    energyDetails:
      'Elige una acción con un final claro y deja temporalmente aparte lo que no le corresponda.',
    recommendationLabel: 'Para pasar a la práctica',
    label: 'sentido práctico',
    strengthTitle: 'Un enfoque práctico',
    strengthDescription: 'Valoras las opciones que se pueden aplicar y comprobar en la vida real.',
    growthTitle: 'Conecta la acción con su sentido',
    growthDescription:
      'Una respuesta que funciona también puede revisarse a la luz del propósito general.',
    energyTitle: 'La sensación de terminar',
    energyDescription: 'Un paso terminado puede aportar más claridad que una lista larga.',
    recommendationTitle: 'Define qué significa terminar',
    recommendationDescription: 'Reduce la tarea a su próximo resultado observable.',
    recommendationDetails:
      'Anota una acción, cómo sabrás que está terminada y cuándo la revisarás.',
  },
  reflection: {
    strengthDetails:
      'Hacer una pausa, observar o revisar tu propia reacción antes de actuar se repite en tus respuestas.',
    growthDetails: 'Decide de antemano qué información basta y cuándo pasar de pensar a actuar.',
    energyDetails:
      'Incluso una pausa breve sin información nueva puede ayudarte a poner en palabras tu reacción y elegir el siguiente paso.',
    recommendationLabel: 'Para una decisión importante',
    label: 'reflexión',
    strengthTitle: 'Una mirada reflexiva',
    strengthDescription: 'Te das tiempo para observar el contexto antes de actuar.',
    growthTitle: 'Reconoce cuándo es suficiente',
    growthDescription: 'La reflexión ayuda hasta que retrasa una comprobación útil en la práctica.',
    energyTitle: 'Espacio para asimilar',
    energyDescription: 'Una pausa sin decisiones nuevas puede devolverte claridad.',
    recommendationTitle: 'Limita el tiempo de reflexión',
    recommendationDescription: 'Define cuánto tiempo dedicarás a pensar la próxima decisión.',
    recommendationDetails: 'Elige un plazo y dos criterios que basten para el siguiente paso.',
  },
  structure: {
    strengthDetails:
      'Los hechos, un plan, los avances visibles y los ejemplos concretos se repiten en tus respuestas.',
    growthDetails:
      'Separa lo esencial del plan de aquello que puedes revisar sin perder el resultado.',
    energyDetails: 'Céntrate en la etapa más cercana y en qué significaría completarla.',
    recommendationLabel: 'Para un plan claro',
    label: 'estructura',
    strengthTitle: 'Pensamiento organizado',
    strengthDescription: 'Creas claridad con secuencias, criterios y avances visibles.',
    growthTitle: 'Deja margen dentro del plan',
    growthDescription:
      'La estructura sigue siendo útil cuando las circunstancias pueden modificarla.',
    energyTitle: 'Un siguiente paso claro',
    energyDescription: 'Una secuencia visible puede reducir la sensación de sobrecarga.',
    recommendationTitle: 'Elige tres referencias',
    recommendationDescription: 'Reduce la próxima decisión a tres puntos de referencia útiles.',
    recommendationDetails:
      'Define un requisito imprescindible, una preferencia y una condición para reconsiderar.',
  },
};
