import { style } from '@vanilla-extract/css'
import { vars } from '@haklex/rich-style-token/styles'

export const pageLayout = style({
  display: 'grid',
  gridTemplateColumns: '280px minmax(0, 1fr)',
  gap: '32px',
  alignItems: 'start',
})

export const sidebar = style({
  position: 'sticky',
  top: 24,
  alignSelf: 'start',
})

export const sidebarInner = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  padding: 20,
  borderRadius: vars.borderRadius.lg,
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  boxShadow: vars.boxShadow.menu,
})

export const sidebarKicker = style({
  margin: 0,
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: vars.color.textTertiary,
})

export const sidebarGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
})

export const sidebarGroupHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
})

export const sidebarGroupTitle = style({
  margin: 0,
  fontSize: '14px',
  fontWeight: 700,
  color: vars.color.text,
})

export const sidebarGroupDescription = style({
  margin: 0,
  fontSize: '12px',
  lineHeight: 1.5,
  color: vars.color.textTertiary,
})

export const sidebarList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
})

export const sidebarItem = style({
  display: 'block',
  padding: '10px 12px',
  borderRadius: vars.borderRadius.md,
  color: vars.color.textSecondary,
  textDecoration: 'none',
  background: 'transparent',
  transition: 'background 0.18s ease, color 0.18s ease, transform 0.18s ease',
  ':hover': {
    background: vars.color.fillTertiary,
    color: vars.color.text,
    transform: 'translateX(2px)',
  },
})

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 32,
  minWidth: 0,
})

export const hero = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)',
  gap: 24,
  padding: 32,
  borderRadius: vars.borderRadius.lg,
  background: `linear-gradient(135deg, ${vars.color.bg} 0%, ${vars.color.bgSecondary} 100%)`,
  border: `1px solid ${vars.color.border}`,
  boxShadow: vars.boxShadow.modal,
})

export const heroBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
})

export const heroEyebrow = style({
  margin: 0,
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: vars.color.accent,
})

export const heroTitle = style({
  margin: 0,
  fontSize: '42px',
  lineHeight: 1.02,
  letterSpacing: '-0.04em',
  color: vars.color.text,
  maxWidth: '14ch',
})

export const heroLead = style({
  margin: 0,
  maxWidth: 720,
  fontSize: '16px',
  lineHeight: 1.7,
  color: vars.color.textSecondary,
})

export const heroActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
})

export const heroLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 14px',
  borderRadius: vars.borderRadius.md,
  background: vars.color.accent,
  color: vars.color.bg,
  textDecoration: 'none',
  fontWeight: 600,
})

export const heroLinkSecondary = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 14px',
  borderRadius: vars.borderRadius.md,
  background: vars.color.fillSecondary,
  color: vars.color.text,
  textDecoration: 'none',
  fontWeight: 600,
})

export const heroStats = style({
  display: 'grid',
  gap: 12,
})

export const heroStat = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  padding: 18,
  borderRadius: vars.borderRadius.md,
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
})

export const heroStatLabel = style({
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: vars.color.textTertiary,
})

export const heroStatValue = style({
  fontSize: '30px',
  lineHeight: 1,
  color: vars.color.text,
})

export const heroStatDetail = style({
  fontSize: '13px',
  lineHeight: 1.6,
  color: vars.color.textSecondary,
})

export const sectionStack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 56,
})

export const sectionFrame = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  scrollMarginTop: 24,
})

export const sectionHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  paddingBottom: 16,
  borderBottom: `1px solid ${vars.color.border}`,
})

export const sectionEyebrow = style({
  margin: 0,
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: vars.color.accent,
})

export const sectionTitle = style({
  margin: 0,
  fontSize: '28px',
  lineHeight: 1.1,
  letterSpacing: '-0.03em',
  color: vars.color.text,
})

export const sectionDescription = style({
  margin: 0,
  maxWidth: 760,
  fontSize: '15px',
  lineHeight: 1.7,
  color: vars.color.textSecondary,
})

export const sectionBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
})

export const callout = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  padding: 18,
  borderRadius: vars.borderRadius.md,
  background: vars.color.bgSecondary,
  border: `1px solid ${vars.color.border}`,
})

export const calloutTitle = style({
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: vars.color.text,
})

export const calloutText = style({
  margin: 0,
  fontSize: '14px',
  lineHeight: 1.65,
  color: vars.color.textSecondary,
})

export const foundationBlock = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  padding: 24,
  borderRadius: vars.borderRadius.lg,
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
})

export const foundationHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
})

export const subsectionTitle = style({
  margin: 0,
  fontSize: '16px',
  fontWeight: 700,
  color: vars.color.text,
})

export const subsectionText = style({
  margin: 0,
  fontSize: '14px',
  lineHeight: 1.6,
  color: vars.color.textSecondary,
})

export const foundationGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 20,
})

export const tokenTable = style({
  display: 'flex',
  flexDirection: 'column',
  borderTop: `1px solid ${vars.color.border}`,
})

export const tokenRow = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.6fr) minmax(120px, auto) 44px',
  gap: 16,
  alignItems: 'center',
  padding: '14px 0',
  borderBottom: `1px solid ${vars.color.border}`,
})

export const tokenMeta = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  minWidth: 0,
})

export const tokenName = style({
  fontSize: '13px',
  fontWeight: 700,
  color: vars.color.text,
})

export const tokenUsage = style({
  fontSize: '13px',
  lineHeight: 1.55,
  color: vars.color.textSecondary,
})

export const tokenValue = style({
  justifySelf: 'end',
  fontSize: '12px',
  color: vars.color.textTertiary,
  fontFamily: vars.typography.fontMono,
  whiteSpace: 'nowrap',
})

export const tokenSwatch = style({
  width: 44,
  height: 44,
  borderRadius: vars.borderRadius.md,
  border: `1px solid ${vars.color.border}`,
})

export const spacingTable = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
})

export const spacingRow = style({
  display: 'grid',
  gridTemplateColumns: '48px minmax(120px, 1fr) auto minmax(0, 1.4fr)',
  gap: 12,
  alignItems: 'center',
})

export const spacingLabel = style({
  fontSize: '12px',
  fontWeight: 700,
  color: vars.color.text,
  fontFamily: vars.typography.fontMono,
})

export const spacingTrack = style({
  height: 24,
  borderRadius: vars.borderRadius.sm,
  background: vars.color.bgSecondary,
  border: `1px solid ${vars.color.border}`,
  display: 'flex',
  alignItems: 'center',
  padding: '0 6px',
})

export const spacingBar = style({
  height: 10,
  borderRadius: 999,
  background: vars.color.accent,
})

export const spacingValue = style({
  fontSize: '12px',
  color: vars.color.textTertiary,
  fontFamily: vars.typography.fontMono,
  whiteSpace: 'nowrap',
})

export const spacingUsage = style({
  fontSize: '13px',
  lineHeight: 1.55,
  color: vars.color.textSecondary,
})

export const typeStack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
})

export const typeSample = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: 16,
  borderRadius: vars.borderRadius.md,
  background: vars.color.bgSecondary,
})

export const typeSampleHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'center',
})

export const typeSampleText = style({
  margin: 0,
  fontSize: '18px',
  lineHeight: 1.45,
  color: vars.color.text,
})

export const typeScale = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gap: 12,
})

export const typeScaleItem = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: 14,
  borderRadius: vars.borderRadius.md,
  background: vars.color.bgSecondary,
})

export const typeScaleName = style({
  fontSize: '12px',
  fontWeight: 700,
  color: vars.color.text,
  fontFamily: vars.typography.fontMono,
})

export const typeScalePreview = style({
  color: vars.color.text,
  lineHeight: 1.3,
})

export const radiusGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 16,
})

export const radiusCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  padding: 16,
  borderRadius: vars.borderRadius.md,
  background: vars.color.bgSecondary,
})

export const radiusPreview = style({
  width: '100%',
  height: 72,
  background: vars.color.fillSecondary,
  border: `1px solid ${vars.color.border}`,
})

export const shadowScene = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 16,
  padding: 16,
  borderRadius: vars.borderRadius.md,
  background: vars.color.bgTertiary,
})

export const shadowCard = style({
  minHeight: 130,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  gap: 6,
  padding: 16,
  borderRadius: vars.borderRadius.md,
  background: vars.color.bg,
})

export const shadowName = style({
  fontSize: '13px',
  fontWeight: 700,
  color: vars.color.text,
})

export const shadowUsage = style({
  fontSize: '12px',
  lineHeight: 1.55,
  color: vars.color.textSecondary,
})

export const layoutNote = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '14px 16px',
  borderRadius: vars.borderRadius.md,
  background: vars.color.bgSecondary,
})

export const showcaseSplit = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 20,
})

export const showcasePanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  padding: 24,
  borderRadius: vars.borderRadius.lg,
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
})

export const showcaseHeading = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
})

export const demoRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 10,
})

export const demoLabel = style({
  fontSize: '12px',
  color: vars.color.textTertiary,
  fontFamily: vars.typography.fontMono,
  minWidth: 84,
})

export const inlineGroup = style({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  flexWrap: 'wrap',
})

export const inlineCode = style({
  fontSize: '12px',
  color: vars.color.textTertiary,
  fontFamily: vars.typography.fontMono,
})

export const stack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
})

export const formField = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  maxWidth: 320,
})

export const formLabel = style({
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: vars.color.textTertiary,
})

export const stateReadout = style({
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  fontSize: '13px',
  lineHeight: 1.6,
  color: vars.color.textSecondary,
})

export const contentNote = style({
  margin: 0,
  paddingLeft: 14,
  borderLeft: `2px solid ${vars.color.border}`,
  fontSize: '14px',
  lineHeight: 1.65,
  color: vars.color.textSecondary,
})

export const dialogPreview = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: 18,
  borderRadius: vars.borderRadius.md,
  background: vars.color.bgSecondary,
  border: `1px solid ${vars.color.border}`,
})

export const dialogPreviewLabel = style({
  margin: 0,
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: vars.color.textTertiary,
})

export const dialogPreviewTitle = style({
  margin: 0,
  fontSize: '18px',
  color: vars.color.text,
})

export const dialogPreviewText = style({
  margin: 0,
  fontSize: '14px',
  lineHeight: 1.65,
  color: vars.color.textSecondary,
})

export const statusList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
})

export const statusRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 12px',
  borderRadius: vars.borderRadius.md,
  background: vars.color.bgSecondary,
})

export const statusName = style({
  fontSize: '13px',
  color: vars.color.textSecondary,
})

export const codeNotes = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
})
