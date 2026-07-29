import { VoiceRecording } from '@features/voice-recording';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';

export function VoicePage() {
  const { navigate } = useRouter();

  return (
    <VoiceRecording
      onBack={() => navigate(ROUTES.portraitQuestions)}
      onContinue={() => navigate(ROUTES.portraitBirthDate)}
    />
  );
}
