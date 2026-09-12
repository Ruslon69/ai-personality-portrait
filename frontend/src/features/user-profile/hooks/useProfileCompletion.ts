import { useMemo } from 'react';

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
      summary:
        locale === 'en'
          ? `${completedCount} of ${items.length} sources included`
          : locale === 'uk'
            ? `Додано джерел: ${completedCount} із ${items.length}`
            : `Добавлено источников: ${completedCount} из ${items.length}`,
      totalCount: items.length,
    };
  }, [items, locale]);
}
