import { supportedLocales, type Locale } from '@shared/i18n';
import { zodiacNames } from '@shared/i18n/zodiac-names';

export const westernSigns = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;
export const chineseSigns = [
  'rat',
  'ox',
  'tiger',
  'rabbit',
  'dragon',
  'snake',
  'horse',
  'goat',
  'monkey',
  'rooster',
  'dog',
  'pig',
] as const;
export type WesternSign = (typeof westernSigns)[number];
export type ChineseSign = (typeof chineseSigns)[number];
export type ZodiacSystem = 'western' | 'chinese';
export type ZodiacArtwork = {
  id: string;
  system: ZodiacSystem;
  sign: WesternSign | ChineseSign;
  sourceNumber: number;
  sourcePath: string;
  width: number;
  height: number;
  objectPosition: string;
  crop: 'none';
  reviewStatus: 'verified' | 'identity-mismatch';
  descriptions: Readonly<Record<Locale, string>>;
  variants: readonly { src: string; width: number; height: number }[];
};

// The order is the owner's fixed numeric mapping, never inferred from source names.
const westernDescriptions: Record<Locale, readonly string[]> = {
  ru: [
    'Баран с закрученными рогами перед золотой небесной сферой.',
    'Бык с длинными рогами на скале под светящимся небесным символом.',
    'Две фигуры, обращённые в разные стороны, на фоне золотого сияния.',
    'Краб с поднятыми клешнями в лунном небесном пейзаже.',
    'Лев с золотой гривой перед сияющей небесной сферой.',
    'Женская фигура с колосьями среди золотого света и созвездий.',
    'Женская фигура с весами, раскрытыми по обе стороны.',
    'Женская фигура и скорпион с поднятым хвостом в золотом сиянии.',
    'Лучник с натянутым луком; стрела направлена к краю небесной сферы.',
    'Женская фигура рядом с козлом с закрученными рогами.',
    'Женская фигура льёт воду из сосуда под созвездиями.',
    'Женская фигура между двумя синими рыбами в золотом небесном свете.',
  ],
  es: [
    'Un carnero con cuernos curvos ante una esfera celeste dorada.',
    'Un toro de cuernos largos sobre una roca bajo un símbolo celeste luminoso.',
    'Dos figuras orientadas en direcciones distintas ante una luz dorada.',
    'Un cangrejo con las pinzas alzadas en un paisaje celeste iluminado por la luna.',
    'Un león de melena dorada ante una esfera celeste luminosa.',
    'Una mujer sostiene espigas entre luz dorada y constelaciones.',
    'Una mujer sostiene una balanza con los brazos extendidos.',
    'Una mujer y un escorpión con la cola alzada entre luz dorada.',
    'Un arquero tensa el arco y apunta hacia el borde de la esfera celeste.',
    'Una mujer junto a una cabra de cuernos curvos.',
    'Una mujer vierte agua de una vasija bajo constelaciones.',
    'Una mujer entre dos peces azules en una luz celeste dorada.',
  ],
  en: [
    'A ram with curled horns before a golden celestial sphere.',
    'A long-horned bull on a rock beneath a glowing celestial symbol.',
    'Two figures facing different directions against golden light.',
    'A crab with raised claws in a moonlit celestial landscape.',
    'A lion with a golden mane before a glowing celestial sphere.',
    'A woman holding ears of grain among golden light and constellations.',
    'A woman holding scales extended on either side.',
    'A woman and a scorpion with a raised tail in golden light.',
    'An archer draws a bow, the arrow pointing towards the celestial sphere’s edge.',
    'A woman beside a goat with curled horns.',
    'A woman pours water from a vessel beneath constellations.',
    'A woman between two blue fish in golden celestial light.',
  ],
  uk: [
    'Баран із закрученими рогами перед золотою небесною сферою.',
    'Бик із довгими рогами на скелі під сяйливим небесним символом.',
    'Дві постаті, повернуті в різні боки, на тлі золотого сяйва.',
    'Краб із піднятими клешнями в місячному небесному пейзажі.',
    'Лев із золотою гривою перед сяйливою небесною сферою.',
    'Жіноча постать із колоссям серед золотого світла й сузір’їв.',
    'Жіноча постать із терезами, розкритими з обох боків.',
    'Жіноча постать і скорпіон із піднятим хвостом у золотому сяйві.',
    'Лучник із натягнутим луком; стріла спрямована до краю небесної сфери.',
    'Жіноча постать поряд із козлом із закрученими рогами.',
    'Жіноча постать ллє воду з посудини під сузір’ями.',
    'Жіноча постать між двома синіми рибами в золотому небесному світлі.',
  ],
};
const chineseSubjects: Record<Locale, readonly string[]> = {
  ru: [
    'Крыса',
    'Бык',
    'Тигр',
    'Кролик',
    'Дракон',
    'Змея',
    'Лошадь',
    'Коза',
    'Обезьяна',
    'Петух',
    'Собака',
    'Свинья',
  ],
  es: [
    'Una rata',
    'Un buey',
    'Un tigre',
    'Un conejo',
    'Un dragón',
    'Una serpiente',
    'Un caballo',
    'Una cabra',
    'Un mono',
    'Un gallo',
    'Un perro',
    'Un cerdo',
  ],
  en: [
    'A rat',
    'An ox',
    'A tiger',
    'A rabbit',
    'A dragon',
    'A snake',
    'A horse',
    'A goat',
    'A monkey',
    'A rooster',
    'A dog',
    'A pig',
  ],
  uk: [
    'Щур',
    'Бик',
    'Тигр',
    'Кролик',
    'Дракон',
    'Змія',
    'Кінь',
    'Коза',
    'Мавпа',
    'Півень',
    'Собака',
    'Свиня',
  ],
};
const chineseDescription: Record<Locale, (subject: string) => string> = {
  es: (subject) => `${subject} en rojo y dorado ante una esfera celeste y ramas en flor.`,
  en: (subject) => `${subject} in red and gold before a celestial sphere and flowering branches.`,
  uk: (subject) => `${subject} у червоно-золотому небесному пейзажі з квітучими гілками.`,
  ru: (subject) => `${subject} в красно-золотом небесном пейзаже с цветущими ветвями.`,
};

function artwork(
  system: ZodiacSystem,
  sign: WesternSign | ChineseSign,
  index: number,
): ZodiacArtwork {
  const number =
    system === 'chinese' && sign === 'pig' ? 25 : index + (system === 'western' ? 1 : 13);
  const sourceNames = ['01-Aries.png', '02-Taurus.png', '03-Gemini.png', '04-Cancer.png'];
  const descriptions = Object.fromEntries(
    supportedLocales.map((locale) => [
      locale,
      system === 'western'
        ? westernDescriptions[locale][index]
        : chineseDescription[locale](chineseSubjects[locale][index] ?? ''),
    ]),
  ) as Record<Locale, string>;
  return {
    id: `${system}-${sign}`,
    system,
    sign,
    sourceNumber: number,
    sourcePath: `zodiak/${sourceNames[number - 1] ?? `${number}.png`}`,
    width: 1254,
    height: 1254,
    objectPosition: '50% 50%',
    crop: 'none',
    reviewStatus: 'verified',
    descriptions,
    variants: [480, 800, 1254].map((width) => ({
      src: `/zodiac/${system}/${sign}-${width}.webp`,
      width,
      height: width,
    })),
  };
}
export const zodiacArtwork = {
  western: Object.fromEntries(
    westernSigns.map((sign, index) => [sign, artwork('western', sign, index)]),
  ) as Record<WesternSign, ZodiacArtwork>,
  chinese: Object.fromEntries(
    chineseSigns.map((sign, index) => [sign, artwork('chinese', sign, index)]),
  ) as Record<ChineseSign, ZodiacArtwork>,
};
export function getZodiacArtwork(system: 'western', sign: WesternSign): ZodiacArtwork;
export function getZodiacArtwork(system: 'chinese', sign: ChineseSign): ZodiacArtwork;
export function getZodiacArtwork(
  system: ZodiacSystem,
  sign: WesternSign | ChineseSign,
): ZodiacArtwork {
  return system === 'western'
    ? zodiacArtwork.western[sign as WesternSign]
    : zodiacArtwork.chinese[sign as ChineseSign];
}
export function isWesternSign(sign: string): sign is WesternSign {
  return westernSigns.some((candidate) => candidate === sign);
}
// Immutable Portrait snapshots contain the localized sign in the insight title,
// not a sign ID. Resolve that existing title without recalculating a birth date.
export function findPortraitZodiacArtwork(
  title: string,
  locale: Locale,
): ZodiacArtwork | undefined {
  const index = westernSigns.findIndex((sign) => title.startsWith(`${zodiacNames[locale][sign]}:`));
  const sign = westernSigns[index];
  return sign ? zodiacArtwork.western[sign] : undefined;
}
