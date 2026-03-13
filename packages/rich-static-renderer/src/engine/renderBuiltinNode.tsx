import {
  detailsClassNames,
  detailsStyles,
  getTagBgColor,
  LinkFavicon,
  RendererWrapper,
  RubyRenderer,
  semanticClassNames,
  type SharedStyleKey,
  sharedStyles,
} from '@haklex/rich-editor/static';
import { Link } from 'lucide-react';
import { createElement, type ReactNode } from 'react';

import { HtmlComment } from '../components/HtmlComment';
import * as tableStyles from '../table.css';

const shared = (key: SharedStyleKey): string => `${semanticClassNames[key]} ${sharedStyles[key]}`;
const headingClassNames = {
  h1: shared('headingH1'),
  h2: shared('headingH2'),
  h3: shared('headingH3'),
  h4: shared('headingH4'),
  h5: shared('headingH5'),
  h6: shared('headingH6'),
} as const;

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
  if (node.type === 'comment') return '';
  if (node.text) return node.text;
  if (node.children) return node.children.map(extractText).join('');
  return '';
}

export function renderBuiltinNode(
  node: any,
  key: string,
  children: ReactNode[] | null,
  headingSlugs: Map<string, number>,
  _textContent?: string,
): ReactNode {
  switch (node.type) {
    case 'root': {
      return <>{children}</>;
    }
    case 'paragraph': {
      const align = node.format ? ({ textAlign: node.format } as const) : undefined;
      return (
        <p className={shared('paragraph')} key={key} style={align}>
          {children}
        </p>
      );
    }
    case 'heading': {
      const Tag = node.tag as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      const text = extractText(node);
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
        <Tag className={headingClassNames[Tag]} id={slug || undefined} key={key}>
          {slug && (
            <a className={shared('headingAnchor')} href={`#${slug}`} tabIndex={0}>
              <Link aria-hidden size={14} strokeWidth={2} />
            </a>
          )}
          {children}
        </Tag>
      );
    }
    case 'quote': {
      return (
        <blockquote className={shared('quote')} key={key}>
          {children}
        </blockquote>
      );
    }
    case 'list': {
      const Tag = node.listType === 'number' ? 'ol' : 'ul';
      const cls =
        node.listType === 'number'
          ? shared('listOl')
          : node.listType === 'check'
            ? `${shared('checklist')} ${shared('listUl')}`
            : shared('listUl');
      return (
        <Tag className={cls} key={key} start={node.start !== 1 ? node.start : undefined}>
          {children}
        </Tag>
      );
    }
    case 'listitem': {
      const isChecklist = node.checked !== undefined;
      const hasNestedList = node.children?.some((c: any) => c.type === 'list');
      const value = typeof node.value === 'number' && node.value > 1 ? node.value : undefined;
      let cls: string;
      if (hasNestedList) {
        cls = shared('listNestedItem');
      } else if (isChecklist) {
        cls = node.checked
          ? `${shared('listItem')} ${shared('listItemChecked')}`
          : `${shared('listItem')} ${shared('listItemUnchecked')}`;
      } else {
        cls = shared('listItem');
      }
      return (
        <li className={cls} key={key} value={value}>
          {children}
        </li>
      );
    }
    case 'link': {
      return (
        <a
          className={shared('link')}
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
        <a className={shared('link')} href={node.url} key={key} rel="noopener" target="_blank">
          <LinkFavicon href={node.url} />
          {children}
        </a>
      );
    }
    case 'horizontalrule': {
      return <hr className={shared('hr')} key={key} />;
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
        <details
          className={`${detailsClassNames.details} ${detailsStyles.details}`}
          key={key}
          open={node.open || undefined}
        >
          <summary className={`${detailsClassNames.summary} ${detailsStyles.summary}`}>
            <span
              aria-hidden="true"
              className={`${detailsClassNames.chevron} ${detailsStyles.chevron}`}
            >
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
            <span className={`${detailsClassNames.summaryText} ${detailsStyles.summaryText}`}>
              {summary}
            </span>
          </summary>
          <div className={`${detailsClassNames.content} ${detailsStyles.content}`}>{children}</div>
        </details>
      );
    }
    case 'spoiler': {
      return (
        <span className={shared('spoiler')} key={key} role="button" tabIndex={0}>
          {children}
        </span>
      );
    }
    case 'tag': {
      return (
        <span
          className={shared('tag')}
          key={key}
          style={{ backgroundColor: getTagBgColor(node.text) }}
        >
          {node.text}
        </span>
      );
    }
    case 'comment': {
      return <HtmlComment key={key} text={node.text ?? ''} />;
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
