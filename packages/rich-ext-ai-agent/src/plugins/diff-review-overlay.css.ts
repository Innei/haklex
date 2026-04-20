import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const overlayContainer = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 10,
});

export const batchPanel = style({
  pointerEvents: 'auto',
  position: 'absolute',
  left: 0,
  right: 0,
  overflow: 'hidden',
  border: `1px solid color-mix(in srgb, ${vars.color.text} 10%, transparent)`,
});

export const batchHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: '2px 10px',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '11px',
  background: `color-mix(in srgb, ${vars.color.text} 3%, ${vars.color.bg})`,
  borderBottom: `1px solid color-mix(in srgb, ${vars.color.text} 6%, transparent)`,
});

export const batchHeaderActions = style({
  display: 'flex',
  gap: '2px',
});

export const batchHeaderReject = style({
  all: 'unset',
  cursor: 'pointer',
  padding: '1px 6px',
  fontSize: '11px',
  color: vars.color.textTertiary,
  transition: 'color 100ms ease, background 100ms ease',
  selectors: {
    '&:hover': {
      color: vars.color.alertCaution,
      background: `color-mix(in srgb, ${vars.color.alertCaution} 10%, transparent)`,
    },
  },
});

export const batchHeaderAccept = style({
  all: 'unset',
  cursor: 'pointer',
  padding: '1px 6px',
  fontSize: '11px',
  color: vars.color.alertTip,
  transition: 'color 100ms ease, background 100ms ease',
  selectors: {
    '&:hover': {
      background: `color-mix(in srgb, ${vars.color.alertTip} 10%, transparent)`,
    },
  },
});

export const oldBlock = style({
  background: `color-mix(in srgb, ${vars.color.alertCaution} 5%, ${vars.color.bg})`,
  borderLeft: `2px solid ${vars.color.alertCaution}`,
  padding: '4px 10px',
  textDecoration: 'line-through',
  textDecorationColor: `color-mix(in srgb, ${vars.color.alertCaution} 35%, transparent)`,
  color: vars.color.textTertiary,
});

export const newBlock = style({
  background: `color-mix(in srgb, ${vars.color.alertTip} 5%, ${vars.color.bg})`,
  borderLeft: `2px solid ${vars.color.alertTip}`,
  padding: '4px 10px',
});

export const floatingBar = style({
  pointerEvents: 'auto',
  position: 'sticky',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '6px 16px',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '12px',
  background: `color-mix(in srgb, ${vars.color.text} 4%, ${vars.color.bg})`,
  borderTop: `1px solid color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
  backdropFilter: 'blur(8px)',
  zIndex: 20,
});

export const floatingBarBtn = style({
  all: 'unset',
  cursor: 'pointer',
  padding: '3px 12px',
  fontSize: '12px',
  fontWeight: 500,
  transition: 'color 100ms ease, background 100ms ease',
});

export const floatingBarAccept = style([
  floatingBarBtn,
  {
    color: vars.color.alertTip,
    background: `color-mix(in srgb, ${vars.color.alertTip} 10%, transparent)`,
    selectors: {
      '&:hover': {
        background: `color-mix(in srgb, ${vars.color.alertTip} 18%, transparent)`,
      },
    },
  },
]);

export const floatingBarReject = style([
  floatingBarBtn,
  {
    color: vars.color.textTertiary,
    selectors: {
      '&:hover': {
        color: vars.color.alertCaution,
        background: `color-mix(in srgb, ${vars.color.alertCaution} 10%, transparent)`,
      },
    },
  },
]);

export const floatingBarLabel = style({
  color: vars.color.textTertiary,
  marginRight: '4px',
});

export const rendererFrame = style({
  overflow: 'hidden',
});

// Delete 条目独立入口：视觉与 batchHeader 一致（同底色、同字号、同按钮），仅盒子为悬浮小宽
export const deleteActionBar = style({
  pointerEvents: 'auto',
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '2px',
  padding: '2px 10px',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '11px',
  background: `color-mix(in srgb, ${vars.color.text} 3%, ${vars.color.bg})`,
  border: `1px solid color-mix(in srgb, ${vars.color.text} 10%, transparent)`,
  transform: 'translate(0, -100%)',
});

// Diff 特化样式：不复用 article/note/comment 之排版规格
// selector 重复 className 以提 specificity，压制 variant 之 globalStyle 覆写
export const diffCompact = style({
  fontSize: '13px',
  lineHeight: 1.55,
});

globalStyle(`${rendererFrame} > :first-child`, {
  marginTop: 0,
});

globalStyle(`${rendererFrame} > :last-child`, {
  marginBottom: 0,
});

const dc = `${diffCompact}${diffCompact}`;

// RichRenderer 内部 wrap 一层 .articleVariant/.rich-content 并强写 fontSize: 16px
// 断继承链，故此处需显式为各文本元素指定紧凑字号
globalStyle(`${dc} .rich-content, ${dc} .article-article, ${dc} [class*="richContent"]`, {
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
