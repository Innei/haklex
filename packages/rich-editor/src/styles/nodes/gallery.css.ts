import { style } from '@vanilla-extract/css'

import { vars } from '../vars.css'

export const gallery = style({
  margin: `${vars.spacing.md} 0`,
})

export const galleryGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: vars.spacing.sm,
})

export const galleryMasonry = style({
  columnCount: 3,
  columnGap: vars.spacing.sm,
})

export const galleryCarousel = style({
  display: 'flex',
  gap: vars.spacing.sm,
  overflowX: 'auto',
  scrollSnapType: 'x mandatory',
})

export const galleryItem = style({
  overflow: 'hidden',
  borderRadius: vars.borderRadius.md,
  margin: 0,
  selectors: {
    [`${galleryCarousel} &`]: {
      flexShrink: 0,
      scrollSnapAlign: 'start',
    },
    [`${galleryMasonry} &`]: {
      breakInside: 'avoid',
      marginBottom: vars.spacing.sm,
    },
  },
})
