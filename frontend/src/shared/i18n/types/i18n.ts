import type { PropsWithChildren } from 'react';

export type Locale = 'en' | 'ru' | 'uk';

export type LocalizedCard = {
  description: string;
  title: string;
};

export type LocalizedLabeledCard = LocalizedCard & {
  badge?: string;
  label: string;
};

export type LocalizedFeature = LocalizedCard & {
  eyebrow: string;
};

export type I18nMessages = {
  shell: {
    footer: string;
    header: {
      closeNavigation: string;
      language: string;
      menu: string;
      openNavigation: string;
      openSettings: string;
      settings: string;
      userMenuUnavailable: string;
      userPlaceholder: string;
    };
    navigation: {
      close: string;
      closeLabel: string;
      label: string;
      sectionsLabel: string;
    };
    skipToContent: string;
    theme: {
      action: string;
      current: string;
      modes: Record<'dark' | 'light' | 'system', string>;
      shortModes: Record<'dark' | 'light' | 'system', string>;
    };
  };
  navigation: {
    compatibility: string;
    home: string;
    myPath: string;
    numerology: string;
    portrait: string;
    profile: string;
    settings: string;
    tarot: string;
  };
  system: {
    compatibility: {
      description: string;
      title: string;
    };
    notFound: {
      description: string;
      title: string;
    };
  };
  home: {
    benefits: {
      description: string;
      eyebrow: string;
      items: readonly LocalizedFeature[];
      title: string;
    };
    emotion: {
      description: string;
      eyebrow: string;
      title: string;
    };
    final: {
      description: string;
      title: string;
    };
    hero: {
      description: string;
      eyebrow: string;
      primaryCta: string;
      secondaryCta: string;
      title: readonly [string, string];
      trustSignals: readonly [string, string, string, string];
      visual: {
        ariaLabel: string;
        coreLabel: string;
        coreStatus: string;
        coreValue: string;
        layers: readonly [string, string, string, string, string];
      };
    };
    layers: {
      baseLabel: string;
      description: string;
      eyebrow: string;
      items: readonly LocalizedLabeledCard[];
      optionalLabel: string;
      title: string;
    };
    process: {
      description: string;
      eyebrow: string;
      items: readonly LocalizedCard[];
      origins: readonly [string, string, string, string, string];
      resultLabel: string;
      synthesisLabel: string;
      title: string;
    };
    privacy: {
      description: string;
      eyebrow: string;
      statement: string;
      title: string;
    };
  };
  start: {
    essentials: {
      description: string;
      eyebrow: string;
      items: readonly LocalizedLabeledCard[];
      title: string;
    };
    final: {
      description: string;
      title: string;
    };
    hero: {
      description: string;
      eyebrow: string;
      note: string;
      primaryCta: string;
      title: readonly [string, string];
    };
    journey: {
      eyebrow: string;
      items: readonly LocalizedCard[];
      title: string;
    };
    privacy: {
      description: string;
      eyebrow: string;
      title: string;
    };
    result: {
      description: string;
      eyebrow: string;
      points: readonly [string, string, string];
      title: string;
    };
  };
};

export type I18nContextValue = {
  locale: Locale;
  messages: I18nMessages;
  setLocale: (locale: Locale) => void;
};

export type I18nProviderProps = PropsWithChildren;
