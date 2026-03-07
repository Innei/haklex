import { vars } from '@haklex/rich-style-token/styles'
import { globalStyle } from '@vanilla-extract/css'

import { richContent } from './shared.css'

// ─── Details / Collapse ─────────────────────────────────
globalStyle(`${richContent} .rich-details`, {
  margin: `${vars.spacing.md} 0`,
  border: 'none',
  interpolateSize: 'allow-keywords',
})

// ─── Summary ────────────────────────────────────────────
globalStyle(`${richContent} .rich-details-summary`, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  cursor: 'pointer',
  userSelect: 'none',
  fontWeight: 500,
  fontSize: '0.9375rem',
  lineHeight: '1.5',
  padding: `0.75rem 0`,
  color: vars.color.text,
  listStyle: 'none',
  transition: 'color 0.2s ease',
})

globalStyle(`${richContent} .rich-details-summary:hover`, {
  opacity: '0.8',
})

globalStyle(`${richContent} .rich-details-summary::-webkit-details-marker`, {
  display: 'none',
})

globalStyle(`${richContent} .rich-details-summary::marker`, {
  display: 'none',
  content: '""',
})

globalStyle(`${richContent} .rich-details-summary-text`, {
  flex: '1',
})

// ─── Chevron ────────────────────────────────────────────
globalStyle(`${richContent} .rich-details-chevron`, {
  display: 'inline-flex',
  flexShrink: 0,
  color: vars.color.textSecondary,
  transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
})

globalStyle(`${richContent} .rich-details[open] .rich-details-chevron`, {
  transform: 'rotate(180deg)',
})

// ─── ::details-content Transition ───────────────────────
globalStyle(`${richContent} .rich-details::details-content`, {
  display: 'block',
  height: 0,
  overflow: 'hidden',
  opacity: 0,
  contentVisibility: 'hidden',
  transition:
    'height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), content-visibility 0.4s cubic-bezier(0.4, 0, 0.2, 1) allow-discrete',
} as any)

globalStyle(`${richContent} .rich-details[open]::details-content`, {
  height: 'auto',
  opacity: 1,
  contentVisibility: 'visible',
} as any)

// ─── Content body ───────────────────────────────────────
// 正文色阶低于 summary，形成层级
globalStyle(`${richContent} .rich-details-content`, {
  padding: '0 0 0.75rem',
  color: vars.color.textSecondary,
})

// Editor mode: bg for visual boundary
globalStyle(`[contenteditable="true"] .rich-details-content`, {
  backgroundColor: vars.color.bgSecondary,
  borderRadius: vars.borderRadius.sm,
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  marginTop: vars.spacing.xs,
})

globalStyle(
  `${richContent} .rich-details-content > .rich-paragraph:first-child`,
  {
    marginTop: 0,
  },
)

globalStyle(
  `${richContent} .rich-details-content > .rich-paragraph:last-child`,
  {
    marginBottom: 0,
  },
)
