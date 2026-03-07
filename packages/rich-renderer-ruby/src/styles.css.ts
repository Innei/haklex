import { vars } from '@haklex/rich-style-token/styles'
import { style } from '@vanilla-extract/css'

export const semanticClassNames = {
  ruby: 'rich-ruby',
  rubyRt: 'rich-ruby-rt',
} as const

export const ruby = style({
  rubyPosition: 'over',
  rubyAlign: 'center',
})

export const rt = style({
  fontSize: '0.58em',
  lineHeight: 1,
  color: vars.color.textSecondary,
  userSelect: 'none',
})
