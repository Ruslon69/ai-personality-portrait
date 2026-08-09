type DateParts = { day: number; month: number; year: number };

export function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInMonth(year: number, month: number) {
  return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 0;
}

export function parseIsoDate(value: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  return { day, month, year };
}

export function formatIsoDate(parts: DateParts) {
  return `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

export function compareIsoDates(left: string, right: string) {
  return left.localeCompare(right);
}

export function addYearsClamped(value: string, years: number) {
  const parts = parseIsoDate(value);
  if (!parts) throw new Error(`Invalid ISO date: ${value}.`);
  const year = parts.year + years;
  return formatIsoDate({
    ...parts,
    day: Math.min(parts.day, daysInMonth(year, parts.month)),
    year,
  });
}

export function addMonthsClamped(value: string, months: number) {
  const parts = parseIsoDate(value);
  if (!parts) throw new Error(`Invalid ISO date: ${value}.`);
  const absoluteMonth = parts.year * 12 + (parts.month - 1) + months;
  const year = Math.floor(absoluteMonth / 12);
  const month = (absoluteMonth % 12) + 1;
  return formatIsoDate({ day: Math.min(parts.day, daysInMonth(year, month)), month, year });
}

export function previousDay(value: string) {
  const parts = parseIsoDate(value);
  if (!parts) throw new Error(`Invalid ISO date: ${value}.`);
  if (parts.day > 1) return formatIsoDate({ ...parts, day: parts.day - 1 });
  const month = parts.month === 1 ? 12 : parts.month - 1;
  const year = parts.month === 1 ? parts.year - 1 : parts.year;
  return formatIsoDate({ day: daysInMonth(year, month), month, year });
}

export function calendarMonthsUntil(from: string, to: string) {
  const start = parseIsoDate(from);
  const end = parseIsoDate(to);
  if (!start || !end) throw new Error('Calendar month calculation requires valid ISO dates.');
  const raw = (end.year - start.year) * 12 + end.month - start.month;
  if (raw === 0) return 0;
  return raw > 0 ? raw - (end.day < start.day ? 1 : 0) : raw + (end.day > start.day ? 1 : 0);
}
