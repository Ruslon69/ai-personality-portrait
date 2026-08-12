import type { TarotDeckTheme } from '../types';
import styles from './Tarot.module.css';

function ClassicArcanaBack() {
  return (
    <svg aria-hidden="true" viewBox="0 0 140 240">
      <rect className={styles.backLineStrong} height="218" rx="8" width="118" x="11" y="11" />
      <rect className={styles.backLineFine} height="204" rx="5" width="104" x="18" y="18" />
      <g className={styles.backLineFine}>
        <path d="M24 45c9-13 23-17 34-7-13-2-20 5-18 17-8-1-13-4-16-10Z" />
        <circle cx="109" cy="42" r="8" />
        <path d="M109 27v7M109 50v7M94 42h7M117 42h7M99 32l5 5M114 47l5 5M119 32l-5 5M104 47l-5 5" />
      </g>
      <g className={styles.backLineFine} transform="rotate(180 70 120)">
        <path d="M24 45c9-13 23-17 34-7-13-2-20 5-18 17-8-1-13-4-16-10Z" />
        <circle cx="109" cy="42" r="8" />
        <path d="M109 27v7M109 50v7M94 42h7M117 42h7M99 32l5 5M114 47l5 5M119 32l-5 5M104 47l-5 5" />
      </g>
      <g className={styles.backLineStrong}>
        <circle cx="70" cy="120" r="35" />
        <circle cx="70" cy="120" r="27" />
        <path d="M35 120H22M118 120h-13M70 85V72M70 168v-13M45 95l-9-9M104 154l-9-9M95 95l9-9M36 154l9-9" />
        <path d="M42 120c15-18 41-18 56 0-15 18-41 18-56 0Z" />
        <circle className={styles.backAccentFill} cx="70" cy="120" r="8" />
        <circle className={styles.backPaperFill} cx="70" cy="120" r="3" />
      </g>
      <path className={styles.backLineFine} d="M20 76h100M20 164h100" />
    </svg>
  );
}

function LunarBack() {
  return (
    <svg aria-hidden="true" viewBox="0 0 140 240">
      <rect className={styles.backLineStrong} height="218" rx="9" width="118" x="11" y="11" />
      <rect className={styles.backLineFine} height="204" rx="6" width="104" x="18" y="18" />
      <g className={styles.backLineFine}>
        <path d="M29 48c7-11 17-17 28-18-9 7-11 18-5 28-10-1-18-4-23-10Z" />
        <circle cx="70" cy="40" r="7" />
        <path d="M111 48c-7-11-17-17-28-18 9 7 11 18 5 28 10-1 18-4 23-10Z" />
        <path d="M32 70l5 3 5-3-2 6 4 4-6-1-4 5v-7l-5-4 6 1Z" />
        <path d="M108 70l-5 3-5-3 2 6-4 4 6-1 4 5v-7l5-4-6 1Z" />
      </g>
      <g className={styles.backLineFine} transform="rotate(180 70 120)">
        <path d="M29 48c7-11 17-17 28-18-9 7-11 18-5 28-10-1-18-4-23-10Z" />
        <circle cx="70" cy="40" r="7" />
        <path d="M111 48c-7-11-17-17-28-18 9 7 11 18 5 28 10-1 18-4 23-10Z" />
        <path d="M32 70l5 3 5-3-2 6 4 4-6-1-4 5v-7l-5-4 6 1Z" />
        <path d="M108 70l-5 3-5-3 2 6-4 4 6-1 4 5v-7l5-4-6 1Z" />
      </g>
      <g className={styles.backLineStrong}>
        <circle cx="70" cy="120" r="36" />
        <circle cx="70" cy="120" r="27" />
        <path d="M70 84c-16 9-16 63 0 72M70 84c16 9 16 63 0 72M34 120h72" />
        <circle className={styles.backAccentFill} cx="70" cy="120" r="13" />
        <path className={styles.backPaperFill} d="M64 111c10 3 13 12 7 20-11-2-15-12-7-20Z" />
      </g>
      <g className={styles.backDotFill}>
        <circle cx="32" cy="103" r="1.7" />
        <circle cx="108" cy="137" r="1.7" />
        <circle cx="108" cy="103" r="1.7" />
        <circle cx="32" cy="137" r="1.7" />
      </g>
      <path
        className={styles.backLineFine}
        d="m32 103 20 10m56 24-20-10m20-24-20 10m-56 24 20-10"
      />
    </svg>
  );
}

function CelestialBack() {
  return (
    <svg aria-hidden="true" viewBox="0 0 140 240">
      <rect className={styles.backLineStrong} height="218" rx="8" width="118" x="11" y="11" />
      <rect className={styles.backLineFine} height="202" rx="5" width="102" x="19" y="19" />
      <g className={styles.backLineFine}>
        <circle cx="70" cy="120" r="45" />
        <circle cx="70" cy="120" r="34" />
        <ellipse cx="70" cy="120" rx="45" ry="17" />
        <ellipse cx="70" cy="120" rx="17" ry="45" />
        <path d="M38 88l64 64M102 88l-64 64M70 75v90M25 120h90" />
      </g>
      <g className={styles.backLineStrong}>
        <path d="m70 88 28 48H42l28-48Z" />
        <path d="m70 152-28-48h56l-28 48Z" />
        <circle className={styles.backAccentFill} cx="70" cy="120" r="9" />
        <circle className={styles.backPaperFill} cx="70" cy="120" r="3" />
      </g>
      <g className={styles.backLineFine}>
        <circle cx="31" cy="45" r="9" />
        <circle cx="109" cy="195" r="9" />
        <circle cx="109" cy="45" r="4" />
        <circle cx="31" cy="195" r="4" />
        <path d="M31 29v7M31 54v7M15 45h7M40 45h7M109 179v7M109 204v7M93 195h7M118 195h7" />
      </g>
    </svg>
  );
}

function NocturneBack() {
  return (
    <svg aria-hidden="true" viewBox="0 0 140 240">
      <rect className={styles.backLineStrong} height="218" rx="7" width="118" x="11" y="11" />
      <rect className={styles.backLineFine} height="204" rx="4" width="104" x="18" y="18" />
      <g className={styles.backLineFine}>
        <path d="M22 72c18-4 26-17 28-38 7 16 3 32-13 47M118 72c-18-4-26-17-28-38-7 16-3 32 13 47" />
        <path d="M22 168c18 4 26 17 28 38 7-16 3-32-13-47M118 168c-18 4-26 17-28 38-7-16-3-32 13-47" />
        <path d="M28 88c12-1 20-7 24-17M112 88c-12-1-20-7-24-17M28 152c12 1 20 7 24 17M112 152c-12 1-20 7-24 17" />
      </g>
      <g className={styles.backLineStrong}>
        <circle cx="70" cy="120" r="39" />
        <circle cx="70" cy="120" r="31" />
        <path d="m70 86 10 20 22 3-16 16 4 23-20-11-20 11 4-23-16-16 22-3 10-20Z" />
        <path d="M47 120c12-14 34-14 46 0-12 14-34 14-46 0Z" />
        <circle className={styles.backAccentFill} cx="70" cy="120" r="7" />
        <circle className={styles.backPaperFill} cx="70" cy="120" r="2.5" />
      </g>
      <g className={styles.backDotFill}>
        <circle cx="29" cy="29" r="2" />
        <circle cx="111" cy="211" r="2" />
        <circle cx="111" cy="29" r="2" />
        <circle cx="29" cy="211" r="2" />
      </g>
    </svg>
  );
}

function EngravedMysticalOverlay() {
  return (
    <svg aria-hidden="true" className={styles.backEngraving} viewBox="0 0 140 240">
      <g className={styles.backLineFine}>
        <path d="M20 31h15l8 8M120 209h-15l-8-8M120 31h-15l-8 8M20 209h15l8-8" />
        <path d="M27 55v14M113 171v14M113 55v14M27 171v14" />
        <path d="m27 78 5 8-5 8-5-8 5-8Zm86 68 5 8-5 8-5-8 5-8Z" />
        <path d="m113 78-5 8 5 8 5-8-5-8Zm-86 68-5 8 5 8 5-8-5-8Z" />
        <circle cx="27" cy="62" r="3.5" />
        <circle cx="113" cy="178" r="3.5" />
        <circle cx="113" cy="62" r="3.5" />
        <circle cx="27" cy="178" r="3.5" />
      </g>
      <g className={styles.backLineStrong}>
        <path d="M55 27h30M55 213h30" />
        <path d="m62 27 8-8 8 8-8 8-8-8Zm16 186-8-8-8 8 8 8 8-8Z" />
        <circle cx="70" cy="27" r="3" />
        <circle cx="70" cy="213" r="3" />
      </g>
    </svg>
  );
}

export function TarotCardBack({ theme }: { theme: TarotDeckTheme }) {
  return (
    <span className={styles.cardBackDesign} data-back-theme={theme}>
      {theme === 'cosmic-minimal' ? <ClassicArcanaBack /> : null}
      {theme === 'solar-lines' ? <LunarBack /> : null}
      {theme === 'midnight-geometry' ? <CelestialBack /> : null}
      {theme === 'deep-water' ? <NocturneBack /> : null}
      <EngravedMysticalOverlay />
    </span>
  );
}
