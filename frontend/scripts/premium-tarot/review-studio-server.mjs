#!/usr/bin/env node

import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import process from 'node:process';
import { URL } from 'node:url';

import {
  findProductionCard,
  generatedRoot,
  manifestCandidateAttempts,
  parseNamedArguments,
  readJson,
  readProductionManifest,
  resolveFrontendPath,
  rubricPath,
  validateProductionManifest,
} from './lib.mjs';
import { findCandidateReviewAttempt, saveCandidateReview } from './review-workflow.mjs';
import {
  canonicalIdentityForCard,
  readCanonicalIdentityManifest,
  validateCanonicalIdentityManifest,
} from './canonical-identity.mjs';
import { readSourceNumberMap } from './mass-production.mjs';
import { acquireProductionLock } from './production-lock.mjs';

const { options, positional } = parseNamedArguments(process.argv.slice(2));
const [initialCardId] = positional;
if (!initialCardId || positional.length !== 1) {
  throw new Error('Usage: npm run tarot:premium:review-studio -- <card-id> [--port 4178]');
}
const port = Number(options.get('port') ?? 4178);
const csrfToken = randomUUID();
if (!Number.isInteger(port) || port < 1024 || port > 65_535) {
  throw new Error('Review Studio port must be an integer between 1024 and 65535.');
}

function parseRoute(pathname, prefix) {
  const match = new RegExp(`^/${prefix}/([a-z0-9]+(?:-[a-z0-9]+)*)/v(\\d+)$`).exec(pathname);
  return match ? { cardId: match[1], version: Number(match[2]) } : undefined;
}

function contentType(path) {
  return (
    {
      '.html': 'text/html; charset=utf-8',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.avif': 'image/avif',
    }[extname(path).toLowerCase()] ?? 'application/octet-stream'
  );
}

function send(response, status, body, type = 'text/plain; charset=utf-8') {
  response.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(body);
}

async function requestJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1024 * 1024) throw new Error('Review payload exceeds 1 MB.');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function productionContext(cardId, version) {
  const [manifest, canonicalIdentityManifest, sourceMap] = await Promise.all([
    readProductionManifest(),
    readCanonicalIdentityManifest(),
    readSourceNumberMap(),
  ]);
  const failures = await validateProductionManifest(manifest);
  failures.push(
    ...validateCanonicalIdentityManifest(canonicalIdentityManifest, manifest, sourceMap),
  );
  if (failures.length) throw new Error(failures.join('\n'));
  const card = findProductionCard(manifest, cardId);
  if (card.isGoldenMaster) throw new Error('The Golden Master Studio remains separate.');
  const attempt = findCandidateReviewAttempt(card, version);
  if (!attempt) throw new Error(`${cardId} v${version} is not a retained review attempt.`);
  return {
    card,
    attempt,
    canonicalIdentity: canonicalIdentityForCard(canonicalIdentityManifest, cardId),
  };
}

function generatePages(cardId) {
  execFileSync(process.execPath, [resolve(import.meta.dirname, 'candidate-review.mjs'), cardId], {
    stdio: 'ignore',
  });
}

const initialManifest = await readProductionManifest();
const initialCard = findProductionCard(initialManifest, initialCardId);
if (initialCard.isGoldenMaster) {
  throw new Error('Use npm run tarot:premium:golden-review for major-fool.');
}
generatePages(initialCardId);
const initialVersion =
  manifestCandidateAttempts(initialCard)
    .filter((attempt) => attempt.reviewPath)
    .sort((left, right) => left.version - right.version)
    .at(-1)?.version ?? initialCard.version;

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1'}`);
    if (request.method === 'GET' && url.pathname === '/') {
      response.writeHead(302, {
        Location: `/review/${initialCardId}/v${initialVersion}`,
        'Cache-Control': 'no-store',
      });
      response.end();
      return;
    }

    const reviewPage = parseRoute(url.pathname, 'review');
    if (request.method === 'GET' && reviewPage) {
      generatePages(reviewPage.cardId);
      const path = resolve(
        generatedRoot,
        'candidate-reviews',
        `${reviewPage.cardId}-v${reviewPage.version}.html`,
      );
      const page = (await readFile(path, 'utf8')).replaceAll('__PREMIUM_REVIEW_CSRF__', csrfToken);
      send(response, 200, page, contentType(path));
      return;
    }

    const reviewApi = parseRoute(url.pathname, 'api/review');
    if (reviewApi && ['GET', 'POST'].includes(request.method)) {
      if (request.method === 'GET') {
        const { attempt } = await productionContext(reviewApi.cardId, reviewApi.version);
        send(
          response,
          200,
          `${JSON.stringify(await readJson(resolveFrontendPath(attempt.reviewPath)), null, 2)}\n`,
          'application/json; charset=utf-8',
        );
        return;
      }
      const origin = request.headers.origin;
      const expectedOrigin = `http://${request.headers.host}`;
      if (origin !== expectedOrigin || request.headers['x-premium-review-csrf'] !== csrfToken) {
        send(response, 403, 'Review writes require the same local origin.');
        return;
      }
      const productionLock = await acquireProductionLock(
        `Review Studio save ${reviewApi.cardId} v${reviewApi.version}`,
      );
      try {
        const { card, attempt, canonicalIdentity } = await productionContext(
          reviewApi.cardId,
          reviewApi.version,
        );
        const saved = await saveCandidateReview(
          card,
          attempt,
          await requestJson(request),
          await readJson(rubricPath),
          { identity: canonicalIdentity },
        );
        send(
          response,
          200,
          `${JSON.stringify(saved, null, 2)}\n`,
          'application/json; charset=utf-8',
        );
      } finally {
        await productionLock.release();
      }
      return;
    }

    const classicArt = /^\/api\/art\/classic\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(url.pathname);
    if (request.method === 'GET' && classicArt) {
      const manifest = await readProductionManifest();
      const card = findProductionCard(manifest, classicArt[1]);
      const path = resolveFrontendPath(card.compositionReference.referenceAsset);
      send(response, 200, await readFile(path), contentType(path));
      return;
    }

    const candidateArt = parseRoute(url.pathname, 'api/art/candidate');
    if (request.method === 'GET' && candidateArt) {
      const { attempt } = await productionContext(candidateArt.cardId, candidateArt.version);
      const path = resolveFrontendPath(attempt.outputPath);
      send(response, 200, await readFile(path), contentType(path));
      return;
    }

    send(response, 404, 'Review Studio resource not found.');
  } catch (error) {
    send(response, 400, error.message);
  }
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(
    `Candidate Review Studio: http://127.0.0.1:${port}/review/${initialCardId}/v${initialVersion}\nPress Ctrl+C to stop.\n`,
  );
});
