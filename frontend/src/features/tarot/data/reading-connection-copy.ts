import type { Locale } from '@shared/i18n';

// Russian uses its authored card-name/meaning grammar adapter. Other languages
// must provide explicit content here rather than falling through to English.
type ConnectionCopy = {
  single: (name: string) => string;
  pair: (name: string, meaning: string, neighbour: string, neighbourMeaning: string) => string;
};
export const readingConnectionCopy: Record<Exclude<Locale, 'ru'>, ConnectionCopy> = {
  es: {
    single: (name) => `${name} establece el tema principal de esta lectura.`,
    pair: (name, meaning, neighbour, neighbourMeaning) =>
      `Estas cartas muestran dos aspectos conectados. ${name}: ${meaning} ${neighbour}: ${neighbourMeaning}`,
  },
  en: {
    single: (name) => `${name} sets the main theme of this reading.`,
    pair: (name, meaning, neighbour, neighbourMeaning) =>
      `These cards show two connected aspects. ${name}: ${meaning} ${neighbour}: ${neighbourMeaning}`,
  },
  uk: {
    single: (name) => `${name} задає головну тему цього розкладу.`,
    pair: (name, meaning, neighbour, neighbourMeaning) =>
      `Ці карти показують два пов’язані моменти. ${name}: ${meaning} ${neighbour}: ${neighbourMeaning}`,
  },
};
