import {
  $selectionTouchesSpoiler,
  $toggleSpoilerSelection,
  collectCommandItems,
} from '@haklex/rich-editor/commands';
import type { TooltipRootProps } from '@haklex/rich-editor-ui';
import {
  createTooltipHandle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from '@haklex/rich-editor-ui';
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
  $setBlocksType,
} from '@lexical/selection';
import { $findMatchingParent } from '@lexical/utils';
import type { ElementFormatType, ElementNode } from 'lexical';
import {
  $createParagraphNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Ellipsis,
  EyeOff,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListChecks,
  ListOrdered,
  Pilcrow,
  Redo,
  Strikethrough,
  Underline,
  Undo,
} from 'lucide-react';
import type { CSSProperties, ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import * as css from './styles.css';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarDropdown } from './ToolbarDropdown';
import { ToolbarSeparator } from './ToolbarSeparator';
import type { ToolbarTooltipPayload } from './types';

const ICON_SIZE = 15;
const ICON_STROKE = 2;

// ─── Font Family ────────────────────────────────────────

interface FontFamilyDef {
  label: string;
  value: string;
}

const FONT_FAMILIES: FontFamilyDef[] = [
  { label: '默认', value: '' },
  {
    label: '宋体',
    value: '"Noto Serif CJK SC", "Source Han Serif SC", SimSun, serif',
  },
  {
    label: '黑体',
    value: '"Noto Sans CJK SC", "Source Han Sans SC", SimHei, sans-serif',
  },
  { label: '楷体', value: 'KaiTi, STKaiti, serif' },
  { label: 'Sans', value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Mono', value: 'ui-monospace, "SF Mono", "Fira Code", monospace' },
];

function getFontLabel(fontFamily: string): string {
  if (!fontFamily) return '默认';
  const match = FONT_FAMILIES.find((f) => f.value === fontFamily);
  if (match) return match.label;
  for (const def of FONT_FAMILIES) {
    if (def.value && fontFamily.startsWith(def.value.split(',')[0]!)) {
      return def.label;
    }
  }
  return '默认';
}

// ─── Block Type ─────────────────────────────────────────

type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'bullet' | 'number' | 'check' | 'other';

const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  paragraph: 'Text',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  bullet: 'Bulleted List',
  number: 'Numbered List',
  check: 'To-do List',
  other: 'Other',
};

// ─── State ──────────────────────────────────────────────

interface ToolbarState {
  blockType: BlockType;
  canRedo: boolean;
  canUndo: boolean;
  elementFormat: ElementFormatType;
  fontFamily: string;
  isBold: boolean;
  isCode: boolean;
  isHighlight: boolean;
  isItalic: boolean;
  isSpoiler: boolean;
  isStrikethrough: boolean;
  isUnderline: boolean;
}

const INITIAL_STATE: ToolbarState = {
  canUndo: false,
  canRedo: false,
  blockType: 'paragraph',
  fontFamily: '',
  elementFormat: 'left',
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
  isCode: false,
  isHighlight: false,
  isSpoiler: false,
};

function getBlockType(anchorNode: ElementNode): BlockType {
  if ($isHeadingNode(anchorNode)) {
    const tag = anchorNode.getTag();
    if (tag === 'h1' || tag === 'h2' || tag === 'h3') return tag;
    return 'other';
  }
  if ($isListNode(anchorNode)) {
    const listType = anchorNode.getListType();
    if (listType === 'bullet') return 'bullet';
    if (listType === 'number') return 'number';
    if (listType === 'check') return 'check';
    return 'other';
  }
  const type = anchorNode.getType();
  if (type === 'paragraph') return 'paragraph';
  return 'other';
}

// ─── Component ──────────────────────────────────────────

const DEFAULT_MAX_VISIBLE_INSERT_ITEMS = 5;

export interface ToolbarPluginProps {
  className?: string;
  insertItemOrder?: string[];
  maxVisibleInsertItems?: number;
}

export function ToolbarPlugin({
  className,
  maxVisibleInsertItems = DEFAULT_MAX_VISIBLE_INSERT_ITEMS,
  insertItemOrder,
}: ToolbarPluginProps): ReactElement {
  const [editor] = useLexicalComposerContext();
  const [state, setState] = useState<ToolbarState>(INITIAL_STATE);
  const [tooltipHandle] = useState(() => createTooltipHandle<ToolbarTooltipPayload>());

  const toolbarItems = useMemo(() => {
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

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    const anchorNode = selection.anchor.getNode();
    let element =
      anchorNode.getKey() === 'root'
        ? anchorNode
        : ($findMatchingParent(anchorNode, (e) => {
            const parent = e.getParent();
            return parent !== null && $isRootOrShadowRoot(parent);
          }) ?? anchorNode.getTopLevelElementOrThrow());

    if ($isListNode(element)) {
      const parentList = $findMatchingParent(anchorNode, (node) => $isListNode(node));
      if (parentList) {
        element = parentList;
      }
    }

    const blockType = getBlockType(element as ElementNode);
    const fontFamily = $getSelectionStyleValueForProperty(selection, 'font-family', '');
    const elementFormat: ElementFormatType = $isElementNode(element)
      ? element.getFormatType()
      : 'left';

    setState((prev) => ({
      ...prev,
      blockType,
      fontFamily,
      elementFormat,
      isBold: selection.hasFormat('bold'),
      isItalic: selection.hasFormat('italic'),
      isUnderline: selection.hasFormat('underline'),
      isStrikethrough: selection.hasFormat('strikethrough'),
      isCode: selection.hasFormat('code'),
      isHighlight: selection.hasFormat('highlight'),
      isSpoiler: $selectionTouchesSpoiler(selection),
    }));
  }, []);

  useEffect(() => {
    const unregisterUndo = editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setState((prev) => ({ ...prev, canUndo: payload }));
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
    const unregisterRedo = editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setState((prev) => ({ ...prev, canRedo: payload }));
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
    const unregisterUpdate = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
    return () => {
      unregisterUndo();
      unregisterRedo();
      unregisterUpdate();
    };
  }, [editor, updateToolbar]);

  const applyFontFamily = useCallback(
    (value: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, { 'font-family': value || '' });
        }
      });
    },
    [editor],
  );

  const fontFamilyItems = useMemo(
    () =>
      FONT_FAMILIES.map((def) => ({
        label: def.label,
        active: state.fontFamily === def.value,
        style: def.value ? ({ fontFamily: def.value } as CSSProperties) : undefined,
        onSelect: () => applyFontFamily(def.value),
      })),
    [state.fontFamily, applyFontFamily],
  );

  const headingItems = useMemo(
    () => [
      {
        label: 'Text',
        icon: <Pilcrow size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
        active: state.blockType === 'paragraph',
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createParagraphNode());
            }
          });
        },
      },
      {
        label: 'Heading 1',
        icon: <Heading1 size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
        active: state.blockType === 'h1',
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode('h1'));
            }
          });
        },
      },
      {
        label: 'Heading 2',
        icon: <Heading2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
        active: state.blockType === 'h2',
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode('h2'));
            }
          });
        },
      },
      {
        label: 'Heading 3',
        icon: <Heading3 size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
        active: state.blockType === 'h3',
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode('h3'));
            }
          });
        },
      },
    ],
    [editor, state.blockType],
  );

  const containerClassName = className
    ? `${css.toolbarContainer} ${className}`
    : css.toolbarContainer;

  const h = tooltipHandle;

  return (
    <TooltipProvider delay={300}>
      <TooltipRoot disableHoverablePopup handle={tooltipHandle as TooltipRootProps['handle']}>
        {
          ((props: { payload?: ToolbarTooltipPayload }) =>
            props.payload !== undefined ? (
              <TooltipContent side="bottom" sideOffset={4}>
                {props.payload.title}
                {props.payload.shortcut && (
                  <span className={css.tooltipShortcut}>{props.payload.shortcut}</span>
                )}
              </TooltipContent>
            ) : null) as TooltipRootProps['children']
        }
      </TooltipRoot>

      <div aria-label="Editor toolbar" className={containerClassName} role="toolbar">
        <div className={css.toolbarRow}>
          {/* Font Family */}
          <ToolbarDropdown
            items={fontFamilyItems}
            label={getFontLabel(state.fontFamily)}
            title="Font family"
            tooltipHandle={h}
            triggerWidth={76}
          />

          <ToolbarSeparator />

          {/* Heading dropdown */}
          <ToolbarDropdown
            items={headingItems}
            label={BLOCK_TYPE_LABELS[state.blockType] ?? 'Text'}
            title="Block type"
            tooltipHandle={h}
            triggerWidth={120}
          />

          <ToolbarSeparator />

          {/* Undo / Redo */}
          <ToolbarButton
            disabled={!state.canUndo}
            icon={<Undo size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
            shortcut="Ctrl+Z"
            title="Undo"
            tooltipHandle={h}
            onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          />
          <ToolbarButton
            disabled={!state.canRedo}
            icon={<Redo size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
            shortcut="Ctrl+Y"
            title="Redo"
            tooltipHandle={h}
            onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          />

          <ToolbarSeparator />

          {/* Format buttons */}
          <ToolbarButton
            active={state.isBold}
            icon={<Bold size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
            shortcut="Ctrl+B"
            title="Bold"
            tooltipHandle={h}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          />
          <ToolbarButton
            active={state.isItalic}
            icon={<Italic size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
            shortcut="Ctrl+I"
            title="Italic"
            tooltipHandle={h}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          />
          <ToolbarButton
            active={state.isUnderline}
            icon={<Underline size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
            shortcut="Ctrl+U"
            title="Underline"
            tooltipHandle={h}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
          />
          <ToolbarButton
            active={state.isStrikethrough}
            icon={<Strikethrough size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
            title="Strikethrough"
            tooltipHandle={h}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
          />
          <ToolbarButton
            active={state.isCode}
            icon={<Code size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
            title="Inline Code"
            tooltipHandle={h}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
          />

          <ToolbarSeparator />

          {/* Highlight */}
          <ToolbarButton
            active={state.isHighlight}
            icon={<Highlighter size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
            title="Highlight"
            tooltipHandle={h}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight')}
          />
          <ToolbarButton
            active={state.isSpoiler}
            icon={<EyeOff size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
            title="Spoiler"
            tooltipHandle={h}
            onClick={() => editor.update($toggleSpoilerSelection)}
          />

          <ToolbarSeparator />

          {/* List buttons */}
          <ToolbarButton
            active={state.blockType === 'bullet'}
            icon={<List size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
            title="Bulleted List"
            tooltipHandle={h}
            onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
          />
          <ToolbarButton
            active={state.blockType === 'number'}
            icon={<ListOrdered size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
            title="Numbered List"
            tooltipHandle={h}
            onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
          />
          <ToolbarButton
            active={state.blockType === 'check'}
            icon={<ListChecks size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
            title="Checklist"
            tooltipHandle={h}
            onClick={() => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)}
          />

          <ToolbarSeparator />

          {/* Alignment */}
          <ToolbarButton
            active={state.elementFormat === 'left' || state.elementFormat === ''}
            icon={<AlignLeft size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
            title="Align Left"
            tooltipHandle={h}
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
          />
          <ToolbarButton
            active={state.elementFormat === 'center'}
            icon={<AlignCenter size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
            title="Align Center"
            tooltipHandle={h}
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
          />
          <ToolbarButton
            active={state.elementFormat === 'right'}
            icon={<AlignRight size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
            title="Align Right"
            tooltipHandle={h}
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
          />
          <ToolbarButton
            active={state.elementFormat === 'justify'}
            icon={<AlignJustify size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
            title="Justify"
            tooltipHandle={h}
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}
          />

          {/* Dynamic insert items */}
          {toolbarItems.length > 0 && (
            <>
              <ToolbarSeparator />
              {toolbarItems.slice(0, maxVisibleInsertItems).map((item) => (
                <ToolbarButton
                  icon={item.icon}
                  key={item.title}
                  shortcut={item.shortcut}
                  title={item.title}
                  tooltipHandle={h}
                  onClick={() => item.onSelect(editor, '')}
                />
              ))}
              {toolbarItems.length > maxVisibleInsertItems && (
                <DropdownMenu modal={false}>
                  <TooltipTrigger
                    handle={h}
                    payload={{ title: 'More' } satisfies ToolbarTooltipPayload}
                    render={
                      <DropdownMenuTrigger
                        className={css.toolbarButton}
                        render={<button type="button" />}
                      />
                    }
                  >
                    <Ellipsis size={ICON_SIZE} strokeWidth={ICON_STROKE} />
                  </TooltipTrigger>
                  <DropdownMenuContent positionMethod="fixed" sideOffset={4}>
                    {toolbarItems.slice(maxVisibleInsertItems).map((item) => (
                      <DropdownMenuItem key={item.title} onClick={() => item.onSelect(editor, '')}>
                        {item.icon && (
                          <span
                            style={{
                              marginRight: 8,
                              display: 'inline-flex',
                              transform: 'scale(0.8)',
                              transformOrigin: 'left center',
                            }}
                          >
                            {item.icon}
                          </span>
                        )}
                        {item.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
