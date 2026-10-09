import type { Locale } from '@shared/i18n';

type Copy = {
  interestDescription: (label: string) => string;
  interestTitle: string;
  voiceTitle: string;
  voiceDescription: (seconds: number) => string;
  birthTitle: string;
  birthDescription: string;
};
export const evidenceAssemblyCopy: Record<Locale, Copy> = {
  es: {
    interestDescription: (label: string) =>
      `Has elegido «${label}». Solo se utiliza para personalizar los ejemplos.`,
    interestTitle: 'Interés elegido',
    voiceTitle: 'Muestra de voz actual',
    voiceDescription: (seconds: number) =>
      `Una grabación local de ${seconds} ${seconds === 1 ? 'segundo' : 'segundos'} ha superado la validación técnica. No se extraen conclusiones sobre tu personalidad a partir de ella.`,
    birthTitle: 'Fecha de nacimiento añadida',
    birthDescription: 'La fecha se utiliza solo para las lecturas opcionales que has elegido.',
  },
  en: {
    interestDescription: (label: string) =>
      `You chose “${label}”. It is used only to personalize examples.`,
    interestTitle: 'Selected interest',
    voiceTitle: 'Current voice sample',
    voiceDescription: (seconds: number) =>
      `A local ${seconds}-second recording passed technical validation. No personality inference is made from it.`,
    birthTitle: 'Birth date added',
    birthDescription: 'The date is used only for the optional readings you selected.',
  },
  uk: {
    interestDescription: (label: string) =>
      `Ви обрали «${label}». Цей інтерес використано лише для персоналізації прикладів.`,
    interestTitle: 'Обраний інтерес',
    voiceTitle: 'Поточний голосовий запис',
    voiceDescription: (seconds: number) =>
      `Локальний запис (${seconds} с) пройшов технічну перевірку. Висновки про особистість із нього не робляться.`,
    birthTitle: 'Дату народження додано',
    birthDescription: 'Дата використовується лише для додаткових розборів, які ви обрали.',
  },
  ru: {
    interestDescription: (label: string) => `Этот интерес выбран добровольно: «${label}».`,
    interestTitle: 'Выбранный интерес',
    voiceTitle: 'Текущая голосовая запись',
    voiceDescription: (seconds: number) =>
      `Локальная запись (${seconds} с) прошла техническую проверку. По ней не делаются выводы о личности.`,
    birthTitle: 'Дата рождения добавлена',
    birthDescription: 'Дата используется только для дополнительных разборов, которые вы выбрали.',
  },
};
