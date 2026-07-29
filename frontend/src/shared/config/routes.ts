export const ROUTES = Object.freeze({
  compatibility: '/compatibility',
  home: '/',
  notFound: '/404',
  portrait: '/portrait',
  portraitBirthDate: '/portrait/birth-date',
  portraitQuestions: '/portrait/questions',
  portraitVoice: '/portrait/voice',
  profile: '/profile',
  settings: '/settings',
} as const);

export type AppRoutePath = (typeof ROUTES)[keyof typeof ROUTES];
