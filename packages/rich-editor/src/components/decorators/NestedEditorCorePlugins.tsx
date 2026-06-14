import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';

import { useNestedEditorPlugins } from '../../context/NestedEditorPluginsContext';

export function NestedEditorCorePlugins() {
  const nestedEditorPlugins = useNestedEditorPlugins();

  return (
    <>
      <ListPlugin />
      <LinkPlugin />
      {nestedEditorPlugins}
    </>
  );
}
