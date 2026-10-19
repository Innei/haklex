import { vars } from '@haklex/rich-style-token';
import { style } from '@vanilla-extract/css';

export const card = style({
  margin: '1.5em 0',
  padding: '16px 18px',
  borderRadius: 10,
  border: `1px solid ${vars.color.hrBorder}`,
  background: vars.color.bgSecondary,
  fontSize: 13,
  lineHeight: 1.6,
  color: vars.color.text,
});

export const header = style({ display: 'flex', alignItems: 'center', gap: 8 });

export const icon = style({ flex: 'none', width: 16, height: 16, color: vars.color.alertCaution });

export const heading = style({ fontSize: 14, fontWeight: 600 });

export const meta = style({
  marginLeft: 'auto',
  fontFamily: vars.typography.fontMono,
  fontSize: 12,
  color: vars.color.textTertiary,
});

export const context = style({ margin: '2px 0 12px 24px', color: vars.color.textTertiary });

export const list = style({
  margin: 0,
  padding: 0,
  listStyle: 'none',
  borderTop: `1px solid ${vars.color.hrBorder}`,
});

export const item = style({
  padding: '10px 0 10px 24px',
  borderBottom: `1px solid ${vars.color.hrBorder}`,
  selectors: { '&:last-child': { borderBottom: 0, paddingBottom: 0 } },
});

export const path = style({
  padding: '1px 6px',
  borderRadius: 4,
  fontFamily: vars.typography.fontMono,
  fontSize: 12,
  background: vars.color.fillSecondary,
});

export const hint = style({ display: 'block', fontSize: 12, color: vars.color.textTertiary });
