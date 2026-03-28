import 'modern-normalize/modern-normalize.css';
import '@haklex/rich-kit-shiro/style.css';
import '@haklex/rich-kit-shiro/style-renderer.css';
import './demo.css';

import type { ColorScheme } from '@haklex/rich-editor';
import { DialogStackProvider } from '@haklex/rich-editor-ui';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBrowserRouter, Link, Navigate, Outlet, useLocation } from 'react-router-dom';

import { ThemeContext } from './context/ThemeContext';
import { AgentPage } from './pages/AgentPage';
import { BizPage } from './pages/BizPage';
import { CommentsPage } from './pages/CommentsPage';
import { EditorPage } from './pages/EditorPage';
import { NodeShowcase } from './pages/NodeShowcase';
import { PresetsPage } from './pages/PresetsPage';

type ThemeMode = 'system' | 'light' | 'dark';

const navItems = [
  { path: '/editor', label: 'Editor' },
  { path: '/comments', label: 'Comments' },
  { path: '/nodes', label: 'Node Showcase' },
  { path: '/presets', label: 'Presets' },
  { path: '/biz', label: 'Biz' },
  { path: '/agent', label: 'AI Agent' },
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
  const systemScheme = useSystemColorScheme();

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

  return (
    <ThemeContext value={resolved}>
      <DialogStackProvider>
        <div className="app" data-theme={dataTheme}>
          <header className="app-header">
            <div className="app-header-content">
              <div>
                <h1 className="app-title">@haklex/rich-editor</h1>
                <p className="app-subtitle">Lexical-based rich text editor & renderer</p>
              </div>
              <nav className="app-nav">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={
                      location.pathname === item.path ? 'nav-tab nav-tab-active' : 'nav-tab'
                    }
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="nav-divider" />
                <button className="nav-theme-toggle" title={themeLabel} onClick={cycleTheme}>
                  <ThemeIcon size={18} />
                </button>
              </nav>
            </div>
          </header>

          <main className="app-main">
            <Outlet />
          </main>
        </div>
      </DialogStackProvider>
    </ThemeContext>
  );
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/editor', element: <EditorPage /> },
      { path: '/comments', element: <CommentsPage /> },
      { path: '/nodes', element: <NodeShowcase /> },
      { path: '/presets', element: <PresetsPage /> },
      { path: '/biz', element: <BizPage /> },
      { path: '/agent', element: <AgentPage /> },
      { path: '*', element: <Navigate replace to="/editor" /> },
    ],
  },
]);
