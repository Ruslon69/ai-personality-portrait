export function interpolate(template: string, params: Readonly<Record<string, string | number>>) {
  return template.replace(/\{([a-zA-Z0-9]+)\}/g, (match, key: string) =>
    Object.hasOwn(params, key) ? String(params[key]) : match,
  );
}

export function countWords(value: string) {
  return value.trim().split(/\s+/u).filter(Boolean).length;
}

export function firstWord(value: string) {
  return (
    value
      .trim()
      .toLocaleLowerCase()
      .split(/\s+/u)[0]
      ?.replace(/[.,:;!?—]/gu, '') ?? ''
  );
}
