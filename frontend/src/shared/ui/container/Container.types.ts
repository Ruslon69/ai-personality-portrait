import type { ComponentPropsWithoutRef } from 'react';

export type ContainerSize = 'reading' | 'default' | 'wide' | 'full';

export type ContainerProps = ComponentPropsWithoutRef<'div'> & {
  size?: ContainerSize;
};
