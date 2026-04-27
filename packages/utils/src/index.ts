/**
 * Formats a date to a locale string.
 */
export function formatDate(date: Date, locale = "pt-BR"): string {
  return date.toLocaleDateString(locale);
}

/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Clamps a number between min and max values.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Returns true if the value is null or undefined.
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}
