import { describe, expect, it } from 'vitest'
import { formatDuration, relativeTime } from './time'

const NOW = 1_000_000_000_000

describe('relativeTime', () => {
  it('returns an em dash for null', () => {
    expect(relativeTime(null, NOW)).toBe('—')
  })

  it('buckets into 방금 / 초 / 분 / 시간 / 일', () => {
    expect(relativeTime(NOW - 2_000, NOW)).toBe('방금')
    expect(relativeTime(NOW - 12_000, NOW)).toBe('12초 전')
    expect(relativeTime(NOW - 3 * 60_000, NOW)).toBe('3분 전')
    expect(relativeTime(NOW - 2 * 3_600_000, NOW)).toBe('2시간 전')
    expect(relativeTime(NOW - 25 * 3_600_000, NOW)).toBe('1일 전')
  })

  it('clamps future timestamps to 방금', () => {
    expect(relativeTime(NOW + 5_000, NOW)).toBe('방금')
  })
})

describe('formatDuration', () => {
  it('formats mm:ss with zero padding', () => {
    expect(formatDuration(0)).toBe('00:00')
    expect(formatDuration(65_000)).toBe('01:05')
    expect(formatDuration(25 * 60_000)).toBe('25:00')
  })

  it('clamps negative durations to 00:00', () => {
    expect(formatDuration(-5_000)).toBe('00:00')
  })
})
