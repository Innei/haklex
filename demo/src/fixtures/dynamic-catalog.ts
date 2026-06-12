import type { ChatMessage } from '@haklex/rich-agent-core';
import { useEffect, useState } from 'react';

export interface DynamicCatalogEntry {
  description: string;
  initialHeight: number;
  name: string;
  propsSchema: Record<string, unknown>;
  url: string;
}

export interface DynamicCatalog {
  components: DynamicCatalogEntry[];
  version: number;
}

export const DYNAMIC_WIDGETS_PATH_PREFIX = '/dynamic-widgets/';

export function isAllowedDynamicUrl(url: string): boolean {
  try {
    const resolved = new URL(url, window.location.origin);
    return (
      resolved.origin === window.location.origin &&
      resolved.pathname.startsWith(DYNAMIC_WIDGETS_PATH_PREFIX)
    );
  } catch {
    return false;
  }
}

export function buildDynamicCatalogSystemMessage(catalog: DynamicCatalog): ChatMessage {
  const entries = catalog.components
    .map(
      (c) =>
        `- ${c.name}: ${c.description}\n  url: ${c.url}\n  initial-height: ${c.initialHeight}\n  props schema: ${JSON.stringify(c.propsSchema)}`,
    )
    .join('\n');

  return {
    role: 'system',
    content: `## Dynamic Component Catalog\n\nThe following interactive components are available for <dynamic> nodes. Use exactly these URLs and the listed initial-height; props must conform to each schema.\n\n${entries}`,
  };
}

export function useDynamicCatalogSystemMessages(): ChatMessage[] {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${DYNAMIC_WIDGETS_PATH_PREFIX}catalog.json`)
      .then((res) => (res.ok ? (res.json() as Promise<DynamicCatalog>) : null))
      .then((catalog) => {
        if (cancelled || !catalog?.components?.length) return;
        setMessages([buildDynamicCatalogSystemMessage(catalog)]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return messages;
}
