import { globalStyle, keyframes, style } from '@vanilla-extract/css'

export const mermaidContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  margin: '1rem 0',
})

globalStyle(`${mermaidContainer} img`, {
  maxWidth: '100%',
  height: 'auto',
})

export const mermaidLoading = style({
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

globalStyle(`${mermaidLoading}::after`, {
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

export const mermaidError = style({
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
