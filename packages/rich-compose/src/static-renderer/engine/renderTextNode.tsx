import { semanticClassNames, type SharedStyleKey, sharedStyles } from '@haklex/rich-editor/static';
import type { CSSProperties, ReactNode } from 'react';

const shared = (key: SharedStyleKey): string => `${semanticClassNames[key]} ${sharedStyles[key]}`;

const FORMAT_FLAGS: [number, SharedStyleKey][] = [
  [1, 'textBold'],
  [2, 'textItalic'],
  [4, 'textStrikethrough'],
  [8, 'textUnderline'],
  [16, 'textCode'],
  [32, 'textSubscript'],
  [64, 'textSuperscript'],
  [128, 'textHighlight'],
];

function parseCSSText(cssText: string): CSSProperties {
  const style: Record<string, string> = {};
  for (const part of cssText.split(';')) {
    const colonIndex = part.indexOf(':');
    if (colonIndex === -1) continue;
    const prop = part.slice(0, colonIndex).trim();
    const value = part.slice(colonIndex + 1).trim();
    if (!prop || !value) continue;
    const camelProp = prop.replaceAll(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    style[camelProp] = value;
  }
  return style as CSSProperties;
}

export function renderTextNode(node: any, key: string): ReactNode {
  let element: ReactNode = node.text;
  const format = node.format || 0;

  for (const [flag, styleKey] of FORMAT_FLAGS) {
    if (format & flag) {
      element = (
        <span className={shared(styleKey)} key={`${key}-${flag}`}>
          {element}
        </span>
      );
    }
  }

  if (node.style) {
    element = (
      <span key={key} style={parseCSSText(node.style)}>
        {element}
      </span>
    );
  }

  return element;
}
