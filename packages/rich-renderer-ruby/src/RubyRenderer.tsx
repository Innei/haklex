import type { RubyRendererProps } from '@haklex/rich-editor'

import * as styles from './styles.css'

export type { RubyRendererProps }

export function RubyRenderer({ reading, children }: RubyRendererProps) {
  if (!reading) {
    return <>{children}</>
  }

  return (
    <ruby className={`${styles.ruby} ${styles.semanticClassNames.ruby}`}>
      {children}
      <rt className={`${styles.rt} ${styles.semanticClassNames.rubyRt}`}>
        {reading}
      </rt>
    </ruby>
  )
}

export default RubyRenderer
