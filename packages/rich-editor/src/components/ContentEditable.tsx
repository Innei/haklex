import { ContentEditable as LexicalContentEditable } from '@lexical/react/LexicalContentEditable'

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
      className="rich-editor__content-wrapper"
      style={{
        position: 'relative',
        maxWidth: 'var(--rc-max-width, none)',
        margin: '0 auto',
      }}
    >
      <LexicalContentEditable
        className={clsx('rich-editor__content', className)}
        style={{
          outline: 'none',
          minHeight: '100px',
          padding: `${paddingTop}px 16px 12px`,
        }}
        aria-placeholder={placeholder ?? ''}
        placeholder={
          <div
            className="rich-editor__placeholder"
            style={{
              position: 'absolute',
              top: paddingTop,
              left: 16,
              color: 'var(--rich-editor-text-secondary, #999)',
              pointerEvents: 'none',
              userSelect: 'none',
              display: placeholder ? undefined : 'none',
            }}
          >
            {placeholder}
          </div>
        }
      />
    </div>
  )
}
