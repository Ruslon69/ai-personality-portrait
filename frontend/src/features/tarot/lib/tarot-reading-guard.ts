import { isSupportedLocale } from '@shared/i18n';
import { tarotCardById, tarotSpreadById } from '../data';
import type { TarotCardSelection, TarotReading } from '../types';

const deckThemes = new Set(['cosmic-minimal', 'deep-water', 'midnight-geometry', 'solar-lines']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isSelection(value: unknown): value is TarotCardSelection {
  if (!isRecord(value)) return false;
  return (
    isString(value.cardId) &&
    tarotCardById.has(value.cardId) &&
    isString(value.positionId) &&
    (value.orientation === 'upright' || value.orientation === 'reversed')
  );
}

function hasRenderableExpertInterpretation(value: unknown) {
  if (!isRecord(value) || !isRecord(value.content) || !Array.isArray(value.themes)) return false;
  return (
    isString(value.leadingThemeId) &&
    isString(value.content.headline) &&
    isString(value.content.opening) &&
    value.themes.every(
      (theme) => isRecord(theme) && isString(theme.id) && isString(theme.semanticId),
    )
  );
}

function hasRenderableNumerology(value: unknown) {
  if (!isRecord(value) || !isRecord(value.personalYear)) return false;
  return (
    isString(value.personalYear.label) &&
    typeof value.personalYear.value === 'number' &&
    Number.isFinite(value.personalYear.value)
  );
}

const interpretationStringFields = [
  'cardId',
  'connections',
  'contextLink',
  'headline',
  'id',
  'meaningInPosition',
  'numerologyLink',
  'positionId',
  'practicalTheme',
  'reflectionQuestion',
  'uncertainty',
] as const;

/**
 * Protects result/history rendering from partially migrated or manually corrupted browser data.
 * It validates only the immutable fields that the existing Tarot result UI actually consumes.
 */
export function isRenderableTarotReading(value: unknown): value is TarotReading {
  if (!isRecord(value)) return false;
  const spread = isString(value.spreadId) ? tarotSpreadById.get(value.spreadId) : undefined;
  if (
    !spread ||
    !isString(value.id) ||
    !value.id.trim() ||
    !isString(value.createdAt) ||
    Number.isNaN(Date.parse(value.createdAt)) ||
    !isString(value.headline) ||
    !isString(value.summary) ||
    !isString(value.practicalFocus) ||
    !isString(value.leadingCardId) ||
    !tarotCardById.has(value.leadingCardId) ||
    !Array.isArray(value.selections) ||
    value.selections.length !== spread.positions.length ||
    !value.selections.every(isSelection) ||
    !Array.isArray(value.interpretations) ||
    value.interpretations.length !== value.selections.length ||
    !hasRenderableExpertInterpretation(value.expertInterpretation) ||
    !isRecord(value.context) ||
    !isSupportedLocale(value.context.locale) ||
    !deckThemes.has(String(value.context.deckTheme)) ||
    !isString(value.context.seed) ||
    !hasRenderableNumerology(value.context.numerology)
  )
    return false;

  const cardIds = new Set<string>();
  const positionIds = new Set<string>();
  for (const [index, selection] of value.selections.entries()) {
    const expectedPosition = spread.positions[index];
    if (
      !expectedPosition ||
      selection.positionId !== expectedPosition.id ||
      cardIds.has(selection.cardId) ||
      positionIds.has(selection.positionId)
    )
      return false;
    cardIds.add(selection.cardId);
    positionIds.add(selection.positionId);

    const interpretation = value.interpretations[index];
    if (
      !isRecord(interpretation) ||
      !interpretationStringFields.every((field) => isString(interpretation[field])) ||
      interpretation.cardId !== selection.cardId ||
      interpretation.positionId !== selection.positionId ||
      interpretation.orientation !== selection.orientation
    )
      return false;
  }

  return cardIds.has(value.leadingCardId);
}
