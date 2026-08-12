#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import process from 'node:process';

import {
  generatedRoot,
  readProductionManifest,
  resolveFrontendPath,
  validateProductionManifest,
} from './lib.mjs';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function relativeUrl(fromDirectory, frontendPath) {
  return relative(fromDirectory, resolveFrontendPath(frontendPath)).split(sep).join('/');
}

const manifest = await readProductionManifest();
const failures = await validateProductionManifest(manifest);
if (failures.length) throw new Error(failures.join('\n'));
await mkdir(generatedRoot, { recursive: true });

const cards = manifest.cards
  .map((card) => {
    const classic = relativeUrl(generatedRoot, card.compositionReference.referenceAsset);
    const candidate = card.previewPath ? relativeUrl(generatedRoot, card.previewPath) : '';
    return `<article data-status="${escapeHtml(card.productionStatus)}">
      <header><strong>${escapeHtml(card.canonicalName)}</strong><span>${escapeHtml(card.cardId)}</span></header>
      <div class="comparison">
        <figure><img src="${escapeHtml(classic)}" alt="Classic reference for ${escapeHtml(card.canonicalName)}"><figcaption>Classic semantic reference</figcaption></figure>
        <figure>${candidate ? `<img src="${escapeHtml(candidate)}" alt="Premium candidate for ${escapeHtml(card.canonicalName)}">` : '<div class="missing">No premium candidate</div>'}<figcaption>Premium candidate</figcaption></figure>
      </div>
      <footer><span>${escapeHtml(card.productionStatus)} / ${escapeHtml(card.reviewStatus)}</span><span>${escapeHtml(card.styleVersion)} · v${card.version}</span></footer>
    </article>`;
  })
  .join('\n');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Premium Tarot production contact sheet</title>
<style>
:root{color-scheme:dark;font-family:Inter,system-ui,sans-serif;background:#080b12;color:#eee7d7}body{margin:0;padding:32px}h1{font-family:Georgia,serif;color:#d2ad65}.meta{color:#aaa;margin-bottom:28px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px}article{border:1px solid #6f5730;border-radius:14px;background:#111725;padding:16px;box-shadow:0 18px 36px #0008}header,footer{display:flex;justify-content:space-between;gap:12px}header span,footer{font-size:12px;color:#b9aa8c}.comparison{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0}figure{margin:0}img,.missing{display:block;width:100%;aspect-ratio:7/12;object-fit:contain;border:1px solid #5c4829;border-radius:8px;background:#090c13}.missing{display:grid;place-items:center;color:#776e5e;text-align:center}figcaption{margin-top:6px;color:#93866f;font-size:11px}article[data-status=approved],article[data-status=integrated]{border-color:#78935c}article[data-status=rejected]{border-color:#9b4d48}@media(max-width:560px){body{padding:16px}.grid{grid-template-columns:1fr}}
</style></head><body><h1>Premium Tarot production</h1><p class="meta">Development-only comparison · ${manifest.cards.length} cards · release mode ${escapeHtml(manifest.releaseMode)}</p><main class="grid">${cards}</main></body></html>`;

const outputPath = resolve(generatedRoot, 'contact-sheet.html');
await writeFile(outputPath, html);
process.stdout.write(`Wrote development contact sheet: ${outputPath}\n`);
