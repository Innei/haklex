import { toString } from 'mdast-util-to-string'
import type { Node as MdastNode } from 'unist'

import { applyFormat, FORMAT_MAP, processCustomInline } from './inline.js'
import { parseMarkdown } from './parse.js'
import type { ContainerBlock, PreprocessResult } from './preprocess.js'
import { PLACEHOLDER_RE, preprocess } from './preprocess.js'
import {
  alertQuote,
  banner,
  codeBlock,
  codeSnippet,
  details,
  doc,
  type EditorState,
  excalidraw,
  gallery,
  gridContainer,
  heading,
  horizontalRule,
  image,
  katexBlock,
  lineBreak,
  link,
  linkCard,
  listItem,
  listNode,
  type LNode,
  mermaid,
  nestedDoc,
  paragraph,
  quote,
  tableCell,
  tableNode,
  tableRow,
  text,
  video,
  wrapRoot,
} from './types.js'

const VIDEO_EXTS = /\.(?:mp4|webm|ogg|mov|m4v)(?:\?.*)?$/i
const ALERT_PATTERN = /^\[!(note|tip|important|warning|caution)\]\s*/i

export function markdownToLexical(mdast: MdastNode, pre: PreprocessResult): EditorState {
  const children = convertChildren((mdast as any).children ?? [], pre)
  // Collect footnote definitions into a single FootnoteSectionNode
  const fnDefs = collectFootnoteDefinitions(mdast)
  if (Object.keys(fnDefs).length > 0) {
    children.push({ type: 'footnote-section', definitions: fnDefs, version: 1 })
  }
  return doc(...children)
}

function convertChildren(nodes: MdastNode[], pre: PreprocessResult): LNode[] {
  const result: LNode[] = []
  for (const node of nodes) {
    const converted = convertNode(node, pre)
    if (converted) {
      if (Array.isArray(converted)) result.push(...converted)
      else result.push(converted)
    }
  }
  return result
}

function convertNode(node: MdastNode, pre: PreprocessResult): LNode | LNode[] | null {
  const n = node as any
  switch (n.type) {
    case 'root': {
      return convertChildren(n.children ?? [], pre)
    }

    case 'heading': {
      return heading(`h${n.depth}` as string, ...convertInlineChildren(n.children ?? [], pre))
    }

    case 'paragraph': {
      return convertParagraph(n, pre)
    }

    case 'text': {
      return processCustomInline(n.value ?? '')
    }

    case 'emphasis': {
      return applyFormat(convertInlineChildren(n.children ?? [], pre), FORMAT_MAP.italic)
    }

    case 'strong': {
      return applyFormat(convertInlineChildren(n.children ?? [], pre), FORMAT_MAP.bold)
    }

    case 'delete': {
      return applyFormat(convertInlineChildren(n.children ?? [], pre), FORMAT_MAP.strikethrough)
    }

    case 'inlineCode': {
      return text(n.value ?? '', FORMAT_MAP.code)
    }

    case 'code': {
      return convertCodeBlock(n)
    }

    case 'blockquote': {
      return convertBlockquote(n, pre)
    }

    case 'list': {
      return convertList(n, pre)
    }

    case 'listItem': {
      return convertListItem(n, pre)
    }

    case 'link': {
      return link(n.url ?? '', n.title ?? null, ...convertInlineChildren(n.children ?? [], pre))
    }

    case 'image': {
      return convertImage(n)
    }

    case 'table': {
      return convertTable(n, pre)
    }

    case 'thematicBreak': {
      return horizontalRule()
    }

    case 'break': {
      return lineBreak()
    }

    case 'math': {
      return katexBlock(n.value ?? '')
    }

    case 'inlineMath': {
      return { type: 'katex-inline', equation: n.value ?? '', version: 1 }
    }

    case 'html': {
      return convertHtml(n.value ?? '', pre)
    }

    case 'footnoteReference': {
      return { type: 'footnote', identifier: n.identifier ?? '', version: 1 }
    }

    case 'footnoteDefinition': {
      // Collected separately
      return null
    }

    case 'yaml':
    case 'toml': {
      // Skip frontmatter
      return null
    }

    default: {
      // Unknown node: try to extract text
      if (n.value) return text(n.value)
      if (n.children) return convertChildren(n.children, pre)
      return null
    }
  }
}

// ── Paragraph ──

function convertParagraph(n: any, pre: PreprocessResult): LNode | LNode[] | null {
  const children: MdastNode[] = n.children ?? []

  // Single image → promote to block-level ImageNode
  if (children.length === 1 && children[0].type === 'image') {
    return convertImage(children[0] as any)
  }

  // Single link occupying the whole paragraph → LinkCardNode
  if (children.length === 1 && children[0].type === 'link') {
    const linkNode = children[0] as any
    const linkText = toString(linkNode)
    // If the link text equals the URL, it's likely a standalone link → card
    if (linkText === linkNode.url || linkText === '') {
      return linkCard(linkNode.url, linkNode.title || undefined)
    }
  }

  const inline = convertInlineChildren(children, pre)
  if (inline.length === 0) return null
  return paragraph(...inline)
}

// ── Inline children ──

function convertInlineChildren(nodes: MdastNode[], pre: PreprocessResult): LNode[] {
  const result: LNode[] = []
  let i = 0
  while (i < nodes.length) {
    const node = nodes[i] as any

    // Detect inline HTML tag patterns: <tag>text</tag>, <ruby>...<rt>...</rt></ruby>
    if (node.type === 'html' && typeof node.value === 'string') {
      const merged = tryMergeInlineHtml(nodes, i, pre)
      if (merged) {
        result.push(merged.node)
        i = merged.end
        continue
      }
    }

    const converted = convertNode(node, pre)
    if (converted) {
      if (Array.isArray(converted)) result.push(...converted)
      else result.push(converted)
    }
    i++
  }
  return mergeHighlightMarkers(result)
}

// Detect == markers spanning across node boundaries and apply highlight format
// e.g. text("==") + strong("bold") + text("==rest") → strong("bold", highlight) + text("rest")
function mergeHighlightMarkers(nodes: LNode[]): LNode[] {
  const result: LNode[] = []
  let i = 0

  while (i < nodes.length) {
    // Look for a text node that starts with == (or is exactly ==)
    const node = nodes[i]
    if (node.type === 'text' && typeof node.text === 'string') {
      const txt = node.text as string
      const eqStart = txt.indexOf('==')
      if (eqStart !== -1) {
        // Try to find closing == in subsequent nodes
        const closeInfo = findClosingHighlight(nodes, i, eqStart)
        if (closeInfo) {
          // Emit text before the opening ==
          if (eqStart > 0) {
            result.push(text(txt.slice(0, eqStart), (node.format as number) || 0))
          }
          // Apply highlight format to all nodes between the markers
          const afterOpen = txt.slice(eqStart + 2)
          if (afterOpen) {
            result.push(text(afterOpen, ((node.format as number) || 0) | FORMAT_MAP.highlight))
          }
          for (let j = i + 1; j < closeInfo.nodeIndex; j++) {
            result.push(applyHighlightToNode(nodes[j]))
          }
          // Handle the closing node
          const closeNode = nodes[closeInfo.nodeIndex]
          const closeTxt = (closeNode as any).text as string
          const beforeClose = closeTxt.slice(0, closeInfo.offset)
          const afterClose = closeTxt.slice(closeInfo.offset + 2)
          if (beforeClose) {
            result.push(text(beforeClose, (((closeNode as any).format as number) || 0) | FORMAT_MAP.highlight))
          }
          if (afterClose) {
            // The remaining text may contain more == markers, process recursively
            const remaining = [text(afterClose, ((closeNode as any).format as number) || 0), ...nodes.slice(closeInfo.nodeIndex + 1)]
            result.push(...mergeHighlightMarkers(remaining))
            return result
          }
          i = closeInfo.nodeIndex + 1
          continue
        }
      }
    }
    result.push(node)
    i++
  }
  return result
}

function findClosingHighlight(
  nodes: LNode[],
  startIdx: number,
  startOffset: number,
): { nodeIndex: number; offset: number } | null {
  // Check rest of the starting text node (after the opening ==)
  const startTxt = (nodes[startIdx] as any).text as string
  const afterOpen = startTxt.slice(startOffset + 2)
  const closeInSame = afterOpen.indexOf('==')
  if (closeInSame !== -1) {
    // Both markers in same text node — handled by processCustomInline already
    return null
  }

  // Search subsequent nodes for closing ==
  for (let j = startIdx + 1; j < nodes.length; j++) {
    const n = nodes[j]
    if (n.type === 'text' && typeof (n as any).text === 'string') {
      const idx = ((n as any).text as string).indexOf('==')
      if (idx !== -1) return { nodeIndex: j, offset: idx }
    }
  }
  return null
}

function applyHighlightToNode(node: LNode): LNode {
  if (node.type === 'text') {
    return { ...node, format: ((node.format as number) || 0) | FORMAT_MAP.highlight }
  }
  // For element nodes with children (like spoiler), apply to children
  if ((node as any).children) {
    return { ...node, children: ((node as any).children as LNode[]).map(applyHighlightToNode) }
  }
  return node
}

function tryMergeInlineHtml(
  nodes: MdastNode[],
  start: number,
  _pre: PreprocessResult,
): { node: LNode; end: number } | null {
  const openNode = nodes[start] as any
  const openHtml: string = openNode.value ?? ''

  // <tag>
  if (/^<tag>$/i.test(openHtml)) {
    return collectUntilClose(nodes, start, '</tag>', (inner) => ({
      type: 'tag',
      text: inner,
      version: 1,
    }))
  }

  // <ruby> — collect until </ruby>
  if (/^<ruby>$/i.test(openHtml)) {
    return collectUntilCloseRuby(nodes, start)
  }

  return null
}

function collectUntilClose(
  nodes: MdastNode[],
  start: number,
  closeTag: string,
  build: (inner: string) => LNode,
): { node: LNode; end: number } | null {
  let inner = ''
  let i = start + 1
  while (i < nodes.length) {
    const n = nodes[i] as any
    if (n.type === 'html' && (n.value ?? '').toLowerCase() === closeTag.toLowerCase()) {
      return { node: build(inner), end: i + 1 }
    }
    inner += n.type === 'text' ? (n.value ?? '') : toString(n)
    i++
  }
  return null
}

function collectUntilCloseRuby(
  nodes: MdastNode[],
  start: number,
): { node: LNode; end: number } | null {
  // Collect all text between <ruby> and </ruby>, parsing <rt>reading</rt> within
  let raw = ''
  let i = start + 1
  while (i < nodes.length) {
    const n = nodes[i] as any
    if (n.type === 'html' && /^<\/ruby>$/i.test(n.value ?? '')) {
      const rtMatch = raw.match(/^(.*?)<rt>(.*?)<\/rt>/i)
      if (rtMatch) {
        return {
          node: { type: 'ruby', reading: rtMatch[2], children: [text(rtMatch[1])], direction: 'ltr', format: '', indent: 0, version: 1 },
          end: i + 1,
        }
      }
      return { node: text(raw), end: i + 1 }
    }
    raw += n.value ?? toString(n)
    i++
  }
  return null
}

// ── Code block ──

function convertCodeBlock(n: any): LNode {
  const lang: string = n.lang ?? ''
  const code: string = n.value ?? ''

  if (lang === 'mermaid') return mermaid(code)
  return codeBlock(code, lang)
}

// ── Blockquote ──

function convertBlockquote(n: any, pre: PreprocessResult): LNode {
  const children: MdastNode[] = n.children ?? []

  // Check for GitHub alert syntax: > [!NOTE] etc.
  if (children.length > 0 && children[0].type === 'paragraph') {
    const firstPara = children[0] as any
    const firstChild = firstPara.children?.[0]
    if (firstChild?.type === 'text') {
      const match = ALERT_PATTERN.exec(firstChild.value ?? '')
      if (match) {
        const alertType = match[1].toLowerCase()
        // Remove the alert marker from the first text node
        const modifiedFirst = { ...firstChild, value: firstChild.value.slice(match[0].length) }
        const modifiedPara = { ...firstPara, children: [modifiedFirst, ...firstPara.children.slice(1)] }
        const modifiedChildren = [modifiedPara, ...children.slice(1)]
        const content = convertChildren(modifiedChildren, pre)
        return alertQuote(alertType, ...content)
      }
    }
  }

  return quote(...convertChildren(children, pre))
}

// ── List ──

function convertList(n: any, pre: PreprocessResult): LNode {
  const type = n.ordered ? 'number' : 'bullet'
  const items = convertChildren(n.children ?? [], pre)
  const result = listNode(type, ...items)
  if (n.start != null && n.start !== 1) {
    result.start = n.start
  }
  return result
}

function convertListItem(n: any, pre: PreprocessResult): LNode {
  const children = convertChildren(n.children ?? [], pre)
  // Flatten: if listItem has a single paragraph, unwrap it
  let inner = children
  if (inner.length === 1 && inner[0].type === 'paragraph') {
    inner = (inner[0].children as LNode[]) ?? inner
  }
  const item = listItem(1, ...inner)
  if (n.checked != null) {
    item.checked = n.checked
  }
  return item
}

// ── Image ──

function convertImage(n: any): LNode {
  const src: string = n.url ?? ''
  const alt: string = n.alt ?? ''
  const title: string | undefined = n.title || undefined

  // Video extension detection
  if (VIDEO_EXTS.test(src)) return video(src)

  return image(src, alt, title)
}

// ── Table ──

function convertTable(n: any, pre: PreprocessResult): LNode {
  const rows: LNode[] = []
  for (let i = 0; i < (n.children ?? []).length; i++) {
    const row = n.children[i] as any
    const cells: LNode[] = []
    for (const cell of row.children ?? []) {
      // headerState: 1 for header row (first row), 0 otherwise
      const hs = i === 0 ? 1 : 0
      const cellChildren = convertInlineChildren(cell.children ?? [], pre)
      cells.push(tableCell(hs, paragraph(...cellChildren)))
    }
    rows.push(tableRow(...cells))
  }
  return tableNode(...rows)
}

// ── HTML nodes ──

/** Parse leading <summary>...</summary> without regex backtracking (ReDoS-safe). */
function parseDetailsSummaryAndBody(html: string): { body: string; summary: string } {
  const lower = html.toLowerCase()
  const open = '<summary>'
  const close = '</summary>'
  const oi = lower.indexOf(open)
  if (oi === -1) return { summary: '', body: html.trim() }
  const innerStart = oi + open.length
  const ci = lower.indexOf(close, innerStart)
  if (ci === -1) return { summary: '', body: html.trim() }
  const summary = html.slice(innerStart, ci).trim()
  const body = html.slice(ci + close.length).trim()
  return { summary, body }
}

function convertHtml(html: string, pre: PreprocessResult): LNode | LNode[] | null {
  const trimmed = html.trim()

  // Check for our placeholders (HTML comments)
  if (PLACEHOLDER_RE.test(trimmed)) {
    // Try container map first, then html map
    const containerBlock = pre.containers.get(trimmed)
    if (containerBlock) return convertContainer(containerBlock, pre)
    const htmlBlock = pre.htmlBlocks.get(trimmed)
    if (htmlBlock) return convertHtmlBlock(htmlBlock, pre)
  }

  // Handle merged HTML nodes containing multiple placeholders (remark may merge adjacent HTML lines)
  const PLACEHOLDER_GLOBAL = /<!--PLACEHOLDER:(?:container|html):\d+:\w+-->/g
  if (PLACEHOLDER_GLOBAL.test(trimmed)) {
    PLACEHOLDER_GLOBAL.lastIndex = 0
    const results: LNode[] = []
    let m: RegExpExecArray | null
    while ((m = PLACEHOLDER_GLOBAL.exec(trimmed)) !== null) {
      const ph = m[0]
      const containerBlock = pre.containers.get(ph)
      if (containerBlock) {
        const node = convertContainer(containerBlock, pre)
        if (node) results.push(node)
      }
      const htmlBlock = pre.htmlBlocks.get(ph)
      if (htmlBlock) {
        const node = convertHtmlBlock(htmlBlock, pre)
        if (node) results.push(node)
      }
    }
    if (results.length > 0) return results
  }

  // <video src="..." /> or <video src="..."></video>
  const videoMatch = trimmed.match(/<video\s[^>]*src=["']([^"']+)["'][^>]*>/i)
  if (videoMatch) return video(videoMatch[1])

  // <tag>text</tag>
  const tagMatch = trimmed.match(/^<tag>([^<]+)<\/tag>$/i)
  if (tagMatch) return { type: 'tag', text: tagMatch[1], version: 1 }

  // <ruby>
  const rubyMatch = trimmed.match(/^<ruby>([^<]*)<rt>([^<]*)<\/rt>(?:<rp>[^<]*<\/rp>)*<\/ruby>$/i)
  if (rubyMatch) return { type: 'ruby', reading: rubyMatch[2], children: [text(rubyMatch[1])], direction: 'ltr', format: '', indent: 0, version: 1 }

  return null
}

function convertHtmlBlock(
  block: { tag: string; attrs: Record<string, string>; content: string },
  pre: PreprocessResult,
): LNode | null {
  switch (block.tag) {
    case 'details': {
      // content starts with <summary>...</summary> (string split avoids regex backtracking)
      const { body: bodyMdRaw, summary } = parseDetailsSummaryAndBody(block.content)
      let bodyMd = bodyMdRaw
      // If body is HTML-heavy, convert to markdown first
      if (/^\s*</.test(bodyMd)) {
        bodyMd = htmlBodyToMarkdown(bodyMd)
      }
      const bodyNodes = convertMarkdownString(bodyMd, pre)
      const isOpen = 'open' in block.attrs
      return details(summary, isOpen, ...bodyNodes)
    }

    case 'tabs': {
      // Parse <tab label="...">content</tab> blocks
      const tabRegex = /<tab\s+label=["']([^"']+)["']\s*>(.*?)<\/tab>/gis
      const files: { filename: string; language: string; code: string }[] = []
      let m: RegExpExecArray | null
      while ((m = tabRegex.exec(block.content)) !== null) {
        const label = m[1]
        const tabContent = m[2].trim()
        // Try to extract code block from tab content
        const codeMatch = tabContent.match(/^```(\w*)\n(.*?)\n```$/s)
        if (codeMatch) {
          files.push({ filename: label, language: codeMatch[1] || '', code: codeMatch[2] })
        } else {
          files.push({ filename: label, language: '', code: tabContent })
        }
      }
      if (files.length > 0) return codeSnippet(files)
      return null
    }

    case 'excalidraw': {
      return excalidraw(block.content)
    }

    case 'nested-doc': {
      const bodyNodes = convertMarkdownString(block.content, pre)
      return nestedDoc(...bodyNodes)
    }

    default: {
      return null
    }
  }
}

// ── Container blocks ──

function convertContainer(block: ContainerBlock, pre: PreprocessResult): LNode | null {
  const typeMap: Record<string, string> = {
    warning: 'warn',
    danger: 'error',
    note: 'info',
  }

  switch (block.type) {
    case 'gallery':
    case 'carousel': {
      const images = pickImages(block.content)
      return gallery(images, block.type === 'carousel' ? 'carousel' : 'grid')
    }

    case 'masonry': {
      const images = pickImages(block.content)
      return gallery(images, 'masonry')
    }

    case 'banner': {
      const bannerType = block.params || 'info'
      const bodyNodes = convertMarkdownString(block.content, pre)
      return banner(typeMap[bannerType] || bannerType, ...bodyNodes)
    }

    case 'warn':
    case 'error':
    case 'danger':
    case 'info':
    case 'success':
    case 'warning':
    case 'note': {
      const mappedType = typeMap[block.type] || block.type
      const bodyNodes = convertMarkdownString(block.content, pre)
      return banner(mappedType, ...bodyNodes)
    }

    case 'details': {
      const params = parseContainerParams(block.params)
      const summary = params.summary?.replaceAll(/^"|"$/g, '') ?? ''
      const bodyNodes = convertMarkdownString(block.content, pre)
      return details(summary, false, ...bodyNodes)
    }

    case 'grid': {
      const params = parseContainerParams(block.params)
      const cols = Number.parseInt(params.cols ?? '2', 10)
      const rawGap = params.gap?.replaceAll(/^"|"$/g, '') ?? '16px'
      const gap = /\d+$/.test(rawGap) ? `${rawGap}px` : rawGap

      if (params.type === 'images') {
        const images = pickImages(block.content)
        return gallery(images, 'grid')
      }

      // Split content by ::: cell markers into separate cells
      const cellParts = block.content.split(/^\s*::: *cell\s*$/gm).filter((s) => s.trim())
      // Remove trailing ::: from each cell
      const cells = cellParts.map((part) => {
        const cleaned = part.replaceAll(/^\s*:::\s*$/gm, '').trim()
        return wrapRoot(convertMarkdownString(cleaned, pre))
      })
      if (cells.length === 0) {
        const bodyNodes = convertMarkdownString(block.content, pre)
        cells.push(wrapRoot(bodyNodes))
      }
      return gridContainer(cols, gap, cells)
    }

    default: {
      return null
    }
  }
}

// ── Helpers ──

function pickImages(content: string): { src: string; alt?: string }[] {
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g
  const images: { src: string; alt?: string }[] = []
  let m: RegExpExecArray | null
  while ((m = regex.exec(content)) !== null) {
    images.push({ src: m[2], alt: m[1] || undefined })
  }
  return images
}

function parseContainerParams(params: string): Record<string, string> {
  const result: Record<string, string> = {}
  const regex = /(\w+)=(?:"([^"]*)"|'([^']*)'|(\S+))/g
  let m: RegExpExecArray | null
  while ((m = regex.exec(params)) !== null) {
    result[m[1]] = m[2] ?? m[3] ?? m[4]
  }
  return result
}

function collectFootnoteDefinitions(root: MdastNode): Record<string, string> {
  const defs: Record<string, string> = {}
  const r = root as any
  if (!r.children) return defs
  for (const child of r.children) {
    if (child.type === 'footnoteDefinition') {
      defs[child.identifier ?? ''] = toString(child)
    }
  }
  return defs
}

function convertMarkdownString(md: string, _parentPre: PreprocessResult): LNode[] {
  // Re-preprocess nested content to handle inner containers/HTML blocks
  const subPre = preprocess(md)
  const subAst = parseMarkdown(subPre.processed)
  const subResult = markdownToLexical(subAst, subPre)
  return subResult.root.children
}

// Convert HTML body content to markdown for re-parsing
function htmlBodyToMarkdown(html: string): string {
  return (
    html
      // Strip <p> wrappers (with optional attributes)
      .replaceAll(/<p[^>]*>/gi, '')
      .replaceAll(/<\/p>/gi, '\n\n')
      // <span class="spoiler">text</span> → ||text||
      .replaceAll(/<span\s+class="spoiler">(.*?)<\/span>/gis, '||$1||')
      // <blockquote>text</blockquote> → > text
      .replaceAll(/<blockquote>(.*?)<\/blockquote>/gis, (_m, inner: string) => {
        return inner
          .trim()
          .split('\n')
          .map((l: string) => `> ${l.trim()}`)
          .join('\n')
      })
      // <strong>text</strong> → **text**
      .replaceAll(/<strong>(.*?)<\/strong>/gis, '**$1**')
      // <em>text</em> → *text*
      .replaceAll(/<em>(.*?)<\/em>/gis, '*$1*')
      // <del>text</del> → ~~text~~
      .replaceAll(/<del>(.*?)<\/del>/gis, '~~$1~~')
      // <code>text</code> → `text`
      .replaceAll(/<code>(.*?)<\/code>/gis, '`$1`')
      // Strip remaining HTML tags (br, span without class, etc.)
      .replaceAll(/<br\s*\/?>/gi, '\n')
      .replaceAll(/<\/?[a-z][^>]*>/gi, '')
      // Dedent: remove leading whitespace from each line (HTML indentation)
      .replaceAll(/^[\t ]+/gm, '')
      .trim()
  )
}
