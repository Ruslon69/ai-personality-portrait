import type { I18nMessages } from '../types';

export const es = {
  shell: {
    notifications: 'Notificaciones',
    footer: 'Para la reflexión personal, no para diagnosticar ni predecir',
    legal: { label: 'Información legal', privacy: 'Privacidad', terms: 'Condiciones' },
    header: {
      closeNavigation: 'Cerrar navegación',
      language: 'Idioma de la interfaz',
      menu: 'Menú',
      openNavigation: 'Abrir navegación',
      openSettings: 'Abrir ajustes',
      settings: 'Ajustes',
    },
    navigation: {
      close: 'Cerrar',
      closeLabel: 'Cerrar menú',
      label: 'Navegación',
      sectionsLabel: 'Secciones de la aplicación',
    },
    skipToContent: 'Ir al contenido principal',
    theme: {
      action: 'Tema actual: {current}. Cambiar a {next}',
      current: 'Tema: {theme}',
      modes: { dark: 'oscuro', light: 'claro', system: 'del sistema' },
      shortModes: { dark: 'Oscuro', light: 'Claro', system: 'Auto' },
    },
  },
  navigation: {
    compatibility: 'Compatibilidad',
    home: 'Inicio',
    myPath: 'Historial',
    numerology: 'Por fecha de nacimiento',
    portrait: 'Retrato',
    profile: 'Mis resultados',
    settings: 'Ajustes',
    tarot: 'Tarot',
  },
  system: {
    compatibility: {
      action: 'Volver al inicio',
      description:
        'Esta sección aún no está disponible. Vuelve al inicio para elegir Tarot, una lectura por fecha de nacimiento o una reflexión personal.',
      title: 'Compatibilidad',
    },
    notFound: {
      action: 'Volver al inicio',
      description: 'Puede que esta página ya no exista o que la dirección contenga un error.',
      title: 'Página no encontrada',
    },
  },
  home: {
    benefits: {
      description:
        'No es otro test que te asigna un tipo, sino una lectura conectada en la que cada observación conserva una fuente clara.',
      eyebrow: 'Qué recibirás',
      title: 'Un retrato en el que los detalles se conectan',
      items: [
        {
          description:
            'Tus respuestas, intereses y los detalles opcionales que elijas forman una imagen coherente, en lugar de una colección de datos aislados.',
          eyebrow: 'Una mirada conectada',
          title: 'Los detalles revelan una imagen más amplia',
        },
        {
          description:
            'Tu retrato muestra una combinación de rasgos y contextos sin definirte como un tipo permanente.',
          eyebrow: 'Tus distintas facetas',
          title: 'Una combinación de rasgos, no una etiqueta',
        },
        {
          description:
            'Las respuestas, la muestra de voz actual y las lecturas por fecha de nacimiento siempre se presentan por separado.',
          eyebrow: 'Fuentes visibles',
          title: 'Más de una forma de mirarte',
        },
        {
          description:
            'Cada observación relevante lleva a una pequeña propuesta realista que puedes probar en tu vida cotidiana.',
          eyebrow: 'Valor práctico',
          title: 'De la reflexión a la acción',
        },
        {
          description:
            'Puedes omitir las partes opcionales. Tú decides qué información y qué lecturas adicionales incluir.',
          eyebrow: 'Tú eliges',
          title: 'Tú decides cuánto explorar',
        },
      ],
    },
    emotion: {
      description:
        'No es una verdad oculta ni una etiqueta fija. Es una forma de reconocer lo que se repite en tus respuestas.',
      eyebrow: 'Una observación sobre ti',
      title: 'A veces, lo más interesante de ti es aquello que aún no has puesto en palabras.',
    },
    final: {
      description:
        'Empieza con unas preguntas breves. Puedes elegir los detalles opcionales después.',
      title: '¿Qué conexiones podrías descubrir?',
    },
    hero: {
      description:
        'Responde unas preguntas y recibe observaciones claras sobre tus hábitos, intereses y reacciones.',
      eyebrow: 'Tu retrato personal',
      primaryCta: 'Crear mi retrato',
      secondaryCta: 'Cómo funciona',
      title: ['Hay más en ti', 'de lo que se ve a simple vista'],
      trustSignals: [
        '3–5 minutos',
        'voz opcional',
        'primera parte gratuita',
        'sin diagnósticos ni etiquetas',
      ],
      visual: {
        ariaLabel:
          'Respuestas, intereses, zodiaco, cálculos por fecha de nacimiento y voz se conectan en una reflexión personal',
        coreLabel: 'Una imagen conectada',
        coreStatus: 'Conectando las facetas que has elegido',
        coreValue: 'Tu retrato',
        layers: ['Respuestas', 'Intereses', 'Zodiaco', 'Numerología', 'Voz'],
      },
    },
    layers: {
      baseLabel: 'Base',
      description: 'Tus respuestas son la base. La voz y la fecha de nacimiento son opcionales.',
      eyebrow: 'Tú decides cuánto explorar',
      optionalLabel: 'Opcional',
      title: 'Elige qué añadir',
      items: [
        {
          description: 'Preguntas breves con opciones de respuesta aportan un contexto útil.',
          label: 'Base',
          title: 'Preguntas breves',
        },
        {
          description: 'Los temas que eliges acercan las observaciones a tu vida.',
          label: 'Base',
          title: 'Intereses',
        },
        {
          badge: 'Opcional',
          description: 'Observaciones técnicas sobre esta muestra, nunca para identificarte.',
          label: 'Muestra actual',
          title: 'Voz',
        },
        {
          badge: 'Interpretación',
          description: 'Una lectura simbólica para reflexionar, no un hecho demostrado.',
          label: 'Por tu fecha de nacimiento',
          title: 'Numerología',
        },
        {
          badge: 'Interpretación',
          description: 'Una referencia familiar que puedes añadir o dejar fuera.',
          label: 'Por tu fecha de nacimiento',
          title: 'Signo del zodiaco',
        },
        {
          badge: 'Interpretación',
          description:
            'Una perspectiva opcional que no valida ni sustituye las observaciones psicológicas.',
          label: 'Opcional',
          title: 'Lectura astrológica',
        },
      ],
    },
    process: {
      description:
        'Mostramos en qué se basa cada observación para que puedas ver conexiones y diferencias, sin conclusiones ocultas.',
      eyebrow: 'Cómo se forma el retrato',
      items: [
        {
          description:
            'Las respuestas breves y los intereses aportan contexto sin un cuestionario largo.',
          title: 'Nos cuentas sobre ti',
        },
        {
          description:
            'La voz y las lecturas por fecha de nacimiento solo se incluyen si las eliges.',
          title: 'Eliges los detalles opcionales',
        },
        {
          description:
            'El sistema compara las observaciones, destaca las coincidencias y mantiene visibles las diferencias.',
          title: 'Las fuentes revelan conexiones y contrastes',
        },
        {
          description:
            'Explora el retrato poco a poco, con pequeñas propuestas prácticas a lo largo del recorrido.',
          title: 'Recibes un resultado personal',
        },
      ],
      origins: [
        'De tus respuestas',
        'De esta muestra de voz',
        'Lectura de los números',
        'Lectura astrológica',
        'Propuesta personal',
      ],
      resultLabel: 'Retrato',
      synthesisLabel: 'Una imagen conectada',
      title: 'Distintas fuentes. Un retrato conectado.',
    },
    privacy: {
      description:
        'La grabación se usa solo para observar el habla en esa muestra concreta. Nunca se utiliza para identificarte.',
      eyebrow: 'Voz y privacidad',
      statement:
        'Puedes omitir la voz. Por defecto, la grabación original se elimina después del análisis.',
      title: 'La voz puede añadir matices, pero tú decides',
    },
  },
  start: {
    essentials: {
      description: 'Una breve guía del formato.',
      eyebrow: 'Antes de empezar',
      title: 'Qué puedes esperar',
      items: [
        { description: 'Hasta llegar al primer resultado.', label: 'Tiempo', title: '3–5 minutos' },
        {
          description: 'No necesitas escribir respuestas largas.',
          label: 'Formato',
          title: 'Preguntas breves',
        },
        {
          badge: 'Tú decides',
          description: 'Puedes omitir cualquier paso opcional.',
          label: 'Tu elección',
          title: 'Solo los detalles que quieras',
        },
      ],
    },
    final: {
      description: 'La primera pantalla presenta una pregunta breve con opciones de respuesta.',
      title: '¿Quieres descubrir cómo se conectan tus facetas?',
    },
    hero: {
      description:
        'Responde unas preguntas breves y recibe observaciones sobre tus hábitos, intereses y reacciones.',
      eyebrow: 'Tu retrato',
      note: '3–5 minutos. Puedes omitir los pasos opcionales.',
      primaryCta: 'Empezar las preguntas',
      title: ['Mírate', 'con más claridad'],
    },
    journey: {
      eyebrow: 'Detalles opcionales',
      title: 'Cómo funciona',
      items: [
        {
          description: 'Unas preguntas sencillas con opciones de respuesta.',
          title: 'Responde las preguntas',
        },
        {
          description: 'Añade intereses, tu fecha de nacimiento o una muestra de voz si quieres.',
          title: 'Añade detalles',
        },
        {
          description:
            'Recibe observaciones personales sin diagnósticos ni afirmaciones definitivas.',
          title: 'Recibe tu resultado',
        },
        {
          description: 'Abre más detalles solo cuando te resulten útiles.',
          title: 'Explora a tu ritmo',
        },
      ],
    },
    privacy: {
      description: 'Tu fecha de nacimiento y tu voz son opcionales. Tú decides qué incluir.',
      eyebrow: 'Sobre tus datos',
      title: 'Tus datos, tu decisión',
    },
    result: {
      description:
        'El retrato se revela poco a poco: primero las observaciones principales, después los detalles, las fuentes y las pequeñas propuestas prácticas.',
      eyebrow: 'Qué viene después',
      points: ['Un retrato personal', 'Propuestas prácticas', 'Primera parte gratuita'],
      title: 'Primero, algo útil. Después, tú decides cuánto explorar.',
    },
  },
} satisfies I18nMessages;
