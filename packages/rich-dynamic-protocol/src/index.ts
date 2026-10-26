export interface DynamicHostContext {
  theme: 'light' | 'dark';
}

export interface DynamicMountInput {
  host: DynamicHostContext;
  props: Record<string, unknown>;
}

export interface DynamicMountHandle {
  /** Optional view-state pair for hosts that rebind mounted instances. */
  getState?: () => unknown;
  /** Passing undefined resets view state for a fresh binding. */
  setState?: (state: unknown) => void;
  unmount: () => void;
  update?: (input: DynamicMountInput) => void;
}

export interface DynamicComponentModule {
  mount: (container: HTMLElement, input: DynamicMountInput) => DynamicMountHandle;
}

export function isDynamicComponentModule(value: unknown): value is DynamicComponentModule {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as DynamicComponentModule).mount === 'function'
  );
}
