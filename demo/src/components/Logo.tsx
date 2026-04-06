interface LogoProps {
  size?: number;
}

export function Logo({ size = 20 }: LogoProps) {
  return (
    <svg aria-label="haklex logo" fill="none" height={size} viewBox="0 0 32 32" width={size}>
      <rect fill="currentColor" height="32" rx="7" width="32" />
      <path
        d="M12.5 10L8 16L12.5 22"
        fill="none"
        stroke="var(--demo-bg)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path
        d="M19.5 10L24 16L19.5 22"
        fill="none"
        stroke="var(--demo-bg)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path
        d="M16 12 L16.8 14.8 L19 16 L16.8 17.2 L16 20 L15.2 17.2 L13 16 L15.2 14.8 Z"
        fill="var(--demo-bg)"
      />
    </svg>
  );
}
