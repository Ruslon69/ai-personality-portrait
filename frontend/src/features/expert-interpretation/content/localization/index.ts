import type { Locale } from '@shared/i18n';

import { enContent } from './en';
import { ruContent } from './ru';
import type { ContentDictionary } from './types';
import { ukContent } from './uk';

export const contentDictionaries: Readonly<Record<Locale, ContentDictionary>> = {
  en: enContent,
  ru: ruContent,
  uk: ukContent,
};

export type { ContentDictionary, NumerologyWordingContext, SpreadStrategyId } from './types';
