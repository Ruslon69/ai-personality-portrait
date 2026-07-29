import type { Ref } from 'react';

export type HeaderProps = {
  isMenuOpen: boolean;
  menuButtonRef?: Ref<HTMLButtonElement>;
  onMenuToggle: () => void;
};
