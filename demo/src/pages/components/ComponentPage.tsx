import type { ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { DocPage } from '../../components/doc/DocPage';
import { ThemeFrame, ThemePair } from '../../components/preview/ThemeFrame';
import { useTheme } from '../../context/ThemeContext';
import type { ComponentKind } from '../../site/components';
import { categoryLabel, componentLists, reviewKey } from '../../site/components';
import { reviewOf } from '../../site/reviews';
import { chromeDemos } from '../chrome/demos';
import { uiDemos } from '../ui/demos';
import { ReviewChip, StyleReview } from './ReviewParts';
import type { ComponentDemo } from './types';

const demosByKind: Record<ComponentKind, Record<string, ComponentDemo>> = {
  ui: uiDemos,
  chrome: chromeDemos,
};

function Section({
  children,
  note,
  title,
}: {
  children: ReactNode;
  note?: ReactNode;
  title: string;
}) {
  return (
    <section className="doc-section">
      <h2 className="doc-h2">{title}</h2>
      {note && <p className="doc-note">{note}</p>}
      {children}
    </section>
  );
}

function SpecTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <table className="doc-table">
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((cells, i) => (
          <tr key={i}>
            {cells.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ComponentPage({ kind }: { kind: ComponentKind }) {
  const { id } = useParams();
  const theme = useTheme();
  const list = componentLists[kind];
  const meta = list.items.find((c) => c.id === id);
  if (!meta) return <Navigate replace to={`/${kind}`} />;
  const demo = demosByKind[kind][meta.id];
  const review = reviewOf(reviewKey(kind, meta.id));
  const { Preview, States } = demo;

  return (
    <DocPage
      wide
      aside={<ReviewChip status={review.status} />}
      breadcrumb={['Components', list.title, categoryLabel(kind, meta.category)]}
      lead={meta.description}
      title={meta.label}
      meta={
        <>
          {kind === 'ui' && <span className="chip-code">{meta.id}</span>}
          <span className="badge">{`@haklex/${meta.packageName}`}</span>
        </>
      }
    >
      <div key={meta.id}>
        <Section
          title={kind === 'ui' ? 'Preview' : 'In the editor'}
          note={
            demo.note ??
            'Light and dark side by side, same component. Compare fills, lines and shadow depth.'
          }
        >
          <ThemePair stageClassName={demo.stageClassName}>
            {(frameTheme) => <Preview theme={frameTheme} />}
          </ThemePair>
        </Section>
        <Section note={demo.statesNote} title="States">
          {States ? (
            <ThemeFrame stageClassName={demo.stageClassName} theme={theme}>
              <States />
            </ThemeFrame>
          ) : null}
        </Section>
        {demo.keyboard && (
          <Section title="Keyboard">
            <SpecTable
              head={['Keys', 'Action']}
              rows={demo.keyboard.map(([keys, action]) => [<kbd key={keys}>{keys}</kbd>, action])}
            />
          </Section>
        )}
        <Section note="What each part should read from Quiet Ink." title="Anatomy">
          <SpecTable
            head={['Part', 'Spec', 'Token']}
            rows={meta.anatomy.map((r) => [r.part, r.spec, <code key="t">{r.token}</code>])}
          />
        </Section>
        <Section note={`Exports from @haklex/${meta.packageName}.`} title="Parts">
          <SpecTable
            head={['Export', 'Props worth knowing']}
            rows={meta.parts.map((r) => [<code key="n">{r.name}</code>, r.props])}
          />
        </Section>
        <Section
          note="Findings live in demo/src/site/reviews.ts, one row each, with the token or spec they break."
          title="Style review"
        >
          <StyleReview review={review} />
        </Section>
      </div>
    </DocPage>
  );
}
