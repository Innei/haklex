import type { ReactNode } from 'react';

interface SegmentedOption<T extends string> {
  label: ReactNode;
  title?: string;
  value: T;
}

interface SegmentedProps<T extends string> {
  block?: boolean;
  iconOnly?: boolean;
  label: string;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  value: T;
}

export function Segmented<T extends string>({
  block,
  iconOnly,
  label,
  onChange,
  options,
  value,
}: SegmentedProps<T>) {
  return (
    <div aria-label={label} className={block ? 'seg seg-block' : 'seg'} role="group">
      {options.map((o) => (
        <button
          aria-label={o.title}
          aria-pressed={o.value === value}
          className={iconOnly ? 'seg-btn seg-btn-icon' : 'seg-btn'}
          key={o.value}
          title={o.title}
          type="button"
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
