import { CornerDownLeft, Search } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { searchCatalog } from '../../site/catalog';

interface CommandPaletteProps {
  onClose: () => void;
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const results = useMemo(() => searchCatalog(query), [query]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      go(results[activeIndex].path);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="palette-layer">
      <div aria-hidden="true" className="palette-scrim" onClick={onClose} />
      <div aria-label="Search the site" aria-modal="true" className="palette" role="dialog">
        <label className="palette-input-row">
          <Search size={16} />
          <input
            autoFocus
            aria-activedescendant={results[activeIndex] ? `${listId}-${activeIndex}` : undefined}
            aria-controls={listId}
            aria-expanded="true"
            className="palette-input"
            placeholder="Search pages, nodes, extensions, presets…"
            role="combobox"
            value={query}
            onKeyDown={onKeyDown}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
          />
        </label>
        <div className="palette-list" id={listId} ref={listRef} role="listbox">
          {results.length === 0 && <div className="palette-empty">No results</div>}
          {results.map((entry, i) => (
            <div
              aria-selected={i === activeIndex}
              className="palette-option"
              data-index={i}
              id={`${listId}-${i}`}
              key={entry.path}
              role="option"
              tabIndex={-1}
              onClick={() => go(entry.path)}
              onMouseMove={() => setActiveIndex(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') go(entry.path);
              }}
            >
              <span>{entry.label}</span>
              <span className="palette-section">{entry.section}</span>
              {i === activeIndex && <CornerDownLeft className="palette-enter" size={14} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
