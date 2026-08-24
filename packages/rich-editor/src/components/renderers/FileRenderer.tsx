export interface FileRendererProps {
  display?: 'block' | 'inline';
  ext?: string;
  mimeType?: string;
  name: string;
  nodeKey?: string;
  size?: number;
  src: string;
}

export function formatFileSize(bytes?: number): string | null {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = '';
  for (const next of units) {
    value /= 1024;
    unit = next;
    if (value < 1024) break;
  }
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${unit}`;
}

export function fileExtension(name: string, ext?: string): string | null {
  if (ext) return ext.toUpperCase();
  const index = name.lastIndexOf('.');
  if (index <= 0 || index === name.length - 1) return null;
  const derived = name.slice(index + 1);
  return derived.length > 8 ? null : derived.toUpperCase();
}

export function fileMetaText(name: string, size?: number, ext?: string): string {
  return [formatFileSize(size), fileExtension(name, ext)].filter(Boolean).join(' · ');
}

export function FileRenderer({ src, name, size, ext, display }: FileRendererProps) {
  if (display === 'inline') {
    return (
      <a
        className="rich-file-chip"
        download={name}
        href={src || undefined}
        rel="noopener noreferrer"
        target="_blank"
      >
        {name}
      </a>
    );
  }

  const meta = fileMetaText(name, size, ext);

  return (
    <a
      className="rich-file-card"
      download={name}
      href={src || undefined}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span className="rich-file-card-name">{name}</span>
      {meta && <span className="rich-file-card-meta">{meta}</span>}
    </a>
  );
}
