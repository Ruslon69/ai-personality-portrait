import type { ProfileLocale } from '@entities/personality-profile';
import type { ZodiacProfile, ZodiacElement, ZodiacModality } from '@features/numerology/types';
import { zodiacNotes, zodiacQualityLabels } from '@features/numerology/data/zodiac-copy';
import { formatDate } from '@shared/i18n';
type BirthDateInterpretationCopy = {
  numerologyEvidenceTitle: (number: number) => string;
  numerologyEvidenceDescription: string;
  numerologyTitle: (number: number) => string;
  numerologyDescription: (number: number) => string;
  numerologyContext: string;
  zodiacEvidenceTitle: (label: string) => string;
  zodiacEvidenceDescription: string;
  zodiacTitle: (label: string) => string;
  zodiacDescription: (label: string, sign: ZodiacProfile) => string;
  zodiacContext: string;
  astrologyEvidenceTitle: string;
  astrologyEvidenceDescription: (birthDate: string, locale: ProfileLocale) => string;
  astrologyTitle: string;
  astrologyDescription: (
    signLabel: string,
    element: ZodiacElement,
    modality: ZodiacModality,
  ) => string;
  astrologyContext: string;
};
export const birthDateInterpretationCopy: Record<ProfileLocale, BirthDateInterpretationCopy> = {
  es: {
    numerologyEvidenceTitle: (number: number) => `Cálculo numerológico: ${number}`,
    numerologyEvidenceDescription:
      'Calculado solo a partir de los dígitos de la fecha de nacimiento indicada.',
    numerologyTitle: (number: number) => `Tu número principal: ${number}`,
    numerologyDescription: (number: number) =>
      `La numerología utiliza el ${number} como punto de partida para explorar hábitos y elecciones habituales.`,
    numerologyContext:
      'No define tu personalidad ni predice acontecimientos. El cálculo suma los dígitos de la fecha introducida y conserva 11, 22 y 33 como resultados separados.',
    zodiacEvidenceTitle: (label: string) => `Signo del zodiaco: ${label}`,
    zodiacEvidenceDescription:
      'El signo se obtiene solo de la fecha, sin hora ni lugar de nacimiento.',
    zodiacTitle: (label: string) => `${label}: una lectura opcional`,
    zodiacDescription: (label: string, sign: ZodiacProfile) =>
      `En esta tradición, ${label} se relaciona con ${zodiacNotes.es[sign.signId as keyof typeof zodiacNotes.es]}.`,
    zodiacContext:
      'Es una interpretación cultural y de entretenimiento, no un hecho demostrado sobre la personalidad.',
    astrologyEvidenceTitle: 'Lectura astrológica por fecha',
    astrologyEvidenceDescription: (birthDate: string, locale: ProfileLocale) =>
      `Solo se ha utilizado la fecha ${formatDate(birthDate, locale)}; no se han recogido la hora ni el lugar de nacimiento.`,
    astrologyTitle: 'Retrato astrológico por fecha',
    astrologyDescription: (signLabel: string, element: ZodiacElement, modality: ZodiacModality) =>
      `${signLabel} se asocia con el elemento ${zodiacQualityLabels.es[element]}. En esta tradición, el signo ${zodiacQualityLabels.es[modality]}.`,
    astrologyContext:
      'Es una interpretación simbólica popular basada solo en la fecha. No es una carta natal y no afecta al grado de respaldo de las observaciones psicológicas.',
  },
  en: {
    numerologyEvidenceTitle: (number: number) => `Numerology calculation: ${number}`,
    numerologyEvidenceDescription: 'Calculated only from the digits of the provided birth date.',
    numerologyTitle: (number: number) => `Your main number — ${number}`,
    numerologyDescription: (number: number) =>
      `Numerology uses ${number} as a prompt for looking at familiar habits and choices.`,
    numerologyContext:
      'This does not define your personality or predict events. The calculation adds the digits of the entered date and keeps 11, 22 and 33 as separate results.',
    zodiacEvidenceTitle: (label: string) => `Zodiac sign: ${label}`,
    zodiacEvidenceDescription:
      'The sign is derived from the date only, without birth time or location.',
    zodiacTitle: (label: string) => `${label}: an optional reading`,
    zodiacDescription: (label: string, sign: ZodiacProfile) =>
      `In this tradition, ${label} is associated with ${zodiacNotes.en[sign.signId as keyof typeof zodiacNotes.en]}.`,
    zodiacContext:
      'This is a cultural and entertainment interpretation, not an established fact about personality.',
    astrologyEvidenceTitle: 'Astrology reading by date',
    astrologyEvidenceDescription: (birthDate: string, locale: ProfileLocale) =>
      `Only the date ${formatDate(birthDate, locale)} was used; birth time and place were not collected.`,
    astrologyTitle: 'Astrology portrait by date',
    astrologyDescription: (signLabel: string, element: ZodiacElement, modality: ZodiacModality) =>
      `${signLabel} is associated with the ${zodiacQualityLabels.en[element]} element. In this tradition, the sign is ${zodiacQualityLabels.en[modality]}.`,
    astrologyContext:
      'This is a popular symbolic interpretation based only on the date. It is not a natal chart and does not affect confidence in psychological observations.',
  },
  uk: {
    numerologyEvidenceTitle: (number: number) => `Нумерологічний розрахунок: ${number}`,
    numerologyEvidenceDescription: 'Розраховано лише з цифр указаної дати народження.',
    numerologyTitle: (number: number) => `Ваше основне число — ${number}`,
    numerologyDescription: (number: number) =>
      `У нумерології число ${number} використовують як привід придивитися до звичних дій і виборів.`,
    numerologyContext:
      'Цей розбір не визначає вашу особистість і не прогнозує події. У розрахунку цифри дати послідовно додаються, а 11, 22 і 33 залишаються окремими результатами.',
    zodiacEvidenceTitle: (label: string) => `Знак зодіаку: ${label}`,
    zodiacEvidenceDescription: 'Знак визначено лише за датою, без часу й місця народження.',
    zodiacTitle: (label: string) => `${label}: додатковий розбір`,
    zodiacDescription: (label: string, sign: ZodiacProfile) =>
      `У цій традиції зі знаком «${label}» пов’язують ${zodiacNotes.uk[sign.signId as keyof typeof zodiacNotes.uk]}.`,
    zodiacContext: 'Це культурний погляд для розваги, а не встановлений факт про особистість.',
    astrologyEvidenceTitle: 'Астрологічний розбір за датою',
    astrologyEvidenceDescription: (birthDate: string, locale: ProfileLocale) =>
      `Використано лише дату ${formatDate(birthDate, locale)}; час і місце народження не збиралися.`,
    astrologyTitle: 'Астрологічний портрет за датою',
    astrologyDescription: (signLabel: string, element: ZodiacElement, modality: ZodiacModality) =>
      `${signLabel} пов’язують зі стихією «${zodiacQualityLabels.uk[element]}». У цій традиції цей знак ${zodiacQualityLabels.uk[modality]}.`,
    astrologyContext:
      'Це популярний символічний розбір лише за датою. Він не є натальною картою й не підтверджує спостереження за вашими відповідями.',
  },
  ru: {
    numerologyEvidenceTitle: (number: number) => `Нумерологический расчёт: ${number}`,
    numerologyEvidenceDescription: 'Расчёт выполнен только из цифр указанной даты рождения.',
    numerologyTitle: (number: number) => `Ваше основное число — ${number}`,
    numerologyDescription: (number: number) =>
      `В нумерологии число ${number} используют как повод присмотреться к привычным действиям и решениям.`,
    numerologyContext:
      'Этот разбор не определяет вашу личность и не предсказывает события. В расчёте цифры даты последовательно складываются, а 11, 22 и 33 остаются отдельными результатами.',
    zodiacEvidenceTitle: (label: string) => `Зодиакальный знак: ${label}`,
    zodiacEvidenceDescription:
      'Знак определён по указанной дате рождения без времени и места рождения.',
    zodiacTitle: (label: string) => `${label}: дополнительный разбор`,
    zodiacDescription: (label: string, sign: ZodiacProfile) =>
      `В этой традиции знак «${label}» связывают с такими качествами: ${zodiacNotes.ru[sign.signId as keyof typeof zodiacNotes.ru]}.`,
    zodiacContext: 'Это культурный взгляд для развлечения, а не установленный факт о личности.',
    astrologyEvidenceTitle: 'Астрологический разбор по дате',
    astrologyEvidenceDescription: (birthDate: string, locale: ProfileLocale) =>
      `Использована только календарная дата ${formatDate(birthDate, locale)}; время и место рождения не собирались.`,
    astrologyTitle: 'Астрологический портрет по дате',
    astrologyDescription: (signLabel: string, element: ZodiacElement, modality: ZodiacModality) =>
      `${signLabel} связывают со стихией «${zodiacQualityLabels.ru[element]}». В этой традиции знак ${zodiacQualityLabels.ru[modality]}.`,
    astrologyContext:
      'Это популярный символический разбор только по дате. Он не является натальной картой и не подтверждает наблюдения по вашим ответам.',
  },
};
