import { createLinkMatcherWithRegExp, type LinkMatcher, registerAutoLink } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

const URL_REGEX = /https?:\/\/(?:www\.)?[\w#%+.:=@~-]{1,256}\.[A-Za-z]{2}[\w#%&()+./:=?@~-]*/;

const EMAIL_REGEX = /(?:[\w%+.-]+@[\d.a-z-]+\.[a-z]{2,})/i;

const URL_MATCHER = createLinkMatcherWithRegExp(URL_REGEX);
const EMAIL_MATCHER = createLinkMatcherWithRegExp(EMAIL_REGEX, (text: string) => `mailto:${text}`);

const DEFAULT_MATCHERS: LinkMatcher[] = [URL_MATCHER, EMAIL_MATCHER];

interface AutoLinkPluginProps {
  matchers?: LinkMatcher[];
}

export function AutoLinkPlugin({ matchers }: AutoLinkPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return registerAutoLink(editor, {
      matchers: matchers ?? DEFAULT_MATCHERS,
      changeHandlers: [],
      excludeParents: [],
    });
  }, [editor, matchers]);

  return null;
}
