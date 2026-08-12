import { useState, type CSSProperties, type ReactNode } from 'react';

import { getTarotCardArtwork, hasRequiredTarotArtworkLayers } from '@assets/tarot';
import type { Locale } from '@shared/i18n';
import { Button, Typography } from '@shared/ui';

import { tarotCardById, tarotCopy, tarotSuitNames } from '../data';
import type { TarotCardSelection, TarotDeckTheme } from '../types';
import styles from './Tarot.module.css';
import {
  shouldLoadTarotFaceArtwork,
  type TarotArtworkLoadingVariant,
} from './tarot-artwork-loading';
import { getTarotArtworkRotation } from './tarot-artwork-orientation';
import { TarotCardBack } from './TarotCardBack';

type Props = {
  ariaLabel?: string;
  ariaDisabled?: boolean;
  instantReveal?: boolean;
  isRevealed?: boolean;
  isSelected?: boolean;
  index?: number;
  locale: Locale;
  onClick?: () => void;
  position?: string;
  preloadFace?: boolean;
  revealPhase?: 'idle' | 'preparing' | 'flipping' | 'settling' | 'settled';
  revealStatus?: 'locked' | 'ready' | 'revealing' | 'revealed';
  selection?: TarotCardSelection;
  selectionOrder?: number;
  showPosition?: boolean;
  total?: number;
  theme: TarotDeckTheme;
  variant?: TarotArtworkLoadingVariant;
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
  ariaLabel,
  ariaDisabled,
  instantReveal = false,
  isRevealed = false,
  isSelected,
  index = 0,
  locale,
  onClick,
  position,
  preloadFace = false,
  revealPhase,
  revealStatus,
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
  const [failedAssets, setFailedAssets] = useState<readonly string[]>([]);
  const shouldRequestFaceArtwork =
    Boolean(card) && shouldLoadTarotFaceArtwork(isRevealed, variant, preloadFace);
  const visibleArtworkLayers = artwork?.layers.filter(
    (layer) => !failedAssets.includes(layer.asset),
  );
  const canRenderFaceAsset =
    shouldRequestFaceArtwork &&
    Boolean(visibleArtworkLayers?.length) &&
    hasRequiredTarotArtworkLayers(artwork?.layers ?? [], failedAssets) &&
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
  const accessibleName =
    ariaLabel ??
    `${state}${isRevealed && card ? ` · ${card.name[locale]}` : ''}${
      accessibleOrientation ? ` · ${accessibleOrientation}` : ''
    }${accessiblePosition ? ` · ${accessiblePosition}` : ''}`;
  const style = {
    '--artwork-accent-tone': artwork?.palette.accentTone,
    '--artwork-dominant-tone': artwork?.palette.dominantTone,
    '--artwork-frame-tone': artwork?.palette.frameTone,
    '--artwork-light-tone': artwork?.palette.lightTone,
    '--artwork-reading-rotation': getTarotArtworkRotation(selection?.orientation),
    '--card-distance': index - (total - 1) / 2,
    '--card-index': index,
  } as CSSProperties;
  const content: ReactNode = (
    <>
      <span className={styles.tarotCardInner}>
        <span aria-hidden="true" className={styles.cardBackFace}>
          <TarotCardBack theme={theme} />
        </span>
        <span
          aria-hidden="true"
          className={styles.cardFrontFace}
          data-has-artwork={canRenderFaceAsset || undefined}
          data-orientation={selection?.orientation}
        >
          <span
            className={styles.cardFaceArtwork}
            data-orientation={selection?.orientation}
            data-render-mode={artwork?.renderMode}
          >
            {canRenderFaceAsset ? (
              <>
                <span className={styles.cardArtworkLayers}>
                  {visibleArtworkLayers?.map((layer, layerIndex) => (
                    <img
                      alt=""
                      className={styles.cardArtworkLayer}
                      data-layer-role={layer.role}
                      decoding="async"
                      fetchPriority={
                        variant === 'leading' || variant === 'revealing' ? 'high' : 'auto'
                      }
                      height={artwork?.height}
                      key={layer.id}
                      loading={variant === 'leading' || variant === 'revealing' ? 'eager' : 'lazy'}
                      onError={() =>
                        setFailedAssets((current) =>
                          current.includes(layer.asset) ? current : [...current, layer.asset],
                        )
                      }
                      src={layer.asset}
                      style={
                        {
                          '--artwork-layer-depth': Math.max(-1, Math.min(1, layer.depth)),
                          '--artwork-layer-opacity': layer.opacity ?? 1,
                          '--artwork-layer-order': layerIndex,
                          mixBlendMode: layer.blendMode ?? 'normal',
                        } as CSSProperties
                      }
                      width={artwork?.width}
                    />
                  ))}
                </span>
                <span
                  className={styles.cardArtworkEffects}
                  data-fog={artwork?.effects.fog || undefined}
                  data-glow={artwork?.effects.glow || undefined}
                  data-light-rays={artwork?.effects.lightRays || undefined}
                  data-particles={artwork?.effects.particles || undefined}
                />
              </>
            ) : (
              <span className={styles.symbolicArtwork} data-pattern={card?.visual.pattern}>
                <i />
                <b>{card?.visual.glyph}</b>
                <i />
              </span>
            )}
          </span>
          {!canRenderFaceAsset ? (
            <span className={styles.cardCorner}>
              <b>{card ? getRank(card.number, card.arcana === 'major') : ''}</b>
              <i>{card?.suit ? card.visual.glyph : '◆'}</i>
            </span>
          ) : null}
          {!canRenderFaceAsset ? (
            <span className={styles.cardFaceCaption}>
              <span className={styles.cardRank}>
                {card ? getRank(card.number, card.arcana === 'major') : ''}
              </span>
              <Typography as="span" variant="heading-sm">
                {card?.name[locale]}
              </Typography>
              {card?.suit ? <small>{tarotSuitNames[locale][card.suit]}</small> : null}
            </span>
          ) : null}
        </span>
      </span>
      {isRevealed && selection?.orientation === 'reversed' ? (
        <span className={styles.orientationLabel}>{copy.reversed}</span>
      ) : null}
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
        data-instant-reveal={instantReveal || undefined}
        data-reveal-phase={revealPhase}
        data-reveal-status={revealStatus}
        data-theme={theme}
        data-variant={variant}
        data-artwork-rights={artwork?.rightsStatus}
        data-artwork-family={artwork?.paletteFamily}
        data-artwork-edition={artwork?.editionId}
        data-artwork-provider={artwork?.providerId}
        data-artwork-quality={artwork?.quality}
        data-artwork-render-mode={artwork?.renderMode}
        data-artwork-source={artwork?.sourceKind}
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
      data-instant-reveal={instantReveal || undefined}
      data-reveal-phase={revealPhase}
      data-reveal-status={revealStatus}
      data-theme={theme}
      data-variant={variant}
      data-artwork-rights={artwork?.rightsStatus}
      data-artwork-family={artwork?.paletteFamily}
      data-artwork-edition={artwork?.editionId}
      data-artwork-provider={artwork?.providerId}
      data-artwork-quality={artwork?.quality}
      data-artwork-render-mode={artwork?.renderMode}
      data-artwork-source={artwork?.sourceKind}
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
