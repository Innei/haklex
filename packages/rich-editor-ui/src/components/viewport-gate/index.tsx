import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

export interface ViewportGateProps {
  children: ReactNode
  fallback: ReactNode
  threshold?: number
}

export function ViewportGate({
  children,
  fallback,
  threshold = 0.5,
}: ViewportGateProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (visible) return
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [visible, threshold])

  if (visible) return <>{children}</>
  return <div ref={ref}>{fallback}</div>
}
