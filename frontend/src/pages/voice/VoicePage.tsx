import { DraftPortraitVoiceRecording } from '@features/voice-recording';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';

export function VoicePage() {
  const { navigate } = useRouter();

  return (
    <DraftPortraitVoiceRecording
      onBack={() => navigate(ROUTES.portraitQuestions)}
      onComplete={() => navigate(ROUTES.portraitBirthDate)}
    />
  );
}
