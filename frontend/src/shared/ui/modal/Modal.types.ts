import type { ComponentPropsWithoutRef } from 'react';

export type ModalProps = Omit<
  ComponentPropsWithoutRef<'dialog'>,
  'aria-label' | 'onCancel' | 'onClose' | 'open'
> & {
  label: string;
  onClose: () => void;
  open: boolean;
};
