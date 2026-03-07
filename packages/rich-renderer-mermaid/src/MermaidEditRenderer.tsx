import { type ColorScheme, useColorScheme } from '@haklex/rich-editor';
import type { MermaidRendererProps } from '@haklex/rich-editor/renderers';
import { presentDialog, usePortalTheme } from '@haklex/rich-editor-ui';
import {
  CircleAlert,
  Code2,
  Columns2,
  Copy,
  Download,
  Eye,
  FishSymbol,
  Maximize2,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { ElementType, FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TransformComponent, TransformWrapper, useControls } from 'react-zoom-pan-pinch';

import * as css from './styles.css';
import { useMermaidRender } from './useMermaidRender';

// ── Templates ───────────────────────────────────────────────────

const TEMPLATES: { label: string; code: string }[] = [
  {
    label: 'Flowchart',
    code: 'graph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Action 1]\n  B -->|No| D[Action 2]\n  C --> E[End]\n  D --> E',
  },
  {
    label: 'Sequence',
    code: 'sequenceDiagram\n  participant A as Client\n  participant B as Server\n  A->>B: Request\n  B-->>A: Response',
  },
  {
    label: 'Class',
    code: 'classDiagram\n  class Animal {\n    +String name\n    +makeSound()\n  }\n  class Dog {\n    +bark()\n  }\n  Animal <|-- Dog',
  },
  {
    label: 'State',
    code: 'stateDiagram-v2\n  [*] --> Idle\n  Idle --> Processing: Submit\n  Processing --> Success: Complete\n  Processing --> Error: Fail\n  Error --> Idle: Retry\n  Success --> [*]',
  },
  {
    label: 'Git',
    code: 'gitGraph\n  commit\n  branch develop\n  checkout develop\n  commit\n  checkout main\n  merge develop\n  commit',
  },
];

// ── Icons (Lucide) ───────────────────────────────────────────────

// Removed inline SVGs in favor of Lucide icons

// ── Preview component with debounce ─────────────────────────────

const MermaidLivePreview: FC<{
  code: string;
  svgRef: { current: string };
  colorScheme: ColorScheme;
}> = ({ code, svgRef, colorScheme }) => {
  const [debounced, setDebounced] = useState(code);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(code), 300);
    return () => clearTimeout(t);
  }, [code]);

  const { loading, error, imgSrc, svg, width, height } = useMermaidRender(debounced, colorScheme);

  useEffect(() => {
    svgRef.current = svg;
  }, [svg, svgRef]);

  if (!debounced.trim()) {
    return (
      <div className={css.editorPreviewWrap}>
        <span className={css.editorPreviewEmpty}>Enter Mermaid code to see the preview</span>
      </div>
    );
  }

  if (loading && !imgSrc) {
    return (
      <div className={css.editorPreviewWrap}>
        <div className={css.mermaidLoading}>Rendering</div>
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
          <p className={css.editorPreviewErrorTitle}>Syntax Error</p>
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
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <img alt="Mermaid diagram" height={height} src={imgSrc} width={width} />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

// ── Code editor with line numbers ───────────────────────────────

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
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        onChange(`${value.slice(0, Math.max(0, start))}  ${value.slice(Math.max(0, end))}`);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        });
      }
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
        className={css.codeArea}
        placeholder="Enter Mermaid code..."
        ref={textareaRef}
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

// ── Editor modal content ────────────────────────────────────────

type ViewMode = 'split' | 'code' | 'preview';

const MermaidEditorContent: FC<{
  initialContent: string;
  onSave: (content: string) => void;
  dismiss: () => void;
  colorScheme: ColorScheme;
}> = ({ initialContent, onSave, dismiss, colorScheme }) => {
  const [code, setCode] = useState(initialContent);
  const [activeView, setActiveView] = useState<ViewMode>('split');
  const [copied, setCopied] = useState(false);
  const svgRef = useRef('');

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleDownload = useCallback(() => {
    const raw = svgRef.current;
    if (!raw) return;
    const blob = new Blob([raw], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mermaid-diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleReset = useCallback(() => setCode(initialContent), [initialContent]);
  const handleSave = useCallback(() => {
    onSave(code);
    dismiss();
  }, [code, onSave, dismiss]);

  const viewBtn = (mode: ViewMode, Icon: ElementType) => (
    <button
      className={`${css.editorViewItem}${activeView === mode ? ` ${css.editorViewItemActive}` : ''}`}
      type="button"
      onClick={() => setActiveView(mode)}
    >
      <Icon size={14} />
    </button>
  );

  return (
    <>
      {/* Header */}
      <div className={css.editorHeader}>
        <div className={css.editorHeaderLeft}>
          <div className={css.editorTitle}>
            <FishSymbol size={18} />
            <span>Mermaid Editor</span>
          </div>
          <div className={css.editorSep} />
          {TEMPLATES.map((tpl) => (
            <button
              className={css.editorTplBtn}
              key={tpl.label}
              type="button"
              onClick={() => setCode(tpl.code)}
            >
              {tpl.label}
            </button>
          ))}
        </div>

        <div className={css.editorHeaderRight}>
          <div className={css.editorViewToggle}>
            {viewBtn('code', Code2)}
            {viewBtn('split', Columns2)}
            {viewBtn('preview', Eye)}
          </div>
          <div className={css.editorSep} />
          <button
            className={css.editorIconBtn}
            title={copied ? 'Copied!' : 'Copy code'}
            type="button"
            onClick={handleCopy}
          >
            <Copy size={14} />
          </button>
          <button
            className={css.editorIconBtn}
            title="Download SVG"
            type="button"
            onClick={handleDownload}
          >
            <Download size={14} />
          </button>
          <button className={css.editorIconBtn} title="Reset" type="button" onClick={handleReset}>
            <RotateCcw size={14} />
          </button>
          <div className={css.editorSep} />
          <button className={css.editorIconBtn} title="Close" type="button" onClick={dismiss}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={css.editorBody}>
        {activeView !== 'preview' && (
          <div
            className={`${css.editorPane} ${activeView === 'code' ? css.editorPaneFull : css.editorPaneHalf}`}
          >
            <div className={css.editorPaneLabel}>Editor</div>
            <CodeEditor value={code} onChange={setCode} />
          </div>
        )}
        {activeView !== 'code' && (
          <div className={css.editorPreviewPane}>
            <div className={css.editorPaneLabel}>Preview</div>
            <MermaidLivePreview code={code} colorScheme={colorScheme} svgRef={svgRef} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={css.editorFooter}>
        <div className={css.footerActions}>
          <button className={css.footerBtnCancel} type="button" onClick={dismiss}>
            Cancel
          </button>
          <button className={css.footerBtnSave} type="button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </>
  );
};

// ── Zoom controls ───────────────────────────────────────────────

const ZoomControls: FC = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className={css.zoomControls}>
      <button className={css.zoomBtn} type="button" onClick={() => zoomIn()}>
        <ZoomIn size={14} />
      </button>
      <button className={css.zoomBtn} type="button" onClick={() => zoomOut()}>
        <ZoomOut size={14} />
      </button>
      <button className={css.zoomBtn} type="button" onClick={() => resetTransform()}>
        <Maximize2 size={14} />
      </button>
    </div>
  );
};

// ── Main renderer ───────────────────────────────────────────────

export const MermaidEditRenderer: FC<MermaidRendererProps> = ({ content, onContentChange }) => {
  const colorScheme = useColorScheme();
  const { loading, error, imgSrc, width, height } = useMermaidRender(content);
  const { className: portalClassName } = usePortalTheme();

  const handleClick = useCallback(() => {
    if (!onContentChange) return;
    presentDialog({
      content: ({ dismiss }) => (
        <MermaidEditorContent
          colorScheme={colorScheme}
          dismiss={dismiss}
          initialContent={content}
          onSave={onContentChange}
        />
      ),
      className: css.editorPopup,
      portalClassName,
      theme: colorScheme,
      showCloseButton: false,
      clickOutsideToDismiss: false,
    });
  }, [onContentChange, content, portalClassName, colorScheme]);

  if (loading) {
    return <div className={css.mermaidLoading}>Mermaid Loading</div>;
  }

  if (!imgSrc) {
    return <div className={css.mermaidError}>{error || 'Render failed'}</div>;
  }

  return (
    <div className={css.mermaidContainer}>
      {onContentChange && (
        <span className={css.mermaidEditHint} onClick={handleClick}>
          Edit
        </span>
      )}
      <TransformWrapper initialScale={1} maxScale={4} minScale={0.5}>
        <ZoomControls />
        <TransformComponent
          wrapperStyle={{ width: '100%' }}
          contentStyle={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <img alt="Mermaid diagram" height={height} src={imgSrc} width={width} />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};
