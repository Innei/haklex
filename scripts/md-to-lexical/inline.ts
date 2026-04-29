import {
  footnoteRef,
  FORMAT_BOLD,
  FORMAT_CODE,
  FORMAT_HIGHLIGHT,
  FORMAT_ITALIC,
  FORMAT_STRIKETHROUGH,
  FORMAT_SUBSCRIPT,
  FORMAT_SUPERSCRIPT,
  FORMAT_UNDERLINE,
  katexInline,
  type LNode,
  mention,
  ruby,
  spoiler,
  tag,
  text,
} from './types.js'

interface InlineToken {
  format?: number
  node?: LNode
  type: 'text' | 'node'
  value?: string
}

// Process a plain text string for custom inline syntax not handled by remark
export function processCustomInline(input: string): LNode[] {
  const tokens = tokenize(input)
  return tokens
    .map((t) => {
      if (t.type === 'node') return t.node!
      return text(t.value!, t.format ?? 0)
    })
    .filter((n) => {
      if (n.type === 'text' && (n.text as string) === '') return false
      return true
    })
}

function tokenize(input: string): InlineToken[] {
  const tokens: InlineToken[] = []
  let pos = 0

  while (pos < input.length) {
    let matched = false

    // Spoiler: ||text||
    const spoilerMatch = input.slice(pos).match(/^\|\|(.+?)\|\|/)
    if (spoilerMatch) {
      tokens.push({ type: 'node', node: spoiler(text(spoilerMatch[1])) })
      pos += spoilerMatch[0].length
      matched = true
    }

    // Mention: [displayName]{PREFIX@handle} or {PREFIX@handle}
    if (!matched) {
      const mentionMatch = input.slice(pos).match(/^(?:\[([^\]]+)\])?\{(GH|TW|TG)@(\w[\w.-]*)\}/)
      if (mentionMatch) {
        tokens.push({ type: 'node', node: mention(mentionMatch[2], mentionMatch[3], mentionMatch[1] || undefined) })
        pos += mentionMatch[0].length
        matched = true
      }
    }

    // KaTeX inline: $equation$ (not $$)
    if (!matched) {
      const katexMatch = input.slice(pos).match(/^\$([^\n$]+)\$(?!\$)/)
      if (katexMatch) {
        tokens.push({ type: 'node', node: katexInline(katexMatch[1]) })
        pos += katexMatch[0].length
        matched = true
      }
    }

    // Ruby: <ruby>base<rt>reading</rt></ruby>
    if (!matched) {
      const rubyMatch = input.slice(pos).match(/^<ruby>([^<]*)<rt>([^<]*)<\/rt>(?:<rp>[^<]*<\/rp>)*<\/ruby>/i)
      if (rubyMatch) {
        tokens.push({ type: 'node', node: ruby(rubyMatch[1], rubyMatch[2]) })
        pos += rubyMatch[0].length
        matched = true
      }
    }

    // Tag: <tag>text</tag>
    if (!matched) {
      const tagMatch = input.slice(pos).match(/^<tag>([^<]+)<\/tag>/i)
      if (tagMatch) {
        tokens.push({ type: 'node', node: tag(tagMatch[1]) })
        pos += tagMatch[0].length
        matched = true
      }
    }

    // Footnote reference: [^id]
    if (!matched) {
      const fnMatch = input.slice(pos).match(/^\[\^(\w+)\]/)
      if (fnMatch) {
        tokens.push({ type: 'node', node: footnoteRef(fnMatch[1]) })
        pos += fnMatch[0].length
        matched = true
      }
    }

    // Insert/underline: ++text++
    if (!matched) {
      const insMatch = input.slice(pos).match(/^\+\+(.+?)\+\+/)
      if (insMatch) {
        tokens.push({ type: 'text', value: insMatch[1], format: FORMAT_UNDERLINE })
        pos += insMatch[0].length
        matched = true
      }
    }

    // Highlight: ==text==
    if (!matched) {
      const hlMatch = input.slice(pos).match(/^==(.+?)==/)
      if (hlMatch) {
        tokens.push({ type: 'text', value: hlMatch[1], format: FORMAT_HIGHLIGHT })
        pos += hlMatch[0].length
        matched = true
      }
    }

    // Superscript: ^text^ (single caret, not ^^)
    if (!matched) {
      const supMatch = input.slice(pos).match(/^\^([^^]+)\^/)
      if (supMatch) {
        tokens.push({ type: 'text', value: supMatch[1], format: FORMAT_SUPERSCRIPT })
        pos += supMatch[0].length
        matched = true
      }
    }

    // Subscript: ~text~ (single tilde, not ~~)
    if (!matched) {
      const subMatch = input.slice(pos).match(/^~([^~]+)~(?!~)/)
      if (subMatch) {
        tokens.push({ type: 'text', value: subMatch[1], format: FORMAT_SUBSCRIPT })
        pos += subMatch[0].length
        matched = true
      }
    }

    // Plain text: consume one character
    if (!matched) {
      const last = tokens.at(-1)
      if (last && last.type === 'text' && (last.format ?? 0) === 0) {
        last.value += input[pos]
      } else {
        tokens.push({ type: 'text', value: input[pos], format: 0 })
      }
      pos++
    }
  }

  return tokens
}

// Apply remark-detected format flags to text nodes
export function applyFormat(nodes: LNode[], format: number): LNode[] {
  return nodes.map((n) => {
    if (n.type === 'text') {
      return { ...n, format: ((n.format as number) || 0) | format }
    }
    return n
  })
}

// Map of remark format names to Lexical format flags
export const FORMAT_MAP: Record<string, number> = {
  bold: FORMAT_BOLD,
  italic: FORMAT_ITALIC,
  strikethrough: FORMAT_STRIKETHROUGH,
  underline: FORMAT_UNDERLINE,
  code: FORMAT_CODE,
  subscript: FORMAT_SUBSCRIPT,
  superscript: FORMAT_SUPERSCRIPT,
  highlight: FORMAT_HIGHLIGHT,
}
