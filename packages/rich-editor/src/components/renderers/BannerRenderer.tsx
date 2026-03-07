import type { FC } from 'react';

import type { BannerType } from '../../nodes/BannerNode';

export interface BannerRendererProps {
  editable?: boolean;
  onTypeChange?: (type: BannerType) => void;
  type: BannerType;
}

export const BannerRenderer: FC<BannerRendererProps> = ({ type }) => {
  return <span className={`rich-banner-icon rich-banner-icon-${type}`} />;
};
