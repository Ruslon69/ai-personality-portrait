import { portraitQuestions, Questionnaire } from '@features/questionnaire';
import { useRouter } from '@router';
import { ROUTES } from '@shared/config';

export function QuestionsPage() {
  const { navigate } = useRouter();

  return (
    <Questionnaire
      onComplete={() => navigate(ROUTES.portraitVoice)}
      questions={portraitQuestions}
    />
  );
}
