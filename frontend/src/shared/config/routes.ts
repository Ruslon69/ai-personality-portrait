export const ROUTES = Object.freeze({
  compatibility: '/compatibility',
  home: '/',
  notFound: '/404',
  portrait: '/portrait',
  portraitBirthDate: '/portrait/birth-date',
  portraitGenerating: '/portrait/generating',
  portraitQuestions: '/portrait/questions',
  portraitResult: '/portrait/result',
  portraitResultPreview: '/portrait/result-preview',
  portraitVoice: '/portrait/voice',
  profile: '/profile',
  profileHistory: '/profile/history',
  settings: '/settings',
} as const);

export type AppRoutePath = (typeof ROUTES)[keyof typeof ROUTES];
