const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses a strict YYYY-MM-DD string as a local calendar date. Returns null for anything else. */
export function parseIsoDate(value: string): Date | null {
  const match = ISO_DATE.exec(value.trim());
  if (!match) {
    return null;
  }
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  // Rejects rollovers such as 2026-02-30 becoming March 2.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export type Deadline = { date: string; what: string };

/** The earliest deadline on or after `today`, ignoring dates that can't be parsed. */
export function nextDeadline<T extends Deadline>(
  deadlines: readonly T[],
  today: Date,
): (T & { parsedDate: Date }) | null {
  const todayStart = startOfDay(today).getTime();
  let next: (T & { parsedDate: Date }) | null = null;
  for (const deadline of deadlines) {
    const parsedDate = parseIsoDate(deadline.date);
    if (!parsedDate || parsedDate.getTime() < todayStart) {
      continue;
    }
    if (!next || parsedDate.getTime() < next.parsedDate.getTime()) {
      next = { ...deadline, parsedDate };
    }
  }
  return next;
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(date);
}

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
