import {
  BirthDatePage,
  CompatibilityPage,
  GeneratingPage,
  HomePage,
  NotFoundPage,
  PortraitPage,
  ProfilePage,
  QuestionsPage,
  ResultPreviewPage,
  SettingsPage,
  VoicePage,
} from '@pages';
import { ROUTES } from '@shared/config';

import type { AppRoute } from './RouterProvider.types';

export const appRoutes: readonly AppRoute[] = [
  { component: HomePage, path: ROUTES.home },
  { component: PortraitPage, path: ROUTES.portrait },
  { component: QuestionsPage, path: ROUTES.portraitQuestions },
  { component: VoicePage, path: ROUTES.portraitVoice },
  { component: BirthDatePage, path: ROUTES.portraitBirthDate },
  { component: GeneratingPage, path: ROUTES.portraitGenerating },
  { component: ResultPreviewPage, path: ROUTES.portraitResultPreview },
  { component: CompatibilityPage, path: ROUTES.compatibility },
  { component: ProfilePage, path: ROUTES.profile },
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
