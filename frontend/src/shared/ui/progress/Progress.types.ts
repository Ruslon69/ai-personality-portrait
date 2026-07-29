import type { ComponentPropsWithoutRef } from 'react';

export type ProgressProps = ComponentPropsWithoutRef<'progress'> & {
  label?: string;
};
