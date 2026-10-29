import { RendererWrapper } from '@haklex/rich-editor/static';
import {
  ActionButton,
  Popover,
  PopoverHeader,
  PopoverPanel,
  PopoverTrigger,
  toast,
} from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import type { NodeKey } from 'lexical';
import { $getNodeByKey } from 'lexical';
import { ChartColumn, Code, Copy, SlidersHorizontal, Table2 } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';

import { ChartBlockRenderer } from './ChartBlockRenderer';
import { $isChartNode } from './ChartNode';
import type { ChartViewMode } from './ChartView';
import { ChartRenderer } from './ChartView';
import { ChartConfigPanel } from './config/ChartConfigPanel';
import { popup as configPopup } from './config/config.css';
import * as s from './edit.css';
import type { ChartSlotProps } from './slot';
import { CHART_NODE_KEY } from './slot';
import { parseChartSource } from './validate';

export interface ChartEditRendererProps extends ChartSlotProps {
  nodeKey: NodeKey;
}

export function ChartEditRenderer(props: ChartEditRendererProps) {
  const isEditable = useLexicalEditable();
  if (!isEditable) {
    return (
      <RendererWrapper
        defaultRenderer={ChartBlockRenderer}
        props={{ spec: props.spec }}
        rendererKey={CHART_NODE_KEY}
      />
    );
  }
  return <ChartEditRendererInner {...props} />;
}

function formatRawSpec(spec: string): string {
  try {
    return JSON.stringify(JSON.parse(spec), null, 2);
  } catch {
    return spec;
  }
}

const stopPropagation = (event: MouseEvent) => event.stopPropagation();

function ChartEditRendererInner({ spec, nodeKey }: ChartEditRendererProps) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [view, setView] = useState<ChartViewMode>('chart');
  const [rawOpen, setRawOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const isValid = useMemo(() => parseChartSource(spec).ok, [spec]);
  const rawText = useMemo(() => formatRawSpec(spec), [spec]);

  const handleSelect = useCallback(
    (event: MouseEvent) => {
      if (!event.shiftKey) clearSelection();
      setSelected(true);
    },
    [clearSelection, setSelected],
  );

  const handleCopy = useCallback(() => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(spec).then(
      () => toast({ title: 'Chart spec copied', tone: 'success' }),
      () => toast({ title: 'Could not copy chart spec', tone: 'error' }),
    );
  }, [spec]);

  const handleSpecChange = useCallback(
    (next: string) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isChartNode(node)) node.setSpec(next);
      });
    },
    [editor, nodeKey],
  );

  const showToolbar = isSelected || rawOpen || configOpen;

  return (
    <div className={`${s.frame}${isSelected ? ` ${s.frameSelected}` : ''}`} onClick={handleSelect}>
      <ChartRenderer hideToggle defaultView={view} key={view} value={spec} />
      {showToolbar && (
        <div aria-label="Chart" className={s.toolbar} role="toolbar" onClick={stopPropagation}>
          <Popover open={configOpen} onOpenChange={setConfigOpen}>
            <PopoverTrigger render={<ActionButton size="md" />}>
              <SlidersHorizontal />
              Edit chart
            </PopoverTrigger>
            <PopoverPanel flush align="end" className={configPopup} side="bottom" size="lg">
              <PopoverHeader icon={<ChartColumn />} title="Chart" />
              <ChartConfigPanel spec={spec} onChange={handleSpecChange} />
            </PopoverPanel>
          </Popover>
          {isValid && (
            <ActionButton
              aria-pressed={view === 'table'}
              size="md"
              onClick={() => setView(view === 'table' ? 'chart' : 'table')}
            >
              {view === 'table' ? <ChartColumn /> : <Table2 />}
              {view === 'table' ? 'View chart' : 'View data'}
            </ActionButton>
          )}
          <Popover open={rawOpen} onOpenChange={setRawOpen}>
            <PopoverTrigger render={<ActionButton size="md" />}>
              <Code />
              Raw data
            </PopoverTrigger>
            <PopoverPanel flush align="end" className={s.rawPanel} side="bottom" size="lg">
              <PopoverHeader
                icon={<Code />}
                title="Chart spec"
                actions={
                  <ActionButton size="md" onClick={handleCopy}>
                    <Copy />
                    Copy
                  </ActionButton>
                }
              />
              <pre className={s.rawCode}>
                {rawText || <span className={s.rawEmpty}>(empty)</span>}
              </pre>
            </PopoverPanel>
          </Popover>
        </div>
      )}
    </div>
  );
}
