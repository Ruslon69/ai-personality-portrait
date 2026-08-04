import { ROUTES } from '@shared/config';

import {
  BirthDatePage,
  CompatibilityPage,
  FullResultPage,
  GeneratingPage,
  HistoryPage,
  HomePage,
  NotFoundPage,
  NumerologyPage,
  NumerologyProfilePage,
  NumerologyResultPage,
  PortraitPage,
  ProfilePage,
  QuestionsPage,
  ResultPreviewPage,
  SettingsPage,
  TarotPage,
  TarotReadingPage,
  TarotResultPage,
  VoicePage,
} from './lazy-pages';
import type { AppRoute } from './RouterProvider.types';

export const appRoutes: readonly AppRoute[] = [
  { component: HomePage, path: ROUTES.home },
  { component: TarotPage, path: ROUTES.tarot },
  { component: TarotReadingPage, path: ROUTES.tarotReading },
  { component: TarotResultPage, path: ROUTES.tarotResult },
  { component: NumerologyPage, path: ROUTES.numerology },
  { component: NumerologyProfilePage, path: ROUTES.numerologyProfile },
  { component: NumerologyResultPage, path: ROUTES.numerologyResult },
  { component: PortraitPage, path: ROUTES.portrait },
  { component: QuestionsPage, path: ROUTES.portraitQuestions },
  { component: VoicePage, path: ROUTES.portraitVoice },
  { component: BirthDatePage, path: ROUTES.portraitBirthDate },
  { component: GeneratingPage, path: ROUTES.portraitGenerating },
  { component: ResultPreviewPage, path: ROUTES.portraitResultPreview },
  { component: FullResultPage, path: ROUTES.portraitResult },
  { component: CompatibilityPage, path: ROUTES.compatibility },
  { component: ProfilePage, path: ROUTES.profile },
  { component: HistoryPage, path: ROUTES.profileHistory },
  { component: SettingsPage, path: ROUTES.settings },
  { component: NotFoundPage, path: ROUTES.notFound },
];

export const notFoundRoute: AppRoute = {
  component: NotFoundPage,
  path: ROUTES.notFound,
};

export function resolveRoute(path: string) {
  return appRoutes.find((route) => route.path === path) ?? notFoundRoute;
}
