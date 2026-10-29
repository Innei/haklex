import type { ColorScheme } from '@haklex/rich-editor/static';
import {
  confirmDiscardChanges,
  ModalShell,
  ModalShellBody,
  ModalShellFooter,
  ModalShellHeader,
  SegmentedControl,
  toast,
} from '@haklex/rich-editor-ui';
import { CircleAlert, FishSymbol } from 'lucide-react';
import type { FC, KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import { MermaidHeaderMenus } from './MermaidHeaderMenus';
import * as css from './styles.css';
import { useMermaidRender } from './useMermaidRender';
import { ZoomControls } from './ZoomControls';

type ViewMode = 'code' | 'split' | 'preview';

const MOBILE_QUERY = '(max-width: 640px)';

function useIsMobile(): boolean {
  return useSyncExternalStore(
    (cb) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mql = window.matchMedia(MOBILE_QUERY);
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    () => typeof window !== 'undefined' && !!window.matchMedia?.(MOBILE_QUERY).matches,
    () => false,
  );
}

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const DESKTOP_VIEWS = [
  { value: 'code' as const, label: 'Code' },
  { value: 'split' as const, label: 'Split' },
  { value: 'preview' as const, label: 'Preview' },
];

const MOBILE_VIEWS = DESKTOP_VIEWS.filter((item) => item.value !== 'split');

const CodeEditor: FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const lineCount = value.split('\n').length;

  const syncScroll = useCallback(() => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.addEventListener('scroll', syncScroll);
    return () => el.removeEventListener('scroll', syncScroll);
  }, [syncScroll]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== 'Tab') return;
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      onChange(`${value.slice(0, Math.max(0, start))}  ${value.slice(Math.max(0, end))}`);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    },
    [value, onChange],
  );

  return (
    <div className={css.codeEditor}>
      <div aria-hidden="true" className={css.codeGutter} ref={gutterRef}>
        {Array.from({ length: lineCount }, (_, i) => (
          <div className={css.codeGutterLine} key={i}>
            {i + 1}
          </div>
        ))}
      </div>
      <textarea
        aria-label="Mermaid code"
        className={css.codeArea}
        placeholder="Enter Mermaid code…"
        ref={textareaRef}
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

const MermaidPreview: FC<{
  code: string;
  error: string;
  height?: number;
  imgSrc: string;
  width?: number;
}> = ({ code, error, imgSrc, width, height }) => {
  if (!code.trim()) {
    return (
      <div className={css.editorPreviewWrap}>
        <span className={css.editorPreviewEmpty}>Enter Mermaid code to see the preview</span>
      </div>
    );
  }

  if (error && !imgSrc) {
    return (
      <div className={css.editorPreviewWrap}>
        <div className={css.editorPreviewErrorWrap}>
          <span className={css.editorPreviewErrorIcon}>
            <CircleAlert size={16} />
          </span>
          <p className={css.editorPreviewErrorTitle}>Syntax error</p>
          <p className={css.editorPreviewErrorMsg}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={css.editorPreviewWrap}>
      <TransformWrapper initialScale={1} maxScale={5} minScale={0.3}>
        <ZoomControls />
        <TransformComponent
          contentStyle={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          wrapperStyle={{ width: '100%', height: '100%' }}
        >
          <img alt="Mermaid diagram" height={height} src={imgSrc} width={width} />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export interface MermaidEditorModalProps {
  colorScheme: ColorScheme;
  dismiss: () => void;
  initialContent: string;
  onDirtyChange?: (dirty: boolean) => void;
  onSave: (content: string) => void;
  requestDismiss?: () => void;
}

export const MermaidEditorModal: FC<MermaidEditorModalProps> = ({
  initialContent,
  onSave,
  onDirtyChange,
  dismiss,
  requestDismiss,
  colorScheme,
}) => {
  const [code, setCode] = useState(initialContent);
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<ViewMode>(() => (isMobile ? 'code' : 'split'));
  const view: ViewMode = isMobile && activeView === 'split' ? 'code' : activeView;
  const debounced = useDebounced(code, 300);
  const { error, imgSrc, svg, width, height } = useMermaidRender(debounced, colorScheme);
  const dirty = code !== initialContent;

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const handleTemplate = useCallback(
    async (template: string) => {
      if (code.trim() && code !== template) {
        const replace = await confirmDiscardChanges({
          title: 'Replace code?',
          description: 'The template replaces the code in the editor.',
          confirmLabel: 'Replace',
        });
        if (!replace) return;
      }
      setCode(template);
    },
    [code],
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({ title: 'Copied', tone: 'success' });
    } catch {
      toast({ title: 'Couldn’t copy code', tone: 'error' });
    }
  }, [code]);

  const handleDownload = useCallback(() => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mermaid-diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, [svg]);

  const handleReset = useCallback(() => setCode(initialContent), [initialContent]);

  const handleSave = useCallback(() => {
    onSave(code);
    dismiss();
  }, [code, onSave, dismiss]);

  const handleCancel = requestDismiss ?? dismiss;

  const syntaxStatus = !debounced.trim() ? (
    'Empty diagram'
  ) : error ? (
    <span className={css.footerStatusError}>1 syntax error</span>
  ) : (
    'Syntax OK'
  );

  return (
    <ModalShell className={css.editorShell} onSave={handleSave}>
      <ModalShellHeader
        icon={<FishSymbol />}
        title="Mermaid diagram"
        actions={
          <MermaidHeaderMenus
            canDownload={!!svg}
            canReset={dirty}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onReset={handleReset}
            onTemplate={handleTemplate}
          />
        }
        center={
          <SegmentedControl
            items={isMobile ? MOBILE_VIEWS : DESKTOP_VIEWS}
            value={view}
            onChange={setActiveView}
          />
        }
        onClose={handleCancel}
      />
      <ModalShellBody className={css.editorBody}>
        {view !== 'preview' && (
          <div
            className={`${css.editorPane} ${view === 'code' ? css.editorPaneFull : css.editorPaneHalf}`}
          >
            <CodeEditor value={code} onChange={setCode} />
          </div>
        )}
        {view !== 'code' && (
          <div className={css.editorPreviewPane}>
            <MermaidPreview
              code={debounced}
              error={error}
              height={height}
              imgSrc={imgSrc}
              width={width}
            />
          </div>
        )}
      </ModalShellBody>
      <ModalShellFooter
        dirty={dirty}
        status={
          <>
            {dirty && 'Unsaved changes · '}
            {syntaxStatus}
          </>
        }
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </ModalShell>
  );
};
