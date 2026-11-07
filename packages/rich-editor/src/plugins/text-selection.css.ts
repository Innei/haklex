import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

import {
  TEXT_SELECTION_HIGHLIGHT_NAME,
  TEXT_SELECTION_INACTIVE_HIGHLIGHT_NAME,
} from '../utils/text-selection-constants';

export const nativeSelectionActive = style({});
export const nativeSelectionInactive = style({});
export const nativeSelectionHidden = style({});
const textSelectionBackground = vars.color.accentLight;
const inactiveTextSelectionBackground = `color-mix(in srgb, ${vars.color.textTertiary} 24%, transparent)`;

globalStyle(`.${nativeSelectionActive}::selection, .${nativeSelectionActive} *::selection`, {
  backgroundColor: textSelectionBackground,
  color: 'inherit',
});

globalStyle(
  `.${nativeSelectionActive}::-moz-selection, .${nativeSelectionActive} *::-moz-selection`,
  {
    backgroundColor: textSelectionBackground,
    color: 'inherit',
  },
);

globalStyle(`.${nativeSelectionInactive}::selection, .${nativeSelectionInactive} *::selection`, {
  backgroundColor: inactiveTextSelectionBackground,
  color: 'inherit',
});

globalStyle(
  `.${nativeSelectionInactive}::-moz-selection, .${nativeSelectionInactive} *::-moz-selection`,
  {
    backgroundColor: inactiveTextSelectionBackground,
    color: 'inherit',
  },
);

// Host apps commonly style ::selection; it must not paint under the custom highlight.
globalStyle(`.${nativeSelectionHidden}::selection, .${nativeSelectionHidden} *::selection`, {
  backgroundColor: 'transparent !important',
  color: 'inherit',
});

globalStyle(
  `.${nativeSelectionHidden}::-moz-selection, .${nativeSelectionHidden} *::-moz-selection`,
  {
    backgroundColor: 'transparent !important',
    color: 'inherit',
  },
);

globalStyle(`::highlight(${TEXT_SELECTION_HIGHLIGHT_NAME})`, {
  backgroundColor: textSelectionBackground,
  color: 'inherit',
});

globalStyle(`::highlight(${TEXT_SELECTION_INACTIVE_HIGHLIGHT_NAME})`, {
  backgroundColor: inactiveTextSelectionBackground,
  color: 'inherit',
});
