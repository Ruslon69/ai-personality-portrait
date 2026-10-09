import type { Ref } from 'react';

export type HeaderProps = {
  showMenu?: boolean;
  isMenuOpen: boolean;
  menuButtonRef?: Ref<HTMLButtonElement>;
  onMenuToggle: () => void;
  showSettings?: boolean;
  variant?: 'application' | 'marketing';
};
