import { vars } from './vars.css';

export const chromeText = {
  label: { fontSize: '12px', lineHeight: '16px', fontWeight: 500 },
  control: { fontSize: '13px', lineHeight: '20px' },
  item: { fontSize: '14px', lineHeight: '20px' },
  title: { fontSize: '16px', lineHeight: '24px', fontWeight: 600 },
  mono: { fontFamily: vars.typography.fontMono, fontSize: '12px', lineHeight: '16px' },
} as const;

export const chromeRadius = { sm: '4px', md: '8px', lg: '12px' } as const;

export const chromeHeight = { sm: '24px', md: '28px', lg: '32px' } as const;

export const chromeWidth = { sm: '280px', md: '320px', lg: '400px' } as const;

export const focusRing = `0 0 0 1px ${vars.color.accent}, 0 0 0 3px ${vars.color.accentLight}`;

export const chromeMotion = {
  popupIn: '120ms ease-out',
  popupOut: '80ms ease-in',
  state: '120ms',
  layout: '200ms cubic-bezier(0.25, 1, 0.5, 1)',
} as const;
