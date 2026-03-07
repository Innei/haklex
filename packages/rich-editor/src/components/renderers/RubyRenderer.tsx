import type { ReactNode } from 'react';

export interface RubyRendererProps {
  children?: ReactNode;
  reading: string;
}

export function RubyRenderer({ reading, children }: RubyRendererProps) {
  if (!reading) {
    return <>{children}</>;
  }

  return (
    <ruby className="rich-ruby">
      {children}
      <rt className="rich-ruby-rt">{reading}</rt>
    </ruby>
  );
}
