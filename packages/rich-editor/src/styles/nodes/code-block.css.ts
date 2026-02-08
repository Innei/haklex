import { style } from '@vanilla-extract/css'

import { vars } from '../vars.css'

export const codeBlock = style({
  position: 'relative',
  backgroundColor: vars.color.codeBg,
  borderRadius: vars.borderRadius.md,
  border: `1px solid ${vars.color.border}`,
  margin: `${vars.spacing.md} 0`,
  overflowX: 'auto',
  fontSize: vars.typography.fontSizeSmall,
  fontFamily: vars.typography.fontMono,
})

export const codeBlockHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: `${vars.spacing.xs} ${vars.spacing.md}`,
  borderBottom: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.bgSecondary,
  fontSize: vars.typography.fontSizeSmall,
  color: vars.color.textSecondary,
  userSelect: 'none',
})

export const codeBlockContent = style({
  padding: vars.spacing.md,
  overflowX: 'auto',
  lineHeight: vars.typography.lineHeightTight,
})

export const codeBlockLine = style({
  display: 'block',
  counterIncrement: 'line',
  selectors: {
    '&::before': {
      content: 'counter(line)',
      display: 'inline-block',
      width: '2em',
      marginRight: vars.spacing.md,
      textAlign: 'right',
      color: vars.color.textSecondary,
      opacity: 0.5,
      userSelect: 'none',
    },
  },
})
