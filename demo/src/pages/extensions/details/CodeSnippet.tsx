import { ColorSchemeProvider, getVariantClass } from '@haklex/rich-editor';
import type { CodeFile } from '@haklex/rich-ext-code-snippet';
import { CodeSnippetRenderer } from '@haklex/rich-ext-code-snippet/static';
import { PortalThemeProvider } from '@haklex/rich-style-token';
import { type FC, useState } from 'react';

import { Panel } from '../../../components/Panel';
import { useTheme } from '../../../context/ThemeContext';

interface CodeSnippetSample {
  description: string;
  files: CodeFile[];
  key: string;
  label: string;
}

const codeSnippetSamples: CodeSnippetSample[] = [
  {
    key: 'single',
    label: 'Single File',
    description: 'A single TypeScript module rendered with dual-theme syntax highlighting.',
    files: [
      {
        filename: 'fibonacci.ts',
        language: 'typescript',
        code: `export function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55`,
      },
    ],
  },
  {
    key: 'multi',
    label: 'Multi-File Tabs',
    description: 'Multiple files share a tab strip; click to switch active file.',
    files: [
      {
        filename: 'index.ts',
        language: 'typescript',
        code: `export function hello(name: string): string {
  return \`Hello, \${name}!\`;
}`,
      },
      {
        filename: 'index.test.ts',
        language: 'typescript',
        code: `import { hello } from './index';

test('greets', () => {
  expect(hello('World')).toBe('Hello, World!');
});`,
      },
      {
        filename: 'README.md',
        language: 'markdown',
        code: `# Hello Module

A trivial greeter for the **rich-ext-code-snippet** demo.`,
      },
    ],
  },
];

interface CodeSnippetEditRendererComponent {
  (props: { files: CodeFile[]; onFilesChange?: (files: CodeFile[]) => void }): ReturnType<FC>;
}

export function CodeSnippetDetail() {
  const theme = useTheme();
  const [editFiles, setEditFiles] = useState<CodeFile[]>(codeSnippetSamples[1].files);
  const [EditRenderer, setEditRenderer] = useState<CodeSnippetEditRendererComponent | null>(null);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    import('@haklex/rich-ext-code-snippet/edit').then((mod) => {
      setEditRenderer(() => mod.CodeSnippetEditRenderer);
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
          Static renderer uses <code>@pierre/highlights</code> with dual light/dark themes. The edit
          variant overlays an <strong>Edit</strong> button that opens a CodeMirror modal for
          tab-based multi-file editing.
        </p>

        <div className="biz-grid">
          {codeSnippetSamples.map((sample) => (
            <Panel
              badge={`code-snippet · ${sample.files.length} file${sample.files.length > 1 ? 's' : ''}`}
              key={sample.key}
              title={sample.label}
            >
              <p className="node-description">{sample.description}</p>
              <div
                className={`node-render ${getVariantClass('article')}`}
                data-color-scheme={theme}
                data-theme={theme}
              >
                <CodeSnippetRenderer files={sample.files} />
              </div>
            </Panel>
          ))}

          <Panel badge="code-snippet · edit" title="Edit Mode">
            <p className="node-description">
              Hover the snippet to reveal the Edit button. Saves write back into the editable state
              — try renaming a file or modifying the code.
            </p>
            <div
              className={`node-render ${getVariantClass('article')}`}
              data-color-scheme={theme}
              data-theme={theme}
            >
              {EditRenderer ? (
                <EditRenderer files={editFiles} onFilesChange={setEditFiles} />
              ) : (
                <p style={{ color: 'var(--rc-text-tertiary)', fontSize: 14 }}>
                  Loading edit renderer...
                </p>
              )}
            </div>
          </Panel>
        </div>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  );
}
