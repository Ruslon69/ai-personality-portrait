# Chinese Zodiac domain readiness — Sprint 19

**Runtime status: disabled.** The verified twelve-animal artwork registry and shared Zodiac chapter presentation are ready; they do not determine a birth sign. `chineseZodiacReadiness.enabled` remains false. No birth-year modulo lookup is exposed.

## Evidence

The existing domain module computes Western Zodiac by month/day. The repository contains no auditable Chinese New Year calendar, lunar conversion rules or supported calendar range. Artwork availability alone cannot resolve a Chinese birth sign. Dragon uses source 17.png; Pig uses 25.png; 24.png remains provenance only.

## Required before enabling

Choose and document one symbolic convention (Chinese New Year rather than an unexplained solar-term alternative). Add a local, attributed calendar dataset with an explicit supported date range, provenance and checksum. Validate date-only inputs without timezone shifts. Test each year's day before/on/after New Year, leap dates, all twelve identities, supported range endpoints and invalid/unsupported dates. Outside that range, show honest unavailability instead of guessing. Have a domain reviewer verify the data and convention.

Use the existing typed registry and `ZodiacChapter` for the complementary birth-date layer once the domain is approved. Keep Western and Chinese traditions separately labelled in RU/EN/UK; neither is a psychological or scientific diagnosis. No external runtime service, artwork replacement, schema change or feature flag activation is needed in this sprint.
