import type { ReactNode } from 'react'
import { createContext, use } from 'react'

export function getStrictContext<T>(
  name?: string,
): readonly [
  (props: { value: T; children?: ReactNode }) => ReactNode,
  () => T,
] {
  const Context = createContext<T | undefined>(undefined)

  const Provider = ({
    value,
    children,
  }: {
    value: T
    children?: ReactNode
  }) => <Context.Provider value={value}>{children}</Context.Provider>

  const useSafeContext = () => {
    const ctx = use(Context)
    if (ctx === undefined) {
      throw new Error(`useContext must be used within ${name ?? 'a Provider'}`)
    }
    return ctx
  }

  return [Provider, useSafeContext] as const
}
