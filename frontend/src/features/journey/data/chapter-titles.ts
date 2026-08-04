import type { Locale } from '@shared/i18n';

export type ChapterTitleKey =
  | 'choices'
  | 'clear-horizon'
  | 'first-step'
  | 'foundations'
  | 'inner-compass'
  | 'new-cycle'
  | 'quiet-current'
  | 'turning-point';

export const chapterTitles: Record<Locale, Record<ChapterTitleKey, string>> = {
  ru: {
    choices: 'Время выбора',
    'clear-horizon': 'Горизонт становится яснее',
    'first-step': 'Первый шаг',
    foundations: 'То, на что можно опереться',
    'inner-compass': 'Внутренний ориентир',
    'new-cycle': 'Новый цикл',
    'quiet-current': 'Тихое течение',
    'turning-point': 'Точка поворота',
  },
  en: {
    choices: 'A Time of Choices',
    'clear-horizon': 'A Clearer Horizon',
    'first-step': 'The First Step',
    foundations: 'What Holds Steady',
    'inner-compass': 'The Inner Compass',
    'new-cycle': 'A New Cycle',
    'quiet-current': 'The Quiet Current',
    'turning-point': 'The Turning Point',
  },
  uk: {
    choices: 'Час вибору',
    'clear-horizon': 'Обрій стає яснішим',
    'first-step': 'Перший крок',
    foundations: 'Те, на що можна спертися',
    'inner-compass': 'Внутрішній орієнтир',
    'new-cycle': 'Новий цикл',
    'quiet-current': 'Тиха течія',
    'turning-point': 'Точка повороту',
  },
};
