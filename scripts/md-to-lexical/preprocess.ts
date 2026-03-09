export interface ContainerBlock {
  type: string
  params: string
  content: string
}

export interface PreprocessResult {
  processed: string
  containers: Map<string, ContainerBlock>
  htmlBlocks: Map<string, { tag: string; attrs: Record<string, string>; content: string }>
}

const CONTAINER_NAMES = /^(gallery|banner|carousel|warn|error|danger|info|success|warning|note|grid|masonry|details)$/

// Use HTML comments as placeholders — remark parses these as `html` nodes
let counter = 0
function uid(prefix: string): string {
  return `<!--PLACEHOLDER:${prefix}:${++counter}:${Date.now().toString(36)}-->`
}

// Regex to detect our placeholders in parsed HTML nodes
export const PLACEHOLDER_RE = /^<!--PLACEHOLDER:(container|html):(\d+):\w+-->$/

export function preprocess(markdown: string): PreprocessResult {
  counter = 0
  const containers = new Map<string, ContainerBlock>()
  const htmlBlocks = new Map<string, { tag: string; attrs: Record<string, string>; content: string }>()

  let result = markdown

  // Extract ::: container blocks
  result = extractContainers(result, containers)

  // Extract block-level HTML elements
  result = extractHtmlBlock(result, 'details', htmlBlocks)
  result = extractHtmlBlock(result, 'Tabs', htmlBlocks, true)
  result = extractHtmlBlock(result, 'excalidraw', htmlBlocks)
  result = extractHtmlBlock(result, 'nested-doc', htmlBlocks)

  return { processed: result, containers, htmlBlocks }
}

function extractContainers(md: string, map: Map<string, ContainerBlock>): string {
  const lines = md.split('\n')
  const result: string[] = []
  let i = 0

  while (i < lines.length) {
    const openMatch = lines[i].match(/^\s*::: *(\S+?) *(?:\{([^}]*)\})? *$/)
    if (openMatch && CONTAINER_NAMES.test(openMatch[1])) {
      const type = openMatch[1]
      const params = openMatch[2] || ''
      // Find matching close by counting depth
      let depth = 1
      let j = i + 1
      while (j < lines.length && depth > 0) {
        if (/^\s*::: *\S/.test(lines[j])) {
          depth++
        } else if (/^\s*::: *$/.test(lines[j])) {
          depth--
        }
        if (depth > 0) j++
      }
      if (depth === 0) {
        const content = lines.slice(i + 1, j).join('\n')
        const id = uid('container')
        map.set(id, { type, params, content })
        result.push(id)
        i = j + 1
        continue
      }
    }
    result.push(lines[i])
    i++
  }
  return result.join('\n')
}

function extractHtmlBlock(
  md: string,
  tagName: string,
  map: Map<string, { tag: string; attrs: Record<string, string>; content: string }>,
  caseSensitive = false,
): string {
  const flags = caseSensitive ? 'gm' : 'gim'
  const pattern = new RegExp(
    `<${tagName}((?:\\s+[a-zA-Z][\\w-]*(?:=(?:"[^"]*"|'[^']*'|[^\\s>]+))?)*)\\s*>([\\s\\S]*?)<\\/${tagName}>`,
    flags,
  )

  return md.replace(pattern, (_, attrsStr: string, content: string) => {
    const id = uid('html')
    const attrs = parseAttrs(attrsStr)
    map.set(id, { tag: tagName.toLowerCase(), attrs, content: content.trim() })
    // Surround with blank lines so remark doesn't merge adjacent HTML blocks
    return `\n\n${id}\n\n`
  })
}

function parseAttrs(str: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const regex = /([a-zA-Z][\w-]*)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g
  let m: RegExpExecArray | null
  while ((m = regex.exec(str)) !== null) {
    attrs[m[1]] = m[2] ?? m[3] ?? m[4] ?? ''
  }
  return attrs
}
