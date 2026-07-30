import { Badge, Container, Stack, Typography } from '@shared/ui';

import styles from './UserProfileSections.module.css';

type ProfileHeroProps = {
  greeting: string;
  introduction: string;
};

export function ProfileHero({ greeting, introduction }: ProfileHeroProps) {
  return (
    <section aria-labelledby="profile-title" className={styles.hero}>
      <Container size="wide">
        <Stack className={styles.heroContent} gap="lg">
          <Badge className={styles.badge} tone="info">
            Локальный профиль
          </Badge>
          <Stack gap="sm">
            <Typography
              as="h1"
              className={styles.heroTitle}
              id="profile-title"
              tabIndex={-1}
              variant="display"
            >
              {greeting}
            </Typography>
            <Typography variant="lead">{introduction}</Typography>
          </Stack>
        </Stack>
      </Container>
    </section>
  );
}
