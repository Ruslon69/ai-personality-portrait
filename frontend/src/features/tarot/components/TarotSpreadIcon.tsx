import type { ReactNode } from 'react';

import type { TarotSpread } from '../types';

const star = <path d="m32 13 4 14 14 5-14 4-4 15-4-15-14-4 14-5Z" />;
const motifs: Record<TarotSpread['id'], ReactNode> = {
  day: (
    <>
      <circle cx="32" cy="32" r="22" />
      {star}
      <path d="m18 18 6 6m16 16 6 6M46 18l-6 6M24 40l-6 6M32 3v3m29 26h-3M32 58v3M6 32H3" />
    </>
  ),
  love: (
    <>
      <path d="M31 15a21 21 0 1 0 0 36 19 19 0 0 1 0-36Zm2 0a21 21 0 1 1 0 36 19 19 0 0 0 0-36Z" />
      <path d="m32 5 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" />
    </>
  ),
  week: (
    <>
      <circle cx="32" cy="32" r="24" strokeDasharray="1 5" />
      {star}
      {[
        [32, 6],
        [52, 16],
        [57, 38],
        [43, 55],
        [21, 55],
        [7, 38],
        [12, 16],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" fill="currentColor" stroke="none" />
      ))}
    </>
  ),
  work: (
    <>
      <path d="M32 31c-7-7-15-9-25-8v28c10-1 18 1 25 7 7-6 15-8 25-7V23c-10-1-18 1-25 8Zm0 0v27M13 31c5 0 9 2 13 4m-13 4c5 0 9 2 13 4m12-8c4-3 8-4 13-4m-13 12c4-3 8-4 13-4" />
      <path d="m32 4 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" />
    </>
  ),
  month: (
    <>
      <circle cx="32" cy="32" r="26" />
      <path d="M38 13a20 20 0 1 0 0 38 22 22 0 0 1 0-38Z" />
      <path d="m46 21 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" />
      <circle cx="13" cy="14" r="2" fill="currentColor" />
    </>
  ),
  money: (
    <>
      <circle cx="32" cy="32" r="25" />
      <circle cx="32" cy="32" r="20" />
      {star}
      <path d="M18 5h3m22 54h3M5 45v-3m54-23v3" />
    </>
  ),
  year: (
    <>
      <circle cx="32" cy="32" r="18" />
      <circle cx="32" cy="32" r="10" />
      {Array.from({ length: 12 }, (_, index) => (
        <path key={index} d="M32 3v6" transform={`rotate(${index * 30} 32 32)`} />
      ))}
      <path d="m32 25 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" />
    </>
  ),
  decision: (
    <>
      <path d="M32 60V27m0 23C32 35 11 39 11 22m21 28c0-15 21-11 21-28M6 27l5-5 5 5m32 0 5-5 5 5" />
      <path d="m32 4 3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" />
      <path d="M20 56h24" />
    </>
  ),
};

/** Decorative spread symbols; the native radio's adjacent title supplies its name. */
export function TarotSpreadIcon({ spreadId }: { spreadId: TarotSpread['id'] }) {
  return (
    <svg
      aria-hidden="true"
      data-spread-icon={spreadId}
      fill="none"
      focusable="false"
      height="64"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.25"
      viewBox="0 0 64 64"
      width="64"
    >
      {motifs[spreadId]}
    </svg>
  );
}
