import { useMemo } from 'react';

import type { ProfileCompletionItem } from '@entities/personality-profile';

export function useProfileCompletion(items: readonly ProfileCompletionItem[]) {
  return useMemo(() => {
    const completedCount = items.filter((item) => item.status === 'complete').length;

    return {
      completedCount,
      summary: `${completedCount} из ${items.length} источников добавлено`,
      totalCount: items.length,
    };
  }, [items]);
}
