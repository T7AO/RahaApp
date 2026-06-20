export interface DayOption {
  label: string;
  short: string;
  full: string;
  iso: string;
}

export function buildNextDays(count: number, startDate = new Date(), locale = 'en-US'): DayOption[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      label:
        index === 0
          ? 'Today'
          : index === 1
            ? 'Tomorrow'
            : date.toLocaleDateString(locale, { weekday: 'short' }),
      short: date.toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
      full: date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }),
      iso: date.toISOString().split('T')[0],
    };
  });
}

export function formatTimeRangeLabel(date: string, time: string) {
  return `${date} at ${time}`;
}

export function joinMeta(parts: Array<string | number | null | undefined>) {
  return parts.filter(part => part !== null && part !== undefined && String(part).trim() !== '').join(' · ');
}
