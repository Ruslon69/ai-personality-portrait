import type { ComponentPropsWithoutRef } from 'react';

export type ToastTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

export type ToastProps = ComponentPropsWithoutRef<'div'> & {
  tone?: ToastTone;
};
