import type { Locale } from '@shared/i18n';
import type { BirthDateValidationError } from '../types';

export const birthDateCopy: Record<
  Locale,
  {
    actions: { back: string; create: string };
    dateLabel: string;
    errors: Record<BirthDateValidationError, string>;
    formLabel: string;
    formLead: string;
    formTitle: string;
    introduction: { badge: string; lead: string; title: string };
    minimumAge: (years: number) => string;
    privacy: { description: string; title: string };
    skip: { description: string; title: string };
  }
> = {
  es: {
    actions: { back: 'Volver', create: 'Crear mi retrato' },
    dateLabel: 'Fecha de nacimiento',
    errors: {
      future: 'La fecha de nacimiento no puede ser futura.',
      invalid: 'Revisa la fecha e inténtalo de nuevo.',
      'minimum-age': 'Esta función solo está disponible para personas adultas.',
      required: 'Introduce tu fecha de nacimiento o elige omitirla.',
    },
    formLabel: 'Fecha de nacimiento',
    formLead:
      'Las lecturas astrológicas y numerológicas se presentan por separado, nunca como hechos demostrados.',
    formTitle: 'Elige una fecha',
    introduction: {
      badge: 'El último detalle',
      lead: 'Solo se usa para las lecturas opcionales de numerología y zodiaco. No necesitas la hora de nacimiento.',
      title: 'Añade tu fecha de nacimiento',
    },
    minimumAge: (years) => `Para personas de ${years} años o más.`,
    privacy: {
      description: 'Tu fecha se utiliza para este retrato y no se envía a ningún servidor.',
      title: 'Tú decides sobre tu fecha',
    },
    skip: {
      description: 'Tu retrato se creará sin lecturas astrológicas ni numerológicas.',
      title: 'Prefiero no usar mi fecha de nacimiento',
    },
  },
  en: {
    actions: { back: 'Back', create: 'Create my portrait' },
    dateLabel: 'Birth date',
    errors: {
      future: 'Birth date cannot be in the future.',
      invalid: 'Check the date and try again.',
      'minimum-age': 'This feature is currently available only to adults.',
      required: 'Enter your birth date or choose to skip it.',
    },
    formLabel: 'Birth date',
    formLead:
      'Astrology and numerology readings are shown separately and never presented as established facts.',
    formTitle: 'Choose a date',
    introduction: {
      badge: 'Final touch',
      lead: 'It is used only for optional numerology and zodiac readings. Birth time is not required.',
      title: 'Add your birth date',
    },
    minimumAge: (years) => `For ages ${years} and over.`,
    privacy: {
      description: 'Your date is used for this portrait and is not sent to a server.',
      title: 'Your date stays under your control',
    },
    skip: {
      description: 'Your portrait will be created without astrology and numerology readings.',
      title: 'I do not want to use my birth date',
    },
  },
  ru: {
    actions: { back: 'Назад', create: 'Создать мой портрет' },
    dateLabel: 'Дата рождения',
    errors: {
      future: 'Дата рождения не может быть в будущем.',
      invalid: 'Проверьте дату и попробуйте ещё раз.',
      'minimum-age': 'Сейчас этот раздел доступен только совершеннолетним пользователям.',
      required: 'Введите дату рождения или выберите вариант без даты.',
    },
    formLabel: 'Дата рождения',
    formLead:
      'Астрологический и нумерологический разборы будут показаны отдельно и не как установленные факты.',
    formTitle: 'Выберите дату',
    introduction: {
      badge: 'Последний штрих',
      lead: 'Она нужна только для дополнительных разборов по числам и знаку зодиака. Время рождения не требуется.',
      title: 'Добавьте дату рождения',
    },
    minimumAge: (years) => `Для участников от ${years} лет.`,
    privacy: {
      description: 'Дата используется для этого портрета и не отправляется на сервер.',
      title: 'Дата остаётся под вашим контролем',
    },
    skip: {
      description: 'Портрет будет создан без астрологического и нумерологического разборов.',
      title: 'Я не хочу использовать дату рождения',
    },
  },
  uk: {
    actions: { back: 'Назад', create: 'Створити мій портрет' },
    dateLabel: 'Дата народження',
    errors: {
      future: 'Дата народження не може бути в майбутньому.',
      invalid: 'Перевірте дату й спробуйте ще раз.',
      'minimum-age': 'Наразі цей розділ доступний лише повнолітнім користувачам.',
      required: 'Введіть дату народження або оберіть варіант без дати.',
    },
    formLabel: 'Дата народження',
    formLead:
      'Астрологічний і нумерологічний розбори буде показано окремо, а не як встановлені факти.',
    formTitle: 'Виберіть дату',
    introduction: {
      badge: 'Останній штрих',
      lead: 'Вона потрібна лише для додаткових розборів за числами й знаком зодіаку. Час народження не потрібен.',
      title: 'Додайте дату народження',
    },
    minimumAge: (years) => `Для учасників від ${years} років.`,
    privacy: {
      description: 'Дата використовується для цього портрета й не надсилається на сервер.',
      title: 'Дата залишається під вашим контролем',
    },
    skip: {
      description: 'Портрет буде створено без астрологічного й нумерологічного розборів.',
      title: 'Я не хочу використовувати дату народження',
    },
  },
};
