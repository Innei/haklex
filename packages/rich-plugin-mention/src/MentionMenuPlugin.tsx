import { $createMentionNode } from '@haklex/rich-editor/nodes';
import { PortalThemeWrapper } from '@haklex/rich-style-token';
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

// Lexical's default PUNCTUATION includes ':', which would end the match before
// the "@PLATFORM:handle" fast path; this set leaves it out.
const MENTION_PUNCTUATION = '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_;';

interface MentionMenuModel {
  heading?: string;
  hint?: string;
  options: MentionMenuItem[];
}

function handleItem(platform: MentionPlatformDef, handle: string): MentionMenuItem {
  return new MentionMenuItem({
    type: 'confirm',
    platformKey: platform.key,
    icon: isValidElement(platform.icon) ? platform.icon : undefined,
    label: platform.label,
    description: platform.label,
    handleText: handle,
  });
}

function buildMenu(query: string, platforms: MentionPlatformDef[]): MentionMenuModel {
  const colonIdx = query.indexOf(':');

  if (colonIdx !== -1) {
    const platformKey = query.slice(0, colonIdx).toUpperCase();
    const handle = query.slice(colonIdx + 1);
    const platform = platforms.find((p) => p.key === platformKey);
    if (!platform) return { options: [] };
    if (!handle) {
      return { heading: `Mention on ${platform.label}`, hint: 'Type a handle', options: [] };
    }
    return { heading: `Mention on ${platform.label}`, options: [handleItem(platform, handle)] };
  }

  if (!query) {
    return {
      heading: 'Mention',
      options: platforms.map(
        (p) =>
          new MentionMenuItem({
            type: 'platform',
            platformKey: p.key,
            icon: isValidElement(p.icon) ? p.icon : undefined,
            label: p.label,
            description: `@${p.key}:`,
          }),
      ),
    };
  }

  return {
    heading: `Mention “${query}”`,
    options: platforms.map((p) => handleItem(p, query)),
  };
}

export function MentionMenuPlugin({ extraPlatforms }: MentionMenuPluginProps = {}) {
  const [queryString, setQueryString] = useState<string | null>(null);

  const platforms = useMemo(() => getAllPlatforms(extraPlatforms), [extraPlatforms]);

  const menu = useMemo(() => buildMenu(queryString ?? '', platforms), [queryString, platforms]);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('@', {
    minLength: 0,
    punctuation: MENTION_PUNCTUATION,
  });

  const onSelectOption = useCallback(
    (option: MentionMenuItem, textNodeContainingQuery: TextNode | null, closeMenu: () => void) => {
      if (option.type === 'platform') {
        if (textNodeContainingQuery) {
          const text = `@${option.platformKey}:`;
          const newTextNode = $createTextNode(text);
          textNodeContainingQuery.replace(newTextNode);
          newTextNode.select(text.length, text.length);
        }
        return;
      }

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
    },
    [],
  );

  return (
    <LexicalTypeaheadMenuPlugin<MentionMenuItem>
      options={menu.options}
      triggerFn={checkForTriggerMatch}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) => {
        const anchorElement = anchorElementRef.current;
        if (!anchorElement) return null;

        return createPortal(
          <PortalThemeWrapper>
            <MentionMenuList
              anchorElement={anchorElement}
              heading={menu.heading}
              hint={menu.hint}
              options={menu.options}
              selectOptionAndCleanUp={selectOptionAndCleanUp}
              selectedIndex={selectedIndex}
              setHighlightedIndex={setHighlightedIndex}
            />
          </PortalThemeWrapper>,
          anchorElement,
        );
      }}
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
    />
  );
}
