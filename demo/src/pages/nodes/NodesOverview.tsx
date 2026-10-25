import { useState } from 'react';

import { DocPage } from '../../components/doc/DocPage';
import { OverviewSection, Tile } from '../../components/doc/Overview';
import { nodeSketches } from '../../components/doc/sketches/node-sketches';
import { Segmented } from '../../components/ui/Segmented';
import { nodeSamples } from '../../fixtures';
import type { NodeTypeMeta } from '../../fixtures/node-types';
import { nodeTypes } from '../../fixtures/node-types';

type Category = NodeTypeMeta['category'];
type Filter = 'all' | Category;

const categories: { key: Category; label: string }[] = [
  { key: 'inline', label: 'Inline' },
  { key: 'block', label: 'Block' },
  { key: 'container', label: 'Container' },
];

const countOf = (c: Category) => nodeTypes.filter((t) => t.category === c).length;

const filterOptions = [
  {
    value: 'all' as Filter,
    label: (
      <>
        All <span className="seg-count">{nodeTypes.length}</span>
      </>
    ),
  },
  ...categories.map((c) => ({
    value: c.key as Filter,
    label: (
      <>
        {c.label} <span className="seg-count">{countOf(c.key)}</span>
      </>
    ),
  })),
];

export function NodesOverview() {
  const [filter, setFilter] = useState<Filter>('all');
  const visible = categories.filter((c) => filter === 'all' || filter === c.key);

  return (
    <DocPage
      wide
      breadcrumb={['Reference', 'Nodes']}
      lead={`${nodeTypes.length} node types with ${nodeSamples.length} samples. Each tile opens the node's page with its preview, edit mode and JSON.`}
      title="Nodes"
    >
      <div className="ov-filters">
        <Segmented label="Category" options={filterOptions} value={filter} onChange={setFilter} />
      </div>
      {visible.map((c) => {
        const types = nodeTypes.filter((t) => t.category === c.key);
        return (
          <OverviewSection count={types.length} key={c.key} title={c.label}>
            {types.map((t) => (
              <Tile
                code={t.type}
                count={t.sampleKeys.length}
                key={t.type}
                label={t.label}
                sketch={nodeSketches[t.type]}
                to={`/nodes/${t.type}`}
              />
            ))}
          </OverviewSection>
        );
      })}
    </DocPage>
  );
}
