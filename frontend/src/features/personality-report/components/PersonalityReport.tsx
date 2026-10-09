import type { ProfileLocale } from '@entities/personality-profile';
import { useEffect } from 'react';

import { focusElementByIdOnNextFrame } from '@shared/lib/focus';
import type { PersonalityProfile } from '@entities/personality-profile';

import { PersonalizedReport } from './PersonalizedReport';

type PersonalityReportProps = {
  onShare: () => void;
  profile: PersonalityProfile;
  locale?: ProfileLocale;
};

export function PersonalityReport({
  onShare,
  profile,
  locale = profile.locale,
}: PersonalityReportProps) {
  useEffect(() => focusElementByIdOnNextFrame('full-report-title'), []);
  return <PersonalizedReport locale={locale} onShare={onShare} profile={profile} />;
}
