import { ColorSchemeProvider, getVariantClass } from '@haklex/rich-editor';
import { DynamicSSRRenderer } from '@haklex/rich-ext-dynamic/static';
import { PortalThemeProvider } from '@haklex/rich-style-token';

import { Panel } from '../../../components/Panel';
import { useTheme } from '../../../context/ThemeContext';

const DYNAMIC_WIDGET_URL = '/dynamic-widgets/counter.mjs';

export function DynamicDetail() {
  const theme = useTheme();

  return (
    <PortalThemeProvider className={getVariantClass('article')} theme={theme}>
      <ColorSchemeProvider colorScheme={theme}>
        <p
          style={{
            margin: '0 0 16px',
            color: 'var(--rc-text-tertiary)',
            fontSize: 14,
          }}
        >
          The widget below is a plain ESM file served from <code>{DYNAMIC_WIDGET_URL}</code>, loaded
          at runtime via <code>import(url)</code> and mounted inside a shadow root. Toggle the site
          theme — it reaches the widget through <code>handle.update</code> and the{' '}
          <code>--rc-*</code> CSS variables.
        </p>
        <div className="biz-grid">
          <Panel badge="dynamic" title="Default Props">
            <p className="node-description">
              Mounted with <code>{'{}'}</code> — the widget falls back to its own defaults.
            </p>
            <div
              className={getVariantClass('article')}
              data-color-scheme={theme}
              data-theme={theme}
            >
              <DynamicSSRRenderer
                componentProps={{}}
                initialHeight={140}
                url={DYNAMIC_WIDGET_URL}
              />
            </div>
          </Panel>

          <Panel badge="dynamic" title="Per-Instance Props">
            <p className="node-description">
              Same module, different payload: <code>{'{"title":"Score","step":10}'}</code>.
            </p>
            <div
              className={getVariantClass('article')}
              data-color-scheme={theme}
              data-theme={theme}
            >
              <DynamicSSRRenderer
                componentProps={{ title: 'Score', step: 10 }}
                initialHeight={140}
                url={DYNAMIC_WIDGET_URL}
              />
            </div>
          </Panel>
        </div>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  );
}
