import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { DRAG_DROP_PASTE } from '@lexical/rich-text'
import { $insertNodes, COMMAND_PRIORITY_HIGH, PASTE_COMMAND } from 'lexical'
import { useEffect, useRef } from 'react'

import { $createImageNode } from '../nodes/ImageNode'
import { computeImageMeta } from '../utils/thumbhash'

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

interface ImageUploadPluginProps {
  onUpload: ImageUploadFn
}

export function ImageUploadPlugin({ onUpload }: ImageUploadPluginProps) {
  const [editor] = useLexicalComposerContext()
  const uploadRef = useRef(onUpload)
  uploadRef.current = onUpload

  useEffect(() => {
    let isActive = true

    const handleFiles = (files: File[]): boolean => {
      const images = files.filter(isImageFile)
      if (images.length === 0) return false

      for (const file of images) {
        Promise.all([uploadRef.current(file), computeImageMeta(file)])
          .then(([result, meta]) => {
            if (!isActive) return
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
          })
          .catch((err: unknown) => {
            if (!isActive) return
            console.error('[ImageUploadPlugin]', err)
          })
      }
      return true
    }

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

        const files = Array.from(clipboardData.files)
        if (files.some(isImageFile)) {
          return handleFiles(files)
        }
        return false
      },
      COMMAND_PRIORITY_HIGH,
    )

    return () => {
      isActive = false
      unregisterDragDrop()
      unregisterPaste()
    }
  }, [editor])

  return null
}
