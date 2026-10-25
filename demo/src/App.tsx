import 'modern-normalize/modern-normalize.css';
import './lexical/style';
import './styles/base.css';
import './styles/shell.css';
import './styles/palette.css';
import './styles/doc.css';
import './styles/sketch.css';
import './styles/workbench.css';
import './styles/catalog.css';
import './styles/tokens.css';
import './styles/component-sketch.css';
import './demo.css';

import type { ColorScheme, RichEditorVariant } from '@haklex/rich-editor';
import { DialogStackProvider } from '@haklex/rich-editor-ui';
import { PollDataProvider } from '@haklex/rich-ext-poll';
import { Menu } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createBrowserRouter, Link, Navigate, Outlet, useLocation } from 'react-router-dom';

import { Logo } from './components/Logo';
import { CommandPalette } from './components/shell/CommandPalette';
import type { ThemeMode } from './components/shell/Sidebar';
import { Sidebar } from './components/shell/Sidebar';
import { ThemeContext } from './context/ThemeContext';
import { SetVariantContext, VariantContext } from './context/VariantContext';
import { mockPollAdapter } from './fixtures/mock-poll-adapter';
import { AgentPage } from './pages/AgentPage';
import { ChartKindPage } from './pages/charts/ChartKindPage';
import { ChartsOverview } from './pages/charts/ChartsOverview';
import { CommentsPage } from './pages/CommentsPage';
import { ComponentPage } from './pages/components/ComponentPage';
import { ComponentsOverview } from './pages/components/ComponentsOverview';
import { EditorPage } from './pages/EditorPage';
import { ExtensionPage } from './pages/extensions/ExtensionPage';
import { ExtensionsOverview } from './pages/extensions/ExtensionsOverview';
import { HostilePage } from './pages/HostilePage';
import { NodesOverview } from './pages/nodes/NodesOverview';
import { NodeTypePage } from './pages/nodes/NodeTypePage';
import { PresetsPage } from './pages/PresetsPage';
import { TokensPage } from './pages/tokens/TokensPage';

function useSystemColorScheme(): ColorScheme {
  const [scheme, setScheme] = useState<ColorScheme>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setScheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return scheme;
}

function Layout() {
  const location = useLocation();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [variant, setVariant] = useState<RichEditorVariant>('article');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const systemScheme = useSystemColorScheme();
  const resolved: ColorScheme = themeMode === 'system' ? systemScheme : themeMode;

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname, location.search]);

  useLayoutEffect(() => {
    if (!location.hash && mainRef.current) mainRef.current.scrollTop = 0;
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const previousBodyMargin = document.body.style.margin;
    document.body.style.margin = '0';
    return () => {
      document.body.style.margin = previousBodyMargin;
    };
  }, []);

  return (
    <ThemeContext value={resolved}>
      <DialogStackProvider>
        <PollDataProvider adapter={mockPollAdapter}>
          <div className="app" data-drawer={drawerOpen ? 'open' : 'closed'} data-theme={resolved}>
            <header className="mobile-bar">
              <button
                aria-expanded={drawerOpen}
                aria-label="Open navigation"
                className="icon-btn"
                type="button"
                onClick={() => setDrawerOpen(true)}
              >
                <Menu size={18} />
              </button>
              <Link className="sidebar-brand" to="/editor">
                <Logo size={20} />
                haklex
              </Link>
            </header>
            <div aria-hidden="true" className="drawer-scrim" onClick={() => setDrawerOpen(false)} />
            <Sidebar
              themeMode={themeMode}
              onOpenSearch={() => setPaletteOpen(true)}
              onThemeModeChange={setThemeMode}
            />
            <main className="app-main" ref={mainRef}>
              <SetVariantContext value={setVariant}>
                <VariantContext value={variant}>
                  <Outlet />
                </VariantContext>
              </SetVariantContext>
            </main>
            {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
          </div>
        </PollDataProvider>
      </DialogStackProvider>
    </ThemeContext>
  );
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate replace to="/editor" /> },
      { path: '/editor', element: <EditorPage /> },
      { path: '/presets', element: <PresetsPage /> },
      { path: '/comments', element: <CommentsPage /> },
      { path: '/nodes', element: <NodesOverview /> },
      { path: '/nodes/:type', element: <NodeTypePage /> },
      { path: '/extensions', element: <ExtensionsOverview /> },
      { path: '/extensions/:id', element: <ExtensionPage /> },
      { path: '/charts', element: <ChartsOverview /> },
      { path: '/charts/:kind', element: <ChartKindPage /> },
      { path: '/tokens', element: <TokensPage /> },
      { path: '/ui', element: <ComponentsOverview key="ui" kind="ui" /> },
      { path: '/ui/:id', element: <ComponentPage key="ui" kind="ui" /> },
      { path: '/chrome', element: <ComponentsOverview key="chrome" kind="chrome" /> },
      { path: '/chrome/:id', element: <ComponentPage key="chrome" kind="chrome" /> },
      { path: '/ai', element: <AgentPage /> },
      { path: '/hostile', element: <HostilePage /> },
      { path: '*', element: <Navigate replace to="/editor" /> },
    ],
  },
]);
