import type { FC } from 'react';

// The dark scene is inverted by a CSS filter, so a white flood comes out dark.
export const ShadowFilter: FC<{ dark: boolean; id: string }> = ({ dark, id }) => (
  <filter height="160%" id={id} width="140%" x="-20%" y="-20%">
    <feDropShadow
      dx="0"
      dy="3"
      floodColor={dark ? '#fff' : '#000'}
      floodOpacity="0.14"
      stdDeviation="4"
    />
  </filter>
);
