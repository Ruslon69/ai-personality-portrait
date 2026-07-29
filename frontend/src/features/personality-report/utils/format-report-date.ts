const reportDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatReportDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Дата не указана';
  }

  return reportDateFormatter.format(date);
}
