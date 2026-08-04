import type { CSSProperties, ReactNode } from 'react';

import type { Locale } from '@shared/i18n';
import { Button, Typography } from '@shared/ui';

import { tarotCardById, tarotCopy } from '../data';
import type { TarotCardSelection, TarotDeckTheme } from '../types';
import styles from './Tarot.module.css';

type Props = {
  ariaDisabled?: boolean;
  isRevealed?: boolean;
  isSelected?: boolean;
  index?: number;
  locale: Locale;
  onClick?: () => void;
  position?: string;
  selection?: TarotCardSelection;
  selectionOrder?: number;
  showPosition?: boolean;
  total?: number;
  theme: TarotDeckTheme;
  variant?: 'assigned' | 'compact' | 'leading' | 'revealing' | 'selectable';
};

export function TarotCardView({
  ariaDisabled,
  isRevealed = false,
  isSelected,
  index = 0,
  locale,
  onClick,
  position,
  selection,
  selectionOrder,
  showPosition = true,
  total = 1,
  theme,
  variant = 'assigned',
}: Props) {
  const copy = tarotCopy[locale];
  const card = selection ? tarotCardById.get(selection.cardId) : undefined;
  const state = isRevealed ? copy.revealed : isSelected ? copy.selected : copy.cardBack;
  const accessiblePosition =
    position ?? (selectionOrder ? `${copy.position} ${selectionOrder}` : '');
  const accessibleName = `${state}${isRevealed && card ? ` · ${card.name[locale]}` : ''}${
    accessiblePosition ? ` · ${accessiblePosition}` : ''
  }`;
  const style = {
    '--card-distance': index - (total - 1) / 2,
    '--card-index': index,
  } as CSSProperties;
  const content: ReactNode = (
    <>
      <span className={styles.tarotCardInner}>
        <span aria-hidden="true" className={styles.cardBackFace}>
          <i />
          <b />
          <i />
        </span>
        <span className={styles.cardFrontFace}>
          <span aria-hidden="true" className={styles.cardGlyph}>
            {card?.visual.glyph}
          </span>
          <Typography as="span" variant="heading-sm">
            {card?.name[locale]}
          </Typography>
          <span>{selection?.orientation === 'reversed' ? copy.reversed : copy.upright}</span>
        </span>
      </span>
      {selectionOrder ? (
        <span aria-hidden="true" className={styles.selectionOrder}>
          {selectionOrder}
        </span>
      ) : null}
      {position && showPosition ? <span className={styles.cardPosition}>{position}</span> : null}
    </>
  );

  if (!onClick) {
    return (
      <div
        aria-label={accessibleName}
        className={styles.tarotCardButton}
        data-revealed={isRevealed || undefined}
        data-selected={isSelected || undefined}
        data-state={isRevealed ? 'face-up' : isSelected ? 'selected' : 'face-down'}
        data-theme={theme}
        data-variant={variant}
        role="img"
        style={style}
      >
        {content}
      </div>
    );
  }

  return (
    <Button
      aria-disabled={ariaDisabled || undefined}
      aria-label={accessibleName}
      aria-pressed={isSelected !== undefined ? isSelected : undefined}
      className={styles.tarotCardButton}
      data-revealed={isRevealed || undefined}
      data-selected={isSelected || undefined}
      data-state={isRevealed ? 'face-up' : isSelected ? 'selected' : 'selectable'}
      data-theme={theme}
      data-variant={variant}
      onClick={ariaDisabled ? undefined : onClick}
      prominence="quiet"
      style={style}
    >
      {content}
    </Button>
  );
}
