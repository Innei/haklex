import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CornerDownLeft,
  Delete,
  type LucideIcon,
} from 'lucide-react';
import type { ReactElement } from 'react';
import { useSyncExternalStore } from 'react';

import type { KbdIcon, KbdPlatform } from './keys';
import { detectPlatform, keyDisplay, parseShortcut } from './keys';
import * as css from './styles.css';

export type { KbdIcon, KbdPlatform, KeyDisplay } from './keys';
export { detectPlatform, keyDisplay, parseShortcut } from './keys';

export interface KbdProps {
  className?: string;
  /** Key names such as `['mod', 'shift', 'z']`, or a shortcut string such as `"Ctrl+Shift+Z"`. */
  keys: string | string[];
  platform?: KbdPlatform;
  size?: 'sm' | 'md';
  tone?: 'default' | 'muted' | 'inverted';
}

const icons: Record<KbdIcon, LucideIcon> = {
  enter: CornerDownLeft,
  backspace: Delete,
  delete: Delete,
  up: ArrowUp,
  down: ArrowDown,
  left: ArrowLeft,
  right: ArrowRight,
};

const subscribe = () => () => {};
const clientPlatform = () =>
  detectPlatform(typeof navigator === 'undefined' ? undefined : navigator);
const serverPlatform = (): KbdPlatform => 'other';

export function useKbdPlatform(): KbdPlatform {
  return useSyncExternalStore(subscribe, clientPlatform, serverPlatform);
}

export function Kbd({
  className,
  keys,
  platform,
  size = 'md',
  tone = 'default',
}: KbdProps): ReactElement {
  const detected = useKbdPlatform();
  const resolved = platform ?? detected;
  const list = typeof keys === 'string' ? parseShortcut(keys) : keys;
  const displays = list.map((key) => keyDisplay(key, resolved));
  const iconSize = size === 'sm' ? 11 : 12;
  const capClass = `${css.cap} ${css.size[size]} ${css.tone[tone]}`;

  return (
    <kbd className={`${css.group}${className ? ` ${className}` : ''}`}>
      <span className={css.visuallyHidden} data-slot="kbd-label">
        {displays.map((d) => d.name).join(' ')}
      </span>
      {displays.map((d, i) => {
        const Icon = d.icon ? icons[d.icon] : undefined;
        return (
          <kbd aria-hidden="true" className={capClass} key={`${d.name}-${i}`}>
            {Icon ? (
              <Icon
                className={d.icon === 'delete' ? `${css.icon} ${css.mirrored}` : css.icon}
                size={iconSize}
                strokeWidth={2}
              />
            ) : (
              d.label
            )}
          </kbd>
        );
      })}
    </kbd>
  );
}
