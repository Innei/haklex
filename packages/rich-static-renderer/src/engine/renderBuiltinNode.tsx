import type { ReactNode } from 'react'

import * as tableStyles from '../table.css'

function textToSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replaceAll(/[^\w\s\u3001-\u9fff\uac00-\ud7af\uff00-\uffef-]/g, '')
    .replaceAll(/[\s_]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
}

function extractText(node: any): string {
  if (node.text) return node.text
  if (node.children) return node.children.map(extractText).join('')
  return ''
}

export function renderBuiltinNode(
  node: any,
  key: string,
  children: ReactNode[] | null,
  headingSlugs: Map<string, number>,
): ReactNode {
  switch (node.type) {
    case 'root':
      return <>{children}</>
    case 'paragraph': {
      const align = node.format
        ? ({ textAlign: node.format } as const)
        : undefined
      return (
        <p key={key} className="rich-paragraph" style={align}>
          {children}
        </p>
      )
    }
    case 'heading': {
      const Tag = node.tag as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      const text = extractText(node)
      const baseSlug = textToSlug(text)
      let slug = baseSlug
      if (baseSlug) {
        const count = headingSlugs.get(baseSlug)
        if (count !== undefined) {
          slug = `${baseSlug}-${count}`
          headingSlugs.set(baseSlug, count + 1)
        } else {
          headingSlugs.set(baseSlug, 1)
        }
      }
      return (
        <Tag key={key} id={slug || undefined} className={`rich-heading-${Tag}`}>
          {slug && (
            <a
              className="rich-heading-anchor"
              aria-hidden="true"
              tabIndex={-1}
              href={`#${slug}`}
            />
          )}
          {children}
        </Tag>
      )
    }
    case 'quote':
      return (
        <blockquote key={key} className="rich-quote">
          {children}
        </blockquote>
      )
    case 'list': {
      const Tag = node.listType === 'number' ? 'ol' : 'ul'
      const cls =
        node.listType === 'number'
          ? 'rich-list-ol'
          : node.listType === 'check'
            ? 'rich-checklist rich-list-ul'
            : 'rich-list-ul'
      return (
        <Tag
          key={key}
          className={cls}
          start={node.start !== 1 ? node.start : undefined}
        >
          {children}
        </Tag>
      )
    }
    case 'listitem': {
      const isChecklist = node.checked !== undefined
      const hasNestedList = node.children?.some((c: any) => c.type === 'list')
      let cls: string
      if (hasNestedList) {
        cls = 'rich-list-nested-item'
      } else if (isChecklist) {
        cls = node.checked
          ? 'rich-list-item rich-list-item-checked'
          : 'rich-list-item rich-list-item-unchecked'
      } else {
        cls = 'rich-list-item'
      }
      return (
        <li key={key} className={cls} value={node.value}>
          {children}
        </li>
      )
    }
    case 'link':
      return (
        <a
          key={key}
          className="rich-link"
          href={node.url}
          target={node.target}
          rel={node.rel}
        >
          {children}
        </a>
      )
    case 'autolink':
      return (
        <a
          key={key}
          className="rich-link"
          href={node.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      )
    case 'horizontalrule':
      return <hr key={key} className="rich-hr" />
    case 'table':
      return (
        <div key={key} className={tableStyles.tableWrapper}>
          <table className={tableStyles.table}>{children}</table>
        </div>
      )
    case 'tablerow':
      return <tr key={key}>{children}</tr>
    case 'tablecell': {
      const CellTag = node.headerState ? 'th' : 'td'
      const cls = node.headerState
        ? tableStyles.tableHead
        : tableStyles.tableCell
      return (
        <CellTag
          key={key}
          className={cls}
          colSpan={node.colSpan > 1 ? node.colSpan : undefined}
        >
          {children}
        </CellTag>
      )
    }
    case 'details': {
      const summary = node.summary || ''
      return (
        <details
          key={key}
          className="rich-details"
          open={node.open || undefined}
        >
          <summary className="rich-details-summary">
            <span className="rich-details-summary-text">{summary}</span>
            <span className="rich-details-chevron">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8L10 12L14 8" />
              </svg>
            </span>
          </summary>
          <div className="rich-details-content">{children}</div>
        </details>
      )
    }
    case 'spoiler':
      return (
        <span key={key} className="rich-spoiler" role="button" tabIndex={0}>
          {children}
        </span>
      )
    case 'code':
      return (
        <pre key={key} className="rich-code-block">
          <code>{children}</code>
        </pre>
      )
    case 'code-highlight':
      return <span key={key}>{node.text}</span>
    case 'linebreak':
      return <br key={key} />
    case 'tab':
      return <span key={key}>{'  '}</span>
    default:
      return null
  }
}
