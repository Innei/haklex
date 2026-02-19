import type { ReactNode } from 'react'
import { createContext, use, useMemo } from 'react'

export interface FootnoteDefinitionsContextValue {
  definitions: Record<string, string>
  displayNumberMap: Record<string, number>
}

const FootnoteDefinitionsContext =
  createContext<FootnoteDefinitionsContextValue>({
    definitions: {},
    displayNumberMap: {},
  })

export function FootnoteDefinitionsProvider({
  definitions,
  displayNumberMap,
  children,
}: FootnoteDefinitionsContextValue & { children: ReactNode }) {
  const value = useMemo(
    () => ({ definitions, displayNumberMap }),
    [definitions, displayNumberMap],
  )
  return (
    <FootnoteDefinitionsContext value={value}>
      {children}
    </FootnoteDefinitionsContext>
  )
}

export function useFootnoteDefinitions(): FootnoteDefinitionsContextValue {
  return use(FootnoteDefinitionsContext)
}

export function useFootnoteContent(identifier: string): string | undefined {
  const { definitions } = use(FootnoteDefinitionsContext)
  return definitions[identifier]
}

export function useFootnoteDisplayNumber(
  identifier: string,
): number | undefined {
  const { displayNumberMap } = use(FootnoteDefinitionsContext)
  return displayNumberMap[identifier]
}
