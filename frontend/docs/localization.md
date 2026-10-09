# Localization

Soul Arkana currently enables **ru, en, uk, es**. URLs are shared across languages. This document describes the current product, not a promise of additional launch languages, server storage or automatic translation.

## Registration and negotiation

`src/shared/i18n/config/locale-definitions.ts` is the registration source. Each entry supplies its native `label`, compact selector `shortLabel`, `htmlLang`, Intl `formatTag`, script, enabled flag and status. `Locale` derives from enabled entries; `ProfileLocale` aliases it. The selector, formatting, supported-locale guards and snapshot validation use this registration.

Initial language: saved browser preference → first supported browser language → Russian. Browser tags such as `en-US` normalize to the enabled `en` entry. Unsupported preferences do not enable a language. Existing results use exact content-language IDs; they do not undergo browser-tag negotiation. `isSupportedLocale` checks exact IDs, while `resolveLocale` supplies the last-resort Russian fallback for unsafe runtime input. The provider rejects an unsupported requested language.

The existing label is a native label; do not duplicate it in each translation. Do not add disabled candidates to the production selector. An entry marked `enabled: false` is excluded from `Locale` and the options. Registration alone is not sufficient to enable a language.

## Content sources

- Shell, navigation, accessibility and common system states: `src/shared/i18n/locales/`, typed by `I18nMessages`.
- Product promises: `src/shared/i18n/product-contract-copy.ts`.
- Home: `src/pages/home/home-copy.ts`.
- Portrait question and answer IDs/content: `src/features/questionnaire/data/portraitQuestions.ts`. IDs, ordering and scoring are language-independent.
- Portrait traits, grammatical interest forms, evidence, recommendations and result assembly: `src/features/personality-analysis/data/`. Birth-date content lives in `birth-date-interpretation-copy.ts`; its assembly functions receive calculated values without changing calculations.
- Birth-date, generation, preview and report UI: each feature's `data/` folder. Components select a content entry; they do not own separate copies of these strings.
- Tarot: `src/features/tarot/data/`, including card-specific EN/UK/ES editorial equivalents. The Russian authored interpretation profiles remain a separate source. Their public reading adapter is covered by the existing semantic gates. Locale-specific grammatical assembly is content work, not permission to change draw or reading rules.
- Numerology: `src/features/numerology/data/`, including meanings and calculation labels. Western sign names/tradition labels are shared in `src/shared/i18n/zodiac-names.ts`; sign-specific symbolic notes and element/modality copy remain in the Numerology feature. Chinese artwork descriptions exist, but its product remains disabled.
- History, Personal Space, Settings and privacy/terms: their existing feature/page dictionaries. Legal/operator omissions remain owner/legal input; translation must not invent those details.
- Runtime page/loading metadata: `src/router/route-copy.ts` and `route-metadata.ts`.

Some authored result assembly maps remain next to the corresponding adapter in `lib/` (for example Tarot synthesis and contextual Portrait contrasts). They are content sources with different grammatical needs, not separate locale registries. The source gate inventories their concrete locale maps as well as dictionaries in `data/`.

## Interface language and result language

**Interface language owns controls. Content language owns completed result meaning.**

A new result uses the current interface language. A completed in-memory Portrait, active Numerology result and saved Tarot snapshot keep their creation/content language when the interface changes. Navigation, disclosure controls, feedback, notices and dates used as archive UI follow the current interface language. Content regions carry their own `lang` attribute where the languages differ.

Never translate or mutate an immutable saved snapshot on reopen. Existing Tarot snapshots keep their original title, interpretation, evidence and content language. Invalid or unsupported stored metadata follows existing recovery behavior; it must not be relabeled as a translated result.

Numerology currently persists the input date, not an immutable full historical report. Reload creates a new calculation in the then-current interface language. A failed save leaves the current valid calculation available in memory and announces that it could not be saved for later. Portrait remains temporary in memory; refreshing can remove its result. Language switching must not be mistaken for either event. See [runtime contracts](product-runtime-contracts.md).

## Grammar, interpolation and formatting

Use `formatDate`, `formatNumber` and `pluralForm` from `@shared/i18n` for shared presentation. Feature-specific Intl calls may use the same registered `formatTag`. Calendar `YYYY-MM-DD` values are parsed as calendar dates; timestamps use the viewer's time zone. Do not persist localized formatted dates as canonical values.

Plural forms use `Intl.PluralRules`. Russian and Ukrainian need `one/few/many/other`; English and Spanish use `one/other`. Other languages may need different categories. Count agreement cannot be tested only at two; cover zero, one, two, five, eleven, twenty-one and twenty-two. Keep answer choices in first person. Inflected interest forms belong in `interestForms`, preserving user-entered custom interests verbatim.

`formatMessage` accepts string/number values, including zero. Missing values return its explicit fallback (or an empty safe string), never a raw token. Required dictionaries and interpolation names must pass validation before release; fallback is a final safety layer, not permission to ship incomplete translations. Use a meaningful supplied fallback for an important accessible name if its inputs can be absent.

## Validation

Run `npm run quality:localization` for the new readiness gate, existing product language polish, Sprint 17 runtime-contract checks and existing localized expert-content checks. The readiness gate checks:

- Approved enabled registry, strict IDs versus browser tags and unsupported-language fallback.
- Required dictionary key parity/orphans, empty strings, interpolation names and detectable script leakage.
- Concrete source locale-object coverage and comparable nested structures, with explicit Russian-base Tarot adapters recognized. Arrays and reference expressions need runtime/data tests rather than unreliable syntax comparison.
- Direct visible JSX prose and literal accessible names through the TypeScript AST. Brand text and aria-hidden marks are allowed. The unmounted legacy `portrait-history` feature is explicitly excluded and must be localized before reuse; it is not the current History product.
- All 78 cards, both orientations, active spread positions, all 16 question/answer identities, all 12 Western signs, localized artwork descriptions and calendar/number/count cases.

The Sprint 17 runtime-contract gate separately traces every answer into exact localized evidence and scoring, and verifies completed/saved language preservation. Full quality also checks engine determinism, immutable snapshots, storage reliability, content claims and architecture. Syntax checks cannot establish natural language quality or semantic equivalence: review complete generated results and actual renders too.

Canonical completion gates remain formatting, lint, build, fast/full quality, `../scripts/check.sh`, Premium Tarot validation/integrity/identity, Zodiac validation, dependency audit and diff check. Do not weaken them when introducing a locale.

## Adding NL, DE, PL or another language

1. Agree the native label, HTML language, formatting tag, script and fallback policy. Register a disabled candidate first; it must not become a visible option.
2. Supply shell and all feature/route/accessibility/legal-UI dictionaries, using the [glossary](localization-glossary.md) and [voice guide](product-language-guide.md). Complete dictionaries before enabling the locale on a development branch.
3. Supply authored card content (78 identities, upright/reversed, contextual and practical copy), Portrait questions/options/traits/evidence/contrasts/recommendations/grammatical forms, Numerology meanings/labels and 12 Western Zodiac notes/accessible descriptions. Do not translate degraded generated output.
4. Supply grammatical assembly equivalents in the existing content providers. Tarot currently has a dedicated Russian grammar adapter; other languages must use their own registered content rather than falling through an English default. Existing concrete locale maps and typed `Record<Locale, …>` are intentional completeness barriers. Positional card data must be extended in its content builder; it is not a new calculation.
5. Enable only in development while completing type checks/source and data gates. Extend the approved-language expectation deliberately at launch, never automatically. Check exact snapshot-language compatibility without altering existing schemas or rewriting old content.
6. Render full journeys, all twelve ordered switches across the four active languages plus every new pair, notices/dialogs, content after switching and reload. Check seven target viewports, 200% text, keyboard, reduced motion and forced colors. Obtain native editorial review.
7. Measure bundles and decide whether additional authored content warrants locale/content loading changes. Sprint 20 adds no localization dependency and no future-language bundles.
8. Enable publicly only after owner approval and all gates pass. Registration is architecture readiness, not completed NL/DE/PL content.

No new component-specific language selector or locale URL is required. Some content generators still need new authored grammar/data entries; those are explicit content work rather than automatic translation. Reusing currently unmounted legacy features requires a separate localization audit.

## HTML and later SEO work

The provider updates `<html lang>`. The router updates current document/social titles and existing description metadata in the selected UI language. It retains the existing private-result noindex policy. Static initial HTML has a default language; client updates do not provide multilingual prerendering to every crawler.

Production domain, localized URL strategy, canonical/hreflang, prerendering/indexing and final social metadata remain the later SEO/release sprint. Do not fabricate localized URLs or operator/legal details in localization work.

## Spanish production content (Sprint 20.1)

`es` is registered as **Español / ES**, HTML language `es`, Intl tag `es`, Latin script. Regional browser tags such as `es-MX` and `es-ES` negotiate to `es`; completed snapshot IDs remain exactly `es`. Spanish uses neutral international **tú**. It is complete authored content, not an English runtime overlay. Card meanings, actions and name/keyword metadata are in `features/tarot/data/card-copy-es.ts`; Spanish trait templates and expert assembly content have their own typed content files. Existing data contracts, routes, engines and numeric values are unchanged.

All production gates require four languages. The source gate understands explicit Russian-base providers containing every non-Russian locale, and shorthand dictionary entries; neither exemption permits missing Spanish content. Spanish prose is checked against direct English fallback copies, while proper names and shared single-word terminology are allowed. Runtime/data tests cover all card identities, question/answer evidence, signs and result-language ownership. New locales still need full authored content and native editorial review before approval.
