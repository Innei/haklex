import { describe, expect, it } from 'vitest'

import { createDefaultRegistry } from '../src/default-registry'
import { deserializeFromXml } from '../src/deserializer'
import { serializeToXml } from '../src/serializer'

const registry = createDefaultRegistry()

function roundtrip(xml: string) {
  const state = deserializeFromXml(`<doc>${xml}</doc>`, registry)
  const output = serializeToXml(state, registry)
  // Strip <doc> wrapper for comparison
  return output.replace(/^<doc>\n/, '').replace(/<\/doc>\n$/, '').trim()
}

describe('roundtrip', () => {
  it('paragraph with plain text', () => {
    expect(roundtrip('<p id="p1">hello world</p>')).toBe('<p id="p1">hello world</p>')
  })

  it('paragraph with formatted text', () => {
    expect(roundtrip('<p id="p1">normal <b>bold</b> <i>italic</i></p>'))
      .toBe('<p id="p1">normal <b>bold</b> <i>italic</i></p>')
  })

  it('heading', () => {
    expect(roundtrip('<h2 id="h1">Title</h2>')).toBe('<h2 id="h1">Title</h2>')
  })

  it('unordered list', () => {
    const input = '<ul id="u1">\n  <li id="l1">A</li>\n  <li id="l2">B</li>\n</ul>'
    const result = roundtrip(input)
    expect(result).toContain('<ul id="u1">')
    expect(result).toContain('<li id="l1">A</li>')
    expect(result).toContain('<li id="l2">B</li>')
  })

  it('code-block', () => {
    expect(roundtrip('<codeblock id="c1" lang="ts">const x = 1</codeblock>'))
      .toBe('<codeblock id="c1" lang="ts">const x = 1</codeblock>')
  })

  it('image', () => {
    expect(roundtrip('<img id="i1" src="/a.jpg" alt="Photo" />')).toContain('src="/a.jpg"')
  })

  it('link inside paragraph', () => {
    const result = roundtrip('<p id="p1">See <a href="https://x.com">link</a></p>')
    expect(result).toContain('<a href="https://x.com">link</a>')
  })

  it('new XML without ids (AI-generated content)', () => {
    // AI-generated XML won't have ids — should still roundtrip structurally
    const state = deserializeFromXml('<doc><p>new para</p><h2>new heading</h2></doc>', registry)
    const children = (state.root as any).children
    expect(children).toHaveLength(2)
    expect(children[0].type).toBe('paragraph')
    expect(children[1].type).toBe('heading')
    expect(children[1].tag).toBe('h2')
  })
})
