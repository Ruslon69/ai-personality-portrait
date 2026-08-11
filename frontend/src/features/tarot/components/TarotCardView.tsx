import type { CSSProperties, ReactNode } from 'react';

import { getTarotCardArtwork } from '@assets/tarot';
import type { Locale } from '@shared/i18n';
import { Button, Typography } from '@shared/ui';

import { tarotCardById, tarotCopy, tarotSuitNames } from '../data';
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
  variant?:
    'assigned' | 'compact' | 'history' | 'leading' | 'revealing' | 'selectable' | 'supporting';
};

function toRoman(value: number) {
  if (value === 0) return '0';
  const symbols: readonly [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let remainder = value;
  return symbols.reduce((result, [number, symbol]) => {
    while (remainder >= number) {
      result += symbol;
      remainder -= number;
    }
    return result;
  }, '');
}

function getRank(number: number, isMajor: boolean) {
  if (isMajor) return toRoman(number);
  if (number === 1) return 'A';
  if (number === 11) return 'P';
  if (number === 12) return 'Kn';
  if (number === 13) return 'Q';
  if (number === 14) return 'K';
  return toRoman(number);
}

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
  const artwork = card ? getTarotCardArtwork(card.id) : undefined;
  const canRenderFaceAsset =
    Boolean(artwork?.faceAsset) &&
    (artwork?.rightsStatus === 'licensed' ||
      artwork?.rightsStatus === 'original' ||
      artwork?.rightsStatus === 'verified-public-domain');
  const state = isRevealed ? copy.revealed : isSelected ? copy.selected : copy.cardBack;
  const accessiblePosition =
    position ?? (selectionOrder ? `${copy.position} ${selectionOrder}` : '');
  const accessibleOrientation =
    isRevealed && selection
      ? selection.orientation === 'reversed'
        ? copy.reversed
        : copy.upright
      : '';
  const accessibleName = `${state}${isRevealed && card ? ` · ${card.name[locale]}` : ''}${
    accessibleOrientation ? ` · ${accessibleOrientation}` : ''
  }${accessiblePosition ? ` · ${accessiblePosition}` : ''}`;
  const style = {
    '--card-distance': index - (total - 1) / 2,
    '--card-index': index,
  } as CSSProperties;
  const content: ReactNode = (
    <>
      <span className={styles.tarotCardInner}>
        <span aria-hidden="true" className={styles.cardBackFace}>
          <span className={styles.cardBackFrame}>
            <i />
            <b />
            <i />
          </span>
        </span>
        <span
          aria-hidden="true"
          className={styles.cardFrontFace}
          data-orientation={selection?.orientation}
        >
          <span className={styles.cardFaceArtwork} data-orientation={selection?.orientation}>
            {canRenderFaceAsset ? (
              <img alt="" decoding="async" loading="lazy" src={artwork?.faceAsset ?? ''} />
            ) : (
              <span className={styles.symbolicArtwork} data-pattern={card?.visual.pattern}>
                <i />
                <b>{card?.visual.glyph}</b>
                <i />
              </span>
            )}
          </span>
          <span className={styles.cardCorner}>
            <b>{card ? getRank(card.number, card.arcana === 'major') : ''}</b>
            <i>{card?.suit ? card.visual.glyph : '◆'}</i>
          </span>
          {selection?.orientation === 'reversed' ? (
            <span className={styles.orientationLabel}>{copy.reversed}</span>
          ) : null}
          <span className={styles.cardFaceCaption}>
            <span className={styles.cardRank}>
              {card ? getRank(card.number, card.arcana === 'major') : ''}
            </span>
            <Typography as="span" variant="heading-sm">
              {card?.name[locale]}
            </Typography>
            {card?.suit ? <small>{tarotSuitNames[locale][card.suit]}</small> : null}
          </span>
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
        data-artwork-rights={artwork?.rightsStatus}
        data-orientation={selection?.orientation}
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
      data-artwork-rights={artwork?.rightsStatus}
      data-orientation={selection?.orientation}
      disabled={ariaDisabled}
      onClick={onClick}
      prominence="quiet"
      style={style}
    >
      {content}
    </Button>
  );
}
