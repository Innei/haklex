import { getBuiltinItems, SlashMenuList } from '@haklex/rich-plugin-slash-menu';
import { useMemo, useState } from 'react';

import { StateCell } from '../../../components/preview/States';

const noop = () => {};

function FrozenList({ query }: { query: string }) {
  const [anchor, setAnchor] = useState<HTMLSpanElement | null>(null);
  const options = useMemo(() => {
    const items = getBuiltinItems();
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) => item.title.toLowerCase().includes(q) || item.keywords.some((k) => k.includes(q)),
    );
  }, [query]);

  return (
    <div className="slash-frozen">
      <span className="slash-anchor" ref={setAnchor}>{`/${query}`}</span>
      {anchor && (
        <SlashMenuList
          anchorElement={anchor}
          options={options}
          selectOptionAndCleanUp={noop}
          selectedIndex={options.length > 0 ? 0 : null}
          setHighlightedIndex={noop}
        />
      )}
    </div>
  );
}

export function SlashStates() {
  return (
    <div className="slash-states">
      <StateCell label="No query">
        <FrozenList query="" />
      </StateCell>
      <StateCell label="Filtered: /head">
        <FrozenList query="head" />
      </StateCell>
      <StateCell label="No results: /zzz">
        <FrozenList query="zzz" />
      </StateCell>
    </div>
  );
}
