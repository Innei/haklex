import { usePortalTheme } from '@haklex/rich-style-token'
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text'
import type { LexicalEditor, LexicalNode, SerializedEditorState } from 'lexical'
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  createEditor,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical'
import {
  Bold,
  Code2,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListChecks,
  ListOrdered,
  Pilcrow,
  Redo,
  Save,
  Underline,
  Undo,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { allNodes } from '../../config'
import { useColorScheme } from '../../context/ColorSchemeContext'
import { useImageUpload } from '../../context/ImageUploadContext'
import {
  NestedContentRendererProvider,
  useOptionalNestedContentRenderer,
} from '../../context/NestedContentRendererContext'
import {
  RendererConfigProvider,
  useVariant,
} from '../../context/RendererConfigContext'
import { getResolvedEditNodes } from '../../node-registry'
import { $isNestedDocNode } from '../../nodes/NestedDocNode'
import { AutoLinkPlugin } from '../../plugins/AutoLinkPlugin'
import { BlockExitPlugin } from '../../plugins/BlockExitPlugin'
import { FootnotePlugin } from '../../plugins/FootnotePlugin'
import { HorizontalRulePlugin } from '../../plugins/HorizontalRulePlugin'
import { ImagePlugin } from '../../plugins/ImagePlugin'
import { ImageUploadPlugin } from '../../plugins/ImageUploadPlugin'
import { KaTeXPlugin } from '../../plugins/KaTeXPlugin'
import { LinkFaviconPlugin } from '../../plugins/LinkFaviconPlugin'
import { MarkdownShortcutsPlugin } from '../../plugins/MarkdownShortcutsPlugin'
import { MermaidPlugin } from '../../plugins/MermaidPlugin'
import { NestedDocPlugin } from '../../plugins/NestedDocPlugin'
import { editorTheme } from '../../styles/theme'
import { collectCommandItems } from '../../utils/collect-command-items'
import { extractTextContent } from '../../utils/extractTextContent'
import {
  hasRenderableEditorState,
  truncateEditorState,
} from '../../utils/truncateEditorState'
import * as css from './nested-doc-dialog.css'

const PREVIEW_NODE_LIMIT = 6

type BlockType =
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bullet'
  | 'number'
  | 'check'
  | 'other'

interface ToolbarState {
  canUndo: boolean
  canRedo: boolean
  blockType: BlockType
  isBold: boolean
  isItalic: boolean
  isUnderline: boolean
  isCode: boolean
}

const INITIAL_TOOLBAR_STATE: ToolbarState = {
  canUndo: false,
  canRedo: false,
  blockType: 'paragraph',
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isCode: false,
}

interface NestedDocEditDecoratorProps {
  nodeKey: string
  contentEditor: LexicalEditor
  contentState: SerializedEditorState
}

function getPreviewNodes() {
  const baseNodes = [...allNodes]
  const seenTypes = new Set(
    baseNodes.map((node) => (node as { getType?: () => string }).getType?.()),
  )

  for (const node of getResolvedEditNodes()) {
    const type = (node as { getType?: () => string }).getType?.()
    if (!type || seenTypes.has(type)) continue
    seenTypes.add(type)
    baseNodes.push(node as any)
  }

  return baseNodes
}

function PreviewStateSyncPlugin({
  editorState,
}: {
  editorState: SerializedEditorState
}) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const parsed = editor.parseEditorState(editorState)
    editor.setEditorState(parsed)
  }, [editor, editorState])

  return null
}

function NestedDocPreviewRenderer({ value }: { value: SerializedEditorState }) {
  const variant = useVariant()
  const previewNodes = useMemo(() => getPreviewNodes(), [])
  const previewEditor = useMemo(() => {
    const editor = createEditor({
      namespace: 'NestedDocPreview',
      nodes: previewNodes,
      theme: editorTheme,
      editable: false,
      onError: (error: Error) => {
        console.error('[NestedDocPreview]', error)
      },
    })
    const initialState = editor.parseEditorState(value)
    editor.setEditorState(initialState)
    return editor
  }, [previewNodes, value])

  const renderNestedContent = useCallback(
    (state: SerializedEditorState) => (
      <NestedDocPreviewRenderer value={state} />
    ),
    [],
  )

  return (
    <div className={css.previewRenderer}>
      <RendererConfigProvider
        config={undefined}
        mode="renderer"
        variant={variant}
      >
        <NestedContentRendererProvider value={renderNestedContent}>
          <LexicalNestedComposer initialEditor={previewEditor}>
            <PreviewStateSyncPlugin editorState={value} />
            <FootnotePlugin>
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    className={css.previewEditable}
                    aria-placeholder=""
                    placeholder={<span style={{ display: 'none' }} />}
                  />
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </FootnotePlugin>
          </LexicalNestedComposer>
        </NestedContentRendererProvider>
      </RendererConfigProvider>
    </div>
  )
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      className={`${css.toolbarButton} ${active ? css.toolbarButtonActive : ''}`.trim()}
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function getBlockType(): BlockType {
  let blockType: BlockType = 'other'

  const selection = $getSelection()
  if (!$isRangeSelection(selection)) return blockType

  const anchorNode = selection.anchor.getNode()
  const topLevel = anchorNode.getTopLevelElementOrThrow()

  let listNode: LexicalNode | null = anchorNode
  while (listNode) {
    if ($isListNode(listNode)) {
      const listType = listNode.getListType()
      if (listType === 'bullet') blockType = 'bullet'
      if (listType === 'number') blockType = 'number'
      if (listType === 'check') blockType = 'check'
      return blockType
    }
    listNode = listNode.getParent()
  }

  if ($isHeadingNode(topLevel)) {
    const tag = topLevel.getTag()
    if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
      blockType = tag
      return blockType
    }
  }

  if (topLevel.getType() === 'paragraph') {
    blockType = 'paragraph'
  }

  return blockType
}

function NestedDocToolbar() {
  const [editor] = useLexicalComposerContext()
  const [state, setState] = useState(INITIAL_TOOLBAR_STATE)

  const insertItems = useMemo(
    () =>
      collectCommandItems(editor).filter(
        (item) =>
          item.placement?.includes('toolbar') && item.group === 'insert',
      ),
    [editor],
  )

  const updateToolbar = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      const blockType = getBlockType()

      if (!$isRangeSelection(selection)) {
        setState((current) => ({
          ...current,
          blockType,
          isBold: false,
          isItalic: false,
          isUnderline: false,
          isCode: false,
        }))
        return
      }

      const isBold = selection.hasFormat('bold')
      const isItalic = selection.hasFormat('italic')
      const isUnderline = selection.hasFormat('underline')
      const isCode = selection.hasFormat('code')

      setState((current) => ({
        ...current,
        blockType,
        isBold,
        isItalic,
        isUnderline,
        isCode,
      }))
    })
  }, [editor])

  useEffect(() => {
    const unregisterUndo = editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setState((current) => ({ ...current, canUndo: payload }))
        return false
      },
      COMMAND_PRIORITY_LOW,
    )

    const unregisterRedo = editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setState((current) => ({ ...current, canRedo: payload }))
        return false
      },
      COMMAND_PRIORITY_LOW,
    )

    const unregisterUpdate = editor.registerUpdateListener(() => {
      updateToolbar()
    })

    updateToolbar()

    return () => {
      unregisterUndo()
      unregisterRedo()
      unregisterUpdate()
    }
  }, [editor, updateToolbar])

  const handleSetParagraph = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      const anchorNode = selection.anchor.getNode()
      const block = anchorNode.getTopLevelElementOrThrow()
      const paragraph = $createParagraphNode()
      block.replace(paragraph, true)
      paragraph.selectEnd()
    })
  }, [editor])

  const handleSetHeading = useCallback(
    (tag: 'h1' | 'h2' | 'h3') => {
      editor.update(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return

        const anchorNode = selection.anchor.getNode()
        const block = anchorNode.getTopLevelElementOrThrow()
        const heading = $createHeadingNode(tag)
        block.replace(heading, true)
        heading.selectEnd()
      })
    },
    [editor],
  )

  return (
    <div
      className={css.toolbar}
      onMouseDown={(event) => event.preventDefault()}
    >
      <div className={css.toolbarGroup}>
        <ToolbarButton
          label="Undo"
          disabled={!state.canUndo}
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        >
          <Undo size={15} />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={!state.canRedo}
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        >
          <Redo size={15} />
        </ToolbarButton>
      </div>

      <div className={css.toolbarDivider} />

      <div className={css.toolbarGroup}>
        <ToolbarButton
          label="Paragraph"
          active={state.blockType === 'paragraph'}
          onClick={handleSetParagraph}
        >
          <Pilcrow size={15} />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 1"
          active={state.blockType === 'h1'}
          onClick={() => handleSetHeading('h1')}
        >
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          active={state.blockType === 'h2'}
          onClick={() => handleSetHeading('h2')}
        >
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={state.blockType === 'h3'}
          onClick={() => handleSetHeading('h3')}
        >
          <Heading3 size={15} />
        </ToolbarButton>
      </div>

      <div className={css.toolbarDivider} />

      <div className={css.toolbarGroup}>
        <ToolbarButton
          label="Bold"
          active={state.isBold}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={state.isItalic}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          active={state.isUnderline}
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
          }
        >
          <Underline size={15} />
        </ToolbarButton>
        <ToolbarButton
          label="Inline code"
          active={state.isCode}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
        >
          <Code2 size={15} />
        </ToolbarButton>
      </div>

      <div className={css.toolbarDivider} />

      <div className={css.toolbarGroup}>
        <ToolbarButton
          label="Bulleted list"
          active={state.blockType === 'bullet'}
          onClick={() =>
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
          }
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={state.blockType === 'number'}
          onClick={() =>
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
          }
        >
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton
          label="Checklist"
          active={state.blockType === 'check'}
          onClick={() =>
            editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
          }
        >
          <ListChecks size={15} />
        </ToolbarButton>
      </div>

      {insertItems.length > 0 && (
        <>
          <div className={css.toolbarDivider} />
          <div className={css.toolbarGroup}>
            {insertItems.map((item) => (
              <ToolbarButton
                key={item.title}
                label={item.title}
                disabled={item.isDisabled?.(editor)}
                active={item.isActive?.(editor)}
                onClick={() => item.onSelect(editor, '')}
              >
                {item.icon ?? <FileText size={15} />}
              </ToolbarButton>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function NestedDocEditDecorator({
  nodeKey,
  contentEditor,
  contentState,
}: NestedDocEditDecoratorProps) {
  const [editor] = useLexicalComposerContext()
  const colorScheme = useColorScheme()
  const { className: portalClassName } = usePortalTheme()
  const renderNestedContent = useOptionalNestedContentRenderer()

  const previewState = useMemo(
    () => truncateEditorState(contentState, PREVIEW_NODE_LIMIT),
    [contentState],
  )
  const hasPreview = hasRenderableEditorState(previewState)

  const handleOpenDialog = useCallback(async () => {
    const { presentDialog } = await import('@haklex/rich-editor-ui')

    presentDialog({
      content: ({ dismiss }) => (
        <NestedDocDialogContent
          initialState={contentEditor.getEditorState().toJSON()}
          parentEditor={editor}
          nodeKey={nodeKey}
          contentEditor={contentEditor}
          onDismiss={dismiss}
        />
      ),
      className: css.dialogPopup,
      portalClassName,
      theme: colorScheme,
      showCloseButton: false,
      clickOutsideToDismiss: false,
    })
  }, [colorScheme, contentEditor, editor, nodeKey, portalClassName])

  return (
    <div
      onClick={handleOpenDialog}
      role="button"
      tabIndex={0}
      aria-label="Open nested document editor"
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleOpenDialog()
        }
      }}
    >
      <div className="rich-nested-doc-content">
        {hasPreview ? (
          <div className={css.previewSurface}>
            {renderNestedContent ? (
              renderNestedContent(previewState)
            ) : (
              <NestedDocPreviewRenderer value={previewState} />
            )}
          </div>
        ) : (
          <p className={css.previewEmpty}>
            Empty nested document. Click to edit.
          </p>
        )}
      </div>
      <div className="rich-nested-doc-mask">
        <button
          type="button"
          className="rich-nested-doc-toggle"
          onClick={(event) => {
            event.stopPropagation()
            handleOpenDialog()
          }}
        >
          Edit
        </button>
      </div>
    </div>
  )
}

function NestedDocDialogContent({
  initialState,
  parentEditor,
  nodeKey,
  contentEditor,
  onDismiss,
}: {
  initialState: SerializedEditorState
  parentEditor: LexicalEditor
  nodeKey: string
  contentEditor: LexicalEditor
  onDismiss: () => void
}) {
  const dialogEditorRef = useRef<LexicalEditor | null>(null)
  const imageUpload = useImageUpload()

  const safeInitialState =
    initialState?.root?.children?.length > 0
      ? initialState
      : {
          root: {
            children: [
              {
                children: [],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
                textFormat: 0,
                textStyle: '',
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        }

  const blockCount = safeInitialState.root.children.length
  const characterCount = extractTextContent(
    safeInitialState as SerializedEditorState,
  ).trim().length

  const initialConfig = {
    namespace: 'NestedDocDialog',
    nodes: getResolvedEditNodes(),
    theme: editorTheme,
    editable: true,
    editorState: JSON.stringify(safeInitialState),
    onError: (error: Error) => {
      console.error('[NestedDocDialog]', error)
    },
  }

  const handleDone = useCallback(() => {
    const dialogEditor = dialogEditorRef.current
    if (dialogEditor) {
      const newState = dialogEditor.getEditorState().toJSON()
      const parsed = contentEditor.parseEditorState(newState)
      contentEditor.setEditorState(parsed)
      parentEditor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isNestedDocNode(node)) {
          node.setContentState(newState)
        }
      })
    }
    onDismiss()
  }, [contentEditor, nodeKey, onDismiss, parentEditor])

  const handleKeyDownCapture = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const isModifier = event.metaKey || event.ctrlKey
      if (!isModifier) return

      if (event.key === 'Enter' || event.key.toLowerCase() === 's') {
        event.preventDefault()
        handleDone()
      }
    },
    [handleDone],
  )

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorRefCapture editorRef={dialogEditorRef} />
      <FootnotePlugin>
        <div
          className={css.dialogShell}
          onKeyDownCapture={handleKeyDownCapture}
        >
          <div className={css.dialogHeader}>
            <div className={css.dialogHeaderMain}>
              <span className={css.dialogHeaderIcon}>
                <FileText size={18} />
              </span>
              <div className={css.dialogHeaderText}>
                <h3 className={css.dialogTitle}>Nested document</h3>
                <p className={css.dialogDescription}>
                  Edit embedded content in a focused workspace with full
                  rich-text controls.
                </p>
              </div>
            </div>
            <div className={css.dialogMetaRow}>
              <span className={css.dialogMetaPill}>{blockCount} blocks</span>
              <span className={css.dialogMetaPill}>{characterCount} chars</span>
              <span className={css.dialogMetaPill}>⌘/Ctrl + Enter to save</span>
            </div>
          </div>

          <NestedDocToolbar />

          <div className={css.editorArea}>
            <div className={css.editorCard}>
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    className={css.editorEditable}
                    aria-placeholder=""
                    placeholder={<span style={{ display: 'none' }} />}
                  />
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
          </div>

          <div className={css.dialogFooter}>
            <p className={css.dialogHint}>
              Supports headings, lists, media blocks, toolbar insertion and
              nested content editing.
            </p>
            <div className={css.dialogActions}>
              <button
                type="button"
                className={css.secondaryButton}
                onClick={onDismiss}
              >
                <X size={15} />
                Cancel
              </button>
              <button
                type="button"
                className={css.primaryButton}
                onClick={handleDone}
              >
                <Save size={15} />
                Save
              </button>
            </div>
          </div>
        </div>
      </FootnotePlugin>

      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <CheckListPlugin />
      <TabIndentationPlugin />
      <TablePlugin />
      <MarkdownShortcutsPlugin />
      <AutoLinkPlugin />
      <HorizontalRulePlugin />
      <ImagePlugin />
      {imageUpload ? <ImageUploadPlugin onUpload={imageUpload} /> : null}
      <KaTeXPlugin />
      <MermaidPlugin />
      <NestedDocPlugin />
      <LinkFaviconPlugin />
      <BlockExitPlugin />
    </LexicalComposer>
  )
}

function EditorRefCapture({
  editorRef,
}: {
  editorRef: React.RefObject<LexicalEditor | null>
}) {
  const [editor] = useLexicalComposerContext()
  editorRef.current = editor
  return null
}
