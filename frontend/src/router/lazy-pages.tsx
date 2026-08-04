import { lazy } from 'react';

export const HomePage = lazy(() =>
  import('@pages/home').then((module) => ({ default: module.HomePage })),
);
export const PortraitPage = lazy(() =>
  import('@pages/portrait').then((module) => ({ default: module.PortraitPage })),
);
export const QuestionsPage = lazy(() =>
  import('@pages/questions').then((module) => ({ default: module.QuestionsPage })),
);
export const VoicePage = lazy(() =>
  import('@pages/voice').then((module) => ({ default: module.VoicePage })),
);
export const BirthDatePage = lazy(() =>
  import('@pages/birth-date').then((module) => ({ default: module.BirthDatePage })),
);
export const GeneratingPage = lazy(() =>
  import('@pages/generating').then((module) => ({ default: module.GeneratingPage })),
);
export const ResultPreviewPage = lazy(() =>
  import('@pages/result-preview').then((module) => ({ default: module.ResultPreviewPage })),
);
export const FullResultPage = lazy(() =>
  import('@pages/full-result').then((module) => ({ default: module.FullResultPage })),
);
export const CompatibilityPage = lazy(() =>
  import('@pages/compatibility').then((module) => ({ default: module.CompatibilityPage })),
);
export const ProfilePage = lazy(() =>
  import('@pages/profile').then((module) => ({ default: module.ProfilePage })),
);
export const HistoryPage = lazy(() =>
  import('@pages/history').then((module) => ({ default: module.HistoryPage })),
);
export const SettingsPage = lazy(() =>
  import('@pages/settings').then((module) => ({ default: module.SettingsPage })),
);
export const NotFoundPage = lazy(() =>
  import('@pages/not-found').then((module) => ({ default: module.NotFoundPage })),
);
export const TarotPage = lazy(() =>
  import('@pages/tarot').then((module) => ({ default: module.TarotPage })),
);
export const TarotReadingPage = lazy(() =>
  import('@pages/tarot').then((module) => ({ default: module.TarotReadingPage })),
);
export const TarotResultPage = lazy(() =>
  import('@pages/tarot').then((module) => ({ default: module.TarotResultPage })),
);
export const NumerologyPage = lazy(() =>
  import('@pages/numerology').then((module) => ({ default: module.NumerologyPage })),
);
export const NumerologyProfilePage = lazy(() =>
  import('@pages/numerology').then((module) => ({ default: module.NumerologyProfilePage })),
);
export const NumerologyResultPage = lazy(() =>
  import('@pages/numerology').then((module) => ({ default: module.NumerologyResultPage })),
);
