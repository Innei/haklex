import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CodeFile, ColorScheme } from '@haklex/rich-editor'
import { normalizeLanguage } from '@haklex/rich-renderer-codeblock/constants'
import { FileIcon } from '@haklex/rich-renderer-codeblock/icons'
import {
  getHighlighterWithLang,
  SHIKI_THEMES,
} from '@haklex/rich-renderer-codeblock/shiki'
import { usePortalTheme } from '@haklex/rich-style-token'
import { GripVertical, Plus, Trash2, X } from 'lucide-react'
import type { CSSProperties, FC } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import * as styles from './styles.css'
import { getLanguageFromFilename } from './utils'

export interface CodeEditorModalProps {
  files: CodeFile[]
  onFilesChange?: (files: CodeFile[]) => void
  dismiss: () => void
  colorScheme: ColorScheme
}

// ─── Sortable file item ──────────────────────────────────
const SortableFileItem: FC<{
  file: CodeFile
  isActive: boolean
  isEditing: boolean
  editValue: string
  canDelete: boolean
  onSelect: () => void
  onStartRename: () => void
  onEditChange: (v: string) => void
  onCommitRename: () => void
  onCancelRename: () => void
  onDelete: () => void
}> = ({
  file,
  isActive,
  isEditing,
  editValue,
  canDelete,
  onSelect,
  onStartRename,
  onEditChange,
  onCommitRename,
  onCancelRename,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.filename })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.fileItem({ active: isActive, dragging: isDragging })} ${styles.semanticClassNames.fileItem} ${isActive ? styles.semanticClassNames.fileItemActive : ''} ${isDragging ? styles.semanticClassNames.fileItemDragging : ''}`.trim()}
      onClick={onSelect}
      onDoubleClick={onStartRename}
    >
      <span
        className={`${styles.fileDragHandle} ${styles.semanticClassNames.fileDragHandle}`}
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={12} />
      </span>
      <FileIcon
        filename={file.filename}
        size={14}
        className={`${styles.fileIcon} ${styles.semanticClassNames.fileIcon}`}
      />
      {isEditing ? (
        <input
          className={`${styles.renameInput} ${styles.semanticClassNames.renameInput}`}
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onCommitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCommitRename()
            if (e.key === 'Escape') onCancelRename()
          }}
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className={`${styles.fileName} ${styles.semanticClassNames.fileName}`}
        >
          {file.filename}
        </span>
      )}
      {canDelete && (
        <button
          type="button"
          className={`${styles.fileDelete} ${styles.semanticClassNames.fileDelete}`}
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          aria-label={`Delete ${file.filename}`}
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  )
}

// ─── Main modal ─────────────────────────────────────────
export const CodeEditorModal: FC<CodeEditorModalProps> = ({
  files: initialFiles,
  onFilesChange,
  dismiss,
  colorScheme,
}) => {
  const [editFiles, setEditFiles] = useState<CodeFile[]>(() =>
    initialFiles.map((f) => ({ ...f })),
  )
  const [activeFilename, setActiveFilename] = useState(
    initialFiles[0]?.filename ?? '',
  )

  const [editingFilename, setEditingFilename] = useState<string | null>(null)
  const [newFilenameInput, setNewFilenameInput] = useState('')
  const [dragActiveId, setDragActiveId] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<any>(null)
  const onCodeChangeRef = useRef<(code: string) => void>(undefined)
  const editFilesRef = useRef(editFiles)
  editFilesRef.current = editFiles

  const activeFile =
    editFiles.find((f) => f.filename === activeFilename) ?? editFiles[0]

  onCodeChangeRef.current = (code: string) => {
    setEditFiles((prev) =>
      prev.map((f) => (f.filename === activeFilename ? { ...f, code } : f)),
    )
  }

  // Only recreate editor when switching files
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const file = editFilesRef.current.find((f) => f.filename === activeFilename)
    if (!file) return

    let disposed = false
    let inputCleanup: (() => void) | null = null

    ;(async () => {
      const lang = normalizeLanguage(
        file.language ?? getLanguageFromFilename(file.filename),
      )
      const [highlighter, { shikiCode }] = await Promise.all([
        getHighlighterWithLang(lang),
        import('shikicode'),
      ])

      if (disposed) return

      const theme = SHIKI_THEMES[colorScheme]
      const loaded: string[] = highlighter.getLoadedLanguages()
      const resolvedLang = loaded.includes(lang) ? lang : 'text'

      const editor = shikiCode()
        .withOptions({
          readOnly: false,
          lineNumbers: 'on',
        })
        .create(container, highlighter, {
          value: file.code,
          language: resolvedLang as any,
          theme,
        })

      const handleInput = () => {
        onCodeChangeRef.current?.(editor.input.value)
      }
      editor.input.addEventListener('input', handleInput)
      inputCleanup = () =>
        editor.input.removeEventListener('input', handleInput)
      editorRef.current = editor
    })()

    return () => {
      disposed = true
      inputCleanup?.()
      editorRef.current?.dispose()
      editorRef.current = null
    }
  }, [activeFilename]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update theme without recreating editor
  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    editor.updateOptions({
      theme: SHIKI_THEMES[colorScheme],
    })
  }, [colorScheme])

  const handleDismiss = useCallback(() => {
    onFilesChange?.(editFiles)
    dismiss()
  }, [editFiles, onFilesChange, dismiss])

  const handleAddFile = useCallback(() => {
    const name = `untitled-${editFiles.length + 1}.ts`
    const newFile: CodeFile = {
      filename: name,
      code: '',
      language: 'typescript',
    }
    setEditFiles((prev) => [...prev, newFile])
    setActiveFilename(name)
  }, [editFiles.length])

  const handleDeleteFile = useCallback(
    (filename: string) => {
      if (editFiles.length <= 1) return
      const newFiles = editFiles.filter((f) => f.filename !== filename)
      setEditFiles(newFiles)
      if (activeFilename === filename) {
        setActiveFilename(newFiles[0]?.filename ?? '')
      }
    },
    [editFiles, activeFilename],
  )

  const handleRenameFile = useCallback(
    (oldName: string, newName: string) => {
      if (
        !newName.trim() ||
        editFiles.some((f) => f.filename === newName && f.filename !== oldName)
      ) {
        setEditingFilename(null)
        return
      }
      setEditFiles((prev) =>
        prev.map((f) =>
          f.filename === oldName
            ? { ...f, filename: newName, language: undefined }
            : f,
        ),
      )
      if (activeFilename === oldName) {
        setActiveFilename(newName)
      }
      setEditingFilename(null)
    },
    [editFiles, activeFilename],
  )

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const fileIds = useMemo(() => editFiles.map((f) => f.filename), [editFiles])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setDragActiveId(null)
      if (!over || active.id === over.id) return

      const oldIndex = editFiles.findIndex((f) => f.filename === active.id)
      const newIndex = editFiles.findIndex((f) => f.filename === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      setEditFiles(arrayMove(editFiles, oldIndex, newIndex))
    },
    [editFiles],
  )

  const dragActiveFile = dragActiveId
    ? editFiles.find((f) => f.filename === dragActiveId)
    : null

  const { className: portalThemeClassName } = usePortalTheme()

  const language = activeFile
    ? (activeFile.language ?? getLanguageFromFilename(activeFile.filename))
    : ''

  return (
    <div className={`${styles.modal} ${styles.semanticClassNames.modal}`}>
      {/* Title bar */}
      <div
        className={`${styles.modalTitlebar} ${styles.semanticClassNames.modalTitlebar}`}
      >
        <span
          className={`${styles.modalTitle} ${styles.semanticClassNames.modalTitle}`}
        >
          Code Snippet
        </span>
        <button
          type="button"
          className={`${styles.modalIconButton} ${styles.semanticClassNames.modalIconButton}`}
          onClick={handleDismiss}
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div
        className={`${styles.modalBody} ${styles.semanticClassNames.modalBody}`}
      >
        {/* Sidebar */}
        <div
          className={`${styles.modalSidebar} ${styles.semanticClassNames.modalSidebar}`}
        >
          <div
            className={`${styles.sidebarHeader} ${styles.semanticClassNames.sidebarHeader}`}
          >
            <span>Files</span>
            <button
              type="button"
              className={`${styles.sidebarAddButton} ${styles.semanticClassNames.sidebarAddButton}`}
              onClick={handleAddFile}
              aria-label="Add file"
            >
              <Plus size={14} />
            </button>
          </div>
          <div
            className={`${styles.fileList} ${styles.semanticClassNames.fileList}`}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={(event) =>
                setDragActiveId(event.active.id as string)
              }
              onDragEnd={handleDragEnd}
              onDragCancel={() => setDragActiveId(null)}
            >
              <SortableContext
                items={fileIds}
                strategy={verticalListSortingStrategy}
              >
                {editFiles.map((file) => (
                  <SortableFileItem
                    key={file.filename}
                    file={file}
                    isActive={file.filename === activeFilename}
                    isEditing={editingFilename === file.filename}
                    editValue={newFilenameInput}
                    canDelete={editFiles.length > 1}
                    onSelect={() => setActiveFilename(file.filename)}
                    onStartRename={() => {
                      setEditingFilename(file.filename)
                      setNewFilenameInput(file.filename)
                    }}
                    onEditChange={setNewFilenameInput}
                    onCommitRename={() =>
                      handleRenameFile(file.filename, newFilenameInput)
                    }
                    onCancelRename={() => setEditingFilename(null)}
                    onDelete={() => handleDeleteFile(file.filename)}
                  />
                ))}
              </SortableContext>

              {typeof document !== 'undefined'
                ? createPortal(
                    <DragOverlay>
                      <div
                        className={portalThemeClassName}
                        style={{ display: 'contents' }}
                      >
                        {dragActiveFile ? (
                          <div
                            className={`${styles.fileItem()} ${styles.semanticClassNames.fileItem} ${styles.dragOverlay} ${styles.semanticClassNames.dragOverlay}`}
                          >
                            <FileIcon
                              filename={dragActiveFile.filename}
                              size={14}
                              className={`${styles.fileIcon} ${styles.semanticClassNames.fileIcon}`}
                            />
                            <span
                              className={`${styles.fileName} ${styles.semanticClassNames.fileName}`}
                            >
                              {dragActiveFile.filename}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </DragOverlay>,
                    document.body,
                  )
                : null}
            </DndContext>
          </div>
        </div>

        {/* Code panel */}
        <div
          className={`${styles.modalEditor} ${styles.semanticClassNames.modalEditor}`}
        >
          {/* Breadcrumb bar */}
          <div
            className={`${styles.breadcrumb} ${styles.semanticClassNames.breadcrumb}`}
          >
            <div
              className={`${styles.breadcrumbLeft} ${styles.semanticClassNames.breadcrumbLeft}`}
            >
              {activeFile && (
                <>
                  <FileIcon
                    filename={activeFile.filename}
                    size={14}
                    className={`${styles.fileIcon} ${styles.semanticClassNames.fileIcon}`}
                  />
                  <span
                    className={`${styles.breadcrumbName} ${styles.semanticClassNames.breadcrumbName}`}
                  >
                    {activeFile.filename}
                  </span>
                  {language && (
                    <span
                      className={`${styles.breadcrumbLang} ${styles.semanticClassNames.breadcrumbLang}`}
                    >
                      {language}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Editor container */}
          <div
            ref={containerRef}
            className={`${styles.editorContainer} ${styles.semanticClassNames.editorContainer}`}
          />
        </div>
      </div>
    </div>
  )
}
