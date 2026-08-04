export const ROUTES = Object.freeze({
  compatibility: '/compatibility',
  home: '/',
  notFound: '/404',
  numerology: '/numerology',
  numerologyProfile: '/numerology/profile',
  numerologyResult: '/numerology/result',
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
  tarot: '/tarot',
  tarotReading: '/tarot/reading',
  tarotResult: '/tarot/result',
} as const);

export type AppRoutePath = (typeof ROUTES)[keyof typeof ROUTES];
