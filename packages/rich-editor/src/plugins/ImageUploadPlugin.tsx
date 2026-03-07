import {
  ActionBar,
  ActionButton,
  Dialog,
  DialogPopup,
  DialogTitle,
  SegmentedControl,
} from '@haklex/rich-editor-ui'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { DRAG_DROP_PASTE } from '@lexical/rich-text'
import {
  $insertNodes,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  PASTE_COMMAND,
} from 'lexical'
import { Check, Info, Link2, Upload } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { $createImageNode } from '../nodes/ImageNode'
import { computeImageMeta } from '../utils/thumbhash'
import * as css from './image-upload.css'
import { OPEN_IMAGE_UPLOAD_DIALOG_COMMAND } from './image-upload-command'

export interface ImageUploadResult {
  src: string
  altText?: string
  width?: number
  height?: number
  thumbhash?: string
}

export type ImageUploadFn = (file: File) => Promise<ImageUploadResult>

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

function hasImageData(dataTransfer: DataTransfer | null): boolean {
  if (!dataTransfer) return false

  if ([...dataTransfer.files].some(isImageFile)) return true
  return [...dataTransfer.items].some((item) =>
    item.type.startsWith('image/'),
  )
}

const UNSAFE_URL_RE = /^(?:javascript\s*:|vbscript\s*:|data\s*:(?!image\/))/i

function isSafeImageUrl(url: string): boolean {
  return !UNSAFE_URL_RE.test(url)
}

function loadImageByUrl(
  src: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      resolve({
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      })
    }
    image.onerror = () => reject(new Error('Failed to load image'))
    image.src = src
  })
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('File read failed'))
    reader.readAsDataURL(file)
  })
}

export async function defaultImageUpload(
  file: File,
): Promise<ImageUploadResult> {
  return {
    src: await readAsDataUrl(file),
    altText: file.name,
  }
}

interface ImageUploadPluginProps {
  onUpload: ImageUploadFn
}

export function ImageUploadPlugin({ onUpload }: ImageUploadPluginProps) {
  const [editor] = useLexicalComposerContext()
  const uploadRef = useRef(onUpload)
  uploadRef.current = onUpload
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toastTimerRef = useRef<number | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [tab, setTab] = useState<'upload' | 'url'>('upload')
  const [rootDragActive, setRootDragActive] = useState(false)
  const [dialogDragActive, setDialogDragActive] = useState(false)
  const [pendingUploads, setPendingUploads] = useState(0)
  const [dialogUploading, setDialogUploading] = useState(false)
  const [toast, setToast] = useState<null | {
    kind: 'success' | 'error'
    message: string
  }>(null)

  const [urlInput, setUrlInput] = useState('')
  const [urlPreview, setUrlPreview] = useState<string | null>(null)
  const [urlMeta, setUrlMeta] = useState<{
    width: number
    height: number
  } | null>(null)
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)

  const tabItems = useMemo(
    () => [
      { value: 'upload' as const, label: 'Upload' },
      { value: 'url' as const, label: 'URL' },
    ],
    [],
  )

  const pushToast = useCallback(
    (kind: 'success' | 'error', message: string) => {
      setToast({ kind, message })
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current)
      }
      toastTimerRef.current = window.setTimeout(setToast, 2200, null)
    },
    [],
  )

  const insertByUpload = useCallback(
    async (file: File, options?: { closeDialog?: boolean }) => {
      if (!isImageFile(file)) return false

      const closeDialog = Boolean(options?.closeDialog)

      setPendingUploads((value) => value + 1)
      if (closeDialog) setDialogUploading(true)

      try {
        const [result, meta] = await Promise.all([
          uploadRef.current(file),
          computeImageMeta(file),
        ])

        editor.update(() => {
          const node = $createImageNode({
            src: result.src,
            altText: result.altText ?? file.name,
            width: result.width ?? meta.width,
            height: result.height ?? meta.height,
            thumbhash: result.thumbhash ?? meta.thumbhash,
          })
          $insertNodes([node])
        })

        if (closeDialog) {
          setDialogOpen(false)
          setUrlInput('')
          setUrlPreview(null)
          setUrlMeta(null)
          setUrlError(null)
        }
        pushToast('success', 'Image uploaded')
        return true
      } catch (err: unknown) {
        console.error('[ImageUploadPlugin]', err)
        pushToast('error', 'Image upload failed')
        return false
      } finally {
        setPendingUploads((value) => Math.max(value - 1, 0))
        setDialogUploading(false)
      }
    },
    [editor, pushToast],
  )

  const handleFiles = useCallback(
    (files: File[]): boolean => {
      const images = files.filter(isImageFile)
      if (images.length === 0) return false

      for (const file of images) {
        void insertByUpload(file)
      }
      return true
    },
    [insertByUpload],
  )

  useEffect(() => {
    const unregisterDragDrop = editor.registerCommand(
      DRAG_DROP_PASTE,
      (files: File[]) => handleFiles(files),
      COMMAND_PRIORITY_HIGH,
    )

    const unregisterPaste = editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent | InputEvent | KeyboardEvent) => {
        const clipboardData =
          'clipboardData' in event
            ? (event as ClipboardEvent).clipboardData
            : null
        if (!clipboardData) return false

        const files = [...clipboardData.files]
        if (files.some(isImageFile)) {
          return handleFiles(files)
        }
        return false
      },
      COMMAND_PRIORITY_HIGH,
    )

    const unregisterOpenDialog = editor.registerCommand(
      OPEN_IMAGE_UPLOAD_DIALOG_COMMAND,
      () => {
        setDialogOpen(true)
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )

    const rootElement = editor.getRootElement()
    const wrapper = rootElement?.parentElement ?? null
    if (!wrapper) {
      return () => {
        unregisterDragDrop()
        unregisterPaste()
        unregisterOpenDialog()
      }
    }

    let dragCounter = 0

    const setWrapperDragging = (next: boolean) => {
      setRootDragActive(next)
      wrapper.classList.toggle(css.draggingWrapperClass, next)
    }

    const onDragEnter = (event: DragEvent) => {
      if (!hasImageData(event.dataTransfer)) return
      dragCounter += 1
      setWrapperDragging(true)
    }

    const onDragOver = (event: DragEvent) => {
      if (!hasImageData(event.dataTransfer)) return
      event.preventDefault()
    }

    const onDragLeave = () => {
      dragCounter = Math.max(dragCounter - 1, 0)
      if (dragCounter === 0) {
        setWrapperDragging(false)
      }
    }

    const onDrop = () => {
      dragCounter = 0
      setWrapperDragging(false)
    }

    rootElement?.addEventListener('dragenter', onDragEnter)
    rootElement?.addEventListener('dragover', onDragOver)
    rootElement?.addEventListener('dragleave', onDragLeave)
    rootElement?.addEventListener('drop', onDrop)

    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current)
      }
      unregisterDragDrop()
      unregisterPaste()
      unregisterOpenDialog()
      setWrapperDragging(false)
      rootElement?.removeEventListener('dragenter', onDragEnter)
      rootElement?.removeEventListener('dragover', onDragOver)
      rootElement?.removeEventListener('dragleave', onDragLeave)
      rootElement?.removeEventListener('drop', onDrop)
    }
  }, [editor, handleFiles])

  const resetUrlState = useCallback(() => {
    setUrlInput('')
    setUrlPreview(null)
    setUrlMeta(null)
    setUrlError(null)
    setUrlLoading(false)
  }, [])

  const handleDialogFile = useCallback(
    async (file: File | null) => {
      if (!file) return
      await insertByUpload(file, { closeDialog: true })
    },
    [insertByUpload],
  )

  const handleUrlPreview = useCallback(async () => {
    const nextUrl = urlInput.trim()
    if (!nextUrl) return
    if (!isSafeImageUrl(nextUrl)) {
      setUrlError('Unsupported URL scheme')
      return
    }

    setUrlLoading(true)
    setUrlError(null)
    try {
      const meta = await loadImageByUrl(nextUrl)
      setUrlMeta(meta)
      setUrlPreview(nextUrl)
    } catch {
      setUrlPreview(null)
      setUrlMeta(null)
      setUrlError('Could not load this image URL')
    } finally {
      setUrlLoading(false)
    }
  }, [urlInput])

  const handleInsertByUrl = useCallback(() => {
    if (!urlPreview || !isSafeImageUrl(urlPreview)) return

    editor.update(() => {
      const node = $createImageNode({
        src: urlPreview,
        altText: '',
        width: urlMeta?.width,
        height: urlMeta?.height,
      })
      $insertNodes([node])
    })
    pushToast('success', 'Image inserted')
    setDialogOpen(false)
    resetUrlState()
  }, [editor, pushToast, resetUrlState, urlMeta, urlPreview])

  const helperMessage =
    pendingUploads > 0
      ? `Uploading ${pendingUploads} image${pendingUploads > 1 ? 's' : ''}...`
      : rootDragActive
        ? 'Drop image files to upload'
        : null

  return (
    <>
      {(helperMessage || toast) && (
        <div className={css.toastStack}>
          {helperMessage && (
            <div className={`${css.toast} ${css.toastVariant.info}`}>
              <span className={css.spinner} />
              {helperMessage}
            </div>
          )}
          {toast && (
            <div className={`${css.toast} ${css.toastVariant[toast.kind]}`}>
              {toast.kind === 'success' ? (
                <Check size={12} />
              ) : (
                <Info size={12} />
              )}
              {toast.message}
            </div>
          )}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && dialogUploading) return
          setDialogOpen(nextOpen)
          if (!nextOpen) {
            resetUrlState()
            setDialogUploading(false)
            setDialogDragActive(false)
          }
        }}
      >
        <DialogPopup
          className={css.dialogPopup}
          showCloseButton={!dialogUploading}
        >
          <div className={css.dialogHeader}>
            <DialogTitle className={css.dialogTitle}>Insert image</DialogTitle>
          </div>

          <div className={css.dialogBody}>
            <div className={css.tabWrap}>
              <SegmentedControl
                items={tabItems}
                value={tab}
                onChange={setTab}
                fullWidth
              />
            </div>

            {tab === 'upload' ? (
              <div
                role="button"
                tabIndex={0}
                className={`${css.uploadDropzone} ${css.uploadDropzoneState[dialogUploading ? 'busy' : dialogDragActive ? 'active' : 'idle']}`}
                onClick={() => {
                  if (!dialogUploading) fileInputRef.current?.click()
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  if (!dialogUploading) fileInputRef.current?.click()
                }}
                onDragEnter={(event) => {
                  if (hasImageData(event.dataTransfer)) {
                    event.preventDefault()
                    setDialogDragActive(true)
                  }
                }}
                onDragOver={(event) => {
                  if (hasImageData(event.dataTransfer)) {
                    event.preventDefault()
                  }
                }}
                onDragLeave={() => setDialogDragActive(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  setDialogDragActive(false)
                  const file = [...event.dataTransfer.files].find(
                    isImageFile,
                  )
                  void handleDialogFile(file ?? null)
                }}
              >
                <input
                  ref={fileInputRef}
                  className={css.hiddenInput}
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0] ?? null
                    void handleDialogFile(file)
                    event.currentTarget.value = ''
                  }}
                />

                {dialogUploading ? (
                  <div className={css.uploadBusyWrap}>
                    <div className={css.uploadProgress}>
                      <span className={css.spinner} />
                      Uploading image...
                    </div>
                  </div>
                ) : (
                  <>
                    <span className={css.uploadDropIcon}>
                      <Upload size={18} />
                    </span>
                    <span className={css.uploadDropTitle}>
                      Click to upload or drag and drop
                    </span>
                    <span className={css.uploadDropDesc}>
                      PNG, JPG, GIF, WebP
                    </span>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className={css.urlInputRow}>
                  <input
                    className={css.textInput}
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={urlInput}
                    onChange={(event) => {
                      setUrlInput(event.target.value)
                      setUrlError(null)
                      setUrlPreview(null)
                      setUrlMeta(null)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        if (urlPreview) {
                          handleInsertByUrl()
                        } else {
                          void handleUrlPreview()
                        }
                      }
                    }}
                  />
                  <ActionButton
                    variant="outline"
                    size="md"
                    disabled={urlLoading || !urlInput.trim()}
                    onClick={() => void handleUrlPreview()}
                  >
                    {urlLoading ? 'Loading' : 'Preview'}
                  </ActionButton>
                  <ActionButton
                    variant="accent"
                    size="md"
                    disabled={!urlPreview}
                    onClick={handleInsertByUrl}
                  >
                    Insert
                  </ActionButton>
                </div>

                {urlError && (
                  <span
                    className={`${css.helperText} ${css.toastVariant.error}`}
                  >
                    <Info size={12} />
                    {urlError}
                  </span>
                )}

                {urlPreview && (
                  <div className={css.urlPreview}>
                    <img
                      className={css.urlPreviewImage}
                      src={urlPreview}
                      alt="Preview"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className={css.dialogFooter}>
            <span className={css.helperText}>
              <Link2 size={12} />
              You can also paste images or drag files directly into the editor.
            </span>
            <ActionBar>
              <ActionButton
                variant="outline"
                size="md"
                onClick={() => setDialogOpen(false)}
                disabled={dialogUploading}
              >
                Close
              </ActionButton>
            </ActionBar>
          </div>
        </DialogPopup>
      </Dialog>
    </>
  )
}
