import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const semanticClassNames = {
  root: 'rich-steps',
  item: 'rich-steps-item',
  marker: 'rich-steps-marker',
  title: 'rich-steps-title',
  content: 'rich-steps-content',
} as const;

const MARKER_SIZE = '1.75em';

export const root = style({
  position: 'relative',
  listStyle: 'none',
  margin: `${vars.flow.block} 0`,
  padding: 0,
  paddingInlineStart: `calc(${MARKER_SIZE} + 0.875em)`,
  display: 'flex',
  flexDirection: 'column',
  gap: '1.75em',
  color: vars.color.text,
  lineHeight: vars.typography.lineHeight,
  selectors: {
    '&::before': {
      content: '""',
      position: 'absolute',
      insetInlineStart: `calc(${MARKER_SIZE} / 2)`,
      top: '0.5em',
      bottom: '0.5em',
      width: 1,
      background: vars.color.border,
    },
  },
});

export const item = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5em',
  minWidth: 0,
});

export const marker = style({
  position: 'absolute',
  insetInlineStart: `calc(-1 * (${MARKER_SIZE} + 0.875em))`,
  top: 0,
  width: MARKER_SIZE,
  height: MARKER_SIZE,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: vars.typography.fontSizeSmall,
  fontWeight: 500,
  fontVariantNumeric: 'tabular-nums',
  color: vars.color.textSecondary,
  background: vars.color.bg,
  boxShadow: `0 0 0 1px ${vars.color.border}`,
});

export const title = style({
  margin: 0,
  fontSize: '1.0625em',
  fontWeight: 600,
  lineHeight: MARKER_SIZE,
  color: vars.color.text,
  overflowWrap: 'anywhere',
});

export const content = style({
  minWidth: 0,
});

globalStyle(`${content} > :first-child`, { marginTop: 0 });
globalStyle(`${content} > :last-child`, { marginBottom: 0 });
