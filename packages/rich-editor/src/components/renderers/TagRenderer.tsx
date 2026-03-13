import { semanticClassNames, sharedStyles } from '../../styles/shared.css';
import { getTagBgColor } from '../../utils/tag-color';
import { clsx } from '../utils';

export interface TagRendererProps {
  text: string;
}

export function TagRenderer({ text }: TagRendererProps) {
  return (
    <span
      className={clsx(semanticClassNames.tag, sharedStyles.tag)}
      style={{ backgroundColor: getTagBgColor(text) }}
    >
      {text}
    </span>
  );
}
export { getTagBgColor } from '../../utils/tag-color';
