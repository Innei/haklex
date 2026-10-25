interface PanelTabsProps<T extends string> {
  label: string;
  onChange: (value: T) => void;
  tabs: { label: string; value: T }[];
  value: T;
}

export function PanelTabs<T extends string>({ label, onChange, tabs, value }: PanelTabsProps<T>) {
  return (
    <div aria-label={label} className="wb-panel-head wb-panel-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          aria-selected={tab.value === value}
          className="wb-panel-tab"
          key={tab.value}
          role="tab"
          type="button"
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
