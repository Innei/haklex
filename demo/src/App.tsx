import 'modern-normalize/modern-normalize.css';
import '@haklex/rich-kit-shiro/style.css';
import '@haklex/rich-kit-shiro/style-renderer.css';
import './demo.css';

import type { ColorScheme, RichEditorVariant } from '@haklex/rich-editor';
import { DialogStackProvider } from '@haklex/rich-editor-ui';
import { PollDataProvider } from '@haklex/rich-ext-poll';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createBrowserRouter, Link, Navigate, Outlet, useLocation } from 'react-router-dom';

import { Logo } from './components/Logo';
import { FullWidthContext, SetFullWidthContext } from './context/FullWidthContext';
import { ThemeContext } from './context/ThemeContext';
import { SetVariantContext, VariantContext } from './context/VariantContext';
import { mockPollAdapter } from './fixtures/mock-poll-adapter';
import { AgentPage } from './pages/AgentPage';
import { CommentsPage } from './pages/CommentsPage';
import { EditorPage } from './pages/EditorPage';
import { ExtensionsPage } from './pages/ExtensionsPage';
import { NodeShowcase } from './pages/NodeShowcase';
import { PresetsPage } from './pages/PresetsPage';

type ThemeMode = 'system' | 'light' | 'dark';

const navItems = [
  { path: '/editor', label: 'Editor' },
  { path: '/presets', label: 'Presets' },
  { path: '/comments', label: 'Comments' },
  { path: '/nodes', label: 'Nodes' },
  { path: '/extensions', label: 'Extensions' },
  { path: '/ai', label: 'AI' },
] as const;

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
  const [fullWidth, setFullWidth] = useState(false);
  const systemScheme = useSystemColorScheme();
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(88);

  const resolved: ColorScheme = themeMode === 'system' ? systemScheme : themeMode;

  const dataTheme = useMemo(
    () => (themeMode === 'system' ? systemScheme : themeMode),
    [systemScheme, themeMode],
  );

  const cycleTheme = useCallback(() => {
    setThemeMode((m) => {
      if (m === 'system') return 'light';
      if (m === 'light') return 'dark';
      return 'system';
    });
  }, []);

  const themeLabel = themeMode === 'system' ? 'System' : themeMode === 'light' ? 'Light' : 'Dark';
  const ThemeIcon = themeMode === 'system' ? Monitor : themeMode === 'light' ? Sun : Moon;

  const isActivePath = useCallback(
    (path: string) => {
      if (path === '/') return location.pathname === '/';
      return location.pathname === path || location.pathname.startsWith(`${path}/`);
    },
    [location.pathname],
  );

  useEffect(() => {
    const headerNode = headerRef.current;

    if (!headerNode) {
      return;
    }

    const updateHeaderHeight = () => {
      setHeaderHeight(headerNode.offsetHeight);
    };

    updateHeaderHeight();

    const observer = new ResizeObserver(updateHeaderHeight);
    observer.observe(headerNode);

    return () => {
      observer.disconnect();
    };
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
          <div
            className="app"
            data-theme={dataTheme}
            style={{ ['--app-header-height' as string]: `${headerHeight}px` }}
          >
            <header
              className="app-header"
              ref={headerRef}
              style={{ left: 0, position: 'fixed', right: 0, top: 0 }}
            >
              <div className="app-header-content">
                <Link className="app-logo" to="/">
                  <Logo size={20} />
                  <span className="app-logo-text">haklex</span>
                </Link>
                <nav className="app-nav">
                  {navItems.map((item) => (
                    <Link
                      className={isActivePath(item.path) ? 'nav-tab nav-tab-active' : 'nav-tab'}
                      key={item.path}
                      to={item.path}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="app-header-right">
                  <a
                    className="nav-icon-btn"
                    href="https://github.com/innei/haklex"
                    rel="noreferrer"
                    target="_blank"
                    title="GitHub"
                  >
                    <svg fill="currentColor" height={18} viewBox="0 0 24 24" width={18}>
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
                    </svg>
                  </a>
                  <button className="nav-icon-btn" title={themeLabel} onClick={cycleTheme}>
                    <ThemeIcon size={16} />
                  </button>
                </div>
              </div>
            </header>

            <main
              className="app-main"
              style={{
                bottom: 0,
                left: 0,
                margin: 0,
                maxWidth: 'none',
                overflowY: 'auto',
                padding: 0,
                paddingBottom: fullWidth ? 0 : '64px',
                position: 'fixed',
                right: 0,
                top: `${headerHeight}px`,
                width: 'auto',
              }}
            >
              <div
                style={{
                  boxSizing: 'border-box',
                  margin: '0 auto',
                  maxWidth: fullWidth ? 'none' : '1200px',
                  minHeight: '100%',
                  padding: fullWidth ? 0 : '24px',
                  width: '100%',
                }}
              >
                <SetFullWidthContext value={setFullWidth}>
                  <FullWidthContext value={fullWidth}>
                    <SetVariantContext value={setVariant}>
                      <VariantContext value={variant}>
                        <Outlet />
                      </VariantContext>
                    </SetVariantContext>
                  </FullWidthContext>
                </SetFullWidthContext>
              </div>
            </main>
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
      { path: '/nodes', element: <NodeShowcase /> },
      { path: '/extensions', element: <ExtensionsPage /> },
      { path: '/ai', element: <AgentPage /> },
      { path: '*', element: <Navigate replace to="/editor" /> },
    ],
  },
]);
