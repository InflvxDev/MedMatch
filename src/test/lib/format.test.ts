import { describe, expect, it } from 'vitest';
import { formatCurrency, parseNumber } from '../../lib/format';

describe('formatCurrency', () => {
  it('formats a positive COP value', () => {
    const formatted = formatCurrency(1890000);
    expect(formatted).toMatch(/1[.,]890[.,]000/);
  });

  it('returns dash for null and NaN', () => {
    expect(formatCurrency(null)).toBe('—');
    expect(formatCurrency(Number.NaN)).toBe('—');
  });
});

describe('parseNumber', () => {
  it('returns null for empty/nullish input', () => {
    expect(parseNumber(null)).toBeNull();
    expect(parseNumber(undefined)).toBeNull();
    expect(parseNumber('')).toBeNull();
  });

  it('passes through finite numbers', () => {
    expect(parseNumber(1234)).toBe(1234);
    expect(parseNumber(2500)).toBe(2500);
  });

  it('parses COP strings with thousand separators', () => {
    expect(parseNumber('12.500')).toBe(12500);
    expect(parseNumber('12,500')).toBe(12500);
    expect(parseNumber('1.890')).toBe(1890);
    expect(parseNumber('$ 1.890.000')).toBe(1890000);
  });

  it('parses mixed separators with comma decimal', () => {
    expect(parseNumber('1.890.000,50')).toBe(1890000.5);
  });

  it('parses mixed separators with dot decimal', () => {
    expect(parseNumber('1,890,000.50')).toBe(1890000.5);
  });

  it('preserves decimal intent when separator is decimal', () => {
    expect(parseNumber('1.5')).toBe(1.5);
    expect(parseNumber('1.50')).toBe(1.5);
    expect(parseNumber('1,5')).toBe(1.5);
  });
});
