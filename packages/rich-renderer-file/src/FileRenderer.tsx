import type { FileRendererProps } from '@haklex/rich-editor/renderers';
import { fileMetaText } from '@haklex/rich-editor/renderers';
import { Download, Paperclip } from 'lucide-react';

import * as styles from './styles.css';

export function FileChipContent({ name }: { name: string }) {
  return (
    <>
      <Paperclip className={`${styles.chipIcon} ${styles.semanticClassNames.chipIcon}`} />
      <span className={`${styles.chipName} ${styles.semanticClassNames.chipName}`}>{name}</span>
    </>
  );
}

export function FileCardContent({
  name,
  size,
  ext,
}: {
  ext?: string;
  name: string;
  size?: number;
}) {
  const meta = fileMetaText(name, size, ext);
  return (
    <>
      <Paperclip className={`${styles.cardIcon} ${styles.semanticClassNames.cardIcon}`} />
      <span className={`${styles.cardMeta} ${styles.semanticClassNames.cardMeta}`}>
        <span className={`${styles.cardName} ${styles.semanticClassNames.cardName}`}>{name}</span>
        {meta && (
          <span className={`${styles.cardSub} ${styles.semanticClassNames.cardSub}`}>{meta}</span>
        )}
      </span>
      <Download className={`${styles.cardAction} ${styles.semanticClassNames.cardAction}`} />
    </>
  );
}

export function FileRenderer({ src, name, size, ext, display }: FileRendererProps) {
  if (display === 'inline') {
    return (
      <a
        className={`${styles.chip} ${styles.semanticClassNames.chip}`}
        download={name}
        href={src || undefined}
        rel="noopener noreferrer"
        target="_blank"
      >
        <FileChipContent name={name} />
      </a>
    );
  }

  return (
    <a
      className={`${styles.card} ${styles.semanticClassNames.card}`}
      download={name}
      href={src || undefined}
      rel="noopener noreferrer"
      target="_blank"
    >
      <FileCardContent ext={ext} name={name} size={size} />
    </a>
  );
}
