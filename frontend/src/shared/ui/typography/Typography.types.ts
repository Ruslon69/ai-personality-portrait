import type { HTMLAttributes } from 'react';

export type TypographyElement = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type TypographyVariant = 'body' | 'caption' | 'heading-sm' | 'heading-md' | 'heading-lg';

export type TypographyProps = HTMLAttributes<HTMLElement> & {
  as?: TypographyElement;
  variant?: TypographyVariant;
};
