import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  SerializedLexicalNode,
} from 'lexical';
import { ElementNode } from 'lexical';

import { semanticClassNames, sharedStyles } from '../styles/shared.css';

export class SpoilerNode extends ElementNode {
  static getType(): string {
    return 'spoiler';
  }

  static clone(node: SpoilerNode): SpoilerNode {
    return new SpoilerNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    span.className = `${semanticClassNames.spoiler} ${sharedStyles.spoiler}`;
    span.setAttribute('role', 'button');
    span.setAttribute('tabindex', '0');
    span.setAttribute('aria-label', 'Spoiler (click to reveal)');

    const toggle = () => {
      if (span.isContentEditable) return;
      span.classList.toggle(semanticClassNames.spoilerRevealed);
      const revealed = span.classList.toggle(sharedStyles.spoilerRevealed);
      span.setAttribute(
        'aria-label',
        revealed ? 'Spoiler (revealed)' : 'Spoiler (click to reveal)',
      );
    };

    span.addEventListener('click', toggle);
    span.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });

    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  static importJSON(_serializedNode: SerializedLexicalNode & Record<string, unknown>): SpoilerNode {
    void _serializedNode;
    return $createSpoilerNode();
  }

  exportJSON(): SerializedElementNode {
    return {
      ...super.exportJSON(),
      type: 'spoiler',
      version: 1,
    };
  }

  canInsertTextBefore(): boolean {
    return true;
  }

  canInsertTextAfter(): boolean {
    return true;
  }

  isInline(): boolean {
    return true;
  }
}

export function $createSpoilerNode(): SpoilerNode {
  return new SpoilerNode();
}

export function $isSpoilerNode(node: LexicalNode | null | undefined): node is SpoilerNode {
  return node instanceof SpoilerNode;
}
