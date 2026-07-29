import type { ComponentPropsWithoutRef } from 'react';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

export type BadgeProps = ComponentPropsWithoutRef<'span'> & {
  tone?: BadgeTone;
};
