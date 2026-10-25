import { useState } from 'react';

import { DocPage } from '../../components/doc/DocPage';
import { OverviewSection, Tile } from '../../components/doc/Overview';
import { chromeSketches, uiSketches } from '../../components/doc/sketches/component-sketches';
import { Segmented } from '../../components/ui/Segmented';
import type { ComponentKind } from '../../site/components';
import { componentLists, reviewKey } from '../../site/components';
import type { ReviewStatus } from '../../site/reviews';
import { countByStatus, reviewOf, reviewStatusLabels } from '../../site/reviews';
import { StatusDotMark } from './ReviewParts';

const sketches = { ui: uiSketches, chrome: chromeSketches };

const leads: Record<ComponentKind, string> = {
  ui: 'Primitives from @haklex/rich-editor-ui that the editor chrome and dialogs are built from. Each page shows the real component in light and dark, its states, the spec it should meet and the review findings.',
  chrome:
    'The parts of the editor around the text: bars, menus and in-place controls from the rich-plugin-* packages. Each page mounts only the plugin it describes.',
};

const statusOrder: ReviewStatus[] = ['unreviewed', 'issues', 'passed'];

function Count({ label, n }: { label: string; n: number }) {
  return (
    <>
      {label} <span className="seg-count">{n}</span>
    </>
  );
}

export function ComponentsOverview({ kind }: { kind: ComponentKind }) {
  const { categories, items, title } = componentLists[kind];
  const [category, setCategory] = useState<string>('all');
  const [status, setStatus] = useState<'all' | ReviewStatus>('all');
  const keys = items.map((c) => reviewKey(kind, c.id));
  const statusCounts = countByStatus(keys);

  const categoryOptions = [
    { value: 'all', label: <Count label="All" n={items.length} /> },
    ...categories.map((c) => ({
      value: c.key as string,
      label: <Count label={c.label} n={items.filter((i) => i.category === c.key).length} />,
    })),
  ];
  const statusOptions = [
    { value: 'all' as const, label: 'Any status' },
    ...statusOrder.map((s) => ({
      value: s,
      label: <Count label={reviewStatusLabels[s]} n={statusCounts[s]} />,
    })),
  ];

  const visible = categories.filter((c) => category === 'all' || category === c.key);

  return (
    <DocPage wide breadcrumb={['Components', title]} lead={leads[kind]} title={title}>
      <div className="ov-filters">
        <Segmented
          label="Category"
          options={categoryOptions}
          value={category}
          onChange={setCategory}
        />
        <Segmented label="Review" options={statusOptions} value={status} onChange={setStatus} />
      </div>
      {visible.map((c) => {
        const group = items.filter(
          (item) =>
            item.category === c.key &&
            (status === 'all' || reviewOf(reviewKey(kind, item.id)).status === status),
        );
        if (group.length === 0) return null;
        return (
          <OverviewSection count={group.length} key={c.key} title={c.label}>
            {group.map((item) => (
              <Tile
                code={kind === 'ui' ? item.id : item.packageName}
                key={item.id}
                label={item.label}
                marker={<StatusDotMark status={reviewOf(reviewKey(kind, item.id)).status} />}
                sketch={sketches[kind][item.id]}
                to={`/${kind}/${item.id}`}
              />
            ))}
          </OverviewSection>
        );
      })}
    </DocPage>
  );
}
