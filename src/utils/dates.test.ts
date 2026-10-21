import { nextDeadline, parseIsoDate } from './dates';

describe('parseIsoDate', () => {
  it('parses a valid date as a local calendar day', () => {
    const date = parseIsoDate('2026-11-05');
    expect(date).not.toBeNull();
    expect([date!.getFullYear(), date!.getMonth(), date!.getDate()]).toEqual([2026, 10, 5]);
  });

  it('tolerates surrounding whitespace', () => {
    expect(parseIsoDate(' 2026-11-05 ')).not.toBeNull();
  });

  it.each(['2026-02-30', '2026-13-01', '05.11.2026', 'unclear', '2026-11-5', ''])('rejects %p', (value) => {
    expect(parseIsoDate(value)).toBeNull();
  });
});

describe('nextDeadline', () => {
  const today = new Date(2026, 9, 21, 15, 30);

  it('returns the earliest deadline that has not passed', () => {
    const next = nextDeadline(
      [
        { date: '2026-12-01', what: 'later' },
        { date: '2026-11-05', what: 'sooner' },
        { date: '2026-09-30', what: 'passed' },
      ],
      today,
    );
    expect(next?.what).toBe('sooner');
  });

  it('counts a deadline due today as upcoming', () => {
    expect(nextDeadline([{ date: '2026-10-21', what: 'today' }], today)?.what).toBe('today');
  });

  it('ignores deadlines whose date cannot be parsed', () => {
    expect(nextDeadline([{ date: 'unclear', what: 'x' }], today)).toBeNull();
  });

  it('returns null when every deadline has passed', () => {
    expect(nextDeadline([{ date: '2026-10-20', what: 'yesterday' }], today)).toBeNull();
  });
});
