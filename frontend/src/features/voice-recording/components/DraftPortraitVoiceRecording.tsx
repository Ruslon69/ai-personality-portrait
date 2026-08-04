import type { DraftVoiceSelection } from '@entities/personality-profile';
import { draftPortraitActions } from '@store';

import { VoiceRecording } from './VoiceRecording';

type DraftPortraitVoiceRecordingProps = {
  onBack: () => void;
  onComplete: () => void;
};

export function DraftPortraitVoiceRecording({
  onBack,
  onComplete,
}: DraftPortraitVoiceRecordingProps) {
  const completeVoiceStep = (result: DraftVoiceSelection) => {
    draftPortraitActions.setVoice(result);
    onComplete();
  };

  return <VoiceRecording onBack={onBack} onComplete={completeVoiceStep} />;
}
