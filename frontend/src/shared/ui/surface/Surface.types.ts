import type { ComponentPropsWithoutRef } from 'react';

export type SurfaceElevation = 'none' | 'low' | 'medium' | 'high';

export type SurfaceProps = ComponentPropsWithoutRef<'div'> & {
  elevation?: SurfaceElevation;
};
