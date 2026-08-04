import { SegmentedControl } from '@haklex/rich-editor-ui';
import type { FC } from 'react';

import * as css from './styles.css';
import type { GalleryAspect, GalleryFit, GalleryLayout } from './types';

const aspectItems = [
  { value: 'auto' as const, label: 'Auto' },
  { value: '1:1' as const, label: '1:1' },
  { value: '4:3' as const, label: '4:3' },
  { value: '16:9' as const, label: '16:9' },
  { value: '3:4' as const, label: '3:4' },
];

const fitBaseItems = [
  { value: 'cover' as const, label: 'Cover' },
  { value: 'contain' as const, label: 'Contain' },
];

export const GalleryDialogSubHeader: FC<{
  aspect: GalleryAspect;
  fit: GalleryFit;
  layout: GalleryLayout;
  maxItemHeightInput: string;
  onAspectChange: (aspect: GalleryAspect) => void;
  onFitChange: (fit: GalleryFit) => void;
  onMaxItemHeightInputChange: (value: string) => void;
}> = ({
  aspect,
  fit,
  layout,
  maxItemHeightInput,
  onAspectChange,
  onFitChange,
  onMaxItemHeightInputChange,
}) => {
  if (layout === 'masonry') {
    return (
      <div className={css.galleryDialogSubHeader}>
        <span className={css.galleryDialogSubHeaderLabel}>Max height</span>
        <input
          className={css.galleryMaxHeightInput}
          min={1}
          placeholder="Auto"
          type="number"
          value={maxItemHeightInput}
          onChange={(e) => onMaxItemHeightInputChange(e.target.value)}
        />
        <span className={css.galleryDialogSubHeaderLabel}>px</span>
      </div>
    );
  }

  return (
    <div className={css.galleryDialogSubHeader}>
      <div className={css.galleryDialogSubHeaderGroup}>
        <span className={css.galleryDialogSubHeaderLabel}>Aspect</span>
        <SegmentedControl items={aspectItems} value={aspect} onChange={onAspectChange} />
      </div>
      <div className={css.galleryDialogSubHeaderGroup}>
        <span className={css.galleryDialogSubHeaderLabel}>Fit</span>
        <SegmentedControl
          items={fitBaseItems.map((item) => ({ ...item, disabled: aspect === 'auto' }))}
          value={fit}
          onChange={onFitChange}
        />
      </div>
    </div>
  );
};
