import type { RichEditorVariant } from '@haklex/rich-editor';
import { use } from 'react';

import { SetVariantContext, VariantContext } from '../context/VariantContext';

const variants: { label: string; value: RichEditorVariant }[] = [
  { label: 'Article', value: 'article' },
  { label: 'Comment', value: 'comment' },
  { label: 'Note', value: 'note' },
];

export function VariantPicker() {
  const variant = use(VariantContext);
  const setVariant = use(SetVariantContext);

  return (
    <div className="toolbar-group">
      <span className="toolbar-label">Variant</span>
      {variants.map((v) => (
        <button
          className={variant === v.value ? 'btn btn-active' : 'btn'}
          key={v.value}
          onClick={() => setVariant(v.value)}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
