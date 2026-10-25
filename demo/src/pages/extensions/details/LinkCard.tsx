import { getVariantClass } from '@haklex/rich-editor';
import { LinkCardRenderer } from '@haklex/rich-renderer-linkcard/static';
import { useState } from 'react';

import { Panel } from '../../../components/Panel';
import { useTheme } from '../../../context/ThemeContext';
import {
  customGithubRepoPlugin,
  extraLinkCardPlugins,
} from '../../../fixtures/extra-linkcard-plugins';

interface DemoCard {
  description: string;
  key: string;
  label: string;
  title?: string;
  url: string;
  useOverride?: boolean;
}

const demoCards: DemoCard[] = [
  {
    key: 'gh-repo',
    label: 'GitHub Repo',
    url: 'https://github.com/facebook/react',
    description: 'shape=compact · gh-repo · star count + description',
  },
  {
    key: 'gh-pr',
    label: 'GitHub PR',
    url: 'https://github.com/facebook/react/pull/28000',
    description: 'shape=compact · gh-pr · state badge + diff stats',
  },
  {
    key: 'gh-issue',
    label: 'GitHub Issue',
    url: 'https://github.com/facebook/react/issues/26380',
    description: 'shape=compact · gh-issue · state + repo path',
  },
  {
    key: 'gh-commit',
    label: 'GitHub Commit',
    url: 'https://github.com/facebook/react/commit/4ea0b8c',
    description: 'shape=compact · gh-commit · sha + diff stats',
  },
  {
    key: 'gh-discussion',
    label: 'GitHub Discussion',
    url: 'https://github.com/vercel/next.js/discussions/55205',
    description: 'shape=compact · gh-discussion · category badge',
  },

  {
    key: 'arxiv',
    label: 'arXiv Paper',
    url: 'https://arxiv.org/abs/1706.03762',
    description: 'shape=expanded · mono id badge · 3-line abstract',
  },

  {
    key: 'leetcode',
    label: 'LeetCode Problem',
    url: 'https://leetcode.cn/problems/two-sum/',
    description: 'shape=wide · difficulty color + tags + AR',
  },
  {
    key: 'netease',
    label: 'Netease Music Song',
    url: 'https://music.163.com/song?id=186016',
    description: 'shape=wide · block desc (歌手 / 专辑)',
  },
  {
    key: 'qq-music',
    label: 'QQ Music Song',
    url: 'https://y.qq.com/n/ryqq/songDetail/001Qu4I30eVFYb',
    description: 'shape=wide · block desc (歌手 / 专辑)',
  },

  {
    key: 'bangumi',
    label: 'Bangumi Subject',
    url: 'https://bgm.tv/subject/253',
    description: 'shape=poster · vertical poster + rating',
  },
  {
    key: 'tmdb-movie',
    label: 'TMDB Movie',
    url: 'https://www.themoviedb.org/movie/129',
    description: 'shape=poster · vertical poster + ★ rating',
  },
  {
    key: 'tmdb-tv',
    label: 'TMDB TV',
    url: 'https://www.themoviedb.org/tv/72636',
    description: 'shape=poster · vertical poster + ★ rating',
  },

  {
    key: 'douban',
    label: 'Douban Book (custom plugin)',
    url: 'https://book.douban.com/subject/1477390',
    description: 'shape=poster · custom plugin merged into builtins',
  },
  {
    key: 'issue',
    label: 'Internal Issue (custom plugin)',
    url: 'https://issues.example.com/PROJ-1234',
    description: 'shape=compact · custom plugin added alongside builtins',
  },
  {
    key: 'github-override',
    label: 'GitHub Repo (overridden)',
    url: 'https://github.com/vercel/next.js',
    description: 'Same-name "gh-repo" overrides the built-in implementation',
    useOverride: true,
  },

  {
    key: 'static',
    label: 'Static fallback (no plugin match)',
    url: 'https://example.com/article',
    title: 'Example Article',
    description: 'Falls back to static props rendering when no plugin matches',
  },
  {
    key: 'error',
    label: 'Error state (404 repo)',
    url: 'https://github.com/this-org-does-not-exist-xyz/no-repo',
    description: 'fetch fail → dashed degraded link with host + hint',
  },
];

export function LinkCardDetail() {
  const theme = useTheme();
  const [showOverride, setShowOverride] = useState(false);

  return (
    <>
      <p
        style={{
          margin: '0 0 16px',
          color: 'var(--rc-text-tertiary)',
          fontSize: 14,
        }}
      >
        <code>plugins</code> prop merges with built-in 11 plugins (same-name overrides, sorted by
        priority).
      </p>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <div className="toolbar-group">
          <span className="toolbar-label">Override</span>
          <button
            className={showOverride ? 'btn btn-active' : 'btn'}
            onClick={() => setShowOverride((v) => !v)}
          >
            Override gh-repo
          </button>
        </div>
      </div>

      <div className="biz-grid">
        {demoCards
          .filter((c) => !c.useOverride || showOverride)
          .map((card) => (
            <Panel badge="linkcard" key={card.key} title={card.label}>
              <p className="node-description">{card.description}</p>
              <div
                className={`node-render ${getVariantClass('article')}`}
                data-theme={theme}
                style={{ marginTop: 8 }}
              >
                <LinkCardRenderer
                  title={card.title}
                  url={card.url}
                  plugins={
                    card.useOverride
                      ? [...extraLinkCardPlugins, customGithubRepoPlugin]
                      : extraLinkCardPlugins
                  }
                />
              </div>
            </Panel>
          ))}
      </div>
    </>
  );
}
