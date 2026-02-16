import type { ComponentType } from 'react'
import { createContext, use } from 'react'

export type EmbedRendererComponent = ComponentType<{
  url: string
  type: string | null
}>

export type EmbedRendererMap = Partial<Record<string, EmbedRendererComponent>>

const EmbedRendererCtx = createContext<EmbedRendererMap>({})

export const EmbedRendererProvider = EmbedRendererCtx.Provider

export function useEmbedRenderers(): EmbedRendererMap {
  return use(EmbedRendererCtx)
}
