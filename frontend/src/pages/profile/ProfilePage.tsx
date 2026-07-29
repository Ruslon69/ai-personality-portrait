import { demoUserProfile, UserProfile } from '@features/user-profile';
import { useRouter } from '@router';
import { ROUTES } from '@shared/config';

export function ProfilePage() {
  const { navigate } = useRouter();

  return (
    <UserProfile
      data={demoUserProfile}
      onCreatePortrait={() => navigate(ROUTES.portrait)}
      onOpenCompatibility={() => navigate(ROUTES.compatibility)}
      onOpenHistory={() => navigate(ROUTES.profileHistory)}
      onOpenPortrait={() => navigate(ROUTES.portraitResult)}
      onOpenSettings={() => navigate(ROUTES.settings)}
    />
  );
}
