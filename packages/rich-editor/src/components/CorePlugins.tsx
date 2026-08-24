import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';

import { AutoLinkPlugin } from '../plugins/AutoLinkPlugin';
import { BlockExitPlugin } from '../plugins/BlockExitPlugin';
import { ClickBelowPlugin } from '../plugins/ClickBelowPlugin';
import { HorizontalRulePlugin } from '../plugins/HorizontalRulePlugin';
import { InlineDndPlugin } from '../plugins/InlineDndPlugin';
import { MarkdownPastePlugin } from '../plugins/MarkdownPastePlugin';
import { MarkdownShortcutsPlugin } from '../plugins/MarkdownShortcutsPlugin';
import { PasteLinkPlugin } from '../plugins/PasteLinkPlugin';

export function CorePlugins() {
  return (
    <>
      <ListPlugin />
      <LinkPlugin />
      <PasteLinkPlugin />
      <TabIndentationPlugin />
      <TablePlugin hasHorizontalScroll />
      <CheckListPlugin />
      <MarkdownShortcutsPlugin />
      <InlineDndPlugin />
      <MarkdownPastePlugin />
      <BlockExitPlugin />
      <ClickBelowPlugin />
      <HorizontalRulePlugin />
      <AutoLinkPlugin />
    </>
  );
}
