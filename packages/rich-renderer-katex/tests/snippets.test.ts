import { describe, expect, it } from 'vitest'

import {
  CURSOR_TOKEN,
  filterKaTeXSnippets,
  insertSnippetAtSelection,
} from '../src/snippets'

describe('insertSnippetAtSelection', () => {
  it('inserts snippet at current cursor position and moves cursor to placeholder', () => {
    const result = insertSnippetAtSelection(
      'E = mc^2',
      ` + \\frac{1}{${CURSOR_TOKEN}}`,
      8,
      8,
    )

    expect(result.value).toBe('E = mc^2 + \\frac{1}{}')
    expect(result.selectionStart).toBe(20)
    expect(result.selectionEnd).toBe(20)
  })

  it('replaces current selection before moving cursor to placeholder', () => {
    const result = insertSnippetAtSelection(
      'x + y',
      `\\sqrt{${CURSOR_TOKEN}}`,
      0,
      5,
    )

    expect(result.value).toBe('\\sqrt{}')
    expect(result.selectionStart).toBe(6)
    expect(result.selectionEnd).toBe(6)
  })

  it('falls back to appending when selection is unavailable', () => {
    const result = insertSnippetAtSelection('a+b', '\\theta', null, null)

    expect(result.value).toBe('a+b\\theta')
    expect(result.selectionStart).toBe(9)
    expect(result.selectionEnd).toBe(9)
  })
})

describe('filterKaTeXSnippets', () => {
  it('matches snippets by name, keyword, and category', () => {
    const byName = filterKaTeXSnippets('frac')
    const byKeyword = filterKaTeXSnippets('root')
    const byCategory = filterKaTeXSnippets('greek')

    expect(byName.some((snippet) => snippet.id === 'frac')).toBe(true)
    expect(byKeyword.some((snippet) => snippet.id === 'sqrt')).toBe(true)
    expect(byCategory.every((snippet) => snippet.category === 'Greek')).toBe(
      true,
    )
  })
})
