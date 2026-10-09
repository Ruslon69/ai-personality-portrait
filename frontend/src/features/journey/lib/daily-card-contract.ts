import { ROUTES, type AppRoutePath } from '@shared/config';

export const dailyCardSectionId = 'card-of-the-day';

export function tarotStartDestination(spreadId: string): AppRoutePath {
  return spreadId === 'day' ? ROUTES.profile : ROUTES.tarotReading;
}

export function focusDailyCard() {
  const section = document.getElementById(dailyCardSectionId);
  if (!section) return;
  section.scrollIntoView({ block: 'start', behavior: 'auto' });
  section.focus({ preventScroll: true });
}

export function navigateToDailyCard(
  navigate: (path: AppRoutePath, options?: { replace?: boolean }) => void,
  replace = false,
) {
  navigate(ROUTES.profile, { replace });
  window.history.replaceState(window.history.state, '', `${ROUTES.profile}#${dailyCardSectionId}`);
  // Handles an already-mounted cabinet; ProfilePage handles lazy/direct arrival.
  window.requestAnimationFrame(focusDailyCard);
}

export function nextLocalDayDelay(date: Date) {
  return (
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime() -
    date.getTime() +
    20
  );
}
