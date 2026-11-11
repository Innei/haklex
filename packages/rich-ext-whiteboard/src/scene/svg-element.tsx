import type { FC } from 'react';
import { use } from 'react';

import { isSvgSource, svgDataUrl } from '../model/svg';
import { SceneDarkContext } from './context';
import type { SvgElement } from './types';

export const SvgRender: FC<{ el: SvgElement }> = ({ el }) => {
  const darkFilter = use(SceneDarkContext);
  if (!isSvgSource(el.svg)) {
    return (
      <rect
        fill="none"
        height={el.height}
        stroke="#888"
        strokeDasharray="4 4"
        strokeWidth={1}
        width={el.width}
      />
    );
  }
  return (
    <image
      filter={darkFilter ? `url(#${darkFilter.filterId})` : undefined}
      height={el.height}
      href={svgDataUrl(el.svg)}
      preserveAspectRatio="xMidYMid meet"
      width={el.width}
    />
  );
};
