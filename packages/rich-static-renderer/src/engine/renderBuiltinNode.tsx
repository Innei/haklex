import { LinkFavicon, RendererWrapper, RubyRenderer } from '@haklex/rich-editor/static';
import { Link } from 'lucide-react';
import { createElement, type ReactNode } from 'react';

import * as tableStyles from '../table.css';

function textToSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // eslint-disable-next-line regexp/no-dupe-characters-character-class
      .replaceAll(/[^\s\w\u3000-\u9FFF\uAC00-\uD7AF\uFF00-\uFFEF-]/g, '')
      .replaceAll(/[\s_]+/g, '-')
      .replaceAll(/^-+|-+$/g, '')
  );
}

function extractText(node: any): string {
  if (node.text) return node.text;
  if (node.children) return node.children.map(extractText).join('');
  return '';
}

export function renderBuiltinNode(
  node: any,
  key: string,
  children: ReactNode[] | null,
  headingSlugs: Map<string, number>,
  textContent?: string,
): ReactNode {
  switch (node.type) {
    case 'root': {
      return <>{children}</>;
    }
    case 'paragraph': {
      const align = node.format ? ({ textAlign: node.format } as const) : undefined;
      return (
        <p className="rich-paragraph" key={key} style={align}>
          {children}
        </p>
      );
    }
    case 'heading': {
      const Tag = node.tag as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      const text = textContent || extractText(node);
      const baseSlug = textToSlug(text);
      let slug = baseSlug;
      if (baseSlug) {
        const count = headingSlugs.get(baseSlug);
        if (count !== undefined) {
          slug = `${baseSlug}-${count}`;
          headingSlugs.set(baseSlug, count + 1);
        } else {
          headingSlugs.set(baseSlug, 1);
        }
      }
      return (
        <Tag className={`rich-heading-${Tag}`} id={slug || undefined} key={key}>
          {slug && (
            <a className="rich-heading-anchor" href={`#${slug}`} tabIndex={0}>
              <Link aria-hidden size={14} strokeWidth={2} />
            </a>
          )}
          {children}
        </Tag>
      );
    }
    case 'quote': {
      return (
        <blockquote className="rich-quote" key={key}>
          {children}
        </blockquote>
      );
    }
    case 'list': {
      const Tag = node.listType === 'number' ? 'ol' : 'ul';
      const cls =
        node.listType === 'number'
          ? 'rich-list-ol'
          : node.listType === 'check'
            ? 'rich-checklist rich-list-ul'
            : 'rich-list-ul';
      return (
        <Tag className={cls} key={key} start={node.start !== 1 ? node.start : undefined}>
          {children}
        </Tag>
      );
    }
    case 'listitem': {
      const isChecklist = node.checked !== undefined;
      const hasNestedList = node.children?.some((c: any) => c.type === 'list');
      let cls: string;
      if (hasNestedList) {
        cls = 'rich-list-nested-item';
      } else if (isChecklist) {
        cls = node.checked
          ? 'rich-list-item rich-list-item-checked'
          : 'rich-list-item rich-list-item-unchecked';
      } else {
        cls = 'rich-list-item';
      }
      return (
        <li className={cls} key={key} value={node.value}>
          {children}
        </li>
      );
    }
    case 'link': {
      return (
        <a
          className="rich-link"
          href={node.url}
          key={key}
          rel={node.rel || 'noopener'}
          target={node.target || '_blank'}
        >
          <LinkFavicon href={node.url} />
          {children}
        </a>
      );
    }
    case 'autolink': {
      return (
        <a className="rich-link" href={node.url} key={key} rel="noopener" target="_blank">
          <LinkFavicon href={node.url} />
          {children}
        </a>
      );
    }
    case 'horizontalrule': {
      return <hr className="rich-hr" key={key} />;
    }
    case 'table': {
      return (
        <div className={tableStyles.tableWrapper} key={key}>
          <table className={tableStyles.table}>{children}</table>
        </div>
      );
    }
    case 'tablerow': {
      return <tr key={key}>{children}</tr>;
    }
    case 'tablecell': {
      const CellTag = node.headerState ? 'th' : 'td';
      const cls = node.headerState ? tableStyles.tableHead : tableStyles.tableCell;
      return (
        <CellTag className={cls} colSpan={node.colSpan > 1 ? node.colSpan : undefined} key={key}>
          {children}
        </CellTag>
      );
    }
    case 'details': {
      const summary = node.summary || '';
      return (
        <details className="rich-details" key={key} open={node.open || undefined}>
          <summary className="rich-details-summary">
            <span aria-hidden="true" className="rich-details-chevron">
              <svg
                fill="none"
                height="20"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                viewBox="0 0 20 20"
                width="20"
              >
                <path d="M8 6L12 10L8 14" />
              </svg>
            </span>
            <span className="rich-details-summary-text">{summary}</span>
          </summary>
          <div className="rich-details-content">{children}</div>
        </details>
      );
    }
    case 'spoiler': {
      return (
        <span className="rich-spoiler" key={key} role="button" tabIndex={0}>
          {children}
        </span>
      );
    }
    case 'ruby': {
      return createElement(RendererWrapper as any, {
        key,
        rendererKey: 'Ruby',
        defaultRenderer: RubyRenderer,
        props: {
          reading: node.reading ?? '',
          children,
        },
      });
    }
    case 'code': {
      return (
        <pre className="rich-code-block" key={key}>
          <code>{children}</code>
        </pre>
      );
    }
    case 'code-highlight': {
      return <span key={key}>{node.text}</span>;
    }
    case 'linebreak': {
      return <br key={key} />;
    }
    case 'tab': {
      return <span key={key}>{'  '}</span>;
    }
    default: {
      return null;
    }
  }
}
