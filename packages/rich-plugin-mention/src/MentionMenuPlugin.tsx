import { $createMentionNode } from '@haklex/rich-editor/nodes';
import { PortalThemeWrapper } from '@haklex/rich-style-token';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import type { TextNode } from 'lexical';
import { $createTextNode } from 'lexical';
import { isValidElement, useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { MentionMenuItem } from './MentionMenuItem';
import { MentionMenuList } from './MentionMenuList';
import type { MentionPlatformDef } from './MentionPlatformRegistry';
import { getAllPlatforms } from './MentionPlatformRegistry';

export interface MentionMenuPluginProps {
  extraPlatforms?: MentionPlatformDef[];
}

// Default PUNCTUATION from Lexical excludes ':' which we need for the
// two-phase "@PLATFORM:handle" syntax.  We strip ':' from the set so the
// trigger regex keeps matching after the user selects a platform.
const MENTION_PUNCTUATION = '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_;';

function parseQueryPhase(
  query: string,
  platforms: MentionPlatformDef[],
): { phase: 1 | 2; options: MentionMenuItem[] } {
  const colonIdx = query.indexOf(':');

  if (colonIdx !== -1) {
    const platformKey = query.slice(0, colonIdx).toUpperCase();
    const handle = query.slice(colonIdx + 1);
    const platform = platforms.find((p) => p.key === platformKey);

    if (platform) {
      const confirmItem = new MentionMenuItem({
        type: 'confirm',
        platformKey,
        icon: isValidElement(platform.icon) ? platform.icon : undefined,
        label: handle ? `@${handle}` : 'Type username...',
        description: `${platform.label} — Enter to confirm`,
        handleText: handle,
      });
      return { phase: 2, options: [confirmItem] };
    }
  }

  const lower = query.toLowerCase();
  const filtered = platforms
    .filter(
      (p) => !query || p.key.toLowerCase().includes(lower) || p.label.toLowerCase().includes(lower),
    )
    .map(
      (p) =>
        new MentionMenuItem({
          type: 'platform',
          platformKey: p.key,
          icon: isValidElement(p.icon) ? p.icon : undefined,
          label: p.label,
          description: `@${p.key}:username`,
        }),
    );
  return { phase: 1, options: filtered };
}

export function MentionMenuPlugin({ extraPlatforms }: MentionMenuPluginProps = {}) {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);

  const platforms = useMemo(() => getAllPlatforms(extraPlatforms), [extraPlatforms]);

  const { phase, options } = useMemo(
    () => parseQueryPhase(queryString ?? '', platforms),
    [queryString, platforms],
  );

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('@', {
    minLength: 0,
    punctuation: MENTION_PUNCTUATION,
  });

  const onSelectOption = useCallback(
    (option: MentionMenuItem, textNodeContainingQuery: TextNode | null, closeMenu: () => void) => {
      if (option.type === 'platform') {
        // Phase 1: replace trigger text with @PLATFORM:, keep menu open
        if (textNodeContainingQuery) {
          const text = `@${option.platformKey}:`;
          const newTextNode = $createTextNode(text);
          textNodeContainingQuery.replace(newTextNode);
          newTextNode.select(text.length, text.length);
        }
        // Don't close — typeahead re-detects @PLATFORM: on next update
      } else {
        // Phase 2: insert MentionNode
        const handle = option.handleText.trim();
        if (!handle) return;

        const mentionNode = $createMentionNode(option.platformKey, handle);
        if (textNodeContainingQuery) {
          textNodeContainingQuery.replace(mentionNode);
        }
        const spaceNode = $createTextNode(' ');
        mentionNode.insertAfter(spaceNode);
        spaceNode.select(0, 0);
        closeMenu();
      }
    },
    [editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin<MentionMenuItem>
      options={options}
      triggerFn={checkForTriggerMatch}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) => {
        if (!anchorElementRef.current) return null;
        if (phase === 1 && options.length === 0) return null;

        return createPortal(
          <PortalThemeWrapper>
            <MentionMenuList
              options={options}
              phase={phase}
              selectOptionAndCleanUp={selectOptionAndCleanUp}
              selectedIndex={selectedIndex}
              setHighlightedIndex={setHighlightedIndex}
            />
          </PortalThemeWrapper>,
          anchorElementRef.current,
        );
      }}
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
    />
  );
}
