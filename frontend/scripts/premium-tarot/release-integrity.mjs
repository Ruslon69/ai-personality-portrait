export function validatePremiumReleaseRecords(records, canonicalCardIds) {
  const failures = [];
  const expectedIds = [...canonicalCardIds].sort();
  const actualRecords = Array.isArray(records) ? records : [];
  const actualIds = actualRecords.map((record) => record.cardId);
  const uniqueIds = new Set(actualIds);
  if (actualRecords.length !== 78) failures.push('Premium runtime release requires 78 records.');
  if (uniqueIds.size !== actualRecords.length) {
    failures.push('Premium runtime release contains duplicate card IDs.');
  }
  if (JSON.stringify([...uniqueIds].sort()) !== JSON.stringify(expectedIds)) {
    failures.push('Premium runtime release IDs differ from the canonical 78-card deck.');
  }
  for (const record of actualRecords) {
    if (
      typeof record.artworkVersion !== 'string' ||
      !record.artworkVersion.trim() ||
      typeof record.assetPath !== 'string' ||
      !record.assetPath.trim() ||
      typeof record.checksum !== 'string' ||
      !/^[a-f0-9]{64}$/u.test(record.checksum)
    ) {
      failures.push(`${record.cardId || '<missing-id>'}: invalid runtime release record.`);
    }
  }
  return failures;
}
