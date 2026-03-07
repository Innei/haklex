import type { FC } from 'react';
import { useMemo } from 'react';

import * as styles from '../styles.css';
import { getMaterialIconSvg } from './material-icon';

/** Maps normalized language to material-icon-theme icon name. */
export const LANG_TO_ICON: Record<string, string> = {
  'javascript': 'javascript',
  'js': 'javascript',
  'typescript': 'typescript',
  'ts': 'typescript',
  'angular-ts': 'angular',
  'angular-html': 'angular',
  'jsx': 'react',
  'tsx': 'react',
  'html': 'html',
  'html-derivative': 'html',
  'css': 'css',
  'scss': 'sass',
  'sass': 'sass',
  'less': 'sass',
  'postcss': 'postcss',
  'stylus': 'stylus',
  'json': 'json',
  'json5': 'json',
  'jsonc': 'json',
  'jsonl': 'json',
  'markdown': 'markdown',
  'md': 'markdown',
  'mdx': 'markdown',
  'mdc': 'markdown',
  'bash': 'console',
  'sh': 'console',
  'shell': 'console',
  'shellscript': 'console',
  'zsh': 'console',
  'python': 'python',
  'py': 'python',
  'rust': 'rust',
  'go': 'go',
  'java': 'java',
  'c': 'c',
  'cpp': 'cpp',
  'c++': 'cpp',
  'swift': 'swift',
  'kotlin': 'kotlin',
  'kt': 'kotlin',
  'yaml': 'yaml',
  'yml': 'yaml',
  'sql': 'database',
  'xml': 'xml',
  'vue': 'vue',
  'vue-html': 'vue',
  'vue-vine': 'vue',
  'svelte': 'svelte',
  'astro': 'astro',
  'php': 'php',
  'rb': 'ruby',
  'r': 'r',
  'julia': 'julia',
  'lua': 'lua',
  'zig': 'zig',
  'toml': 'toml',
  'graphql': 'graphql',
  'gql': 'graphql',
  'dockerfile': 'docker',
  'coffee': 'coffee',
  'pug': 'pug',
  'haml': 'haml',
  'handlebars': 'handlebars',
  'marko': 'markojs',
  'imba': 'imba',
  'hurl': 'hurl',
  'http': 'http',
};

function getLanguageIconSvg(lang: string): string | null {
  const iconName = LANG_TO_ICON[lang] ?? 'code';
  return getMaterialIconSvg(iconName);
}

/** Returns whether a Material icon is available for the given language. */
export function hasLanguageIcon(lang: string): boolean {
  return getLanguageIconSvg(lang) !== null;
}

export const LanguageIcon: FC<{
  language: string;
  size?: number;
  className?: string;
}> = ({
  language,
  size = 14,
  className = `${styles.langIcon} ${styles.semanticClassNames.langIcon}`,
}) => {
  const html = useMemo(() => getLanguageIconSvg(language), [language]);

  if (!html) {
    return (
      <span
        className={className}
        style={{
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.6,
          fontSize: size * 0.6,
        }}
      >
        •
      </span>
    );
  }

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ width: size, height: size }}
    />
  );
};
