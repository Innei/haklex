import { ColorSchemeProvider, getVariantClass } from '@haklex/rich-editor';
import type { ExcalidrawEditRendererProps, ExcalidrawSnapshot } from '@haklex/rich-ext-excalidraw';
import { ExcalidrawConfigProvider } from '@haklex/rich-ext-excalidraw/static';
import { PortalThemeProvider } from '@haklex/rich-style-token';
import { type FC, useCallback, useState } from 'react';

import { Panel } from '../../../components/Panel';
import { useTheme } from '../../../context/ThemeContext';

const excalidrawInlineSnapshot = JSON.stringify({
  elements: [
    {
      id: 'rect1',
      type: 'rectangle',
      x: 100,
      y: 100,
      width: 200,
      height: 120,
      strokeColor: '#1971c2',
      backgroundColor: '#a5d8ff',
      fillStyle: 'solid',
      strokeWidth: 2,
      roughness: 1,
      opacity: 100,
      seed: 1,
      version: 1,
      versionNonce: 1,
      isDeleted: false,
      boundElements: null,
      updated: 1,
      link: null,
      locked: false,
    },
    {
      id: 'ellipse1',
      type: 'ellipse',
      x: 350,
      y: 140,
      width: 160,
      height: 80,
      strokeColor: '#e8590c',
      backgroundColor: '#ffc078',
      fillStyle: 'solid',
      strokeWidth: 2,
      roughness: 1,
      opacity: 100,
      seed: 2,
      version: 1,
      versionNonce: 2,
      isDeleted: false,
      boundElements: null,
      updated: 1,
      link: null,
      locked: false,
    },
  ],
  appState: { viewBackgroundColor: '#ffffff' },
  files: {},
});

export function ExcalidrawDetail() {
  const theme = useTheme();
  const [blobStore] = useState<Map<string, string>>(() => new Map());

  const mockSaveSnapshot = useCallback(
    async (snapshot: object) => {
      const json = JSON.stringify(snapshot);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      blobStore.set(url, json);
      return url;
    },
    [blobStore],
  );

  const [remoteSnapshot, setRemoteSnapshot] = useState<ExcalidrawSnapshot>(() => ({
    type: 'remote',
    url: URL.createObjectURL(new Blob([excalidrawInlineSnapshot], { type: 'application/json' })),
  }));
  const [deltaSnapshot, setDeltaSnapshot] = useState<ExcalidrawSnapshot>(() => ({
    type: 'delta',
    baseUrl: URL.createObjectURL(
      new Blob([excalidrawInlineSnapshot], { type: 'application/json' }),
    ),
    delta: {},
  }));

  const [ExcalidrawEditRenderer, setEditRenderer] =
    useState<FC<ExcalidrawEditRendererProps> | null>(null);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    import('@haklex/rich-ext-excalidraw').then((mod) => {
      setEditRenderer(() => mod.ExcalidrawEditRenderer);
      setLoaded(true);
    });
  }

  if (!ExcalidrawEditRenderer) {
    return (
      <p style={{ color: 'var(--rc-text-tertiary)', fontSize: 14 }}>Loading excalidraw editor...</p>
    );
  }

  return (
    <PortalThemeProvider className={getVariantClass('article')} theme={theme}>
      <ColorSchemeProvider colorScheme={theme}>
        <ExcalidrawConfigProvider saveSnapshot={mockSaveSnapshot}>
          <p
            style={{
              margin: '0 0 16px',
              color: 'var(--rc-text-tertiary)',
              fontSize: 14,
            }}
          >
            Three storage strategies: <strong>Remote</strong> (full snapshot uploaded as blob URL)
            and <strong>Delta</strong> (base ref + JSON diff patch).
          </p>
          <div className="biz-grid">
            <Panel badge="excalidraw" title="Remote Mode">
              <p className="node-description">
                Snapshot uploaded to a blob URL. The editor stores the URL as the snapshot value.
              </p>
              <div
                className={getVariantClass('article')}
                data-color-scheme={theme}
                data-theme={theme}
                style={{ position: 'relative' }}
              >
                <ExcalidrawEditRenderer
                  snapshot={remoteSnapshot}
                  onSnapshotChange={setRemoteSnapshot}
                />
              </div>
            </Panel>

            <Panel badge="excalidraw" title="Delta Mode">
              <p className="node-description">
                Base snapshot uploaded once. Subsequent saves store only the JSON diff.
              </p>
              <div
                className={getVariantClass('article')}
                data-color-scheme={theme}
                data-theme={theme}
                style={{ height: 320, position: 'relative' }}
              >
                <ExcalidrawEditRenderer
                  snapshot={deltaSnapshot}
                  onSnapshotChange={setDeltaSnapshot}
                />
              </div>
            </Panel>
          </div>
        </ExcalidrawConfigProvider>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  );
}
