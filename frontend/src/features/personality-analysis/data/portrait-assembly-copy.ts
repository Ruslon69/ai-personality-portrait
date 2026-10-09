import type { ProfileLocale } from '@entities/personality-profile';

export const portraitAssemblyCopy = {
  es: {
    overview: (primary: string, secondary: string) =>
      `Tus elecciones combinan ${primary} con ${secondary}. El equilibrio puede cambiar según el contexto, en lugar de permanecer fijo.`,
    recommendationContext: (interest: string) =>
      ` Pruébalo en una situación relacionada con ${interest}.`,
    communication: 'Forma de comunicarte',
    energy: 'Energía y descanso',
  },
  en: {
    overview: (primary: string, secondary: string) =>
      `Your choices combine ${primary} with ${secondary}. The balance may shift with context rather than staying fixed.`,
    recommendationContext: (interest: string) =>
      ` Try it in a situation connected with ${interest}.`,
    communication: 'Communication style',
    energy: 'Energy and recovery',
  },
  ru: {
    overview: (primary: string, secondary: string) =>
      `В ваших выборах одновременно заметны ${primary} и ${secondary}. Их баланс может меняться вместе с контекстом.`,
    recommendationContext: (interest: string) =>
      ` Попробуйте это в ситуации, связанной с ${interest}.`,
    communication: 'Стиль общения',
    energy: 'Энергия и восстановление',
  },
  uk: {
    overview: (primary: string, secondary: string) =>
      `У ваших виборах поєднуються ${primary} і ${secondary}. Їхній баланс може змінюватися разом із контекстом.`,
    recommendationContext: (interest: string) =>
      ` Спробуйте це в ситуації, пов’язаній із ${interest}.`,
    communication: 'Стиль спілкування',
    energy: 'Енергія та відновлення',
  },
} satisfies Record<ProfileLocale, unknown>;

export const portraitHeroPhrase: Record<
  ProfileLocale,
  (primary: string, secondary: string, interest?: string, hasInterpretations?: boolean) => string
> = {
  es: (primary: string, secondary: string, interest?: string, hasInterpretations?: boolean) =>
    `Combinas ${primary} con ${secondary}${interest ? `, especialmente al explorar ${interest}` : ''}${hasInterpretations ? '; las lecturas opcionales por fecha se muestran aparte' : ''}.`,
  en: (primary: string, secondary: string, interest?: string, hasInterpretations?: boolean) =>
    `You combine ${primary} with ${secondary}${interest ? `, especially when exploring ${interest}` : ''}${hasInterpretations ? ' — with optional birth-date insights shown separately' : ''}.`,
  uk: (primary: string, secondary: string, interest?: string, hasInterpretations?: boolean) =>
    `Ви поєднуєте ${primary} і ${secondary}${interest ? `, особливо коли досліджуєте ${interest}` : ''}${hasInterpretations ? ' — а доповнення за датою народження показано окремо' : ''}.`,
  ru: (primary: string, secondary: string, interest?: string, hasInterpretations?: boolean) =>
    `Вы сочетаете ${primary} и ${secondary}${interest ? `, особенно когда вас интересует ${interest}` : ''}${hasInterpretations ? ' — а дополнение по дате рождения показано отдельно' : ''}.`,
};
