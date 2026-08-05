import type { TarotSymbolicMotif } from '../types';

export const tarotSymbolicMotifs: readonly TarotSymbolicMotif[] = [
  {
    id: 'bridge',
    process: 'connect',
    themeTags: ['connection', 'transition'],
    shadowTags: ['risk'],
  },
  {
    id: 'circle',
    process: 'integrate',
    themeTags: ['completion', 'balance'],
    shadowTags: ['rest'],
  },
  {
    id: 'crossroad',
    process: 'choose',
    themeTags: ['choice', 'decision'],
    shadowTags: ['uncertainty'],
  },
  { id: 'door', process: 'open', themeTags: ['opportunity', 'change'], shadowTags: ['risk'] },
  { id: 'fire', process: 'amplify', themeTags: ['energy', 'action'], shadowTags: ['conflict'] },
  {
    id: 'lantern',
    process: 'illuminate',
    themeTags: ['clarity', 'focus'],
    shadowTags: ['uncertainty'],
  },
  {
    id: 'mirror',
    process: 'examine',
    themeTags: ['reflection', 'truth'],
    shadowTags: ['uncertainty'],
  },
  {
    id: 'mountain',
    process: 'endure',
    themeTags: ['stability', 'discipline'],
    shadowTags: ['risk'],
  },
  {
    id: 'river',
    process: 'balance',
    themeTags: ['adaptation', 'tempo'],
    shadowTags: ['uncertainty'],
  },
  {
    id: 'seed',
    process: 'cultivate',
    themeTags: ['growth', 'opportunity'],
    shadowTags: ['patience'],
  },
  { id: 'storm', process: 'challenge', themeTags: ['conflict', 'change'], shadowTags: ['risk'] },
  { id: 'sunrise', process: 'begin', themeTags: ['vision', 'recovery'], shadowTags: ['tempo'] },
  {
    id: 'thread',
    process: 'connect',
    themeTags: ['communication', 'connection'],
    shadowTags: ['boundaries'],
  },
  {
    id: 'threshold',
    process: 'define',
    themeTags: ['boundaries', 'transition'],
    shadowTags: ['choice'],
  },
  { id: 'well', process: 'internalize', themeTags: ['intuition', 'emotion'], shadowTags: ['rest'] },
  {
    id: 'window',
    process: 'observe',
    themeTags: ['vision', 'clarity'],
    shadowTags: ['uncertainty'],
  },
];
