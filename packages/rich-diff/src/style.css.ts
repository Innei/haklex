import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const root = style({
  border: `1px solid ${vars.color.border}`,
  borderRadius: 6,
  overflow: 'hidden',
  fontSize: 14,
});

export const header = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  borderBottom: `1px solid ${vars.color.border}`,
  background: vars.color.bgSecondary,
});

export const headerCell = style({
  padding: '8px 16px',
  fontWeight: 600,
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: vars.color.textSecondary,
});

export const headerOld = style({
  borderRight: `1px solid ${vars.color.border}`,
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
});

export const row = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  borderBottom: `1px solid ${vars.color.border}`,
  selectors: {
    '&:last-child': {
      borderBottom: 'none',
    },
  },
});

export const cell = style({
  padding: '4px 12px',
  minHeight: 32,
  overflow: 'hidden',
});

export const cellOld = style({
  borderRight: `1px solid ${vars.color.border}`,
});

export const delete_ = style({
  backgroundColor: `color-mix(in srgb, ${vars.color.alertCaution} 15%, transparent)`,
});

export const insert = style({
  backgroundColor: `color-mix(in srgb, ${vars.color.alertTip} 15%, transparent)`,
});

export const empty = style({
  backgroundColor: vars.color.bgSecondary,
});

globalStyle(`${delete_} .rich-content__body`, {
  opacity: 0.85,
});

// Diff 特化排版：不沿用 article/note variant 之宽松规格
// 注：selector 重复 className 以提 specificity，压制 articleVariant 的 globalStyle 覆写
export const diffCompact = style({
  fontSize: '13px',
  lineHeight: 1.55,
});

// 双类重复提权：(0,3,0) 压 article variant 的 (0,2,0)
const dc = `${diffCompact}${diffCompact}`;

// RichRenderer 内 wrap .articleVariant 并强写 fontSize，需显式压回
globalStyle(`${dc} .rich-content, ${dc} [class*="richContent"]`, {
  fontSize: '13px',
  lineHeight: 1.55,
});

globalStyle(
  `${dc} p, ${dc} .rich-paragraph, ${dc} ul, ${dc} ol, ${dc} .rich-list-ul, ${dc} .rich-list-ol, ${dc} li, ${dc} .rich-list-item, ${dc} blockquote, ${dc} .rich-quote, ${dc} pre`,
  {
    marginTop: '2px',
    marginBottom: '2px',
    fontSize: '13px',
  },
);

globalStyle(
  `${dc} h1, ${dc} h2, ${dc} h3, ${dc} h4, ${dc} h5, ${dc} h6, ${dc} .rich-heading-h1, ${dc} .rich-heading-h2, ${dc} .rich-heading-h3, ${dc} .rich-heading-h4, ${dc} .rich-heading-h5, ${dc} .rich-heading-h6`,
  {
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: 1.35,
    marginTop: '4px',
    marginBottom: '2px',
  },
);

globalStyle(`${dc} ul, ${dc} ol, ${dc} .rich-list-ul, ${dc} .rich-list-ol`, {
  paddingLeft: '18px',
});

globalStyle(`${dc} li, ${dc} .rich-list-item`, {
  marginTop: 0,
  marginBottom: 0,
});

globalStyle(`${dc} pre, ${dc} .rich-code-block`, {
  padding: '6px 8px',
  fontSize: '12px',
  lineHeight: 1.45,
  marginTop: '4px',
  marginBottom: '4px',
});

globalStyle(`${dc} blockquote, ${dc} .rich-quote`, {
  paddingLeft: '8px',
  marginLeft: 0,
  marginTop: '4px',
  marginBottom: '4px',
  fontStyle: 'normal',
});

globalStyle(`${dc} img, ${dc} .rich-image`, {
  maxWidth: '100%',
  height: 'auto',
  marginTop: '4px',
  marginBottom: '4px',
});

globalStyle(`${dc} > :first-child`, {
  marginTop: 0,
});

globalStyle(`${dc} > :last-child`, {
  marginBottom: 0,
});
