import { useEffect } from 'react';

import { focusElementByIdOnNextFrame } from '@shared/lib/focus';
import type { PersonalityProfile } from '@entities/personality-profile';

import {
  LatestPortraitSection,
  ProfileCompletionSection,
  ProfileHero,
  ProfilePrivacySection,
  QuickActionsSection,
} from '../sections';
import styles from './UserProfile.module.css';

type UserProfileProps = {
  onCreatePortrait: () => void;
  onOpenCompatibility: () => void;
  onOpenHistory: () => void;
  onOpenPortrait: () => void;
  onOpenSettings: () => void;
  profile: PersonalityProfile;
};

export function UserProfile({
  onCreatePortrait,
  onOpenCompatibility,
  onOpenHistory,
  onOpenPortrait,
  onOpenSettings,
  profile,
}: UserProfileProps) {
  useEffect(() => focusElementByIdOnNextFrame('profile-title'), []);
  const locale = profile.locale;
  const copy = {
    es: {
      greeting: 'Mis resultados',
      introduction: 'Aquí puedes abrir tu última reflexión personal, el historial o los ajustes.',
      reminder:
        'Tú decides sobre tus resultados guardados y tus datos. Las opciones de privacidad y eliminación están siempre disponibles.',
    },
    en: {
      greeting: 'My results',
      introduction: 'Open your latest personal reflection, history or settings here.',
      reminder:
        'You control your saved results and data. Privacy and deletion settings remain available at any time.',
    },
    ru: {
      greeting: 'Мои результаты',
      introduction: 'Здесь можно открыть последний личный разбор, историю и настройки.',
      reminder:
        'Вы управляете сохранёнными результатами и данными. Настройки удаления и приватности доступны в любое время.',
    },
    uk: {
      greeting: 'Мої результати',
      introduction: 'Тут можна відкрити останній особистий розбір, історію й налаштування.',
      reminder:
        'Ви керуєте збереженими результатами й даними. Налаштування видалення та приватності доступні будь-коли.',
    },
  }[locale];

  return (
    <div className={styles.root}>
      <ProfileHero greeting={copy.greeting} introduction={copy.introduction} locale={locale} />
      <LatestPortraitSection onOpenPortrait={onOpenPortrait} profile={profile} />
      <ProfileCompletionSection items={profile.completion} locale={locale} />
      <QuickActionsSection
        locale={locale}
        onCreatePortrait={onCreatePortrait}
        onOpenCompatibility={onOpenCompatibility}
        onOpenHistory={onOpenHistory}
        onOpenPortrait={onOpenPortrait}
        onOpenSettings={onOpenSettings}
      />
      <ProfilePrivacySection
        locale={locale}
        onOpenSettings={onOpenSettings}
        reminder={copy.reminder}
      />
    </div>
  );
}
