import { formatAmount } from './money';

describe('formatAmount', () => {
  it('formats a Swiss franc amount', () => {
    const formatted = formatAmount(1000, 'CHF', 'de-CH');
    expect(formatted).toContain('CHF');
    expect(formatted).toMatch(/1.000\.00/);
  });

  it('accepts a lowercase ISO code', () => {
    expect(formatAmount(40, 'chf', 'de-CH')).toContain('CHF');
  });

  it('falls back to plain text for a currency that is not an ISO code', () => {
    expect(formatAmount(40, 'Fr.', 'de-CH')).toBe('Fr. 40.00');
  });
});
