import { collectCommandItems } from '@haklex/rich-editor/commands';
import type { TooltipRootProps } from '@haklex/rich-editor-ui';
import {
  createTooltipHandle,
  DropdownMenu,
  DropdownMenuContent,
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
} from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import type { ElementNode, LexicalEditor } from 'lexical';
import { $createParagraphNode, $getSelection, $isRangeSelection } from 'lexical';
import { Ellipsis, Heading1, Heading2, Heading3, Pilcrow, Plus } from 'lucide-react';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { applyFontFamily } from './actions';
import { BLOCK_TYPE_LABELS, FONT_FAMILIES, getFontLabel } from './constants';
import type { ToolbarEntry } from './entries';
import {
  buttonEntry,
  dropdownEntry,
  formattingButtons,
  separatorEntry,
  TOOLBAR_BUTTON_SIZE,
  TOOLBAR_GAP,
} from './entries';
import { fitCount } from './overflow';
import * as css from './styles.css';
import { ToolbarMenuButton, ToolbarMenuItems, ToolbarOverflowMenu } from './ToolbarOverflowMenu';
import type { ToolbarTooltipPayload } from './types';
import { useToolbarState } from './use-toolbar-state';

const DEFAULT_MAX_VISIBLE_INSERT_ITEMS = 5;

export interface ToolbarPluginProps {
  className?: string;
  insertItemOrder?: string[];
  maxVisibleInsertItems?: number;
}

function setBlock(editor: LexicalEditor, create: () => ElementNode) {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) $setBlocksType(selection, create);
  });
}

const HEADINGS: { icon: ReactNode; label: string; type: string }[] = [
  { label: 'Text', type: 'paragraph', icon: <Pilcrow size={16} /> },
  { label: 'Heading 1', type: 'h1', icon: <Heading1 size={16} /> },
  { label: 'Heading 2', type: 'h2', icon: <Heading2 size={16} /> },
  { label: 'Heading 3', type: 'h3', icon: <Heading3 size={16} /> },
];

function useAvailableWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

export function ToolbarPlugin({
  className,
  maxVisibleInsertItems = DEFAULT_MAX_VISIBLE_INSERT_ITEMS,
  insertItemOrder,
}: ToolbarPluginProps): ReactElement {
  const [editor] = useLexicalComposerContext();
  const state = useToolbarState();
  const [handle] = useState(() => createTooltipHandle<ToolbarTooltipPayload>());
  const [rowRef, available] = useAvailableWidth();

  const insertItems = useMemo(() => {
    const items = collectCommandItems(editor).filter(
      (item) => item.placement?.includes('toolbar') && item.group === 'insert',
    );
    if (!insertItemOrder || insertItemOrder.length === 0) return items;
    return items.sort((a, b) => {
      const ai = insertItemOrder.indexOf(a.title);
      const bi = insertItemOrder.indexOf(b.title);
      return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
    });
  }, [editor, insertItemOrder]);

  const entries = useMemo(() => {
    const list: ToolbarEntry[] = [
      dropdownEntry(
        'font',
        {
          title: 'Font family',
          label: getFontLabel(state.fontFamily),
          width: 76,
          items: FONT_FAMILIES.map((def) => ({
            label: def.label,
            active: state.fontFamily === def.value,
            style: def.value ? ({ fontFamily: def.value } as CSSProperties) : undefined,
            onSelect: () => applyFontFamily(editor, def.value),
          })),
        },
        handle,
      ),
      separatorEntry('sep-font'),
      dropdownEntry(
        'block',
        {
          title: 'Block type',
          label: BLOCK_TYPE_LABELS[state.blockType] ?? 'Text',
          width: 112,
          items: HEADINGS.map((heading) => ({
            label: heading.label,
            icon: heading.icon,
            active: state.blockType === heading.type,
            onSelect: () =>
              setBlock(editor, () =>
                heading.type === 'paragraph'
                  ? $createParagraphNode()
                  : $createHeadingNode(heading.type as 'h1' | 'h2' | 'h3'),
              ),
          })),
        },
        handle,
      ),
    ];
    for (const [index, group] of formattingButtons(editor, state).entries()) {
      list.push(separatorEntry(`sep-${index}`));
      for (const spec of group) list.push(buttonEntry(spec, handle));
    }
    if (insertItems.length > 0) {
      list.push(separatorEntry('sep-insert'));
      for (const item of insertItems.slice(0, maxVisibleInsertItems)) {
        list.push(
          buttonEntry(
            {
              key: `insert-${item.title}`,
              label: item.title,
              icon: item.icon,
              shortcut: item.shortcut,
              onSelect: () => item.onSelect(editor, ''),
            },
            handle,
          ),
        );
      }
      const rest = insertItems.slice(maxVisibleInsertItems).map((item) => ({
        label: item.title,
        icon: item.icon,
        shortcut: item.shortcut,
        onSelect: () => item.onSelect(editor, ''),
      }));
      if (rest.length > 0) {
        list.push({
          key: 'insert-menu',
          width: TOOLBAR_BUTTON_SIZE,
          menu: { label: 'Insert', items: rest },
          node: (
            <DropdownMenu key="insert-menu" modal={false}>
              <ToolbarMenuButton handle={handle} title="Insert">
                <Plus size={16} />
              </ToolbarMenuButton>
              <DropdownMenuContent positionMethod="fixed" sideOffset={4}>
                <ToolbarMenuItems items={rest} />
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        });
      }
    }
    return list;
  }, [editor, state, handle, insertItems, maxVisibleInsertItems]);

  const visibleCount = fitCount(entries, {
    available,
    gap: TOOLBAR_GAP,
    reserve: TOOLBAR_BUTTON_SIZE,
  });
  const hidden = entries.slice(visibleCount);

  return (
    <TooltipProvider delay={300}>
      <TooltipRoot disableHoverablePopup handle={handle as TooltipRootProps['handle']}>
        {
          ((props: { payload?: ToolbarTooltipPayload }) =>
            props.payload !== undefined ? (
              <TooltipContent shortcut={props.payload.shortcut} side="bottom" sideOffset={4}>
                {props.payload.title}
              </TooltipContent>
            ) : null) as TooltipRootProps['children']
        }
      </TooltipRoot>

      <div
        aria-label="Editor toolbar"
        className={className ? `${css.toolbarContainer} ${className}` : css.toolbarContainer}
        role="toolbar"
      >
        <div className={css.toolbarRow} ref={rowRef}>
          {entries.slice(0, visibleCount).map((entry) => entry.node)}
          {hidden.length > 0 && (
            <ToolbarOverflowMenu entries={hidden} handle={handle} icon={<Ellipsis size={16} />} />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
