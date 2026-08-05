import type {
  NarrativeChapterKind,
  NarrativeEmotionalPhase,
  NarrativePriorityFactor,
  NarrativeVoiceProfile,
} from '../types';

export const NARRATIVE_CHAPTER_ORDER = [
  'opening',
  'current-situation',
  'hidden-dynamic',
  'main-turning-point',
  'practical-direction',
  'reflection',
  'closing-thought',
] as const satisfies readonly NarrativeChapterKind[];

export const NARRATIVE_EMOTIONAL_CURVE = [
  'calm',
  'deepening',
  'tension',
  'clarity',
  'agency',
  'reflection',
  'integration',
] as const satisfies readonly NarrativeEmotionalPhase[];

export const NARRATIVE_PRIORITY_WEIGHTS: Readonly<Record<NarrativePriorityFactor, number>> = {
  'leading-card': 1000,
  tension: 360,
  'major-arcana': 300,
  'repeated-symbol': 240,
  'strong-connection': 210,
  'numerology-resonance': 180,
  'current-period': 160,
  'spread-position': 140,
  'psychological-context': 110,
  'practical-action': 90,
  reflection: 70,
};

export const NARRATIVE_VOICE: NarrativeVoiceProfile = {
  address: 'second-person-singular',
  cadence: 'measured',
  certainty: 'uncertainty-aware',
  id: 'authorial-voice-v1',
  register: 'calm-modern',
};

export const NARRATIVE_VERSIONS = {
  composerVersion: 'narrative-composer-v1',
  transitionVersion: 'narrative-transitions-v1',
} as const;
