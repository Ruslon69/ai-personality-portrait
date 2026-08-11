export function toggleManualCardSelection(
  selectedCardIds: readonly string[],
  cardId: string,
  requiredCount: number,
): readonly string[] {
  if (selectedCardIds.includes(cardId)) {
    return selectedCardIds.filter((selectedId) => selectedId !== cardId);
  }
  if (selectedCardIds.length >= requiredCount) return selectedCardIds;
  return [...selectedCardIds, cardId];
}

export function isManualCardSelectionComplete(
  selectedCardIds: readonly string[],
  requiredCount: number,
) {
  return requiredCount > 0 && selectedCardIds.length === requiredCount;
}
