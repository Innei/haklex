import { vars } from '@haklex/rich-style-token/styles'
import { globalStyle, style } from '@vanilla-extract/css'

export const root = style({
  border: `1px solid ${vars.color.border}`,
  borderRadius: 6,
  overflow: 'hidden',
  fontSize: 14,
})

export const header = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  borderBottom: `1px solid ${vars.color.border}`,
  background: vars.color.bgSecondary,
})

export const headerCell = style({
  padding: '8px 16px',
  fontWeight: 600,
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: vars.color.textSecondary,
})

export const headerOld = style({
  borderRight: `1px solid ${vars.color.border}`,
})

export const body = style({
  display: 'flex',
  flexDirection: 'column',
})

export const row = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  borderBottom: `1px solid ${vars.color.border}`,
  selectors: {
    '&:last-child': {
      borderBottom: 'none',
    },
  },
})

export const cell = style({
  padding: '4px 12px',
  minHeight: 32,
  overflow: 'hidden',
})

export const cellOld = style({
  borderRight: `1px solid ${vars.color.border}`,
})

export const delete_ = style({
  backgroundColor: `color-mix(in srgb, ${vars.color.alertCaution} 15%, transparent)`,
})

export const insert = style({
  backgroundColor: `color-mix(in srgb, ${vars.color.alertTip} 15%, transparent)`,
})

export const empty = style({
  backgroundColor: vars.color.bgSecondary,
})

globalStyle(`${delete_} .rich-content__body`, {
  opacity: 0.85,
})
