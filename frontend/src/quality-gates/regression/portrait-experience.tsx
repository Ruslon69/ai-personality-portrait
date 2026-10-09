import { renderToStaticMarkup } from 'react-dom/server';

import { createEmptyDraftPortrait } from '../../entities/personality-profile';
import { createPersonalityProfile } from '../../features/personality-analysis/lib';
import { ExplainCard, PortraitSummary, ResultReveal } from '../../features/personality-report';
import { getPortraitQuestions, QuestionOptionCard } from '../../features/questionnaire';
import { ResultPreview } from '../../features/result-preview';
import type { Locale } from '../../shared/i18n';
import type { QualityAssertions } from '../assertions';

const locales: readonly Locale[] = ['ru', 'en', 'uk', 'es'];
const noop = () => {};

export function checkPortraitExperience(assertions: QualityAssertions) {
  locales.forEach((locale) => {
    const questions = getPortraitQuestions(locale);
    const draft = createEmptyDraftPortrait();
    draft.answers = Object.fromEntries(
      questions.map((question) => [
        question.id,
        { optionIds: [question.options[0]?.id ?? ''], skipped: false },
      ]),
    );
    draft.birthDate = { status: 'skipped' };
    draft.voice = { status: 'skipped' };

    const profile = createPersonalityProfile(draft, '2026-09-20T12:00:00.000Z', locale);
    const before = JSON.stringify(profile);
    const preview = renderToStaticMarkup(
      <ResultPreview onOpenFullResult={noop} profile={profile} />,
    );
    const reveal = renderToStaticMarkup(
      <ResultReveal onOpen={noop} opened={false} profile={profile} />,
    );
    const summary = renderToStaticMarkup(<PortraitSummary profile={profile} />);
    const openedReveal = renderToStaticMarkup(
      <ResultReveal onOpen={noop} opened profile={profile} />,
    );
    const textMarkup = (text: string) => renderToStaticMarkup(<span>{text}</span>).slice(6, -7);
    assertions.assert(
      profile.strengths
        .slice(0, 3)
        .every(
          (item) =>
            preview.includes(`id="${item.id}-title"`) &&
            preview.includes(textMarkup(item.title)) &&
            preview.includes(textMarkup(item.description)),
        ) &&
        profile.recommendations
          .slice(0, 2)
          .every(
            (item) =>
              preview.includes(textMarkup(item.title)) &&
              preview.includes(textMarkup(item.description)),
          ),
      {
        code: `portrait-art-direction-preview-content-${locale}`,
        message:
          'The composed preview must retain every existing observation and practical action.',
      },
    );
    assertions.assert(
      !openedReveal.includes('<button') &&
        (openedReveal.match(/<h1\b/g) ?? []).length === 1 &&
        summary.includes('id="summary-title" tabindex="-1"'),
      {
        code: `portrait-art-direction-opened-focus-${locale}`,
        message:
          'The opened portrait keeps its H1 and a focus target, without an inert open action.',
      },
    );
    const insight = profile.strengths[0];
    const collapsed = insight
      ? renderToStaticMarkup(
          <ExplainCard
            expanded={false}
            insight={insight}
            locale={locale}
            onToggle={noop}
            order={0}
          />,
        )
      : '';
    const expanded = insight
      ? renderToStaticMarkup(
          <ExplainCard expanded insight={insight} locale={locale} onToggle={noop} order={0} />,
        )
      : '';
    const option = questions[0]?.options[0];
    const optionHtml = option
      ? renderToStaticMarkup(
          <QuestionOptionCard
            checked
            name={questions[0]?.id ?? 'portrait-question'}
            onChange={noop}
            option={option}
            presentation={questions[0]?.presentation ?? 'list'}
            type={questions[0]?.type ?? 'single'}
          />,
        )
      : '';

    assertions.assert(
      questions.length === 16 &&
        profile.strengths.length > 0 &&
        preview.includes(profile.revealHeadline) &&
        preview.includes(profile.revealLead) &&
        reveal.includes(profile.revealHeadline) &&
        summary.includes(profile.revealHeadline) &&
        summary.includes(profile.revealLead) &&
        JSON.stringify(profile) === before,
      {
        code: `portrait-experience-content-${locale}`,
        message:
          'Portrait must preserve all questions and generated meaning while presenting the synthesis before deeper evidence.',
      },
    );
    assertions.assert(
      (preview.match(/<h1\b/g) ?? []).length === 1 &&
        (reveal.match(/<h1\b/g) ?? []).length === 1 &&
        optionHtml.includes('checked=""') &&
        optionHtml.includes(`value="${option?.id ?? ''}"`) &&
        collapsed.includes('aria-expanded="false"') &&
        collapsed.includes('aria-hidden="true"') &&
        collapsed.includes('inert=""') &&
        expanded.includes('aria-expanded="true"') &&
        expanded.includes('aria-hidden="false"') &&
        !expanded.includes('inert=""') &&
        expanded.includes('data-insight-meta="true"'),
      {
        code: `portrait-experience-hierarchy-${locale}`,
        message:
          'Portrait entry controls must retain native selection semantics, while technical evidence remains progressively disclosed.',
      },
    );
  });
}
