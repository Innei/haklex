import { style, styleVariants } from '@vanilla-extract/css'

import { vars } from '../vars.css'

export const banner = style({
  padding: vars.spacing.md,
  borderRadius: vars.borderRadius.md,
  margin: `${vars.spacing.md} 0`,
  borderLeft: '4px solid',
})

const bannerTypeBase = {
  info: {},
  success: {},
  warning: {},
  error: {},
} as const

const bannerColorMap: Record<string, { border: string; bg: string }> = {
  info: {
    border: vars.color.alertInfo,
    bg: `color-mix(in srgb, ${vars.color.alertInfo} 8%, transparent)`,
  },
  success: {
    border: vars.color.alertTip,
    bg: `color-mix(in srgb, ${vars.color.alertTip} 8%, transparent)`,
  },
  warning: {
    border: vars.color.alertWarning,
    bg: `color-mix(in srgb, ${vars.color.alertWarning} 8%, transparent)`,
  },
  error: {
    border: vars.color.alertCaution,
    bg: `color-mix(in srgb, ${vars.color.alertCaution} 8%, transparent)`,
  },
}

export const bannerTypes = styleVariants(bannerTypeBase, (_, type) => ({
  borderLeftColor: bannerColorMap[type].border,
  backgroundColor: bannerColorMap[type].bg,
}))
