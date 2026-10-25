import { ColorSchemeProvider, getVariantClass } from '@haklex/rich-editor';
import type { GalleryImage, GalleryRendererProps } from '@haklex/rich-ext-gallery';
import { GalleryRenderer } from '@haklex/rich-ext-gallery/static';
import { PortalThemeProvider } from '@haklex/rich-style-token';
import { type FC, useState } from 'react';

import { Panel } from '../../../components/Panel';
import { useTheme } from '../../../context/ThemeContext';

const galleryLayouts = ['grid', 'masonry', 'carousel'] as const;
type GalleryLayout = (typeof galleryLayouts)[number];

const galleryStaticImages: GalleryImage[] = [
  {
    src: 'https://picsum.photos/id/1015/800/520',
    alt: 'Mountain river',
    width: 800,
    height: 520,
  },
  { src: 'https://picsum.photos/id/1018/800/520', alt: 'Misty peaks', width: 800, height: 520 },
  { src: 'https://picsum.photos/id/1019/800/520', alt: 'Forest lake', width: 800, height: 520 },
  { src: 'https://picsum.photos/id/1039/800/520', alt: 'Coastline', width: 800, height: 520 },
];

const galleryEditInitial: GalleryImage[] = [
  { src: 'https://picsum.photos/id/1043/800/520', alt: 'Field', width: 800, height: 520 },
  { src: 'https://picsum.photos/id/1059/800/520', alt: 'Snow', width: 800, height: 520 },
  { src: 'https://picsum.photos/id/1062/800/520', alt: 'Clouds', width: 800, height: 520 },
];

export function GalleryDetail() {
  const theme = useTheme();
  const [staticLayout, setStaticLayout] = useState<GalleryLayout>('grid');
  const [editImages, setEditImages] = useState<GalleryImage[]>(galleryEditInitial);
  const [editLayout, setEditLayout] = useState<GalleryLayout>('grid');
  const [EditRenderer, setEditRenderer] = useState<FC<GalleryRendererProps> | null>(null);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    import('@haklex/rich-ext-gallery').then((mod) => {
      setEditRenderer(() => mod.GalleryEditRenderer);
      setLoaded(true);
    });
  }

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
          Three layouts: <strong>Grid</strong> (uniform columns), <strong>Masonry</strong> (variable
          height), <strong>Carousel</strong> (horizontal scroll with autoplay and indicators). Click
          any image to open the lightbox.
        </p>

        <div className="toolbar" style={{ marginBottom: 16 }}>
          <div className="toolbar-group">
            <span className="toolbar-label">Layout</span>
            {galleryLayouts.map((l) => (
              <button
                className={staticLayout === l ? 'btn btn-active' : 'btn'}
                key={l}
                onClick={() => setStaticLayout(l)}
              >
                {l[0].toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <Panel badge={`gallery · ${staticLayout}`} title="Static Renderer">
          <p className="node-description">
            Read-only display. Carousel mode autoplays with bidirectional scroll until the user
            interacts.
          </p>
          <div
            className={`node-render ${getVariantClass('article')}`}
            data-color-scheme={theme}
            data-theme={theme}
          >
            <GalleryRenderer images={galleryStaticImages} layout={staticLayout} />
          </div>
        </Panel>

        <div style={{ height: 16 }} />

        <Panel badge={`gallery · edit · ${editLayout}`} title="Edit Mode">
          <p className="node-description">
            Hover to reveal the Edit button. The dialog supports drag-reorder, add/remove, and a
            segmented control for layout switching.
          </p>
          <div
            className={`node-render ${getVariantClass('article')}`}
            data-color-scheme={theme}
            data-theme={theme}
          >
            {EditRenderer ? (
              <EditRenderer
                images={editImages}
                layout={editLayout}
                onImagesChange={setEditImages}
                onLayoutChange={setEditLayout}
              />
            ) : (
              <p style={{ color: 'var(--rc-text-tertiary)', fontSize: 14 }}>
                Loading edit renderer...
              </p>
            )}
          </div>
        </Panel>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  );
}
