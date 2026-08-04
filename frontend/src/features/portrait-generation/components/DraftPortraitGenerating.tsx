import {
  canCreatePersonalityProfile,
  createPersonalityProfile,
} from '@features/personality-analysis';
import { useI18n } from '@shared/i18n';
import { draftPortraitActions, useDraftPortraitState } from '@store';

import { PortraitGenerating } from './PortraitGenerating';

type DraftPortraitGeneratingProps = {
  onComplete: () => void;
  onInsufficientData: () => void;
};

export function DraftPortraitGenerating({
  onComplete,
  onInsufficientData,
}: DraftPortraitGeneratingProps) {
  const { draft } = useDraftPortraitState();
  const { locale } = useI18n();

  const completeGeneration = () => {
    if (!canCreatePersonalityProfile(draft)) {
      onInsufficientData();
      return;
    }

    const profile = createPersonalityProfile(draft, new Date().toISOString(), locale);
    draftPortraitActions.saveProfile(profile);
    onComplete();
  };

  return <PortraitGenerating draft={draft} locale={locale} onComplete={completeGeneration} />;
}
