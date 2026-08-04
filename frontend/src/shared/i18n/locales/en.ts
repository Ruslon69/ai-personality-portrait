import type { I18nMessages } from '../types';

export const en = {
  shell: {
    footer: 'For self-reflection — not diagnosis or prediction',
    header: {
      closeNavigation: 'Close navigation',
      language: 'Interface language',
      menu: 'Menu',
      openNavigation: 'Open navigation',
      openSettings: 'Open settings',
      settings: 'Settings',
      userMenuUnavailable: 'User menu is not available yet',
      userPlaceholder: 'User',
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
    myPath: 'My Path',
    numerology: 'Numerology',
    portrait: 'Portrait',
    profile: 'Journey',
    settings: 'Settings',
    tarot: 'Tarot',
  },
  system: {
    compatibility: {
      description: 'The compatibility section is prepared without product functionality.',
      title: 'Compatibility',
    },
    notFound: {
      description: 'The requested page could not be found.',
      title: '404',
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
            'Answers, interests and selected interpretations become one coherent view instead of a collection of isolated facts.',
          eyebrow: 'AI synthesis',
          title: 'AI connects the details',
        },
        {
          description:
            'Your portrait reveals a combination of traits and contexts without defining you as one permanent type.',
          eyebrow: 'Many-sided by design',
          title: 'Not a type. Not a label. A blend of facets.',
        },
        {
          description:
            'Self-reflection, the current voice sample and interpretive layers remain clearly identified by source.',
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
            'Optional parts can be skipped. You decide which information and interpretations belong in your portrait.',
          eyebrow: 'Your choice',
          title: 'You choose the depth',
        },
      ],
      title: 'A portrait where the details connect',
    },
    emotion: {
      description:
        'Not a hidden truth or a fixed label — simply a fresh angle that can make your own patterns easier to notice.',
      eyebrow: 'A fresh perspective',
      title:
        'Sometimes the most interesting side of you is the one you have not put into words yet.',
    },
    final: {
      description:
        'Begin with a few short questions. You can choose every other layer along the way.',
      title: 'Curious what connections AI may notice in you?',
    },
    hero: {
      description:
        'Answer a few questions, choose the layers that feel relevant, and receive a personal portrait that connects your habits, interests and ways of expressing yourself.',
      eyebrow: 'YOUR PERSONAL AI PORTRAIT',
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
          'AI synthesis connects five displayed layers — answers, interests, zodiac, numerology and voice — into a personal portrait',
        coreLabel: 'AI synthesis',
        coreStatus: 'Connecting your chosen facets',
        coreValue: 'Your portrait',
        layers: ['Answers', 'Interests', 'Zodiac', 'Numerology', 'Voice'],
      },
    },
    layers: {
      baseLabel: 'Foundation',
      description:
        'Psychological self-reflection and AI synthesis form the foundation. Every other layer is voluntary and clearly identified.',
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
          description: 'A symbolic layer for reflection, never presented as an established fact.',
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
          label: 'Voluntary layer',
          title: 'Astrological interpretations',
        },
      ],
      optionalLabel: 'Optional',
      title: 'Choose which facets to add',
    },
    process: {
      description:
        'No technical jargon or hidden conclusions: each source becomes its own meaning layer, while AI helps surface connections and differences.',
      eyebrow: 'How AI works',
      items: [
        {
          description: 'Short answers and interests add context without a long questionnaire.',
          title: 'You tell us about yourself',
        },
        {
          description: 'Voice and interpretive layers are included only when you choose them.',
          title: 'You choose extra layers',
        },
        {
          description:
            'The system compares observations, highlights overlaps and keeps differences visible.',
          title: 'AI finds connections and contrasts',
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
        'Numerological interpretation',
        'Astrological interpretation',
        'Personal suggestion',
      ],
      resultLabel: 'Portrait',
      synthesisLabel: 'AI synthesis',
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
      description: 'Only what helps you begin calmly, with no surprises.',
      eyebrow: 'Before you start',
      items: [
        {
          description: 'The usual journey to the first part of your result.',
          label: 'Time',
          title: '3–5 minutes',
        },
        {
          description: 'Ready-made choices and your birth date; no long writing required.',
          label: 'What you need',
          title: 'Answers and a little context',
        },
        {
          badge: 'In your control',
          description: 'Date and interpretive layers are added only when you choose them.',
          label: 'Privacy',
          title: 'Optional stays optional',
        },
      ],
      title: 'Everything important, before the first question',
    },
    final: {
      description: 'The first screen shows one short question with ready-made choices.',
      title: 'Ready to see how your facets connect?',
    },
    hero: {
      description:
        'Short questions create the foundation. Every extra layer remains your choice, and the first meaningful result opens for free.',
      eyebrow: 'YOUR PERSONAL JOURNEY',
      note: 'One clear step at a time. You can go back or skip anything optional.',
      primaryCta: 'Start',
      title: ['Here is how the', 'journey unfolds.'],
    },
    journey: {
      eyebrow: 'Four steps',
      items: [
        {
          description: 'A few simple questions with ready-made choices.',
          title: 'Your answers',
        },
        {
          description: 'Interests, birth date, numerology and zodiac — only when you choose them.',
          title: 'Optional layers',
        },
        {
          description: 'AI connects the sources into one portrait without definitive claims.',
          title: 'AI synthesis',
        },
        {
          description: 'See meaningful observations before deciding whether to explore further.',
          title: 'Your first result',
        },
      ],
      title: 'Self-discovery without the questionnaire feeling',
    },
    privacy: {
      description:
        'Every additional interpretive layer is optional and clearly separated from answer-based observations.',
      eyebrow: 'A clear word on data',
      title: 'You decide which layers to include',
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
