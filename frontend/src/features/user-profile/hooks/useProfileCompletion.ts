import { useMemo } from 'react';
import { profileUiCopy } from '../data/profile-ui-copy';

import type { ProfileCompletionItem } from '@entities/personality-profile';
import type { ProfileLocale } from '@entities/personality-profile';

export function useProfileCompletion(
  items: readonly ProfileCompletionItem[],
  locale: ProfileLocale,
) {
  return useMemo(() => {
    const completedCount = items.filter((item) => item.status === 'complete').length;

    return {
      completedCount,
      summary: profileUiCopy[locale].sources(completedCount, items.length),
      totalCount: items.length,
    };
  }, [items, locale]);
}
