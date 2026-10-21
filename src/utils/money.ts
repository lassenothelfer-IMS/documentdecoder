/** Formats an amount for display. Falls back to plain text when the currency isn't a valid ISO code. */
export function formatAmount(value: number, currency: string, locale?: string): string {
  const label = currency.trim();
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: label.toUpperCase() }).format(value);
  } catch {
    return `${label} ${value.toFixed(2)}`;
  }
}
