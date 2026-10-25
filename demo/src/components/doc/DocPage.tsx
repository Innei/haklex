import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { pagerFor } from '../../site/catalog';
import { slugify } from '../../site/slugify';

interface TocEntry {
  id: string;
  label: string;
}

interface DocPageProps {
  aside?: ReactNode;
  breadcrumb: string[];
  children: ReactNode;
  lead?: ReactNode;
  meta?: ReactNode;
  title: string;
  wide?: boolean;
}

function useToc(articleRef: React.RefObject<HTMLElement | null>, key: string) {
  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string>();

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;
    const root = article.closest('.app-main');
    let observed: HTMLHeadingElement[] = [];
    const observer = new IntersectionObserver(
      (records) => {
        const visible = records.filter((r) => r.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { root, rootMargin: '0px 0px -70% 0px' },
    );

    const scan = () => {
      const headings = [
        ...article.querySelectorAll<HTMLHeadingElement>(
          'h2.doc-h2, h2.panel-title, h2.chart-sample-title',
        ),
      ];
      if (headings.length === observed.length && headings.every((h, i) => h === observed[i])) {
        return;
      }
      for (const h of headings) {
        if (!h.id) h.id = slugify(h.textContent ?? '');
      }
      observer.disconnect();
      for (const h of headings) observer.observe(h);
      observed = headings;
      setEntries(headings.map((h) => ({ id: h.id, label: h.textContent ?? '' })));
      setActiveId((prev) => prev ?? headings[0]?.id);
    };

    scan();
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash) document.getElementById(hash)?.scrollIntoView();

    const mutations = new MutationObserver(scan);
    mutations.observe(article, { childList: true, subtree: true });
    return () => {
      mutations.disconnect();
      observer.disconnect();
      setActiveId(undefined);
    };
  }, [articleRef, key]);

  return { entries, activeId };
}

export function DocPage({ aside, breadcrumb, children, lead, meta, title, wide }: DocPageProps) {
  const location = useLocation();
  const articleRef = useRef<HTMLElement>(null);
  const { entries, activeId } = useToc(articleRef, location.pathname);
  const { prev, next } = pagerFor(location.pathname);
  const showToc = !wide && entries.length > 1;

  return (
    <div className={wide ? 'doc doc-wide' : 'doc'}>
      <article className="doc-article" ref={articleRef}>
        <nav aria-label="Breadcrumb" className="doc-crumbs">
          {breadcrumb.map((part, i) => (
            <span key={part}>
              {i > 0 && <span aria-hidden="true">/</span>}
              {part}
            </span>
          ))}
        </nav>
        {aside ? (
          <div className="doc-title-row">
            <h1 className="doc-title">{title}</h1>
            {aside}
          </div>
        ) : (
          <h1 className="doc-title">{title}</h1>
        )}
        {lead && <p className="doc-lead">{lead}</p>}
        {meta && <div className="doc-meta">{meta}</div>}
        <div className="doc-body">{children}</div>
        {(prev || next) && (
          <nav aria-label="Pagination" className="doc-pager">
            {prev ? (
              <Link to={prev.path}>
                <span>Previous</span>
                {prev.label}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link className="doc-pager-next" to={next.path}>
                <span>Next</span>
                {next.label}
              </Link>
            )}
          </nav>
        )}
      </article>
      {showToc && (
        <aside aria-label="On this page" className="doc-toc">
          <div className="doc-toc-title">On this page</div>
          <div className="doc-toc-list">
            {entries.map((e) => (
              <a
                aria-current={e.id === activeId ? 'location' : undefined}
                className="doc-toc-link"
                href={`#${e.id}`}
                key={e.id}
              >
                {e.label}
              </a>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
