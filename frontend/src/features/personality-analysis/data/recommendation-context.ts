import type { ProfileLocale } from '@entities/personality-profile';

import type { TraitId } from '../model';

// These are situations for trying an existing recommendation, not new trait rules.
export const recommendationSituations: Record<ProfileLocale, Record<TraitId, string>> = {
  ru: {
    adaptability: 'Перед делом, в котором план может измениться.',
    autonomy: 'Когда новые просьбы мешают сосредоточиться или отдохнуть.',
    connection: 'Перед разговором, в котором ваши мнения расходятся.',
    directness: 'Когда важно ясно договориться о просьбе или сроке.',
    initiative: 'Когда хочется начать, но результат ещё неясен.',
    openness: 'Когда привычная задача перестаёт вызывать интерес.',
    practicality: 'Когда большая задача кажется бесконечной.',
    reflection: 'Когда решение затягивается, хотя основные факты уже известны.',
    structure: 'Когда нужно выбрать между несколькими подходящими вариантами.',
  },
  es: {
    adaptability: 'Antes de una tarea en la que el plan pueda cambiar.',
    autonomy: 'Cuando las peticiones nuevas dificultan concentrarte o descansar.',
    connection: 'Antes de una conversación en la que hay un desacuerdo.',
    directness: 'Cuando necesitas acordar una petición o un plazo.',
    initiative: 'Cuando quieres empezar, pero el resultado aún no está claro.',
    openness: 'Cuando una tarea conocida ya no despierta tu interés.',
    practicality: 'Cuando una tarea grande parece no tener fin.',
    reflection: 'Cuando una decisión se alarga aunque ya conoces los datos principales.',
    structure: 'Cuando tienes que elegir entre varias opciones adecuadas.',
  },
  en: {
    adaptability: 'Before a task where the plan may change.',
    autonomy: 'When new requests make it hard to focus or rest.',
    connection: 'Before a conversation where you disagree.',
    directness: 'When you need to agree on a request or deadline.',
    initiative: 'When you want to begin but the outcome is still unclear.',
    openness: 'When a familiar task no longer holds your interest.',
    practicality: 'When a large task feels endless.',
    reflection: 'When a decision drags on even though you know the main facts.',
    structure: 'When you need to choose between several suitable options.',
  },
  uk: {
    adaptability: 'Перед справою, у якій план може змінитися.',
    autonomy: 'Коли нові прохання заважають зосередитися чи відпочити.',
    connection: 'Перед розмовою, у якій ваші думки розходяться.',
    directness: 'Коли важливо чітко домовитися про прохання або термін.',
    initiative: 'Коли хочеться почати, але результат ще неясний.',
    openness: 'Коли звична справа вже не викликає інтересу.',
    practicality: 'Коли велике завдання здається нескінченним.',
    reflection: 'Коли рішення затягується, хоча основні факти вже відомі.',
    structure: 'Коли потрібно обрати між кількома прийнятними варіантами.',
  },
};
