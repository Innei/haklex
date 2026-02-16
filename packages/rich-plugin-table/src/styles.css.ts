import { style } from '@vanilla-extract/css'

export const menuItemDestructive = style({
  color: '#ef4444',
  selectors: {
    '&[data-highlighted]': {
      color: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.08)',
    },
  },
})

export const resizeHandle = style({
  position: 'fixed',
  zIndex: 20,
  opacity: 0,
  transition: 'opacity 0.15s, background-color 0.15s',
  ':hover': {
    opacity: 1,
  },
})

export const resizeHandleActive = style({
  opacity: 1,
})

// Row/Column handle container
export const rowColHandle = style({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  position: 'fixed',
  zIndex: 30,
  opacity: 0,
  pointerEvents: 'none',
  transition: 'opacity 0.15s',
})

export const rowColHandleVisible = style({
  opacity: 1,
  pointerEvents: 'auto',
})

// Individual handle button (+ and grip)
export const handleBtn = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 16,
  height: 16,
  borderRadius: 3,
  border: 'none',
  background: 'transparent',
  color: 'rgba(0, 0, 0, 0.35)',
  cursor: 'pointer',
  padding: 0,
  transition: 'background-color 0.15s, color 0.15s',
  ':hover': {
    background: 'rgba(0, 0, 0, 0.08)',
    color: 'rgba(0, 0, 0, 0.7)',
  },
  '@media': {
    '(prefers-color-scheme: dark)': {
      color: 'rgba(255, 255, 255, 0.35)',
      selectors: {
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
  },
})
