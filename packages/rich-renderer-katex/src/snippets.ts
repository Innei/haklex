export const CURSOR_TOKEN = '__cursor__'

export interface KaTeXSnippet {
  id: string
  title: string
  template: string
  previewEquation: string
  category: 'Basic' | 'Greek' | 'Operators' | 'Structures'
  keywords: string[]
}

export interface SnippetInsertionResult {
  value: string
  selectionStart: number
  selectionEnd: number
}

export const katexSnippets: KaTeXSnippet[] = [
  {
    id: 'frac',
    title: 'Fraction',
    template: `\\frac{1}{${CURSOR_TOKEN}}`,
    previewEquation: '\\frac{a}{b}',
    category: 'Basic',
    keywords: ['fraction', 'divide', 'ratio'],
  },
  {
    id: 'sqrt',
    title: 'Square Root',
    template: `\\sqrt{${CURSOR_TOKEN}}`,
    previewEquation: '\\sqrt{x}',
    category: 'Basic',
    keywords: ['root', 'radical'],
  },
  {
    id: 'alpha',
    title: 'Alpha',
    template: `\\alpha${CURSOR_TOKEN}`,
    previewEquation: '\\alpha',
    category: 'Greek',
    keywords: ['greek', 'letter'],
  },
  {
    id: 'theta',
    title: 'Theta',
    template: `\\theta${CURSOR_TOKEN}`,
    previewEquation: '\\theta',
    category: 'Greek',
    keywords: ['greek', 'angle', 'letter'],
  },
  {
    id: 'sum',
    title: 'Summation',
    template: `\\sum_{i=1}^{n} ${CURSOR_TOKEN}`,
    previewEquation: '\\sum_{i=1}^{n} x_i',
    category: 'Operators',
    keywords: ['series', 'sigma', 'total'],
  },
  {
    id: 'int',
    title: 'Integral',
    template: `\\int_{a}^{b} ${CURSOR_TOKEN} \\, dx`,
    previewEquation: '\\int_{a}^{b} f(x) \\, dx',
    category: 'Operators',
    keywords: ['integral', 'calculus'],
  },
  {
    id: 'matrix',
    title: 'Matrix',
    template: `\\begin{bmatrix}${CURSOR_TOKEN}\\end{bmatrix}`,
    previewEquation: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}',
    category: 'Structures',
    keywords: ['array', 'linear algebra'],
  },
  {
    id: 'cases',
    title: 'Cases',
    template: `\\begin{cases}${CURSOR_TOKEN}\\end{cases}`,
    previewEquation: '\\begin{cases} x & x > 0 \\\\ 0 & x = 0 \\end{cases}',
    category: 'Structures',
    keywords: ['piecewise', 'conditional'],
  },
]

export function filterKaTeXSnippets(query: string): KaTeXSnippet[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return katexSnippets
  }

  return katexSnippets.filter((snippet) => {
    const haystack = [
      snippet.id,
      snippet.title,
      snippet.category,
      snippet.previewEquation,
      ...snippet.keywords,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedQuery)
  })
}

export function insertSnippetAtSelection(
  value: string,
  template: string,
  selectionStart: number | null,
  selectionEnd: number | null,
): SnippetInsertionResult {
  const start = selectionStart ?? value.length
  const end = selectionEnd ?? start
  const cursorOffset = template.indexOf(CURSOR_TOKEN)
  const sanitizedTemplate = template.replace(CURSOR_TOKEN, '')

  const nextValue =
    value.slice(0, start) +
    sanitizedTemplate +
    value.slice(Math.max(start, end))

  const nextCursorPosition =
    start + (cursorOffset >= 0 ? cursorOffset : sanitizedTemplate.length)

  return {
    value: nextValue,
    selectionStart: nextCursorPosition,
    selectionEnd: nextCursorPosition,
  }
}
