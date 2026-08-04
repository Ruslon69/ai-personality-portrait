import { useEffect } from 'react';

import { focusElementByIdOnNextFrame } from '@shared/lib/focus';
import type { PersonalityProfile } from '@entities/personality-profile';

import { PersonalizedReport } from './PersonalizedReport';

type PersonalityReportProps = {
  onShare: () => void;
  profile: PersonalityProfile;
};

export function PersonalityReport({ onShare, profile }: PersonalityReportProps) {
  useEffect(() => focusElementByIdOnNextFrame('full-report-title'), []);
  return <PersonalizedReport onShare={onShare} profile={profile} />;
}
