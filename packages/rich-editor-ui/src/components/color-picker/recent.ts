import { useSyncExternalStore } from 'react';

export type ColorTarget = 'text' | 'background';

const MAX_RECENT = 5;
const STORAGE_KEY = 'haklex:color-picker:recent';

type RecentState = Record<ColorTarget, string[]>;

const EMPTY: RecentState = { text: [], background: [] };

let state: RecentState | null = null;
const listeners = new Set<() => void>();

function sanitize(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string').slice(0, MAX_RECENT);
}

function load(): RecentState {
  if (state) return state;
  state = EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<RecentState>;
      state = { text: sanitize(parsed.text), background: sanitize(parsed.background) };
    }
  } catch {
    state = EMPTY;
  }
  return state;
}

function persist(next: RecentState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export function pushRecentColor(target: ColorTarget, color: string) {
  const current = load();
  const list = [color, ...current[target].filter((c) => c !== color)].slice(0, MAX_RECENT);
  state = { ...current, [target]: list };
  persist(state);
  for (const listener of listeners) listener();
}

export function resetRecentColors() {
  state = null;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getServerSnapshot = () => EMPTY;

export function useRecentColors(target: ColorTarget): string[] {
  return useSyncExternalStore(subscribe, load, getServerSnapshot)[target];
}
