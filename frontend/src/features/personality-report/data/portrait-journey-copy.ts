import type { ProfileLocale } from '@entities/personality-profile';

export const portraitSectionIds = [
  'summary',
  'patterns',
  'communication',
  'energy',
  'contrasts',
  'recommendations',
  'interpretations',
] as const;

export type PortraitSectionId = (typeof portraitSectionIds)[number];
export type PortraitDestinationId = PortraitSectionId | 'portrait-finish';
export type PortraitTransitionKey =
  | 'summary'
  | 'patterns'
  | 'communication'
  | 'energy'
  | 'energyToActions'
  | 'contrasts'
  | 'recommendations'
  | 'recommendationsToFinish'
  | 'interpretations';

type TransitionCopy = { eyebrow: string; lead: string };
type JourneyCopy = {
  sections: Record<PortraitDestinationId, string>;
  transitions: Record<PortraitTransitionKey, TransitionCopy>;
};

export const portraitJourneyCopy = {
  es: {
    sections: {
      summary: 'Lo principal',
      patterns: 'Cómo piensas',
      communication: 'Cómo te comunicas',
      energy: 'Qué te recarga',
      contrasts: 'Cómo te adaptas',
      recommendations: 'Qué probar',
      interpretations: 'Por fecha de nacimiento',
      'portrait-finish': 'Reflexión final',
    },
    transitions: {
      summary: {
        eyebrow: 'Otra perspectiva',
        lead: 'Observa qué formas de pensar se repiten en tus respuestas.',
      },
      patterns: {
        eyebrow: 'Con otras personas',
        lead: 'Ahora descubre cómo pueden aparecer estos patrones en una conversación.',
      },
      communication: {
        eyebrow: 'Tu energía',
        lead: 'Después de una conversación, observa qué te ayuda a recuperar energía.',
      },
      energy: {
        eyebrow: 'El contexto importa',
        lead: 'Distintas circunstancias pueden despertar distintas respuestas.',
      },
      energyToActions: {
        eyebrow: 'A la práctica',
        lead: 'Has visto qué te ayuda a recargarte. Elige un pequeño paso para probar.',
      },
      contrasts: {
        eyebrow: 'A la práctica',
        lead: 'Has visto cómo el contexto cambia tus respuestas. Prueba a llevar una observación a la práctica.',
      },
      recommendations: {
        eyebrow: 'Una perspectiva opcional',
        lead: 'Si quieres, explora tu fecha de nacimiento como una mirada simbólica aparte.',
      },
      recommendationsToFinish: {
        eyebrow: 'Reunir lo aprendido',
        lead: 'Elige qué te resulta útil de esta reflexión y llévatelo contigo.',
      },
      interpretations: {
        eyebrow: 'Reunir lo aprendido',
        lead: 'Esta mirada simbólica es solo un complemento. Tú tienes la última palabra.',
      },
    },
  },
  en: {
    sections: {
      summary: 'Main',
      patterns: 'How you think',
      communication: 'How you communicate',
      energy: 'What restores you',
      contrasts: 'How you adapt',
      recommendations: 'What to try',
      interpretations: 'Birth-date insights',
      'portrait-finish': 'Closing thought',
    },
    transitions: {
      summary: {
        eyebrow: 'Next layer',
        lead: 'Notice which ways of thinking recur in your answers.',
      },
      patterns: {
        eyebrow: 'With others',
        lead: 'Now see how those patterns can appear in conversation.',
      },
      communication: {
        eyebrow: 'Your energy',
        lead: 'After a conversation, notice what helps you regain your energy.',
      },
      energy: {
        eyebrow: 'Context matters',
        lead: 'Different circumstances can bring out different responses.',
      },
      energyToActions: {
        eyebrow: 'Into practice',
        lead: 'You have seen what restores you. Choose one small step to test.',
      },
      contrasts: {
        eyebrow: 'Into practice',
        lead: 'You have seen how context changes your responses. Try putting one insight into practice.',
      },
      recommendations: {
        eyebrow: 'Optional layer',
        lead: 'If you like, explore the birth date as a separate symbolic lens.',
      },
      recommendationsToFinish: {
        eyebrow: 'Bring it together',
        lead: 'Choose what feels useful to take from this reflection.',
      },
      interpretations: {
        eyebrow: 'Bring it together',
        lead: 'This symbolic lens is only an addition. The final say is yours.',
      },
    },
  },
  ru: {
    sections: {
      summary: 'Главное',
      patterns: 'Как вы думаете',
      communication: 'Как вы общаетесь',
      energy: 'Что вас заряжает',
      contrasts: 'Где вы меняетесь',
      recommendations: 'Что попробовать',
      interpretations: 'По дате рождения',
      'portrait-finish': 'Заключение',
    },
    transitions: {
      summary: {
        eyebrow: 'Следующий слой',
        lead: 'Посмотрите, какие способы мышления чаще повторяются в ваших ответах.',
      },
      patterns: {
        eyebrow: 'Рядом с другими',
        lead: 'Теперь — как эти привычные способы проявляются в общении.',
      },
      communication: {
        eyebrow: 'Ваши силы',
        lead: 'После общения важно понять, что помогает вам восстанавливаться.',
      },
      energy: {
        eyebrow: 'Контекст',
        lead: 'В разных обстоятельствах ваши реакции могут меняться.',
      },
      energyToActions: {
        eyebrow: 'К практике',
        lead: 'Вы уже заметили, что даёт силы. Теперь выберите небольшой шаг для проверки.',
      },
      contrasts: {
        eyebrow: 'К практике',
        lead: 'Вы увидели, где можете меняться. Попробуйте применить один вывод.',
      },
      recommendations: {
        eyebrow: 'Необязательный слой',
        lead: 'Если хотите, взгляните на дату рождения как на отдельный символический контекст.',
      },
      recommendationsToFinish: {
        eyebrow: 'Собрать вместе',
        lead: 'Выберите из этого разбора то, что стоит взять с собой.',
      },
      interpretations: {
        eyebrow: 'Собрать вместе',
        lead: 'Символический взгляд — лишь дополнение. Последнее слово остаётся за вами.',
      },
    },
  },
  uk: {
    sections: {
      summary: 'Головне',
      patterns: 'Як ви думаєте',
      communication: 'Як ви спілкуєтеся',
      energy: 'Що вас заряджає',
      contrasts: 'Де ви змінюєтеся',
      recommendations: 'Що спробувати',
      interpretations: 'За датою народження',
      'portrait-finish': 'Підсумок',
    },
    transitions: {
      summary: {
        eyebrow: 'Наступний шар',
        lead: 'Подивіться, які способи мислення найчастіше повторюються у ваших відповідях.',
      },
      patterns: {
        eyebrow: 'Поруч з іншими',
        lead: 'Тепер — як ці звичні способи проявляються у спілкуванні.',
      },
      communication: {
        eyebrow: 'Ваші сили',
        lead: 'Після спілкування варто помітити, що допомагає вам відновлюватися.',
      },
      energy: {
        eyebrow: 'Контекст',
        lead: 'За різних обставин ваші реакції можуть змінюватися.',
      },
      energyToActions: {
        eyebrow: 'До практики',
        lead: 'Ви вже помітили, що додає сил. Тепер оберіть невеликий крок для перевірки.',
      },
      contrasts: {
        eyebrow: 'До практики',
        lead: 'Ви побачили, де можете змінюватися. Спробуйте застосувати один висновок.',
      },
      recommendations: {
        eyebrow: 'Необов’язковий шар',
        lead: 'За бажанням погляньте на дату народження як на окремий символічний контекст.',
      },
      recommendationsToFinish: {
        eyebrow: 'Зібрати разом',
        lead: 'Оберіть із цього розбору те, що варто взяти із собою.',
      },
      interpretations: {
        eyebrow: 'Зібрати разом',
        lead: 'Символічний погляд — лише доповнення. Останнє слово залишається за вами.',
      },
    },
  },
} as const satisfies Record<ProfileLocale, JourneyCopy>;
