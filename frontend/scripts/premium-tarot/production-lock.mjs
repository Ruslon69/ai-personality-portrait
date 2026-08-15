import { randomUUID } from 'node:crypto';
import { hostname } from 'node:os';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

import { productionRoot } from './lib.mjs';

export const productionLockPath = resolve(productionRoot, '.production-lock');
const staleAfterMs = 6 * 60 * 60 * 1000;

function processIsAlive(pid) {
  if (!Number.isInteger(pid) || pid < 1) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

async function readOwner(path) {
  try {
    return JSON.parse(await readFile(resolve(path, 'owner.json'), 'utf8'));
  } catch {
    return undefined;
  }
}

function ownerIsStale(owner, now = Date.now()) {
  const createdAt = Date.parse(owner?.createdAt ?? '');
  if (!Number.isFinite(createdAt)) return false;
  if (owner.hostname === hostname()) return !processIsAlive(owner.pid);
  return now - createdAt > staleAfterMs;
}

async function quarantineStaleLock(lockPath, owner) {
  const quarantine = `${lockPath}.stale-${owner?.token ?? randomUUID()}`;
  try {
    await rename(lockPath, quarantine);
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
  await rm(quarantine, { force: true, recursive: true });
  return true;
}

export async function acquireProductionLock(operation, { lockPath = productionLockPath } = {}) {
  if (typeof operation !== 'string' || !operation.trim()) {
    throw new Error('Production lock operation is required.');
  }
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const token = randomUUID();
    try {
      await mkdir(lockPath);
      const owner = {
        schemaVersion: 'premium-tarot-production-lock-v1',
        token,
        operation: operation.trim(),
        pid: process.pid,
        hostname: hostname(),
        createdAt: new Date().toISOString(),
      };
      await writeFile(resolve(lockPath, 'owner.json'), `${JSON.stringify(owner)}\n`, {
        flag: 'wx',
      });
      let released = false;
      return {
        owner,
        async release() {
          if (released) return;
          const current = await readOwner(lockPath);
          if (current?.token !== token) {
            throw new Error('Production lock ownership changed; refusing unsafe cleanup.');
          }
          await rm(lockPath, { force: true, recursive: true });
          released = true;
        },
      };
    } catch (error) {
      if (error.code !== 'EEXIST') {
        await rm(lockPath, { force: true, recursive: true }).catch(() => {});
        throw error;
      }
      const owner = await readOwner(lockPath);
      if (ownerIsStale(owner) && (await quarantineStaleLock(lockPath, owner))) continue;
      const detail = owner
        ? `${owner.operation} (pid ${owner.pid}, ${owner.hostname}, since ${owner.createdAt})`
        : 'an unreadable lock owner';
      throw new Error(
        `Premium Tarot production is locked by ${detail}. Wait for it to finish; stale writers are not allowed to overwrite production state.`,
        { cause: error },
      );
    }
  }
  throw new Error('Unable to acquire the Premium Tarot production lock safely.');
}

export async function withProductionLock(operation, callback) {
  const lock = await acquireProductionLock(operation);
  try {
    return await callback(lock.owner);
  } finally {
    await lock.release();
  }
}

export const productionLockInternals = { ownerIsStale };
