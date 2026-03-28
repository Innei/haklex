import 'modern-normalize/modern-normalize.css';
import '@haklex/rich-kit-shiro/style.css';
import '@haklex/rich-kit-shiro/style-renderer.css';
import './demo.css';

import type { ColorScheme } from '@haklex/rich-editor';
import { DialogStackProvider } from '@haklex/rich-editor-ui';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ThemeContext } from './context/ThemeContext';
import { AgentPage } from './pages/AgentPage';
import { BizPage } from './pages/BizPage';
import { CommentsPage } from './pages/CommentsPage';
import { EditorPage } from './pages/EditorPage';
import { NodeShowcase } from './pages/NodeShowcase';
import { PresetsPage } from './pages/PresetsPage';

type Page = 'editor' | 'comments' | 'nodes' | 'presets' | 'biz' | 'agent';
type ThemeMode = 'system' | 'light' | 'dark';

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

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const hash = window.location.hash.slice(1) as Page;
    return hash === 'comments' ||
      hash === 'nodes' ||
      hash === 'presets' ||
      hash === 'biz' ||
      hash === 'agent'
      ? hash
      : 'editor';
  });
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

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as Page;
      const validPage =
        hash === 'comments' ||
        hash === 'nodes' ||
        hash === 'presets' ||
        hash === 'biz' ||
        hash === 'agent'
          ? hash
          : 'editor';
      setCurrentPage(validPage);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page: Page) => {
    window.location.hash = page;
  };

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
                <button
                  className={currentPage === 'editor' ? 'nav-tab nav-tab-active' : 'nav-tab'}
                  onClick={() => navigate('editor')}
                >
                  Editor
                </button>
                <button
                  className={currentPage === 'comments' ? 'nav-tab nav-tab-active' : 'nav-tab'}
                  onClick={() => navigate('comments')}
                >
                  Comments
                </button>
                <button
                  className={currentPage === 'nodes' ? 'nav-tab nav-tab-active' : 'nav-tab'}
                  onClick={() => navigate('nodes')}
                >
                  Node Showcase
                </button>
                <button
                  className={currentPage === 'presets' ? 'nav-tab nav-tab-active' : 'nav-tab'}
                  onClick={() => navigate('presets')}
                >
                  Presets
                </button>
                <button
                  className={currentPage === 'biz' ? 'nav-tab nav-tab-active' : 'nav-tab'}
                  onClick={() => navigate('biz')}
                >
                  Biz
                </button>
                <button
                  className={currentPage === 'agent' ? 'nav-tab nav-tab-active' : 'nav-tab'}
                  onClick={() => navigate('agent')}
                >
                  AI Agent
                </button>
                <div className="nav-divider" />
                <button className="nav-theme-toggle" title={themeLabel} onClick={cycleTheme}>
                  <ThemeIcon size={18} />
                </button>
              </nav>
            </div>
          </header>

          <main className="app-main">
            {currentPage === 'editor' && <EditorPage />}
            {currentPage === 'comments' && <CommentsPage />}
            {currentPage === 'nodes' && <NodeShowcase />}
            {currentPage === 'presets' && <PresetsPage />}
            {currentPage === 'biz' && <BizPage />}
            {currentPage === 'agent' && <AgentPage />}
          </main>
        </div>
      </DialogStackProvider>
    </ThemeContext>
  );
}
