import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot, $nodesOfType, $parseSerializedNode } from 'lexical'
import { useEffect, useRef, useState } from 'react'

import { FootnoteDefinitionsProvider } from '../context/FootnoteDefinitionsContext'
import { FootnoteNode } from '../nodes/FootnoteNode'
import { FootnoteSectionNode } from '../nodes/FootnoteSectionNode'

export function FootnotePlugin({ children }: { children?: React.ReactNode }) {
  const [editor] = useLexicalComposerContext()
  const [definitions, setDefinitions] = useState<Record<string, string>>({})
  const [displayNumberMap, setDisplayNumberMap] = useState<
    Record<string, number>
  >({})
  const pendingUpdateRef = useRef(false)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const footnoteNodes = $nodesOfType(FootnoteNode)
        const seen = new Set<string>()
        const numberMap: Record<string, number> = {}
        let counter = 1
        for (const node of footnoteNodes) {
          const id = node.getIdentifier()
          if (!seen.has(id)) {
            seen.add(id)
            numberMap[id] = counter++
          }
        }
        setDisplayNumberMap(numberMap)

        const sectionNodes = $nodesOfType(FootnoteSectionNode)

        if (sectionNodes.length > 0) {
          setDefinitions(sectionNodes[0].getDefinitions())
        } else {
          setDefinitions({})
        }

        if (!editor.isEditable() || pendingUpdateRef.current) return

        if (footnoteNodes.length === 0 && sectionNodes.length > 0) {
          pendingUpdateRef.current = true
          queueMicrotask(() => {
            editor.update(() => {
              const sections = $nodesOfType(FootnoteSectionNode)
              for (const s of sections) s.remove()
            })
            pendingUpdateRef.current = false
          })
          return
        }

        if (footnoteNodes.length > 0 && sectionNodes.length === 0) {
          const seenSnapshot = [...seen]
          pendingUpdateRef.current = true
          queueMicrotask(() => {
            editor.update(() => {
              const root = $getRoot()
              const defs: Record<string, string> = {}
              for (const id of seenSnapshot) {
                defs[id] = ''
              }
              const section = $parseSerializedNode({
                type: 'footnote-section',
                definitions: defs,
                version: 1,
              } as any)
              root.append(section)
            })
            pendingUpdateRef.current = false
          })
        } else if (sectionNodes.length > 0) {
          const existingDefs = sectionNodes[0].getDefinitions()
          const missingIds = [...seen].filter((id) => !(id in existingDefs))
          const orphanIds = Object.keys(existingDefs).filter(
            (id) => !seen.has(id),
          )
          if (missingIds.length > 0 || orphanIds.length > 0) {
            pendingUpdateRef.current = true
            queueMicrotask(() => {
              editor.update(() => {
                const freshSections = $nodesOfType(FootnoteSectionNode)
                if (freshSections.length > 0) {
                  for (const id of missingIds) {
                    freshSections[0].setDefinition(id, '')
                  }
                  for (const id of orphanIds) {
                    freshSections[0].removeDefinition(id)
                  }
                }
              })
              pendingUpdateRef.current = false
            })
          }
        }
      })
    })
  }, [editor])

  return (
    <FootnoteDefinitionsProvider
      definitions={definitions}
      displayNumberMap={displayNumberMap}
    >
      {children}
    </FootnoteDefinitionsProvider>
  )
}
