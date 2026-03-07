import { platformMetaMap } from '@haklex/rich-renderer-mention';
import type { ReactNode } from 'react';

export interface MentionPlatformDef {
  getUrl: (handle: string) => string;
  icon: ReactNode;
  key: string;
  label: string;
}

export const builtinPlatforms: MentionPlatformDef[] = Object.entries(platformMetaMap).map(
  ([key, meta]) => ({
    key,
    label: meta.label,
    icon: meta.icon,
    getUrl: meta.getUrl,
  }),
);

export function getAllPlatforms(extra?: MentionPlatformDef[]): MentionPlatformDef[] {
  if (!extra) return builtinPlatforms;
  const map = new Map<string, MentionPlatformDef>();
  for (const p of builtinPlatforms) map.set(p.key.toUpperCase(), p);
  for (const p of extra) map.set(p.key.toUpperCase(), { ...p, key: p.key.toUpperCase() });
  return [...map.values()];
}
