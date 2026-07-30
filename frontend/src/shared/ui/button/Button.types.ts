import type { ComponentPropsWithRef } from 'react';

export type ButtonProminence = 'default' | 'primary' | 'secondary' | 'danger' | 'quiet';
export type ButtonSize = 'default' | 'large';

export type ButtonVisualProps = {
  prominence?: ButtonProminence;
  size?: ButtonSize;
};

export type ButtonProps = Omit<ComponentPropsWithRef<'button'>, 'size'> & ButtonVisualProps;

export type ButtonLinkProps = Omit<ComponentPropsWithRef<'a'>, 'size'> & ButtonVisualProps;
