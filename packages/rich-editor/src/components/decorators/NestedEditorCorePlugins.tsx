import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';

import { useNestedEditorPlugins } from '../../context/NestedEditorPluginsContext';
import { PasteLinkPlugin } from '../../plugins/PasteLinkPlugin';

export function NestedEditorCorePlugins() {
  const nestedEditorPlugins = useNestedEditorPlugins();

  return (
    <>
      <ListPlugin />
      <LinkPlugin />
      <PasteLinkPlugin />
      {nestedEditorPlugins}
    </>
  );
}
