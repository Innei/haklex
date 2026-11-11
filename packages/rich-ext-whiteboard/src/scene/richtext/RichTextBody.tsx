import type { FC } from 'react';

import { RICHTEXT_PADDING } from '../../model/richtext';
import type { RichTextElement } from '../types';
import { RICHTEXT_BASE_STYLE, RichTextContent } from './RichTextContent';

const XHTML_NS = { xmlns: 'http://www.w3.org/1999/xhtml' } as Record<string, string>;

export const RichTextBody: FC<{ el: RichTextElement }> = ({ el }) => (
  <foreignObject height={el.height} style={{ overflow: 'visible' }} width={el.width}>
    <div
      data-richtext-body={el.id}
      {...XHTML_NS}
      style={{
        ...RICHTEXT_BASE_STYLE,
        boxSizing: 'border-box',
        width: el.width,
        minHeight: el.height,
        padding: RICHTEXT_PADDING,
      }}
    >
      <RichTextContent content={el.content} />
    </div>
  </foreignObject>
);
