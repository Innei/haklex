import { getDOMRectFromTextSelection, useTextSelectionSnapshot } from '@haklex/rich-editor';
import { $toggleSpoilerSelection } from '@haklex/rich-editor/commands';
import { $isKaTeXInlineNode } from '@haklex/rich-editor/nodes';
import type { TooltipRootProps } from '@haklex/rich-editor-ui';
import { TooltipContent, TooltipProvider, TooltipRoot } from '@haklex/rich-editor-ui';
import { usePortalContainer, usePortalTheme } from '@haklex/rich-style-token';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $patchStyleText } from '@lexical/selection';
import type { TextFormatType } from 'lexical';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical';
import { Languages, Link as LinkIcon, Trash2, Unlink, X } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { $clearFormatting } from './actions';
import { FormatBar } from './FormatBar';
import { InlineInputBar } from './InlineInputBar';
import type { Box } from './position';
import { moveToolbarFocus, syncRovingTabIndex } from './roving';
import type { ToolbarState } from './selection-state';
import { getSelectionState, INITIAL_STATE } from './selection-state';
import * as css from './styles.css';
import type { ToolbarTooltipPayload } from './ToolbarButton';
import { createToolbarTooltipHandle } from './ToolbarButton';
import { useEditorBindings } from './use-editor-bindings';
import { useInlineModes } from './use-inline-modes';
import { useToolbarPosition } from './use-toolbar-position';

const ICON = { size: 16, strokeWidth: 2 } as const;

export interface FloatingToolbarPluginProps {
  actions?: ReactNode;
}

function toBox(rect: DOMRect): Box | null {
  if (rect.width === 0 && rect.height === 0) return null;
  return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
}

export function FloatingToolbarPlugin({
  actions,
}: FloatingToolbarPluginProps = {}): ReactElement | null {
  const [editor] = useLexicalComposerContext();
  const { className: portalClassName, theme: portalTheme } = usePortalTheme();
  const portalContainer = usePortalContainer();
  const selectionSnapshot = useTextSelectionSnapshot();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [handle] = useState(createToolbarTooltipHandle);
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<ToolbarState>(INITIAL_STATE);
  const [pendingFocus, setPendingFocus] = useState<{ target: string } | null>(null);
  const lastAnchorRef = useRef<Box | null>(null);

  const onClose = useCallback((target: string | null) => {
    setPendingFocus(target ? { target } : null);
  }, []);
  const modes = useInlineModes(editor, onClose);
  const { mode, modeRef, openLink, openRuby, editRuby, commitOnOutsideClick } = modes;

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection) || selection.isCollapsed()) {
      setVisible(false);
      return;
    }
    setState(getSelectionState(selection));
    setVisible(true);
  }, []);

  useEditorBindings({ editor, editRuby, modeRef, openLink, toolbarRef, updateToolbar });

  useEffect(() => {
    if (!selectionSnapshot) setVisible(false);
  }, [selectionSnapshot]);

  useEffect(() => {
    if (!pendingFocus) return;
    const button =
      pendingFocus.target === 'editor'
        ? null
        : toolbarRef.current?.querySelector<HTMLElement>(`[aria-label="${pendingFocus.target}"]`);
    if (button) button.focus();
    else editor.focus();
    setPendingFocus(null);
  }, [editor, pendingFocus]);

  useEffect(() => {
    if (mode.kind === 'format') return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (toolbarRef.current?.contains(target)) return;
      commitOnOutsideClick();
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', onPointerDown), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [commitOnOutsideClick, mode.kind]);

  const rubyKey = mode.kind === 'ruby' ? mode.draft.nodeKey : null;
  const getAnchor = useCallback((): Box | null => {
    const rootElement = editor.getRootElement();
    let anchor: Box | null = null;
    if (rubyKey) {
      const dom = editor.getElementByKey(rubyKey);
      anchor = dom ? toBox(dom.getBoundingClientRect()) : null;
    } else if (rootElement && selectionSnapshot) {
      const rect = getDOMRectFromTextSelection(rootElement, selectionSnapshot);
      anchor = rect ? toBox(rect) : null;
    }
    if (anchor) lastAnchorRef.current = anchor;
    return anchor ?? lastAnchorRef.current;
  }, [editor, rubyKey, selectionSnapshot]);

  const shown = visible || mode.kind !== 'format';

  useToolbarPosition({
    active: shown,
    editor,
    getAnchor,
    portalContainer,
    toolbarRef,
    trigger: `${mode.kind}:${JSON.stringify(state)}`,
  });

  const handleFormat = useCallback(
    (format: TextFormatType) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format),
    [editor],
  );

  const patchSelection = useCallback(
    (styles: Record<string, string | null>, katexColor?: string | null) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        $patchStyleText(selection, styles);
        if (katexColor === undefined) return;
        for (const node of selection.getNodes()) {
          if ($isKaTeXInlineNode(node)) node.setColor(katexColor);
        }
      });
    },
    [editor],
  );

  const handleColor = useCallback(
    (value: string) => {
      const color = value === 'inherit' ? null : value;
      patchSelection({ color }, color);
    },
    [patchSelection],
  );

  const handleBackgroundColor = useCallback(
    (value: string) => {
      patchSelection({ 'background-color': value === 'inherit' ? null : value });
    },
    [patchSelection],
  );

  if (!shown) return null;

  const toolbarClassName = [
    css.toolbar,
    mode.kind === 'link' && css.toolbarLink,
    mode.kind === 'ruby' && css.toolbarRuby,
    portalClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <TooltipProvider delay={400}>
      <TooltipRoot disableHoverablePopup handle={handle as TooltipRootProps['handle']}>
        {
          ((props: { payload?: ToolbarTooltipPayload }) =>
            props.payload ? (
              <TooltipContent data-slot="toolbar-tooltip" shortcut={props.payload.shortcut}>
                {props.payload.label}
              </TooltipContent>
            ) : null) as TooltipRootProps['children']
        }
      </TooltipRoot>
      {createPortal(
        <div
          aria-label={mode.kind === 'format' ? 'Text formatting' : undefined}
          className={toolbarClassName}
          data-theme={portalClassName ? portalTheme : undefined}
          ref={toolbarRef}
          role={mode.kind === 'format' ? 'toolbar' : 'group'}
          style={{ position: 'fixed', zIndex: 50 }}
          onFocus={(e) => syncRovingTabIndex(e.currentTarget, e.target)}
          onKeyDown={(e) => {
            if (mode.kind !== 'format') return;
            if (moveToolbarFocus(e)) return;
            if (e.key === 'Escape' || e.key === 'Tab') {
              e.preventDefault();
              editor.focus();
            }
          }}
        >
          {mode.kind === 'format' && (
            <FormatBar
              actions={actions}
              handle={handle}
              state={state}
              onBackgroundColor={handleBackgroundColor}
              onClearFormatting={() => editor.update($clearFormatting)}
              onColor={handleColor}
              onFormat={handleFormat}
              onLink={() => openLink('toolbar')}
              onRuby={() => openRuby('toolbar')}
              onSpoiler={() => editor.update($toggleSpoilerSelection)}
            />
          )}
          {mode.kind === 'link' && (
            <InlineInputBar
              handle={handle}
              icon={<LinkIcon {...ICON} />}
              label="URL"
              placeholder="Paste or type a link"
              type="url"
              value={mode.draft}
              secondary={
                mode.existing
                  ? {
                      danger: true,
                      icon: <Unlink {...ICON} />,
                      label: 'Remove link',
                      onClick: modes.removeLink,
                    }
                  : {
                      icon: <X {...ICON} />,
                      label: 'Back to formatting',
                      shortcut: 'Escape',
                      onClick: () => modes.cancel(true),
                    }
              }
              onCancel={() => modes.cancel(true)}
              onChange={modes.setLinkDraft}
              onSubmit={() => modes.saveLink()}
            />
          )}
          {mode.kind === 'ruby' && (
            <InlineInputBar
              handle={handle}
              icon={<Languages {...ICON} />}
              label="Reading"
              placeholder="Reading"
              value={mode.draft.reading}
              secondary={{
                danger: true,
                icon: <Trash2 {...ICON} />,
                label: 'Remove ruby',
                onClick: modes.removeRuby,
              }}
              onCancel={modes.cancelRuby}
              onChange={modes.setRubyDraft}
              onSubmit={() => modes.saveRuby()}
            />
          )}
        </div>,
        portalContainer,
      )}
    </TooltipProvider>
  );
}
