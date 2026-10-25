import { ToolbarPlugin } from '@haklex/rich-plugin-toolbar';
import { use, useEffect, useState } from 'react';

import { Panel } from '../components/Panel';
import { VariantPicker } from '../components/VariantPicker';
import { useTheme } from '../context/ThemeContext';
import { VariantContext } from '../context/VariantContext';
import { initialContent } from '../fixtures/initial-content';
import { LexicalEditor, LexicalRenderer } from '../lexical';
import { hostileHostCss, hostMappingCss } from './hostile-host-css';

function useInjectedStyle(id: string, css: string, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    document.head.append(el);
    return () => el.remove();
  }, [id, css, enabled]);
}

export function HostilePage() {
  const variant = use(VariantContext);
  const theme = useTheme();
  const [hostile, setHostile] = useState(true);
  const [mapping, setMapping] = useState(false);

  useInjectedStyle('hostile-host-css', hostileHostCss, hostile);
  useInjectedStyle('host-mapping-css', hostMappingCss, mapping);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.hostTheme = theme;
    return () => {
      delete root.dataset.hostTheme;
    };
  }, [theme]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="toolbar">
        <VariantPicker />
        <div className="toolbar-group">
          <span className="toolbar-label">Host</span>
          <button
            className={hostile ? 'btn btn-active' : 'btn'}
            onClick={() => setHostile((v) => !v)}
          >
            Hostile CSS
          </button>
          <button
            className={mapping ? 'btn btn-active' : 'btn'}
            onClick={() => setMapping((v) => !v)}
          >
            Stone mapping
          </button>
        </div>
      </div>

      <Panel badge={variant} bodyStyle={{ padding: 0 }} title="Editor">
        <LexicalEditor
          header={<ToolbarPlugin />}
          initialValue={initialContent}
          theme={theme}
          variant={variant}
        />
      </Panel>

      <Panel badge={variant} title="Renderer">
        <LexicalRenderer theme={theme} value={initialContent} variant={variant} />
      </Panel>
    </div>
  );
}
