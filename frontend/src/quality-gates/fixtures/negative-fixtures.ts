export const negativeQualityFixtures = {
  duplicateJourneyEntryIds: ['entry-duplicate', 'entry-duplicate'],
  duplicateTarotCardIds: ['major-fool', 'major-fool'],
  forbiddenClaim: 'You will definitely win.',
  futureSchema: 'product-storage-v99',
  invalidMasterReduction: { input: 11, output: 2 },
  localStoragePureModule: 'export const value = window.localStorage.getItem("key");',
  reactDomainImport: "import type { ReactNode } from 'react';",
  unresolvedTemplate: 'This remains {{unresolved}}.',
} as const;
