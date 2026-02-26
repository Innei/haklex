import {
  allNodes,
  ColorSchemeProvider,
  editorTheme,
  FootnoteDefinitionsProvider,
  getVariantClass,
  NestedContentRendererProvider,
  RendererConfigProvider,
} from '@haklex/rich-editor/static'
import { PortalThemeProvider } from '@haklex/rich-style-token'
import { createHeadlessEditor } from '@lexical/headless'
import type { LexicalEditor, SerializedEditorState } from 'lexical'
import { $getRoot } from 'lexical'
import {
  cloneElement,
  createElement,
  isValidElement,
  type ReactNode,
} from 'react'

import { renderBuiltinNode } from './engine/renderBuiltinNode'
import { renderTextNode } from './engine/renderTextNode'
import { preprocessFootnotes } from './preprocess/footnote'
import type { RichRendererProps } from './types'

interface EditorConfig {
  namespace: string
  theme: Record<string, any>
}

function wrapDecoration(
  serialized: any,
  key: string,
  decoration: ReactNode,
): ReactNode {
  switch (serialized.type) {
    case 'alert-quote':
      return createElement(
        'div',
        { key, className: `rich-alert rich-alert-${serialized.alertType}` },
        decoration,
      )
    case 'banner':
      return createElement(
        'div',
        { key, className: `rich-banner rich-banner-${serialized.bannerType}` },
        decoration,
      )
    case 'grid-container':
      return createElement(
        'div',
        { key, className: 'rich-grid-container' },
        decoration,
      )
    default:
      if (isValidElement(decoration)) {
        return cloneElement(decoration, { key })
      }
      return decoration
  }
}

function renderTree(
  node: any,
  editor: LexicalEditor,
  editorConfig: EditorConfig,
  headingSlugs: Map<string, number>,
  key: string,
): ReactNode {
  const nodeKey = node.getKey ? node.getKey() : key

  if (typeof node.decorate === 'function') {
    try {
      const decoration = node.decorate(editor, editorConfig)
      if (decoration != null) {
        const serialized = node.exportJSON ? node.exportJSON() : {}
        return wrapDecoration(serialized, nodeKey, decoration)
      }
    } catch {
      /* fallthrough to builtin */
    }
  }

  const serialized = node.exportJSON ? node.exportJSON() : {}

  if (serialized.type === 'text') {
    return renderTextNode(serialized, nodeKey)
  }

  let children: ReactNode[] | null = null
  if (node.getChildren) {
    const childNodes = node.getChildren()
    if (childNodes.length > 0) {
      children = childNodes.map((child: any, i: number) =>
        renderTree(
          child,
          editor,
          editorConfig,
          headingSlugs,
          `${nodeKey}-${i}`,
        ),
      )
    }
  }

  return renderBuiltinNode(serialized, nodeKey, children, headingSlugs)
}

function renderEditorToReact(
  value: SerializedEditorState,
  nodes: any[],
): {
  content: ReactNode
  footnoteData: ReturnType<typeof preprocessFootnotes>
  renderNestedContent: (state: SerializedEditorState) => ReactNode
} {
  const editor = createHeadlessEditor({
    nodes,
    theme: editorTheme,
    editable: false,
    onError: (error: Error) => {
      console.error('[RichRenderer]', error)
    },
  })

  const editorConfig: EditorConfig = { namespace: 'ssr', theme: editorTheme }

  const editorState = editor.parseEditorState(value)
  editor.setEditorState(editorState)

  const footnoteData = preprocessFootnotes(value)

  let content: ReactNode = null
  editorState.read(() => {
    const root = $getRoot()
    const headingSlugs = new Map<string, number>()
    const children = root
      .getChildren()
      .map((child: any, i: number) =>
        renderTree(child, editor, editorConfig, headingSlugs, `ssr-${i}`),
      )
    content = <>{children}</>
  })

  const renderNestedContent = (state: SerializedEditorState): ReactNode => {
    const nestedEditor = createHeadlessEditor({
      nodes,
      theme: editorTheme,
      editable: false,
      onError: (error: Error) => {
        console.error('[RichRenderer:nested]', error)
      },
    })
    const nestedEditorConfig: EditorConfig = {
      namespace: 'ssr-nested',
      theme: editorTheme,
    }
    const nestedState = nestedEditor.parseEditorState(state)
    nestedEditor.setEditorState(nestedState)
    let nested: ReactNode = null
    nestedState.read(() => {
      const root = $getRoot()
      const headingSlugs = new Map<string, number>()
      const ch = root
        .getChildren()
        .map((child: any, i: number) =>
          renderTree(
            child,
            nestedEditor,
            nestedEditorConfig,
            headingSlugs,
            `nested-${i}`,
          ),
        )
      nested = <>{ch}</>
    })
    return nested
  }

  return { content, footnoteData, renderNestedContent }
}

export function RichRenderer({
  value,
  variant = 'article',
  theme = 'light',
  className,
  style,
  as: Component = 'div',
  rendererConfig,
  extraNodes,
}: RichRendererProps) {
  const variantClass = getVariantClass(variant)
  const nodes = extraNodes ? [...allNodes, ...extraNodes] : allNodes

  const { content, footnoteData, renderNestedContent } = renderEditorToReact(
    value,
    nodes,
  )

  const classes = ['rich-content', variantClass, className]
    .filter(Boolean)
    .join(' ')

  return (
    <PortalThemeProvider className={variantClass} theme={theme}>
      <ColorSchemeProvider colorScheme={theme}>
        <RendererConfigProvider
          config={rendererConfig}
          mode="renderer"
          variant={variant}
        >
          <FootnoteDefinitionsProvider
            definitions={footnoteData.definitions}
            displayNumberMap={footnoteData.displayNumberMap}
          >
            <NestedContentRendererProvider value={renderNestedContent}>
              <Component className={classes} style={style} data-theme={theme}>
                {content}
              </Component>
            </NestedContentRendererProvider>
          </FootnoteDefinitionsProvider>
        </RendererConfigProvider>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  )
}
