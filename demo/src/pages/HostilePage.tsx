import { ToolbarPlugin } from '@haklex/rich-plugin-toolbar';
import { use, useEffect, useState } from 'react';

import { Panel } from '../components/Panel';
import { VariantPicker } from '../components/VariantPicker';
import { InspectorSection, SwitchRow } from '../components/workbench/Inspector';
import { Workbench } from '../components/workbench/Workbench';
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
    <Workbench
      baseSurface
      meta={<span className="badge">{variant}</span>}
      panelLabel="Inspector"
      panelTitle="Inspector"
      title="Hostile host"
      panel={
        <>
          <InspectorSection title="Variant">
            <VariantPicker block />
          </InspectorSection>
          <InspectorSection title="Host">
            <SwitchRow checked={hostile} label="Hostile CSS" onChange={setHostile} />
            <SwitchRow checked={mapping} label="Stone mapping" onChange={setMapping} />
          </InspectorSection>
        </>
      }
    >
      <LexicalEditor
        header={<ToolbarPlugin className="wb-toolbar" />}
        initialValue={initialContent}
        theme={theme}
        variant={variant}
      />

      <div className="wb-extra">
        <Panel badge={variant} title="Renderer">
          <LexicalRenderer theme={theme} value={initialContent} variant={variant} />
        </Panel>
      </div>
    </Workbench>
  );
}
