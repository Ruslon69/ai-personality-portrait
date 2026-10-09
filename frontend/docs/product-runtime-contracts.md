# Product runtime contracts — Sprint 17

These contracts resolve Sprint 16 findings F03–F07. They do not enable Product Storage V2 or change scoring, artwork, immutable historical snapshots or commercial access.

## Card of the Day

- The canonical destination is Personal Space's daily section (`/profile#card-of-the-day`). Home's Tarot direction, Tarot's day choice and legacy day setup/resume converge on that experience.
- A card belongs to the existing local journey identity and the device's local calendar date, not a reading seed, selected language or Tarot preference. Existing daily selections always win. Card and orientation remain the same throughout that date.
- At local midnight, or when returning to a foreground tab, resolve the current local date again. Do not use UTC date boundaries.
- The experience is free. Opening it records its existing daily open state, not a new ordinary reading or a duplicate archive item. Reopening does not reroll it.
- Previously completed day-spread snapshots remain readable and unchanged. An unfinished legacy day setup can open the canonical daily experience without clearing its saved session or deleting history.
- Daily storage contains identity/selection/date, not generated prose. Its live card description follows the interface language. This differs explicitly from completed generated readings below.

## Portrait lifetime

- Answers and generated Portraits remain in application memory. They survive ordinary in-app navigation but not a page reload or closing the page. No account/cloud recovery is promised.
- Explain this calmly before questions, including direct question entry, and reinforce the same outcome at the result/recovery boundaries. History must describe availability until reload rather than permanent saving.
- Feedback and mini-plans remain local temporary interactions. This sprint does not add persistence or change interpretations.

## Numerology

- A valid submission creates an in-memory result with its date, creation language and reference date before attempting to persist the date.
- Existing successful session-date persistence stays unchanged. Failed/blocked/quota writes cannot replace the current valid result with a blank form or an older date.
- Show one calm inline status in the current interface language when later reopening cannot be saved; a retry saves the same date and does not recalculate or change the result language.
- Reload loses memory. If date persistence succeeded, the tab can calculate a fresh current-period result using its stored date and current interface language. Numerology has no immutable saved-history snapshot today. If persistence failed, this result is not guaranteed after reload; an older successfully stored date remains intact.
- Storage schemas and V2 rollout are unchanged; no backend is introduced.

## Result and interface language

- All interface chrome, navigation, controls, error/status messages and accessible action names use the currently selected RU/EN/UK locale.
- Completed Tarot and Portrait content uses its original creation locale; switching interface language never regenerates or silently translates it. Mark generated content with its own `lang`.
- Active Numerology content similarly retains its creation locale/reference date until a deliberate new calculation or reload. A fresh calculation uses the current interface locale. Calculation controls/chrome remain in the active interface locale.
- History preserves snapshot titles, content and locale. Dates/actions use the active interface locale. Opening a snapshot passes the original record, not a translated/recomputed replacement.
- Language changes preserve in-progress input and selection, do not reset a flow, update document language and retain shared URLs. Persisted preference takes precedence over supported browser language; unsupported browsers retain the existing RU fallback.

## Saved-reading outcome

- A completed Tarot reading remains available in memory if its permanent write fails. Do not call it saved in result or archive presentation until a durable write succeeds.
- Retrying an unsaved reading persists the same immutable record, rather than regenerating or duplicating it. Existing schemas and snapshots are unchanged.

## Portrait answer evidence

- Question ID + option ID are the semantic source of truth. Evidence quotes the actual localized question and selected option from the same questionnaire catalogue the user answered.
- Do not infer translated evidence from generic question contexts or translated generated output. All valid paths have explicit RU/EN/UK question/answer text; no raw-ID fallback is accepted in regression validation.
- Keep rule traits, weights, answer IDs and interpretation calculations unchanged. Skipped/unknown options cannot fabricate evidence.

## Verification

Targeted regressions cover all question/option/locale paths, rule-score invariance, original-result language versus interface chrome, canonical daily routing/identity/local rollover, memory-only Portrait guidance, and normal/blocked/throwing/quota Numerology persistence including retry/reload. Browser checks cover all six directed language switches, representative flows, history, responsive wrapping and storage-failure feedback using isolated data.
