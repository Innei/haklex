import type { ElementTransformer } from '@lexical/markdown'
import { $isTableCellNode, $isTableNode, $isTableRowNode } from '@lexical/table'
import { $getRoot, type LexicalNode } from 'lexical'

import {
  $isCodeBlockNode,
  type SerializedCodeBlockNode,
} from '../nodes/CodeBlockNode'
import { $isGridContainerNode } from '../nodes/GridContainerNode'
import { $isImageNode, type SerializedImageNode } from '../nodes/ImageNode'
import {
  $isLinkCardNode,
  type SerializedLinkCardNode,
} from '../nodes/LinkCardNode'
import { $isMermaidNode } from '../nodes/MermaidNode'
import { $isVideoNode, type SerializedVideoNode } from '../nodes/VideoNode'

const NEVER_MATCH = /a^/

function quoteAttr(value: string): string {
  return value.replaceAll('"', '\\"')
}

function escapeCell(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll('\n', '<br/>')
}

function pickFence(content: string): string {
  const matches = content.match(/`+/g)
  const maxLen =
    matches?.reduce((max, run) => Math.max(max, run.length), 0) ?? 0
  return '`'.repeat(Math.max(3, maxLen + 1))
}

export const IMAGE_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node: LexicalNode) => {
    if (!$isImageNode(node)) return null
    const image = node.exportJSON() as SerializedImageNode
    const alt = image.altText || ''
    const title = image.caption
      ? ` "${image.caption.replaceAll('"', '\\"')}"`
      : ''
    return `![${alt}](${image.src}${title})`
  },
  regExp: NEVER_MATCH,
  replace: () => {},
  type: 'element',
}

export const VIDEO_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node: LexicalNode) => {
    if (!$isVideoNode(node)) return null
    const video = node.exportJSON() as SerializedVideoNode
    const attrs = [`src="${quoteAttr(video.src)}"`]
    if (video.poster) attrs.push(`poster="${quoteAttr(video.poster)}"`)
    if (video.width) attrs.push(`width=${video.width}`)
    if (video.height) attrs.push(`height=${video.height}`)
    return `<video ${attrs.join(' ')} controls></video>`
  },
  regExp: NEVER_MATCH,
  replace: () => {},
  type: 'element',
}

export const CODE_BLOCK_NODE_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node: LexicalNode) => {
    if (!$isCodeBlockNode(node)) return null
    const codeBlock = node.exportJSON() as SerializedCodeBlockNode
    const fence = pickFence(codeBlock.code)
    return `${fence}${codeBlock.language}\n${codeBlock.code}\n${fence}`
  },
  regExp: NEVER_MATCH,
  replace: () => {},
  type: 'element',
}

export const LINK_CARD_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node: LexicalNode) => {
    if (!$isLinkCardNode(node)) return null
    const linkCard = node.exportJSON() as SerializedLinkCardNode
    return linkCard.title
      ? `[${linkCard.title}](${linkCard.url})`
      : `<${linkCard.url}>`
  },
  regExp: NEVER_MATCH,
  replace: () => {},
  type: 'element',
}

export const MERMAID_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node: LexicalNode) => {
    if (!$isMermaidNode(node)) return null
    const fence = pickFence(node.getDiagram())
    return `${fence}mermaid\n${node.getDiagram()}\n${fence}`
  },
  regExp: NEVER_MATCH,
  replace: () => {},
  type: 'element',
}

export const GRID_CONTAINER_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node: LexicalNode) => {
    if (!$isGridContainerNode(node)) return null
    const cells = node.getCellEditors().map((editor) =>
      editor.getEditorState().read(() => {
        return $getRoot().getTextContent()
      }),
    )
    const body = cells.map((content) => `::: cell\n${content}\n:::`).join('\n')
    return `::: grid{cols=${node.getCols()} gap="${quoteAttr(node.getGap())}"}\n${body}\n:::`
  },
  regExp: NEVER_MATCH,
  replace: () => {},
  type: 'element',
}

export const HORIZONTAL_RULE_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node: LexicalNode) => {
    return node.getType() === 'horizontalrule' ? '---' : null
  },
  regExp: NEVER_MATCH,
  replace: () => {},
  type: 'element',
}

export const TABLE_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node: LexicalNode) => {
    if (!$isTableNode(node)) return null

    const rows = node.getChildren().filter($isTableRowNode)
    if (rows.length === 0) return '|  |\n| --- |'

    const tableRows = rows.map((row) =>
      row
        .getChildren()
        .filter($isTableCellNode)
        .map((cell) => escapeCell(cell.getTextContent())),
    )
    const header = tableRows[0]
    const separator = header.map(() => '---')
    const body = tableRows.slice(1)

    const lines = [
      `| ${header.join(' | ')} |`,
      `| ${separator.join(' | ')} |`,
      ...body.map((cells) => `| ${cells.join(' | ')} |`),
    ]
    return lines.join('\n')
  },
  regExp: NEVER_MATCH,
  replace: () => {},
  type: 'element',
}
