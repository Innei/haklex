import { useMemo } from 'react';

import { plugins as builtinPlugins } from '../plugins';
import type { LinkCardPlugin, PluginRegistry, UrlMatchResult } from '../types';

export interface UrlMatchInfo {
  match: UrlMatchResult;
  plugin: LinkCardPlugin;
}

export function matchUrl(
  url: string,
  pluginRegistry: PluginRegistry = builtinPlugins,
): UrlMatchInfo | null {
  try {
    const parsed = new URL(url);
    for (const plugin of pluginRegistry) {
      const match = plugin.matchUrl(parsed);
      if (match) return { plugin, match };
    }
  } catch {
    // invalid URL
  }
  return null;
}

export function useUrlMatcher(
  url: string | undefined,
  pluginRegistry: PluginRegistry = builtinPlugins,
): UrlMatchInfo | null {
  return useMemo(() => {
    if (!url) return null;
    return matchUrl(url, pluginRegistry);
  }, [url, pluginRegistry]);
}
