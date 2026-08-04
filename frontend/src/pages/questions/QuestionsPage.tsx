import { DraftPortraitQuestionnaire } from '@features/questionnaire';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';

export function QuestionsPage() {
  const { navigate } = useRouter();

  return <DraftPortraitQuestionnaire onComplete={() => navigate(ROUTES.portraitBirthDate)} />;
}
