import { describe, expect, it } from 'vitest'

import { FORMAT_TAG_TO_BIT,wrapWithFormatTags } from '../src/text-format'

describe('wrapWithFormatTags', () => {
  it('returns plain text for format 0', () => {
    expect(wrapWithFormatTags('hello', 0)).toEqual(['hello'])
  })

  it('wraps bold (format=1)', () => {
    const result = wrapWithFormatTags('bold', 1)
    expect(result).toEqual([{ tag: 'b', children: ['bold'] }])
  })

  it('wraps bold+italic (format=3)', () => {
    const result = wrapWithFormatTags('text', 3)
    // outermost bold, innermost italic
    expect(result).toEqual([{ tag: 'b', children: [{ tag: 'i', children: ['text'] }] }])
  })

  it('wraps all format bits', () => {
    // bold(1) + italic(2) + code(16) = 19
    const result = wrapWithFormatTags('code', 19)
    expect(result).toEqual([
      { tag: 'b', children: [{ tag: 'i', children: [{ tag: 'code', children: ['code'] }] }] },
    ])
  })
})

describe('FORMAT_TAG_TO_BIT', () => {
  it('maps tag names to bit values', () => {
    expect(FORMAT_TAG_TO_BIT.b).toBe(1)
    expect(FORMAT_TAG_TO_BIT.strong).toBe(1)
    expect(FORMAT_TAG_TO_BIT.i).toBe(2)
    expect(FORMAT_TAG_TO_BIT.em).toBe(2)
    expect(FORMAT_TAG_TO_BIT.s).toBe(4)
    expect(FORMAT_TAG_TO_BIT.u).toBe(8)
    expect(FORMAT_TAG_TO_BIT.code).toBe(16)
    expect(FORMAT_TAG_TO_BIT.sub).toBe(32)
    expect(FORMAT_TAG_TO_BIT.sup).toBe(64)
    expect(FORMAT_TAG_TO_BIT.mark).toBe(128)
  })
})
