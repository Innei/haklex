import type { BannerRendererProps } from '@haklex/rich-editor/renderers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@haklex/rich-editor-ui';
import type { FC } from 'react';

import { ALL_TYPES, BANNER_ICONS, BANNER_LABELS, BannerRenderer } from './BannerRenderer';
import * as css from './styles.css';

export const BannerEditRenderer: FC<BannerRendererProps> = ({ type, editable, onTypeChange }) => {
  if (!editable || !onTypeChange) {
    return <BannerRenderer type={type} />;
  }

  const Icon = BANNER_ICONS[type];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`${css.bannerTrigger} ${css.bannerIcon} ${css.bannerIconType({ type })} ${css.semanticClassNames.icon} ${css.semanticTypeClassNames.icon[type]}`}
      >
        <Icon height="1em" width="1em" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={6}>
        {ALL_TYPES.map((t) => {
          const ItemIcon = BANNER_ICONS[t];
          return (
            <DropdownMenuItem key={t} onClick={() => onTypeChange(t)}>
              <ItemIcon className={`${css.bannerMenuIcon} ${css.bannerIconType({ type: t })}`} />
              <span>{BANNER_LABELS[t]}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
