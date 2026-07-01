import { describe, expect, it } from 'vitest'
import { needsAttention } from './status'

describe('needsAttention', () => {
  it('is true only for attention and blocked', () => {
    expect(needsAttention('attention')).toBe(true)
    expect(needsAttention('blocked')).toBe(true)
    expect(needsAttention('healthy')).toBe(false)
    expect(needsAttention('running')).toBe(false)
    expect(needsAttention('idle')).toBe(false)
    expect(needsAttention('unknown')).toBe(false)
  })
})
