import { vars } from '@haklex/rich-style-token/styles'
import { createVar, globalStyle, style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

const alertColor = createVar()

const alertTypeColors = {
  note: vars.color.alertInfo,
  tip: vars.color.alertTip,
  important: vars.color.alertImportant,
  warning: vars.color.alertWarning,
  caution: vars.color.alertCaution,
} as const

const alertTypeStyles = {
  note: { vars: { [alertColor]: vars.color.alertInfo } },
  tip: { vars: { [alertColor]: vars.color.alertTip } },
  important: { vars: { [alertColor]: vars.color.alertImportant } },
  warning: { vars: { [alertColor]: vars.color.alertWarning } },
  caution: { vars: { [alertColor]: vars.color.alertCaution } },
} as const

export const semanticClassNames = {
  root: 'rich-alert',
  header: 'rich-alert-header',
  icon: 'rich-alert-icon',
  label: 'rich-alert-label',
  content: 'rich-alert-content',
  contentEditable: 'rich-alert-content-editable',
} as const

export const semanticTypeClassNames = {
  root: {
    note: 'rich-alert-note',
    tip: 'rich-alert-tip',
    important: 'rich-alert-important',
    warning: 'rich-alert-warning',
    caution: 'rich-alert-caution',
  },
  header: {
    note: 'rich-alert-header-note',
    tip: 'rich-alert-header-tip',
    important: 'rich-alert-header-important',
    warning: 'rich-alert-header-warning',
    caution: 'rich-alert-header-caution',
  },
} as const

export const alertType = recipe({
  variants: {
    type: alertTypeStyles,
  },
})

export const alertHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  fontSize: vars.typography.fontSizeMd,
  lineHeight: 1,
  marginBottom: 6,
})

export const alertTrigger = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  padding: '2px 6px',
  borderRadius: '4px',
  marginInline: '-6px',
  border: 'none',
  background: 'none',
  font: 'inherit',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  fontSize: vars.typography.fontSizeMd,
  lineHeight: 1,
  transition: 'background-color 0.15s',
  selectors: {
    '&:hover': {
      backgroundColor: `color-mix(in srgb, ${vars.color.text} 5%, transparent)`,
    },
  },
})

export const alertChevron = style({
  opacity: 0,
  transition: 'opacity 0.15s',
  width: '14px',
  height: '14px',
  flexShrink: 0,
  selectors: {
    [`${alertTrigger}:hover &`]: {
      opacity: 0.6,
    },
    [`${alertTrigger}[data-popup-open] &`]: {
      opacity: 0.8,
    },
  },
})

export const alertIcon = style({
  width: '16px',
  height: '16px',
  flexShrink: 0,
  color: alertColor,
})

export const alertLabel = style({
  color: alertColor,
})

export const alertMenuIcon = style({
  width: '16px',
  height: '16px',
  flexShrink: 0,
  color: alertColor,
})

// ─── Alert / Callout (from editor shared) ─────────────────
const alertBarWidth = 4

const alertRootStyles = {
  position: 'relative',
  padding: vars.spacing.md,
  paddingLeft: `calc(${vars.spacing.md} + ${alertBarWidth}px)`,
  borderRadius: `0 ${vars.borderRadius.sm} ${vars.borderRadius.sm} 0`,
  margin: `${vars.spacing.md} 0`,
  backgroundColor: vars.color.bgSecondary,
} as const

const alertRootBarStyles = {
  content: '""',
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: `${alertBarWidth}px`,
  borderRadius: vars.borderRadius.sm,
} as const

const alertHeaderStyles = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  fontWeight: 600,
  marginBottom: vars.spacing.xs,
  fontSize: vars.typography.fontSizeMd,
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  lineHeight: 1,
} as const

const alertContentStyles = {
  minHeight: '1em',
} as const

const alertContentEditableStyles = {
  outline: 'none',
} as const

globalStyle(`.${semanticClassNames.root}`, alertRootStyles)
globalStyle(`.${semanticClassNames.root}::before`, alertRootBarStyles)

globalStyle(`.${semanticClassNames.header}`, alertHeaderStyles)

globalStyle(`.${semanticClassNames.icon}`, {
  display: 'inline-flex',
  width: '16px',
  height: '16px',
  flexShrink: 0,
})

globalStyle(`.${semanticClassNames.content}`, alertContentStyles)
globalStyle(
  `.${semanticClassNames.contentEditable}`,
  alertContentEditableStyles,
)

globalStyle(`.${semanticClassNames.content} > .rich-paragraph:first-child`, {
  marginTop: 0,
})

globalStyle(`.${semanticClassNames.content} > .rich-paragraph:last-child`, {
  marginBottom: 0,
})

globalStyle(`.${semanticClassNames.content} .rich-paragraph`, {
  margin: 0,
  marginBottom: '0.5em',
})

globalStyle(`.${semanticClassNames.content} .rich-paragraph:last-child`, {
  marginBottom: 0,
})

for (const type of Object.keys(alertTypeColors) as Array<
  keyof typeof alertTypeColors
>) {
  globalStyle(`.${semanticTypeClassNames.root[type]}::before`, {
    backgroundColor: alertTypeColors[type],
  })

  globalStyle(`.${semanticTypeClassNames.header[type]}`, {
    color: alertTypeColors[type],
  })
}
