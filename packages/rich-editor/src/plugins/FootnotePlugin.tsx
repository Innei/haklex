import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $nodesOfType } from 'lexical'
import { useEffect, useState } from 'react'

import { FootnoteDefinitionsProvider } from '../context/FootnoteDefinitionsContext'
import { FootnoteNode } from '../nodes/FootnoteNode'
import { FootnoteSectionNode } from '../nodes/FootnoteSectionNode'

export function FootnotePlugin({ children }: { children?: React.ReactNode }) {
  const [editor] = useLexicalComposerContext()
  const [definitions, setDefinitions] = useState<Record<string, string>>({})
  const [displayNumberMap, setDisplayNumberMap] = useState<
    Record<string, number>
  >({})

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
