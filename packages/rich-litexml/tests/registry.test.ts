import { describe, expect, it } from 'vitest'

import { LitexmlRegistry } from '../src/registry'

describe('LitexmlRegistry', () => {
  it('registers and retrieves a writer', () => {
    const registry = new LitexmlRegistry()
    const writer = () => false as const
    registry.registerWriter('paragraph', writer)
    expect(registry.getWriter('paragraph')).toBe(writer)
  })

  it('registers and retrieves a reader', () => {
    const registry = new LitexmlRegistry()
    const reader = () => false as const
    registry.registerReader('p', reader)
    expect(registry.getReader('p')).toBe(reader)
  })

  it('returns undefined for unregistered types', () => {
    const registry = new LitexmlRegistry()
    expect(registry.getWriter('unknown')).toBeUndefined()
    expect(registry.getReader('unknown')).toBeUndefined()
  })

  it('reader lookup is case-insensitive', () => {
    const registry = new LitexmlRegistry()
    const reader = () => false as const
    registry.registerReader('P', reader)
    expect(registry.getReader('p')).toBe(reader)
    expect(registry.getReader('P')).toBe(reader)
  })
})
