export type ExcalidrawSnapshot =
  | { type: 'inline'; data: Record<string, any> }
  | { type: 'remote'; url: string }
  | { type: 'delta'; baseUrl: string; delta: object };

export function parseSnapshot(raw: string): ExcalidrawSnapshot | null {
  if (!raw || !raw.trim()) return null;

  try {
    const json = JSON.parse(raw);
    if (json && typeof json === 'object') return { type: 'inline', data: json };
  } catch {
    // not JSON — check for URL/ref
  }

  const lines = raw.split('\n');
  const firstLine = lines[0].trim();

  if (
    !firstLine.startsWith('http') &&
    !firstLine.startsWith('blob:') &&
    !firstLine.startsWith('ref:')
  )
    return null;

  const remaining = lines.slice(1).join('\n').trim();
  if (remaining) {
    try {
      const delta = JSON.parse(remaining);
      if (delta && typeof delta === 'object') return { type: 'delta', baseUrl: firstLine, delta };
    } catch {
      // not valid JSON delta — treat as plain remote
    }
  }

  return { type: 'remote', url: firstLine };
}

export function serializeSnapshot(snapshot: ExcalidrawSnapshot): string {
  switch (snapshot.type) {
    case 'inline': {
      return JSON.stringify(snapshot.data);
    }
    case 'remote': {
      return snapshot.url;
    }
    case 'delta': {
      return [snapshot.baseUrl, JSON.stringify(snapshot.delta)].join('\n');
    }
  }
}
