import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle } from '@vanilla-extract/css';

export const draggingWrapperClass = 'rich-image-upload-dragging';

globalStyle(`.${draggingWrapperClass}`, {
  position: 'relative',
  borderRadius: vars.borderRadius.md,
  backgroundColor: vars.color.accentLight,
});

globalStyle(`.${draggingWrapperClass} .rich-editor__content`, {
  outline: `2px dashed ${vars.color.accent}`,
  outlineOffset: '-2px',
});
