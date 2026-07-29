import type { ComponentPropsWithoutRef } from 'react';

export type DividerOrientation = 'horizontal' | 'vertical';

export type DividerProps = ComponentPropsWithoutRef<'hr'> & {
  orientation?: DividerOrientation;
};
