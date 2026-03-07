import '../styles.css.ts';

import { ActionBar, ActionButton } from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { ExternalLink, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import * as styles from '../styles.css';
import type { EmbedType } from '../url-matchers';
import { matchEmbedUrl } from '../url-matchers';

interface EmbedNodeMethods {
  getUrl?: () => string;
  setSource?: (source: EmbedType | null) => void;
  setUrl: (url: string) => void;
}

export interface EmbedLinkRendererProps {
  nodeKey: string;
  type: EmbedType | null;
  url: string;
}

const typeLabels: Record<EmbedType, string> = {
  'tweet': 'X / Twitter',
  'youtube': 'YouTube',
  'codesandbox': 'CodeSandbox',
  'bilibili': 'Bilibili',
  'github-file': 'GitHub File',
  'github-gist': 'GitHub Gist',
  'thinking': 'Thinking',
};

export function EmbedLinkRenderer({ type, url, nodeKey }: EmbedLinkRendererProps) {
  const [editor] = useLexicalComposerContext();
  const [editUrl, setEditUrl] = useState(url);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditUrl(url);
  }, [url]);

  useEffect(() => {
    if (!url) {
      inputRef.current?.focus();
    }
  }, [url]);

  const commitUrl = useCallback(() => {
    const trimmed = editUrl.trim();
    if (!trimmed) return;
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (!node || !('setUrl' in node)) return;
      const n = node as unknown as EmbedNodeMethods;
      const currentUrl = n.getUrl?.();
      if (currentUrl !== trimmed) {
        n.setUrl(trimmed);
      }
      if (n.setSource) {
        try {
          n.setSource(matchEmbedUrl(new URL(trimmed)));
        } catch {
          // invalid URL
        }
      }
    });
  }, [editor, nodeKey, editUrl]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitUrl();
        inputRef.current?.blur();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setEditUrl(url);
        inputRef.current?.blur();
      }
    },
    [commitUrl, url],
  );

  const handleDelete = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) node.remove();
    });
  }, [editor, nodeKey]);

  const handleOpen = useCallback(() => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }, [url]);

  const label = type ? typeLabels[type] : 'Embed';
  const cssModifier = type || 'generic';
  const embedModifierClass = styles.embedType[cssModifier];
  const semanticModifierClass = styles.semanticEmbedModifierClass[cssModifier];

  return (
    <div
      className={`${styles.embed} ${embedModifierClass} ${styles.semanticClassNames.embed} ${semanticModifierClass}`.trim()}
    >
      <span className={`${styles.badge} ${styles.semanticClassNames.badge}`}>
        <span className={`${styles.dot} ${styles.semanticClassNames.dot}`} />
        {label}
      </span>
      <span className={`${styles.divider} ${styles.semanticClassNames.divider}`} />
      <input
        className={`${styles.input} ${styles.semanticClassNames.input}`}
        placeholder="https://..."
        ref={inputRef}
        type="url"
        value={editUrl}
        onBlur={commitUrl}
        onChange={(e) => setEditUrl(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <ActionBar>
        <ActionButton icon disabled={!url} size="md" title="Open in new tab" onClick={handleOpen}>
          <ExternalLink />
        </ActionButton>
        <ActionButton danger icon size="md" title="Delete" onClick={handleDelete}>
          <Trash2 />
        </ActionButton>
      </ActionBar>
    </div>
  );
}
