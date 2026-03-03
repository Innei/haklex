import { $convertFromMarkdownString } from '@lexical/markdown'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { SerializedLexicalNode } from 'lexical'
import {
  $insertNodes,
  $parseSerializedNode,
  COMMAND_PRIORITY_HIGH,
  createEditor,
  PASTE_COMMAND,
} from 'lexical'
import { useEffect } from 'react'

import { getResolvedEditNodes } from '../node-registry'
import { $createCodeBlockEditNode } from '../nodes/CodeBlockEditNode'
import { ALL_TRANSFORMERS } from '../transformers'

function getVSCodePasteData(
  clipboardData: DataTransfer,
): { language: string } | null {
  const raw = clipboardData.getData('vscode-editor-data')
  if (!raw) return null
  try {
    const data = JSON.parse(raw)
    return { language: data.mode || 'text' }
  } catch {
    return null
  }
}

function hasRichHTML(clipboardData: DataTransfer): boolean {
  const html = clipboardData.getData('text/html')
  if (!html) return false
  if (/data-vscode|vscode-/i.test(html)) return false
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const richTags = doc.body.querySelectorAll(
    'strong,em,b,i,h1,h2,h3,h4,h5,h6,ul,ol,table,img,blockquote,pre>code,a[href]',
  )
  return richTags.length > 0
}

function detectMarkdown(text: string): boolean {
  let score = 0

  if (/^#{1,6}\s+\S/m.test(text)) score += 5
  if (/^```[\w-]*$/m.test(text)) score += 5
  if (/\[.+?\]\(.+?\)/.test(text)) score += 4
  if (/!\[.*?\]\(.+?\)/.test(text)) score += 5
  if (/^\|.+\|$/m.test(text) && /^\|[-:\s|]+\|$/m.test(text)) score += 5
  if (/^>\s*\[!(?:NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]/im.test(text))
    score += 5
  if (/^[-*]\s+\[[ x]\]/m.test(text)) score += 4

  if (/\*\*.+?\*\*/.test(text)) score += 2
  if (/(?<!\*)\*(?!\*)(?!\s).+?(?<!\s)(?<!\*)\*(?!\*)/.test(text)) score += 1
  if (/^[-*+]\s+\S/m.test(text)) score += 1
  if (/^\d+\.\s+\S/m.test(text)) score += 1
  if (/^>\s+\S/m.test(text)) score += 1
  if (/`.+?`/.test(text)) score += 1
  if (/^[-*_]{3,}$/m.test(text)) score += 2

  const paragraphs = text.split(/\n{2,}/).filter(Boolean)
  if (paragraphs.length >= 3) score += 2

  if (text.length < 20) score -= 3
  if (!text.includes('\n')) score -= 2

  return score >= 5
}

function convertAndInsert(markdown: string): void {
  const tempEditor = createEditor({
    namespace: 'markdown-paste-temp',
    nodes: getResolvedEditNodes(),
    onError: () => {},
  })

  tempEditor.update(
    () => {
      $convertFromMarkdownString(markdown, ALL_TRANSFORMERS)
    },
    { discrete: true },
  )

  const serializedChildren = tempEditor.getEditorState().toJSON().root.children

  const nodes = serializedChildren.map((s: SerializedLexicalNode) =>
    $parseSerializedNode(s),
  )
  $insertNodes(nodes)
}

export function MarkdownPastePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        const clipboardData =
          'clipboardData' in event
            ? (event as ClipboardEvent).clipboardData
            : null
        if (!clipboardData) return false

        // Image files → let ImageUploadPlugin handle
        if (
          Array.from(clipboardData.files).some((f) =>
            f.type.startsWith('image/'),
          )
        )
          return false

        // VS Code paste → code block(s)
        const vscodeData = getVSCodePasteData(clipboardData)
        if (vscodeData) {
          const code = clipboardData.getData('text/plain')
          if (code) {
            const segments = code.split(/\r?\n{3,}/).filter(Boolean)
            const nodes = segments.map((s) =>
              $createCodeBlockEditNode(
                s.replace(/^\s*\n/, '').replace(/\n\s*$/, ''),
                vscodeData.language,
              ),
            )
            $insertNodes(nodes)
            event.preventDefault()
            return true
          }
        }

        // Rich HTML → let Lexical default handle
        if (hasRichHTML(clipboardData)) return false

        // Markdown detection
        const text = clipboardData.getData('text/plain')
        if (!text || !detectMarkdown(text)) return false

        try {
          event.preventDefault()
          convertAndInsert(text)
          return true
        } catch {
          return false
        }
      },
      COMMAND_PRIORITY_HIGH,
    )
  }, [editor])

  return null
}
