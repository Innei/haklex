import { useRendererMode } from '@haklex/rich-editor/static';
import {
  ActionBar,
  ActionButton,
  Popover,
  PopoverPanel,
  PopoverTrigger,
} from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { NodeKey } from 'lexical';
import { $getNodeByKey } from 'lexical';
import { Braces, Link2, Ruler, Settings2, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { DynamicHostRenderer } from './DynamicHostRenderer';
import type { DynamicNode } from './DynamicNode';
import { $isDynamicNode, DEFAULT_DYNAMIC_HEIGHT } from './DynamicNode';
import { DynamicSSRRenderer } from './DynamicSSRRenderer';
import type { DynamicSlotProps } from './slot';
import * as css from './styles.css';

export interface DynamicEditRendererProps extends DynamicSlotProps {
  nodeKey: NodeKey;
}

export function DynamicEditRenderer(props: DynamicEditRendererProps) {
  const mode = useRendererMode();

  if (mode !== 'editor') {
    return (
      <DynamicSSRRenderer
        componentProps={props.componentProps}
        initialHeight={props.initialHeight}
        url={props.url}
      />
    );
  }

  return <DynamicEditRendererInner {...props} />;
}

function DynamicEditRendererInner({
  url,
  componentProps,
  initialHeight,
  nodeKey,
}: DynamicEditRendererProps) {
  const [editor] = useLexicalComposerContext();

  const [open, setOpen] = useState(!url);
  const [editUrl, setEditUrl] = useState(url);
  const [editHeight, setEditHeight] = useState(String(initialHeight));
  const [editProps, setEditProps] = useState(() => JSON.stringify(componentProps ?? {}, null, 2));
  const [propsError, setPropsError] = useState<string | null>(null);

  const resetDraft = useCallback(() => {
    setEditUrl(url);
    setEditHeight(String(initialHeight));
    setEditProps(JSON.stringify(componentProps ?? {}, null, 2));
    setPropsError(null);
  }, [url, initialHeight, componentProps]);

  useEffect(() => {
    resetDraft();
  }, [resetDraft]);

  const commitChanges = useCallback(() => {
    let parsedProps: Record<string, unknown>;
    try {
      const value = JSON.parse(editProps.trim() || '{}');
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        setPropsError('Props must be a JSON object');
        return;
      }
      parsedProps = value as Record<string, unknown>;
    } catch {
      setPropsError('Invalid JSON');
      return;
    }

    const parsedHeight = Number(editHeight);
    const nextHeight =
      Number.isFinite(parsedHeight) && parsedHeight > 0 ? parsedHeight : DEFAULT_DYNAMIC_HEIGHT;

    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (!$isDynamicNode(node)) return;
      const dynamicNode = node as DynamicNode;
      dynamicNode.setUrl(editUrl.trim());
      dynamicNode.setProps(parsedProps);
      dynamicNode.setInitialHeight(nextHeight);
    });
    setPropsError(null);
    setOpen(false);
  }, [editor, nodeKey, editUrl, editHeight, editProps]);

  const handleDelete = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      node?.remove();
    });
    setOpen(false);
  }, [editor, nodeKey]);

  return (
    <div className={`${css.root} ${css.semanticClassNames.root}`}>
      {url ? (
        <DynamicHostRenderer
          componentProps={componentProps}
          initialHeight={initialHeight}
          url={url}
        />
      ) : (
        <div style={{ minHeight: initialHeight, position: 'relative' }}>
          <div className={`${css.overlay} ${css.semanticClassNames.placeholder}`}>
            <span>Dynamic component — configure a module URL</span>
          </div>
        </div>
      )}
      <Popover
        open={open}
        onOpenChange={(nextOpen: boolean) => {
          setOpen(nextOpen);
          if (!nextOpen) resetDraft();
        }}
      >
        <PopoverTrigger
          aria-label="Dynamic component settings"
          className={`${css.settingsButton} ${css.semanticClassNames.settingsButton}`}
        >
          <Settings2 size={14} />
        </PopoverTrigger>
        <PopoverPanel
          className={`${css.editPanel} ${css.semanticClassNames.editPanel}`}
          side="bottom"
          sideOffset={8}
        >
          <div className={`${css.editField} ${css.semanticClassNames.editField}`}>
            <Link2
              className={`${css.editFieldIcon} ${css.semanticClassNames.editFieldIcon}`}
              size={14}
            />
            <input
              className={`${css.editInput} ${css.semanticClassNames.editInput}`}
              placeholder="Module URL (ESM)"
              type="url"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
            />
          </div>
          <div className={`${css.editField} ${css.semanticClassNames.editField}`}>
            <Ruler
              className={`${css.editFieldIcon} ${css.semanticClassNames.editFieldIcon}`}
              size={14}
            />
            <input
              className={`${css.editInput} ${css.semanticClassNames.editInput}`}
              min={0}
              placeholder="Initial height (px)"
              type="number"
              value={editHeight}
              onChange={(e) => setEditHeight(e.target.value)}
            />
          </div>
          <div className={`${css.editField} ${css.semanticClassNames.editField}`}>
            <Braces
              className={`${css.editFieldIcon} ${css.semanticClassNames.editFieldIcon}`}
              size={14}
            />
            <textarea
              className={`${css.editTextarea} ${css.semanticClassNames.editTextarea}`}
              placeholder='Props JSON, e.g. {"level": 1}'
              spellCheck={false}
              value={editProps}
              onChange={(e) => setEditProps(e.target.value)}
            />
          </div>
          {propsError && (
            <span className={`${css.editError} ${css.semanticClassNames.editError}`}>
              {propsError}
            </span>
          )}
          <ActionBar>
            <ActionButton onClick={commitChanges}>Apply</ActionButton>
            <ActionButton danger onClick={handleDelete}>
              <Trash2 size={14} />
              Remove
            </ActionButton>
          </ActionBar>
        </PopoverPanel>
      </Popover>
    </div>
  );
}
