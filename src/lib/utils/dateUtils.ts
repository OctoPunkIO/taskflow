/**
 * Date utilities for consistent timezone handling
 */

/**
 * Parse a date string as UTC, regardless of local timezone
 */
export function parseAsUTC(dateString: string): Date {
  // Handle ISO strings
  if (dateString.includes('T')) {
    return new Date(dateString);
  }

  // Handle YYYY-MM-DD format - parse as UTC
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Format a date for display in user's local timezone
 */
export function formatLocalDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  });
}

/**
 * Format a date for API submission (always UTC)
 */
export function formatUTCDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get the user's timezone abbreviation
 */
export function getTimezoneAbbr(): string {
  const formatter = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' });
  const parts = formatter.formatToParts(new Date());
  const tzPart = parts.find(p => p.type === 'timeZoneName');
  return tzPart?.value || 'UTC';
}
