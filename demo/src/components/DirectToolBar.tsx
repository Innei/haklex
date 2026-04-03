import { useState } from 'react';

import * as css from './direct-tool-bar.css';

interface DirectToolBarProps {
  onExecute: (toolName: string, params: Record<string, unknown>) => void;
}

type ActiveTool = 'insert_node' | 'replace_node' | 'delete_node' | 'search_document' | null;

const TOOLS: { name: ActiveTool & string; label: string }[] = [
  { name: 'search_document', label: 'Search' },
  { name: 'insert_node', label: 'Insert' },
  { name: 'replace_node', label: 'Replace' },
  { name: 'delete_node', label: 'Delete' },
];

export function DirectToolBar({ onExecute }: DirectToolBarProps) {
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);

  function handleToolClick(name: ActiveTool & string) {
    setActiveTool(activeTool === name ? null : name);
  }

  function handleSubmit(toolName: string, params: Record<string, unknown>) {
    onExecute(toolName, params);
    setActiveTool(null);
  }

  return (
    <div className={css.toolBar}>
      <div className={css.toolBarHeader}>
        <span className={css.toolBarLabel}>Direct Tools</span>
        <div className={css.toolButtons}>
          {TOOLS.map((tool) => (
            <button
              className={css.toolButton}
              data-active={activeTool === tool.name ? '' : undefined}
              key={tool.name}
              type="button"
              onClick={() => handleToolClick(tool.name)}
            >
              {tool.label}
            </button>
          ))}
        </div>
      </div>
      {activeTool && <ToolForm toolName={activeTool} onSubmit={handleSubmit} />}
    </div>
  );
}

function ToolForm({
  toolName,
  onSubmit,
}: {
  toolName: string;
  onSubmit: (toolName: string, params: Record<string, unknown>) => void;
}) {
  switch (toolName) {
    case 'search_document': {
      return <SearchForm onSubmit={(p) => onSubmit('search_document', p)} />;
    }
    case 'insert_node': {
      return <InsertForm onSubmit={(p) => onSubmit('insert_node', p)} />;
    }
    case 'replace_node': {
      return <ReplaceForm onSubmit={(p) => onSubmit('replace_node', p)} />;
    }
    case 'delete_node': {
      return <DeleteForm onSubmit={(p) => onSubmit('delete_node', p)} />;
    }
    default: {
      return null;
    }
  }
}

function SearchForm({ onSubmit }: { onSubmit: (params: Record<string, unknown>) => void }) {
  const [query, setQuery] = useState('');
  const [blockType, setBlockType] = useState('');

  return (
    <form
      className={css.toolForm}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ query, ...(blockType ? { blockType } : {}) });
      }}
    >
      <input
        className={css.toolInput}
        placeholder="Query text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <input
        className={css.toolInput}
        placeholder="Block type (optional)"
        value={blockType}
        onChange={(e) => setBlockType(e.target.value)}
      />
      <button className={css.toolSubmit} type="submit">
        Run
      </button>
    </form>
  );
}

function InsertForm({ onSubmit }: { onSubmit: (params: Record<string, unknown>) => void }) {
  const [posType, setPosType] = useState<'after' | 'before' | 'root'>('after');
  const [blockId, setBlockId] = useState('');
  const [index, setIndex] = useState('');
  const [nodeJson, setNodeJson] = useState(
    '{"type":"paragraph","children":[{"type":"text","text":"Hello","version":1}],"direction":"ltr","format":"","indent":0,"version":1,"textFormat":0,"textStyle":""}',
  );

  return (
    <form
      className={css.toolForm}
      onSubmit={(e) => {
        e.preventDefault();
        try {
          const node = JSON.parse(nodeJson);
          const position: Record<string, unknown> = { type: posType };
          if (posType !== 'root' && blockId) position.blockId = blockId;
          if (posType === 'root' && index) position.index = Number(index);
          onSubmit({ position, node });
        } catch {
          // invalid JSON, ignore
        }
      }}
    >
      <div className={css.toolRow}>
        <select
          className={css.toolSelect}
          value={posType}
          onChange={(e) => setPosType(e.target.value as 'after' | 'before' | 'root')}
        >
          <option value="after">after</option>
          <option value="before">before</option>
          <option value="root">root</option>
        </select>
        {posType !== 'root' ? (
          <input
            className={css.toolInput}
            placeholder="blockId"
            value={blockId}
            onChange={(e) => setBlockId(e.target.value)}
          />
        ) : (
          <input
            className={css.toolInput}
            placeholder="index (optional)"
            type="number"
            value={index}
            onChange={(e) => setIndex(e.target.value)}
          />
        )}
      </div>
      <textarea
        className={css.toolTextarea}
        placeholder="Node JSON"
        rows={3}
        value={nodeJson}
        onChange={(e) => setNodeJson(e.target.value)}
      />
      <button className={css.toolSubmit} type="submit">
        Run
      </button>
    </form>
  );
}

function ReplaceForm({ onSubmit }: { onSubmit: (params: Record<string, unknown>) => void }) {
  const [blockId, setBlockId] = useState('');
  const [nodeJson, setNodeJson] = useState(
    '{"type":"paragraph","children":[{"type":"text","text":"Replaced","version":1}],"direction":"ltr","format":"","indent":0,"version":1,"textFormat":0,"textStyle":""}',
  );

  return (
    <form
      className={css.toolForm}
      onSubmit={(e) => {
        e.preventDefault();
        try {
          const node = JSON.parse(nodeJson);
          onSubmit({ blockId, node });
        } catch {
          // invalid JSON, ignore
        }
      }}
    >
      <input
        className={css.toolInput}
        placeholder="blockId"
        value={blockId}
        onChange={(e) => setBlockId(e.target.value)}
      />
      <textarea
        className={css.toolTextarea}
        placeholder="Node JSON"
        rows={3}
        value={nodeJson}
        onChange={(e) => setNodeJson(e.target.value)}
      />
      <button className={css.toolSubmit} type="submit">
        Run
      </button>
    </form>
  );
}

function DeleteForm({ onSubmit }: { onSubmit: (params: Record<string, unknown>) => void }) {
  const [blockId, setBlockId] = useState('');

  return (
    <form
      className={css.toolForm}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ blockId });
      }}
    >
      <input
        className={css.toolInput}
        placeholder="blockId"
        value={blockId}
        onChange={(e) => setBlockId(e.target.value)}
      />
      <button className={css.toolSubmit} type="submit">
        Run
      </button>
    </form>
  );
}
