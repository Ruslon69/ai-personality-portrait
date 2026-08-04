import type { DraftBirthDateSelection } from '@entities/personality-profile';
import { draftPortraitActions, useDraftPortraitState } from '@store';

import type { BirthDateFormValue, BirthDateSubmission } from '../types';
import { BirthDateStep } from './BirthDateStep';

type DraftPortraitBirthDateStepProps = {
  onBack: () => void;
  onComplete: () => void;
};

function getFormValue(birthDate: DraftBirthDateSelection): BirthDateFormValue {
  return {
    birthDate: birthDate.status === 'included' ? birthDate.value : '',
    skipBirthDate: birthDate.status === 'skipped',
  };
}

export function DraftPortraitBirthDateStep({
  onBack,
  onComplete,
}: DraftPortraitBirthDateStepProps) {
  const { draft } = useDraftPortraitState();
  const value = getFormValue(draft.birthDate);

  const changeBirthDate = (nextValue: BirthDateFormValue) => {
    if (nextValue.skipBirthDate) {
      draftPortraitActions.skipBirthDate();
      return;
    }

    draftPortraitActions.setBirthDate(nextValue.birthDate);
  };

  const completeBirthDate = (submission: BirthDateSubmission) => {
    if (submission.skipBirthDate) {
      draftPortraitActions.skipBirthDate();
    } else {
      draftPortraitActions.setBirthDate(submission.birthDate);
    }
    onComplete();
  };

  return (
    <BirthDateStep
      onBack={onBack}
      onChange={changeBirthDate}
      onComplete={completeBirthDate}
      value={value}
    />
  );
}
