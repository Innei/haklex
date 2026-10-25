import type { RichEditorVariant } from '@haklex/rich-editor';
import { use } from 'react';

import { SetVariantContext, VariantContext } from '../context/VariantContext';
import { Segmented } from './ui/Segmented';

const variants: { label: string; value: RichEditorVariant }[] = [
  { label: 'Article', value: 'article' },
  { label: 'Note', value: 'note' },
  { label: 'Comment', value: 'comment' },
];

export function VariantPicker({ block }: { block?: boolean }) {
  const variant = use(VariantContext);
  const setVariant = use(SetVariantContext);

  return (
    <Segmented
      block={block}
      label="Variant"
      options={variants}
      value={variant}
      onChange={setVariant}
    />
  );
}
