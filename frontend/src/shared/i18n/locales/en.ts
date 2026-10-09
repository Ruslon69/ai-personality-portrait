import type { I18nMessages } from '../types';

export const en = {
  shell: {
    notifications: 'Notifications',
    footer: 'For personal reflection — not diagnosis or prediction',
    legal: {
      label: 'Legal information',
      privacy: 'Privacy',
      terms: 'Terms',
    },
    header: {
      closeNavigation: 'Close navigation',
      language: 'Interface language',
      menu: 'Menu',
      openNavigation: 'Open navigation',
      openSettings: 'Open settings',
      settings: 'Settings',
    },
    navigation: {
      close: 'Close',
      closeLabel: 'Close menu',
      label: 'Navigation',
      sectionsLabel: 'Application sections',
    },
    skipToContent: 'Skip to main content',
    theme: {
      action: 'Current theme: {current}. Switch to {next}',
      current: 'Theme: {theme}',
      modes: {
        dark: 'dark',
        light: 'light',
        system: 'system',
      },
      shortModes: {
        dark: 'Dark',
        light: 'Light',
        system: 'Auto',
      },
    },
  },
  navigation: {
    compatibility: 'Compatibility',
    home: 'Home',
    myPath: 'History',
    numerology: 'By birth date',
    portrait: 'Portrait',
    profile: 'My results',
    settings: 'Settings',
    tarot: 'Tarot',
  },
  system: {
    compatibility: {
      action: 'Return home',
      description:
        'This section is not available yet. Return home to choose Tarot, a birth-date reading, or a personal reflection.',
      title: 'Compatibility',
    },
    notFound: {
      action: 'Return home',
      description: 'This page may no longer exist, or there may be a mistake in the address.',
      title: 'Page not found',
    },
  },
  home: {
    benefits: {
      description:
        'Not another test that assigns you a type, but a connected reading where every observation keeps a clear source.',
      eyebrow: 'What you get',
      items: [
        {
          description:
            'Answers, interests and the extras you choose form one clear picture instead of a collection of isolated facts.',
          eyebrow: 'Connected perspective',
          title: 'The details form a wider picture',
        },
        {
          description:
            'Your portrait reveals a combination of traits and contexts without defining you as one permanent type.',
          eyebrow: 'Different sides of you',
          title: 'Not a type or label, but a living mix of traits',
        },
        {
          description:
            'Answers, the current voice sample and birth-date insights are always shown separately.',
          eyebrow: 'Sources stay visible',
          title: 'More than one way to see yourself',
        },
        {
          description:
            'Every meaningful observation leads to a small, realistic suggestion you can try in everyday life.',
          eyebrow: 'Practical value',
          title: 'From insight to action',
        },
        {
          description:
            'Optional parts can be skipped. You decide which information and additional readings to include.',
          eyebrow: 'Your choice',
          title: 'You choose the depth',
        },
      ],
      title: 'A portrait where the details connect',
    },
    emotion: {
      description:
        'This is not a hidden truth or a fixed label. It is a way to notice what repeats in your answers.',
      eyebrow: 'An observation about you',
      title:
        'Sometimes the most interesting side of you is the one you have not put into words yet.',
    },
    final: {
      description: 'Begin with a few short questions. You can choose the optional parts later.',
      title: 'Curious what connections may open up for you?',
    },
    hero: {
      description:
        'Answer a few questions and receive clear observations about your habits, interests and reactions.',
      eyebrow: 'Your personal portrait',
      primaryCta: 'Create my portrait',
      secondaryCta: 'See how it works',
      title: ['There’s more to you', 'than meets the eye'],
      trustSignals: [
        '3–5 minutes',
        'voice is optional',
        'first part is free',
        'no diagnoses or labels',
      ],
      visual: {
        ariaLabel:
          'Answers, interests, zodiac, birth-date calculations and voice combine into a personal reflection',
        coreLabel: 'Connected picture',
        coreStatus: 'Connecting your chosen facets',
        coreValue: 'Your portrait',
        layers: ['Answers', 'Interests', 'Zodiac', 'Numerology', 'Voice'],
      },
    },
    layers: {
      baseLabel: 'Foundation',
      description: 'Your answers form the foundation. Voice and birth-date details are optional.',
      eyebrow: 'You control the depth',
      items: [
        {
          description: 'Short questions with ready-made choices establish useful context.',
          label: 'Foundation',
          title: 'Quick questions',
        },
        {
          description: 'The topics you choose make observations more relevant to your life.',
          label: 'Foundation',
          title: 'Interests',
        },
        {
          badge: 'Optional',
          description: 'Technical observations about this sample only — never identification.',
          label: 'Current sample',
          title: 'Voice',
        },
        {
          badge: 'Interpretation',
          description: 'A symbolic reading for reflection, never presented as an established fact.',
          label: 'From your birth date',
          title: 'Numerology',
        },
        {
          badge: 'Interpretation',
          description: 'A familiar reference point you can add or leave out entirely.',
          label: 'From your birth date',
          title: 'Zodiac sign',
        },
        {
          badge: 'Interpretation',
          description:
            'An optional perspective that neither validates nor replaces the psychological layer.',
          label: 'Optional',
          title: 'Astrology reading',
        },
      ],
      optionalLabel: 'Optional',
      title: 'Choose what to add',
    },
    process: {
      description:
        'We show what each observation is based on, so you can see connections and differences without hidden conclusions.',
      eyebrow: 'How the picture comes together',
      items: [
        {
          description: 'Short answers and interests add context without a long questionnaire.',
          title: 'You tell us about yourself',
        },
        {
          description: 'Voice and birth-date readings are included only when you choose them.',
          title: 'You choose the extras',
        },
        {
          description:
            'The system compares observations, highlights overlaps and keeps differences visible.',
          title: 'The sources reveal connections and contrasts',
        },
        {
          description:
            'Explore the portrait gradually, with small practical suggestions along the way.',
          title: 'You receive a personal result',
        },
      ],
      origins: [
        'From your answers',
        'From this voice sample',
        'Reading by numbers',
        'Astrology reading',
        'Personal suggestion',
      ],
      resultLabel: 'Portrait',
      synthesisLabel: 'Connected picture',
      title: 'Different sources. One connected portrait.',
    },
    privacy: {
      description:
        'The recording is used only for observations about speech in that specific sample. It is never used to identify you.',
      eyebrow: 'Voice and privacy',
      statement:
        'You can skip the voice step, and the original recording is deleted after analysis by default.',
      title: 'Voice can add nuance, but it remains your choice',
    },
  },
  start: {
    essentials: {
      description: 'A quick guide to the format.',
      eyebrow: 'Before you start',
      items: [
        {
          description: 'To reach your first result.',
          label: 'Time',
          title: '3–5 minutes',
        },
        {
          description: 'No long answers are required.',
          label: 'Format',
          title: 'Short questions',
        },
        {
          badge: 'In your control',
          description: 'You can skip every optional step.',
          label: 'Your choice',
          title: 'Only the details you want',
        },
      ],
      title: 'What to expect',
    },
    final: {
      description: 'The first screen shows one short question with ready-made choices.',
      title: 'Ready to see how your facets connect?',
    },
    hero: {
      description:
        'Answer a few short questions and receive observations about your habits, interests and reactions.',
      eyebrow: 'Your portrait',
      note: '3–5 minutes. You can skip optional steps.',
      primaryCta: 'Start the questions',
      title: ['See yourself', 'more clearly'],
    },
    journey: {
      eyebrow: 'Optional details',
      items: [
        {
          description: 'A few simple questions with ready-made choices.',
          title: 'Answer the questions',
        },
        {
          description: 'Add interests, your birth date or a voice sample if you wish.',
          title: 'Add details',
        },
        {
          description: 'Receive personal observations without diagnoses or definitive claims.',
          title: 'Get your result',
        },
        {
          description: 'Open more detail only when it is useful to you.',
          title: 'Explore further',
        },
      ],
      title: 'How it works',
    },
    privacy: {
      description: 'Your birth date and voice are optional. You decide what to include.',
      eyebrow: 'A clear word on data',
      title: 'Your details, your choice',
    },
    result: {
      description:
        'The portrait opens gradually: key observations first, then details, source labels and small practical suggestions.',
      eyebrow: 'What comes next',
      points: ['A personal portrait', 'Practical suggestions', 'The first part is free'],
      title: 'Value first. Your choice of depth comes next.',
    },
  },
} satisfies I18nMessages;
