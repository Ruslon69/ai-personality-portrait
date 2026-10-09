# Soul Arkana language guide

Scope: current RU / EN / UK product. This is an editorial reference, not a change to calculations, snapshots or the Sprint 17 runtime contracts.

## Voice

Calm, personal, clear and reflective. Use direct language, concrete situations and small actions. Leave room for the reader to disagree. In Russian and Ukrainian, address the reader as **вы / ви**, without title-case pronouns. English uses **you**. Keep first-person answer choices in first person.

- Tarot can be atmospheric; the symbolism invites reflection and does not guarantee events or reveal another person’s thoughts.
- Portrait grounds observations in the exact answers. One answer suggests a tentative observation, not a diagnosis. Keep symbolic birth-date material separate.
- Numerology presents symbolic themes, not measured psychological traits or predictions.
- Errors, settings and notices explain the outcome and the available next action. Avoid “local version”, “session fixed”, “save deletion”, internal IDs and implementation vocabulary outside necessary data/privacy detail.
- Prefer a short contextual action when it clarifies the destination. “Continue” is fine for repeated questionnaire steps where the next question is obvious.
- Avoid a reassuring claim stronger than the actual runtime contract. A failed save leaves the current reading available; it does not guarantee recovery after reload.
- Do not repeat a disclaimer in every sentence. Preserve essential disclaimers and uncertainty; make the remaining prose carry useful meaning.
- Preserve completed result language. Interface labels follow the current language. Never rewrite an immutable historical snapshot to match an editorial update.

## Terminology

The expanded canonical glossary is [localization-glossary.md](localization-glossary.md); architecture and expansion instructions are in [localization.md](localization.md).

| Concept                                  | RU                                        | EN                 | UK                                      |
| ---------------------------------------- | ----------------------------------------- | ------------------ | --------------------------------------- |
| Brand                                    | Soul Arkana                               | Soul Arkana        | Soul Arkana                             |
| Tarot                                    | Таро                                      | Tarot              | Таро                                    |
| Completed Tarot experience               | расклад                                   | reading            | розклад                                 |
| Arrangement of positions, when necessary | схема расклада                            | spread             | схема розкладу                          |
| Daily product                            | Карта дня                                 | Card of the day    | Карта дня                               |
| Card                                     | карта                                     | card               | карта                                   |
| Orientation                              | прямое положение / перевёрнутое положение | upright / reversed | пряме положення / перевернуте положення |
| Reading topic                            | тема расклада                             | reading topic      | тема розкладу                           |
| Question                                 | вопрос                                    | question           | запитання                               |
| Interpretation                           | разбор; значение карты in card context    | interpretation     | розбір; значення карти in card context  |
| Result                                   | результат                                 | result             | результат                               |
| Portrait product                         | Портрет                                   | Portrait           | Портрет                                 |
| Numerology discipline                    | Нумерология                               | Numerology         | Нумерологія                             |
| Numerology result description            | разбор по дате рождения                   | birth-date reading | розбір за датою народження              |
| Zodiac sign                              | знак зодиака                              | zodiac sign        | знак зодіаку                            |
| Personal space                           | Личное пространство                       | Personal space     | Особистий простір                       |
| Navigation to personal space             | Мои результаты                            | My results         | Мої результати                          |
| History                                  | История                                   | History            | Історія                                 |
| Saved Tarot artifact                     | сохранённый расклад                       | saved reading      | збережений розклад                      |
| Recommendation                           | рекомендация                              | recommendation     | рекомендація                            |
| Practical invitation                     | что попробовать                           | what to try        | що спробувати                           |
| Reflection                               | размышление                               | reflection         | роздуми                                 |
| Answer-based insight                     | наблюдение                                | observation        | спостереження                           |
| Interface language                       | язык интерфейса                           | interface language | мова інтерфейсу                         |

“Личный разбор / personal reflection / особистий розбір” can describe an experience in prose; use **Portrait** for the English product/navigation name. “Spread” describes an arrangement, not a second English name for every reading. Deck-theme names (Classic Arcana, Lunar, Celestial, Nocturne) are collection names and stay unchanged across languages.

## Sources and formatting

- Shared shell/entry content: `src/shared/i18n/locales/`.
- Feature dictionaries remain with their features; genuine shared runtime promises live in `product-contract-copy.ts`.
- Card-specific EN/UK meanings: `features/tarot/data/card-meaning-copy.ts`, based on the existing Russian interpretation profiles. A suit/rank summary must not replace the meaning of an individual card.
- Card-specific EN/UK practical actions: `features/tarot/data/card-action-copy.ts`, editorial equivalents of the existing Russian actions.
- Portrait evidence quotes the registered question and selected answer; do not paraphrase them into generic evidence.
- Recommendation situations: `features/personality-analysis/data/recommendation-context.ts`. They explain **when** to try the existing action and are not scoring rules.
- Language names, switcher labels and formatting tags: `src/shared/i18n/config/locale-definitions.ts`. `Locale` and `ProfileLocale` derive from this registration. Dates use `Intl.DateTimeFormat`; plural categories use `Intl.PluralRules` where needed.

## Adding a language later

Register the locale and its formatting metadata, then supply the existing typed dictionaries and authored content. Do not add locale-specific URLs or alter scoring. The current product has language-specific wording helpers for grammatical assembly; adding a language also requires its grammar/content equivalents and full rendered QA. Registration alone does not claim that a fourth language works. Existing saved-language identifiers and unsupported/legacy snapshot recovery need compatibility review before expanding launch languages.

## Editorial acceptance

Review full readings as well as labels. Check all answer paths, singular/zero counts, notices, accessible names, mobile wrapping, and an existing result after switching the interface language. Keep automated dictionary parity checks alongside browser QA; key presence alone is not language quality.

## Spanish

Use modern, neutral international Spanish and address the reader as **tú** throughout. Answer options remain in first person. Avoid regional slang, **vosotros**, switching to **usted**, literal Russian syntax and diagnostic certainty. Prefer **lectura** for the experience and **tirada** for the card arrangement. Keep existing legal omissions explicit; translation does not supply missing operator information. Native-speaker review remains a separate human acceptance step.
