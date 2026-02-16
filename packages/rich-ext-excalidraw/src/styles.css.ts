import { globalStyle, keyframes, style } from '@vanilla-extract/css'

export const tldrawContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  margin: '1rem 0',
  position: 'relative',
})

globalStyle(`${tldrawContainer} svg`, {
  maxWidth: '100%',
  height: 'auto',
})

export const tldrawEditorContainer = style({
  position: 'relative',
  width: '100%',
  height: 500,
  margin: '1rem 0',
  borderRadius: '0.5rem',
  overflow: 'hidden',
  border: '1px solid rgba(228, 228, 231, 1)',
  '@media': {
    '(prefers-color-scheme: dark)': {
      border: '1px solid #404040',
    },
  },
})

export const tldrawLoading = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 80,
  color: '#888',
  fontSize: '0.875rem',
})

const spin = keyframes({
  to: { transform: 'rotate(360deg)' },
})

globalStyle(`${tldrawLoading}::after`, {
  content: '""',
  display: 'inline-block',
  width: 16,
  height: 16,
  marginLeft: 8,
  border: '2px solid currentColor',
  borderRightColor: 'transparent',
  borderRadius: '50%',
  animation: `${spin} 0.6s linear infinite`,
})

export const tldrawError = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 50,
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  color: '#ef4444',
  fontSize: '0.875rem',
})
