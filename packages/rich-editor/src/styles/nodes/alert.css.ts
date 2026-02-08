import { style, styleVariants } from '@vanilla-extract/css'

import { vars } from '../vars.css'

export const alertQuote = style({
  padding: vars.spacing.md,
  borderLeft: '4px solid',
  borderRadius: `0 ${vars.borderRadius.sm} ${vars.borderRadius.sm} 0`,
  margin: `${vars.spacing.md} 0`,
  backgroundColor: vars.color.bgSecondary,
})

export const alertTitle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  fontWeight: 600,
  marginBottom: vars.spacing.sm,
  fontSize: vars.typography.fontSizeSmall,
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
})

export const alertIcon = style({
  width: '20px',
  height: '20px',
  flexShrink: 0,
})

const alertTypeBase = {
  note: {},
  warning: {},
  tip: {},
  caution: {},
  important: {},
} as const

const alertColorMap: Record<string, string> = {
  note: vars.color.alertInfo,
  warning: vars.color.alertWarning,
  tip: vars.color.alertTip,
  caution: vars.color.alertCaution,
  important: vars.color.alertImportant,
}

export const alertTypes = styleVariants(alertTypeBase, (_, type) => ({
  borderLeftColor: alertColorMap[type],
}))

export const alertTitleTypes = styleVariants(alertTypeBase, (_, type) => ({
  color: alertColorMap[type],
}))
