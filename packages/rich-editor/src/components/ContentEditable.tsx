import { ContentEditable as LexicalContentEditable } from '@lexical/react/LexicalContentEditable'

import { clsx } from './utils'

interface ContentEditableProps {
  className?: string
  placeholder?: string
}

export function ContentEditable({
  className,
  placeholder,
}: ContentEditableProps) {
  return (
    <div
      className="rich-editor__content-wrapper"
      style={{ position: 'relative' }}
    >
      <LexicalContentEditable
        className={clsx('rich-editor__content', className)}
        style={{
          outline: 'none',
          minHeight: '100px',
          padding: '12px 16px',
        }}
        aria-placeholder={placeholder ?? ''}
        placeholder={
          <div
            className="rich-editor__placeholder"
            style={{
              position: 'absolute',
              top: '12px',
              left: '16px',
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
