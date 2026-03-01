import { createContext, use } from 'react'

import type { LinkCardFetchContext } from './types'

const ctx = createContext<LinkCardFetchContext | undefined>(undefined)

export const LinkCardFetchProvider = ctx.Provider

export function useLinkCardFetchContext(): LinkCardFetchContext | undefined {
  return use(ctx)
}
