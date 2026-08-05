import { PRODUCT_STORAGE_KEYS } from '../constants';
import {
  parseProductStorageEnvelope,
  serializeProductStorageEnvelope,
  withEnvelopeChecksum,
} from '../serialization';
import type {
  ProductStorageEnvelope,
  ProductStorageRepository,
  TransactionWriteResult,
} from '../types';

export function writeEnvelopeTransactionally(
  repository: ProductStorageRepository,
  attempted: ProductStorageEnvelope,
  options: { expectedRevision?: number; now: string },
): TransactionWriteResult {
  const active = repository.read(PRODUCT_STORAGE_KEYS.activeEnvelope);
  if (!active.ok)
    return { capability: active.capability, message: active.error, status: 'failure' };
  const current = active.value ? parseProductStorageEnvelope(active.value) : null;
  if (active.value && current?.status !== 'success')
    return {
      capability:
        current?.status === 'checksum-error' || current?.status === 'validation-error'
          ? 'corrupted'
          : repository.capability(),
      message: `Active storage requires recovery before writing (${current?.status ?? 'unknown'}).`,
      status: 'failure',
    };
  if (
    current?.status === 'success' &&
    options.expectedRevision !== undefined &&
    current.envelope.revision !== options.expectedRevision
  )
    return { attemptedEnvelope: attempted, latestEnvelope: current.envelope, status: 'conflict' };

  const next = withEnvelopeChecksum({
    ...attempted,
    createdAt: current?.status === 'success' ? current.envelope.createdAt : attempted.createdAt,
    revision: (current?.status === 'success' ? current.envelope.revision : attempted.revision) + 1,
    updatedAt: options.now,
  });
  const serialized = serializeProductStorageEnvelope(next);
  if (serialized.status !== 'success')
    return {
      capability: repository.capability(),
      message: serialized.errors.join(' '),
      status: 'failure',
    };
  const tempWrite = repository.write(PRODUCT_STORAGE_KEYS.temporaryTransaction, serialized.json);
  if (!tempWrite.ok)
    return { capability: tempWrite.capability, message: tempWrite.error, status: 'failure' };
  const tempRead = repository.read(PRODUCT_STORAGE_KEYS.temporaryTransaction);
  if (!tempRead.ok || !tempRead.value)
    return {
      capability: tempRead.capability,
      message: tempRead.ok ? 'Temporary transaction disappeared.' : tempRead.error,
      status: 'failure',
    };
  const checked = parseProductStorageEnvelope(tempRead.value);
  if (checked.status !== 'success')
    return {
      capability: repository.capability(),
      message: `Temporary transaction failed validation: ${checked.status}.`,
      status: 'failure',
    };
  if (current?.status === 'success') {
    const backup = repository.write(PRODUCT_STORAGE_KEYS.backupEnvelope, active.value as string);
    if (!backup.ok)
      return { capability: backup.capability, message: backup.error, status: 'failure' };
  }
  const promoted = repository.write(PRODUCT_STORAGE_KEYS.activeEnvelope, tempRead.value);
  if (!promoted.ok)
    return { capability: promoted.capability, message: promoted.error, status: 'failure' };
  const cleanup = repository.remove(PRODUCT_STORAGE_KEYS.temporaryTransaction);
  if (!cleanup.ok)
    return { capability: cleanup.capability, message: cleanup.error, status: 'failure' };
  return { capability: repository.capability(), envelope: checked.envelope, status: 'success' };
}

export function writeRecoveredEnvelope(
  repository: ProductStorageRepository,
  recovered: ProductStorageEnvelope,
  now: string,
): TransactionWriteResult {
  const next = withEnvelopeChecksum({
    ...recovered,
    revision: recovered.revision + 1,
    updatedAt: now,
  });
  const serialized = serializeProductStorageEnvelope(next);
  if (serialized.status !== 'success')
    return {
      capability: repository.capability(),
      message: serialized.errors.join(' '),
      status: 'failure',
    };
  const temporary = repository.write(PRODUCT_STORAGE_KEYS.temporaryTransaction, serialized.json);
  if (!temporary.ok)
    return { capability: temporary.capability, message: temporary.error, status: 'failure' };
  const readBack = repository.read(PRODUCT_STORAGE_KEYS.temporaryTransaction);
  if (!readBack.ok || !readBack.value)
    return {
      capability: readBack.capability,
      message: readBack.ok ? 'Recovery transaction disappeared.' : readBack.error,
      status: 'failure',
    };
  const validated = parseProductStorageEnvelope(readBack.value);
  if (validated.status !== 'success')
    return {
      capability: repository.capability(),
      message: `Recovery transaction failed validation: ${validated.status}.`,
      status: 'failure',
    };
  const promoted = repository.write(PRODUCT_STORAGE_KEYS.activeEnvelope, readBack.value);
  if (!promoted.ok)
    return { capability: promoted.capability, message: promoted.error, status: 'failure' };
  const cleanup = repository.remove(PRODUCT_STORAGE_KEYS.temporaryTransaction);
  if (!cleanup.ok)
    return { capability: cleanup.capability, message: cleanup.error, status: 'failure' };
  return { capability: repository.capability(), envelope: validated.envelope, status: 'success' };
}
