#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import process from 'node:process';

import {
  generatedRoot,
  readProductionManifest,
  resolveFrontendPath,
  validateProductionManifest,
} from './lib.mjs';
import {
  buildProductionQueue,
  readReferenceSet,
  readSourceNumberMap,
  referenceReadiness,
} from './mass-production.mjs';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function relativeUrl(fromDirectory, frontendPath) {
  if (!frontendPath || !existsSync(resolveFrontendPath(frontendPath))) return '';
  return relative(fromDirectory, resolveFrontendPath(frontendPath)).split(sep).join('/');
}

const [manifest, referenceSet, sourceMap] = await Promise.all([
  readProductionManifest(),
  readReferenceSet(),
  readSourceNumberMap(),
]);
const failures = await validateProductionManifest(manifest);
if (failures.length) throw new Error(failures.join('\n'));
await mkdir(generatedRoot, { recursive: true });
const queue = buildProductionQueue(manifest, referenceSet, sourceMap);
const queueById = new Map(queue.map((item) => [item.cardId, item]));
const readiness = referenceReadiness(manifest, referenceSet);
const approvedCount = queue.filter((item) =>
  ['approved', 'integrated'].includes(item.productionState),
).length;

const cards = manifest.cards
  .map((card) => {
    const queueItem = queueById.get(card.cardId);
    const classic = relativeUrl(generatedRoot, card.compositionReference.referenceAsset);
    const attempts = [
      ...(card.candidateHistory ?? []),
      ...(['generated', 'processing', 'review', 'approved', 'rejected', 'integrated'].includes(
        card.productionStatus,
      )
        ? [
            {
              version: card.version,
              previewPath: card.previewPath,
              outputPath: card.outputPath,
              productionStatus: card.productionStatus,
              reviewStatus: card.reviewStatus,
            },
          ]
        : []),
    ];
    const candidateFigures = attempts
      .map((attempt) => {
        const candidate = relativeUrl(generatedRoot, attempt.previewPath ?? attempt.outputPath);
        return `<figure>${candidate ? `<img src="${escapeHtml(candidate)}" alt="Premium candidate v${attempt.version} for ${escapeHtml(card.canonicalName)}">` : '<div class="missing">Candidate preview unavailable</div>'}<figcaption>v${attempt.version} · ${escapeHtml(attempt.productionStatus)} / ${escapeHtml(attempt.reviewStatus)}</figcaption></figure>`;
      })
      .join('');
    const retainedAttempts = attempts.length;
    const groups = [
      queueItem.role !== 'production-card' ? 'reference' : '',
      ['approved', 'integrated'].includes(card.productionStatus) ? 'approved' : '',
      card.productionStatus === 'review' ? 'review' : '',
      card.productionStatus === 'replacement-required' ? 'replacement' : '',
      !['approved', 'integrated'].includes(card.productionStatus) ? 'remaining' : '',
      ['pending', 'prompt-ready', 'prompt-ready-v2'].includes(card.productionStatus)
        ? 'pending'
        : '',
      card.arcana === 'major' ? 'major' : card.suit,
    ]
      .filter(Boolean)
      .join(' ');
    return `<article data-status="${escapeHtml(card.productionStatus)}" data-groups="${escapeHtml(groups)}">
      <header><strong>${queueItem.sequenceNumber}. ${escapeHtml(card.canonicalName)}</strong><span>${escapeHtml(card.cardId)}</span></header>
      <p class="role">${escapeHtml(queueItem.sourceFilename)} · ${escapeHtml(queueItem.role)}</p>
      <div class="comparison">
        <figure><img src="${escapeHtml(classic)}" alt="Classic reference for ${escapeHtml(card.canonicalName)}"><figcaption>Classic semantic reference</figcaption></figure>
        ${candidateFigures || '<figure><div class="missing">No premium candidate</div><figcaption>Premium candidate</figcaption></figure>'}
      </div>
      <footer><span>${escapeHtml(card.productionStatus)} / ${escapeHtml(card.reviewStatus)}</span><span>${escapeHtml(card.styleVersion)} · current v${card.version} · ${retainedAttempts} retained</span></footer>
      <p class="action">Next: ${escapeHtml(queueItem.nextRequiredAction)}</p>
    </article>`;
  })
  .join('\n');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Premium Tarot production contact sheet</title>
<style>
:root{color-scheme:dark;font-family:Inter,system-ui,sans-serif;background:#080b12;color:#eee7d7}body{margin:0;padding:32px}h1{font-family:Georgia,serif;color:#d2ad65}.meta{color:#aaa}.filters{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 28px}.filters button{border:1px solid #6f5730;border-radius:8px;background:#111725;color:#eee7d7;padding:8px 12px;cursor:pointer}.filters button[aria-pressed=true]{background:#6f5730;color:#fff}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px}article{border:1px solid #6f5730;border-radius:14px;background:#111725;padding:16px;box-shadow:0 18px 36px #0008}article[hidden]{display:none}header,footer{display:flex;justify-content:space-between;gap:12px}header span,footer{font-size:12px;color:#b9aa8c}.role,.action{margin:7px 0 0;color:#d2ad65;font-size:12px}.action{color:#c9b998}.comparison{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(130px,1fr);gap:12px;margin:14px 0;overflow-x:auto}figure{margin:0}img,.missing{display:block;width:100%;aspect-ratio:7/12;object-fit:contain;border:1px solid #5c4829;border-radius:8px;background:#090c13}.missing{display:grid;place-items:center;color:#776e5e;text-align:center}figcaption{margin-top:6px;color:#93866f;font-size:11px}article[data-status=approved],article[data-status=integrated]{border-color:#78935c}article[data-status=rejected],article[data-status=replacement-required]{border-color:#9b4d48}@media(max-width:560px){body{padding:16px}.grid{grid-template-columns:1fr}}
</style></head><body><h1>Premium Tarot production</h1><p class="meta">Development-only dashboard · Approved ${approvedCount} / 78 · Remaining ${78 - approvedCount} · release mode ${escapeHtml(manifest.releaseMode)} · Reference set readiness: ${readiness.approved} / ${readiness.total} approved</p><nav class="filters" aria-label="Production filters"><button type="button" data-filter="all" aria-pressed="true">All</button><button type="button" data-filter="reference" aria-pressed="false">Reference set</button><button type="button" data-filter="approved" aria-pressed="false">Approved</button><button type="button" data-filter="remaining" aria-pressed="false">Remaining</button><button type="button" data-filter="review" aria-pressed="false">Review</button><button type="button" data-filter="replacement" aria-pressed="false">Awaiting replacement</button><button type="button" data-filter="pending" aria-pressed="false">Pending</button><button type="button" data-filter="major" aria-pressed="false">Major</button><button type="button" data-filter="wands" aria-pressed="false">Wands</button><button type="button" data-filter="cups" aria-pressed="false">Cups</button><button type="button" data-filter="swords" aria-pressed="false">Swords</button><button type="button" data-filter="pentacles" aria-pressed="false">Pentacles</button></nav><main class="grid">${cards}</main><script>document.querySelectorAll('[data-filter]').forEach((button)=>button.addEventListener('click',()=>{const filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach((item)=>item.setAttribute('aria-pressed',String(item===button)));document.querySelectorAll('article').forEach((card)=>{card.hidden=filter!=='all'&&!card.dataset.groups.split(' ').includes(filter)})}));</script></body></html>`;

const outputPath = resolve(generatedRoot, 'contact-sheet.html');
await writeFile(outputPath, html);
process.stdout.write(`Wrote development contact sheet: ${outputPath}\n`);
