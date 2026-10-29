import { useEditorBlock, useRendererMode } from '@haklex/rich-editor/static';
import {
  ActionButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Field,
  Kbd,
  Popover,
  PopoverBody,
  PopoverFooter,
  PopoverHeader,
  PopoverPanel,
  PopoverTrigger,
  TextInput,
  toast,
  useLiveEdit,
} from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { NodeKey } from 'lexical';
import { $getNodeByKey, HISTORY_MERGE_TAG, UNDO_COMMAND } from 'lexical';
import { Blocks, Ellipsis, Settings2, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import { DynamicHostRenderer } from './DynamicHostRenderer';
import { $isDynamicNode } from './DynamicNode';
import { DynamicSSRRenderer } from './DynamicSSRRenderer';
import type { DynamicSlotProps } from './slot';
import * as css from './styles.css';

const URL_APPLY_DELAY = 500;

export interface DynamicEditRendererProps extends DynamicSlotProps {
  nodeKey: NodeKey;
}

interface DynamicMeta {
  height: number;
  props: Record<string, unknown>;
  url: string;
}

function isModuleUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function parseProps(text: string): { error: string } | { value: Record<string, unknown> } {
  try {
    const value = JSON.parse(text.trim() || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return { error: 'Props must be a JSON object' };
    }
    return { value: value as Record<string, unknown> };
  } catch {
    return { error: 'Invalid JSON' };
  }
}

function parseHeight(text: string): number | undefined {
  const value = Number(text);
  return Number.isFinite(value) && value > 0 ? Math.round(value) : undefined;
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
  const binding = useEditorBlock();
  const id = useId();
  const urlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [open, setOpen] = useState(!url);
  const [editUrl, setEditUrl] = useState(url);
  const [editHeight, setEditHeight] = useState(String(initialHeight));
  const [editProps, setEditProps] = useState(() => JSON.stringify(componentProps ?? {}, null, 2));
  const [propsError, setPropsError] = useState<string | null>(null);

  useEffect(() => {
    if (open) return binding?.retain();
  }, [binding, open]);
  useEffect(() => setOpen(!url), [binding?.blockId]);

  const values = useMemo<DynamicMeta>(
    () => ({ url, props: componentProps ?? {}, height: initialHeight }),
    [url, componentProps, initialHeight],
  );

  const writeNode = useCallback(
    (patch: Partial<DynamicMeta>, merge: boolean) => {
      editor.update(
        () => {
          const node = $getNodeByKey(nodeKey);
          if (!$isDynamicNode(node)) return;
          if (patch.url !== undefined) node.setUrl(patch.url);
          if (patch.props !== undefined) node.setProps(patch.props);
          if (patch.height !== undefined) node.setInitialHeight(patch.height);
        },
        merge ? { tag: HISTORY_MERGE_TAG } : undefined,
      );
    },
    [editor, nodeKey],
  );

  const { apply, revert } = useLiveEdit(values, open, writeNode);

  const cancelPendingUrl = useCallback(() => {
    if (urlTimerRef.current) clearTimeout(urlTimerRef.current);
    urlTimerRef.current = null;
  }, []);

  useEffect(() => cancelPendingUrl, [cancelPendingUrl]);

  useEffect(() => {
    if (!open) return;
    setEditUrl(url);
    setEditHeight(String(initialHeight));
    setEditProps(JSON.stringify(componentProps ?? {}, null, 2));
    setPropsError(null);
  }, [open]);

  const handleDelete = useCallback(() => {
    cancelPendingUrl();
    editor.update(() => {
      $getNodeByKey(nodeKey)?.remove();
    });
    setOpen(false);
    toast({
      title: 'Dynamic component deleted',
      action: {
        label: 'Undo',
        onClick: () => editor.dispatchCommand(UNDO_COMMAND, undefined),
      },
    });
  }, [cancelPendingUrl, editor, nodeKey]);

  const urlInvalid = editUrl.trim() !== '' && !isModuleUrl(editUrl.trim());
  const heightInvalid = parseHeight(editHeight) === undefined;

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger render={<ActionButton icon aria-label="More actions" size="md" />}>
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className={`${css.root} ${css.semanticClassNames.root}`}>
      {url ? (
        <DynamicHostRenderer
          componentProps={componentProps}
          initialHeight={initialHeight}
          nodeKey={nodeKey}
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
        onOpenChange={(nextOpen, details) => {
          if (!nextOpen && details?.reason === 'escape-key') {
            cancelPendingUrl();
            revert();
          }
          setOpen(nextOpen);
        }}
      >
        <PopoverTrigger
          aria-label="Dynamic component settings"
          className={`${css.settingsButton} ${css.semanticClassNames.settingsButton}`}
        >
          <Settings2 size={14} />
        </PopoverTrigger>
        <PopoverPanel
          flush
          className={`${css.editPanel} ${css.semanticClassNames.editPanel}`}
          side="bottom"
          size="lg"
        >
          <PopoverHeader actions={menu} icon={<Blocks />} title="Dynamic component" />
          <PopoverBody>
            <Field
              error={urlInvalid ? 'Enter an http(s) module URL' : undefined}
              hint="ES module URL"
              id={`${id}-url`}
              label="Module URL"
            >
              <TextInput
                mono
                id={`${id}-url`}
                invalid={urlInvalid}
                placeholder="https://"
                type="url"
                value={editUrl}
                onChange={(e) => {
                  const next = e.target.value;
                  setEditUrl(next);
                  cancelPendingUrl();
                  if (!isModuleUrl(next.trim())) return;
                  urlTimerRef.current = setTimeout(() => {
                    urlTimerRef.current = null;
                    apply({ url: next.trim() });
                  }, URL_APPLY_DELAY);
                }}
              />
            </Field>
            <Field
              error={heightInvalid ? 'Enter a height above 0' : undefined}
              id={`${id}-height`}
              label="Initial height"
            >
              <TextInput
                id={`${id}-height`}
                inputMode="numeric"
                invalid={heightInvalid}
                value={editHeight}
                onChange={(e) => {
                  setEditHeight(e.target.value);
                  const height = parseHeight(e.target.value);
                  if (height !== undefined) apply({ height });
                }}
              />
            </Field>
            <Field error={propsError} id={`${id}-props`} label="Props">
              <textarea
                aria-invalid={propsError ? true : undefined}
                className={`${css.editTextarea} ${css.semanticClassNames.editTextarea}`}
                id={`${id}-props`}
                placeholder='{"level": 1}'
                spellCheck={false}
                value={editProps}
                onChange={(e) => {
                  setEditProps(e.target.value);
                  const parsed = parseProps(e.target.value);
                  if ('error' in parsed) {
                    setPropsError(parsed.error);
                    return;
                  }
                  setPropsError(null);
                  apply({ props: parsed.value });
                }}
              />
            </Field>
          </PopoverBody>
          <PopoverFooter hint="Changes apply as you type">
            <Kbd keys="Esc" size="sm" tone="muted" />
            <span className={css.footerNote}>revert</span>
          </PopoverFooter>
        </PopoverPanel>
      </Popover>
    </div>
  );
}
