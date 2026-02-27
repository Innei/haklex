import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands'
import {
  Compartment,
  EditorSelection,
  EditorState,
  Prec,
} from '@codemirror/state'
import { EditorView, keymap, lineNumbers } from '@codemirror/view'
import {
  getThemeExtensions,
  isOnFirstLine,
  isOnLastLine,
  loadLanguageExtension,
} from '@haklex/cm-editor'
import type { CodeBlockRendererProps } from '@haklex/rich-editor'
import { useColorScheme, useVariant } from '@haklex/rich-editor'
import type { ComponentType } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { CodeBlockCard } from './CodeBlockCard'
import { normalizeLanguage } from './constants'
import * as styles from './styles.css'

function stopHandledEvent(event: KeyboardEvent) {
  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()
}

export const CodeBlockEditRenderer: ComponentType<CodeBlockRendererProps> = ({
  code,
  language,
  showLineNumbers: showLineNumbersProp,
  editable = false,
  selected = false,
  cursorPlacement = 'start',
  onCodeChange,
  onLanguageChange,
  onDelete,
  onExitBlock,
}) => {
  const variant = useVariant()
  const colorScheme = useColorScheme()
  const showLineNumbers = showLineNumbersProp ?? variant !== 'comment'
  const normalizedLanguage = normalizeLanguage(language)
  const [mounted, setMounted] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<EditorView | null>(null)
  const suppressChangeRef = useRef(false)

  const editableRef = useRef(editable)
  editableRef.current = editable

  const onCodeChangeRef = useRef(onCodeChange)
  onCodeChangeRef.current = onCodeChange
  const onDeleteRef = useRef(onDelete)
  onDeleteRef.current = onDelete
  const onExitBlockRef = useRef(onExitBlock)
  onExitBlockRef.current = onExitBlock

  const languageCompartmentRef = useRef<Compartment>(null!)
  const editableCompartmentRef = useRef<Compartment>(null!)
  const lineNumbersCompartmentRef = useRef<Compartment>(null!)
  const themeCompartmentRef = useRef<Compartment>(null!)
  if (!languageCompartmentRef.current)
    languageCompartmentRef.current = new Compartment()
  if (!editableCompartmentRef.current)
    editableCompartmentRef.current = new Compartment()
  if (!lineNumbersCompartmentRef.current)
    lineNumbersCompartmentRef.current = new Compartment()
  if (!themeCompartmentRef.current)
    themeCompartmentRef.current = new Compartment()

  const keyboardBoundaryHandler = useMemo(
    () =>
      Prec.high(
        EditorView.domEventHandlers({
          keydown: (event, view) => {
            if (!editableRef.current) return false

            // Prevent Lexical root key commands from handling keystrokes while
            // focus is inside CodeMirror.
            event.stopPropagation()

            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
              stopHandledEvent(event)
              onExitBlockRef.current?.('after')
              return true
            }

            if (event.key === 'Backspace' && view.state.doc.length === 0) {
              stopHandledEvent(event)
              onDeleteRef.current?.()
              return true
            }

            if (event.key === 'ArrowUp' && isOnFirstLine(view)) {
              stopHandledEvent(event)
              onExitBlockRef.current?.('before')
              return true
            }

            if (event.key === 'ArrowDown' && isOnLastLine(view)) {
              stopHandledEvent(event)
              onExitBlockRef.current?.('after')
              return true
            }

            return false
          },
        }),
      ),
    [],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const editor = new EditorView({
      parent: container,
      state: EditorState.create({
        doc: code,
        extensions: [
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
          EditorView.updateListener.of((update) => {
            if (!update.docChanged || suppressChangeRef.current) return
            onCodeChangeRef.current?.(update.state.doc.toString())
          }),
          keyboardBoundaryHandler,
          editableCompartmentRef.current.of([
            EditorView.editable.of(editable),
            EditorState.readOnly.of(!editable),
          ]),
          lineNumbersCompartmentRef.current.of(
            showLineNumbers ? lineNumbers() : [],
          ),
          themeCompartmentRef.current.of(getThemeExtensions(colorScheme)),
          languageCompartmentRef.current.of([]),
        ],
      }),
    })

    editorRef.current = editor
    setMounted(true)

    return () => {
      editor.destroy()
      editorRef.current = null
      setMounted(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Editor instance is created once; code/colorScheme/editable/showLineNumbers are synced via dedicated reconfigure effects
  }, [])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    editor.dispatch({
      effects: editableCompartmentRef.current.reconfigure([
        EditorView.editable.of(editable),
        EditorState.readOnly.of(!editable),
      ]),
    })
  }, [editable])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    editor.dispatch({
      effects: lineNumbersCompartmentRef.current.reconfigure(
        showLineNumbers ? lineNumbers() : [],
      ),
    })
  }, [showLineNumbers])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    editor.dispatch({
      effects: themeCompartmentRef.current.reconfigure(
        getThemeExtensions(colorScheme),
      ),
    })
  }, [colorScheme])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    const current = editor.state.doc.toString()
    if (current === code) return

    suppressChangeRef.current = true
    editor.dispatch({
      changes: {
        from: 0,
        to: current.length,
        insert: code,
      },
    })
    suppressChangeRef.current = false
  }, [code])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    let cancelled = false

    ;(async () => {
      const extension = await loadLanguageExtension(normalizedLanguage)
      if (cancelled) return

      editor.dispatch({
        effects: languageCompartmentRef.current.reconfigure(extension),
      })
    })()

    return () => {
      cancelled = true
    }
  }, [normalizedLanguage])

  useEffect(() => {
    if (!editable || !selected) return

    const editor = editorRef.current
    if (!editor) return

    const raf = requestAnimationFrame(() => {
      const nextCursor = cursorPlacement === 'end' ? editor.state.doc.length : 0
      editor.focus()
      editor.dispatch({
        selection: EditorSelection.cursor(nextCursor),
        scrollIntoView: true,
      })
    })

    return () => cancelAnimationFrame(raf)
  }, [cursorPlacement, editable, mounted, selected])

  const fallbackLines = useMemo(() => code.split('\n'), [code])

  const fallbackClassName = [
    showLineNumbers && styles.lined,
    showLineNumbers && styles.semanticClassNames.lined,
    showLineNumbers && styles.linedWithNumbers,
    showLineNumbers && styles.semanticClassNames.linedWithNumbers,
  ]
    .filter(Boolean)
    .join(' ')

  const bodyClassName = [
    styles.body,
    styles.semanticClassNames.body,
    !editable && styles.bodyReadonly,
    !editable && styles.semanticClassNames.bodyReadonly,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <CodeBlockCard
      code={code}
      language={language}
      collapsible={!editable}
      editable={editable}
      onLanguageChange={onLanguageChange}
    >
      {!mounted && (
        <pre className={fallbackClassName}>
          <code>
            {fallbackLines.map((line, i) => (
              <span key={`${line}-${i}`} className="line">
                {line}
              </span>
            ))}
          </code>
        </pre>
      )}
      <div
        ref={containerRef}
        className={bodyClassName}
        style={
          !mounted
            ? { height: 0, overflow: 'hidden', visibility: 'hidden' }
            : undefined
        }
      />
    </CodeBlockCard>
  )
}
