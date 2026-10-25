import { Monitor, Moon, Search, Sun } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

import editorPkg from '../../../../packages/rich-editor/package.json';
import type { NavSection } from '../../site/catalog';
import { activeSection, currentLeafPath, navGroups } from '../../site/catalog';
import { Logo } from '../Logo';
import { Segmented } from '../ui/Segmented';
import { GithubMark } from './GithubMark';

export type ThemeMode = 'system' | 'light' | 'dark';

const themeOptions = [
  { value: 'system' as const, title: 'System', label: <Monitor size={14} /> },
  { value: 'light' as const, title: 'Light', label: <Sun size={14} /> },
  { value: 'dark' as const, title: 'Dark', label: <Moon size={14} /> },
];

interface SidebarProps {
  onOpenSearch: () => void;
  onThemeModeChange: (mode: ThemeMode) => void;
  themeMode: ThemeMode;
}

function SectionTree({ current, section }: { current: string; section: NavSection }) {
  return (
    <div className="nav-tree">
      {section.tree!.map((group, i) => (
        <div className="nav-group" key={group.label ?? i} style={{ gap: 0 }}>
          {group.label && (
            <div className="nav-tree-label">{`${group.label} · ${group.items.length}`}</div>
          )}
          {group.items.map((leaf) => (
            <Link
              aria-current={leaf.path === current ? 'page' : undefined}
              className="nav-leaf"
              key={leaf.path}
              to={leaf.path}
            >
              {leaf.label}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}

export function Sidebar({ onOpenSearch, onThemeModeChange, themeMode }: SidebarProps) {
  const location = useLocation();
  const active = activeSection(location.pathname);
  const current = currentLeafPath(location.pathname, location.search);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    navRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' });
  }, [current]);

  return (
    <aside aria-label="Site" className="sidebar">
      <div className="sidebar-head">
        <Link className="sidebar-brand" to="/editor">
          <Logo size={20} />
          haklex
        </Link>
        <span className="sidebar-version">{`v${editorPkg.version}`}</span>
      </div>

      <button className="sidebar-search" type="button" onClick={onOpenSearch}>
        <Search size={14} />
        Search
        <span className="kbd">⌘K</span>
      </button>

      <nav className="sidebar-nav" ref={navRef}>
        {navGroups.map((group) => (
          <div className="nav-group" key={group.label}>
            <div className="nav-group-label">{group.label}</div>
            {group.sections.map((section) => {
              const isActive = active?.id === section.id;
              return (
                <div className="nav-group" key={section.id}>
                  <Link className="nav-item" data-active={isActive} to={section.path}>
                    {section.label}
                    {section.count != null && <span className="nav-count">{section.count}</span>}
                  </Link>
                  {isActive && section.tree && <SectionTree current={current} section={section} />}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <a
          className="sidebar-link"
          href="https://github.com/innei/haklex"
          rel="noreferrer"
          target="_blank"
        >
          <GithubMark />
          GitHub
        </a>
        <Segmented
          iconOnly
          label="Color scheme"
          options={themeOptions}
          value={themeMode}
          onChange={onThemeModeChange}
        />
      </div>
    </aside>
  );
}
