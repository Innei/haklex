import type { BannerRendererProps } from '@haklex/rich-editor/renderers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@haklex/rich-editor-ui';
import { ChevronDown } from 'lucide-react';
import type { FC } from 'react';

import { ALL_TYPES, BANNER_ICONS, BANNER_LABELS, BannerRenderer } from './BannerRenderer';
import * as css from './styles.css';

const chevronStyle = { width: 12, height: 12, marginLeft: 2, opacity: 0.6, flexShrink: 0 };

export const BannerEditRenderer: FC<BannerRendererProps> = ({ type, editable, onTypeChange }) => {
  if (!editable || !onTypeChange) {
    return <BannerRenderer type={type} />;
  }

  const Icon = BANNER_ICONS[type];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Banner type: ${BANNER_LABELS[type]}`}
        className={`${css.bannerTrigger} ${css.bannerIcon} ${css.bannerIconType({ type })} ${css.semanticClassNames.icon} ${css.semanticTypeClassNames.icon[type]}`}
      >
        <Icon height="1em" width="1em" />
        <ChevronDown aria-hidden style={chevronStyle} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8}>
        <DropdownMenuRadioGroup
          value={type}
          onValueChange={(next) => {
            if (next !== type) onTypeChange(next as BannerRendererProps['type']);
          }}
        >
          {ALL_TYPES.map((t) => {
            const ItemIcon = BANNER_ICONS[t];
            return (
              <DropdownMenuRadioItem key={t} value={t}>
                <ItemIcon className={`${css.bannerMenuIcon} ${css.bannerIconType({ type: t })}`} />
                <span>{BANNER_LABELS[t]}</span>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
