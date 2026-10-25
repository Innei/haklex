import type { ReactNode } from 'react';

export function InspectorSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="wb-section">
      <h3 className="wb-section-title">{title}</h3>
      {children}
    </section>
  );
}

interface SwitchRowProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

export function SwitchRow({ checked, label, onChange }: SwitchRowProps) {
  return (
    <button
      aria-checked={checked}
      className="switch-row"
      role="switch"
      type="button"
      onClick={() => onChange(!checked)}
    >
      {label}
      <span aria-hidden="true" className="switch" />
    </button>
  );
}

interface OptionButtonProps {
  children: ReactNode;
  onClick: () => void;
  selected: boolean;
}

export function OptionButton({ children, onClick, selected }: OptionButtonProps) {
  return (
    <button aria-pressed={selected} className="opt" type="button" onClick={onClick}>
      {children}
    </button>
  );
}

export function Chip({ children, onClick, selected }: OptionButtonProps) {
  return (
    <button aria-pressed={selected} className="chip" type="button" onClick={onClick}>
      {children}
    </button>
  );
}
