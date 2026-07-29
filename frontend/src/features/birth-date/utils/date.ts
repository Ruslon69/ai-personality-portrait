type CalendarDate = {
  day: number;
  month: number;
  year: number;
};

const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseDateInput(value: string): CalendarDate | null {
  const match = datePattern.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { day, month, year };
}

export function toDateInputValue(date: Date) {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function isAfterDate(left: CalendarDate, right: CalendarDate) {
  if (left.year !== right.year) {
    return left.year > right.year;
  }

  if (left.month !== right.month) {
    return left.month > right.month;
  }

  return left.day > right.day;
}

export function getAgeOnDate(birthDate: CalendarDate, referenceDate: Date) {
  let age = referenceDate.getFullYear() - birthDate.year;
  const hasNotHadBirthday =
    referenceDate.getMonth() + 1 < birthDate.month ||
    (referenceDate.getMonth() + 1 === birthDate.month && referenceDate.getDate() < birthDate.day);

  if (hasNotHadBirthday) {
    age -= 1;
  }

  return age;
}

export function toCalendarDate(date: Date): CalendarDate {
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}
