import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatTimeAgo } from '../../utils/time';

describe('formatTimeAgo', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Just now" for recent dates', () => {
    const now = new Date().toISOString();
    expect(formatTimeAgo(now)).toBe('Just now');
  });

  it('returns minutes ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:30:00Z'));
    expect(formatTimeAgo('2024-01-01T12:15:00Z')).toBe('15m ago');
    vi.useRealTimers();
  });

  it('returns hours ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T15:00:00Z'));
    expect(formatTimeAgo('2024-01-01T12:00:00Z')).toBe('3h ago');
    vi.useRealTimers();
  });

  it('returns days ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-10T12:00:00Z'));
    expect(formatTimeAgo('2024-01-05T12:00:00Z')).toBe('5d ago');
    vi.useRealTimers();
  });

  it('returns formatted date for old dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-01T12:00:00Z'));
    const result = formatTimeAgo('2024-01-01T12:00:00Z');
    // Should return a locale date string, not "Xd ago"
    expect(result).not.toContain('d ago');
    vi.useRealTimers();
  });
});
