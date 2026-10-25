import { chromeRadius, vars } from '@haklex/rich-style-token/styles';
import { style, styleVariants } from '@vanilla-extract/css';

export const group = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2px',
  verticalAlign: 'middle',
  fontStyle: 'normal',
});

export const cap = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  borderRadius: chromeRadius.sm,
  fontFamily: vars.typography.fontFamilySans,
  fontWeight: 500,
  lineHeight: 1,
  whiteSpace: 'nowrap',
});

export const size = styleVariants({
  sm: { minWidth: '18px', height: '18px', padding: '0 4px', fontSize: '11px' },
  md: { minWidth: '20px', height: '20px', padding: '0 5px', fontSize: '12px' },
});

export const tone = styleVariants({
  default: {
    backgroundColor: vars.color.bg,
    boxShadow: `inset 0 0 0 1px ${vars.color.border}, inset 0 -1px 0 ${vars.color.border}`,
    color: vars.color.textSecondary,
  },
  muted: {
    backgroundColor: vars.color.fillTertiary,
    boxShadow: `inset 0 0 0 1px ${vars.color.borderSubtle}`,
    color: vars.color.textTertiary,
  },
  inverted: {
    backgroundColor: `color-mix(in oklab, ${vars.color.bg} 16%, transparent)`,
    color: vars.color.bg,
  },
});

export const icon = style({
  display: 'block',
  flexShrink: 0,
});

export const mirrored = style({
  transform: 'scaleX(-1)',
});

export const visuallyHidden = style({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
});
