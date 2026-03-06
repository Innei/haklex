import { ContentEditable as LexicalContentEditable } from '@lexical/react/LexicalContentEditable'

import * as styles from './ContentEditable.css'
import { clsx } from './utils'

interface ContentEditableProps {
  className?: string
  placeholder?: string
  hasHeader?: boolean
}

export function ContentEditable({
  className,
  placeholder,
  hasHeader,
}: ContentEditableProps) {
  const paddingTop = hasHeader ? 40 : 12
  return (
    <div
      className={clsx('rich-editor__content-wrapper', styles.contentWrapper)}
      style={{ '--ce-padding-top': `${paddingTop}px` } as React.CSSProperties}
    >
      <LexicalContentEditable
        className={clsx('rich-editor__content', styles.content, className)}
        aria-placeholder={placeholder ?? ''}
        placeholder={
          <div
            className={clsx('rich-editor__placeholder', styles.placeholder)}
            style={{ display: placeholder ? undefined : 'none' }}
          >
            {placeholder}
          </div>
        }
      />
    </div>
  )
}
