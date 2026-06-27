import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { $createParagraphNode, $insertNodes, ElementNode } from 'lexical';
import { ChevronRight } from 'lucide-react';
import { createElement } from 'react';

import { detailsClassNames, detailsStyles } from '../styles/details.css';
import type { SlashMenuItemConfig } from '../types/slash-menu';
import { createLucideSvg } from '../utils/lucide-dom';

type IconNode = [string, Record<string, string>][];

const ChevronRightIconNode: IconNode = [['path', { d: 'M8 6L12 10L8 14' }]];

export type SerializedDetailsNode = Spread<
  {
    summary: string;
    open: boolean;
  },
  SerializedElementNode
>;

export class DetailsNode extends ElementNode {
  __summary: string;
  __open: boolean;

  static slashMenuItems: SlashMenuItemConfig[] = [
    {
      title: 'Details',
      icon: createElement(ChevronRight, { size: 20 }),
      description: 'Collapsible content block',
      keywords: ['details', 'toggle', 'collapse', 'accordion'],
      section: 'ADVANCED',
      onSelect: (editor) => {
        editor.update(() => {
          const details = $createDetailsNode('Details', true);
          const paragraph = $createParagraphNode();
          details.append(paragraph);
          $insertNodes([details]);
          paragraph.selectStart();
        });
      },
    },
  ];

  static getType(): string {
    return 'details';
  }

  static clone(node: DetailsNode): DetailsNode {
    return new DetailsNode(node.__summary, node.__open, node.__key);
  }

  constructor(summary: string, open = false, key?: NodeKey) {
    super(key);
    this.__summary = summary;
    this.__open = open;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const details = document.createElement('details');
    details.className = `${detailsClassNames.details} ${detailsStyles.details}`;
    if (this.__open) {
      details.open = true;
    }

    const summary = document.createElement('summary');
    summary.className = `${detailsClassNames.summary} ${detailsStyles.summary}`;

    const chevron = document.createElement('span');
    chevron.className = `${detailsClassNames.chevron} ${detailsStyles.chevron}`;
    chevron.setAttribute('aria-hidden', 'true');
    chevron.append(
      createLucideSvg(ChevronRightIconNode, {
        'width': '20',
        'height': '20',
        'viewBox': '0 0 20 20',
        'stroke-width': '1.5',
      }),
    );
    summary.append(chevron);

    const label = document.createElement('span');
    label.className = `${detailsClassNames.summaryText} ${detailsStyles.summaryText}`;
    label.textContent = this.__summary;
    summary.append(label);

    const content = document.createElement('div');
    content.className = `${detailsClassNames.content} ${detailsStyles.content}`;
    details.append(summary, content);

    return details;
  }

  updateDOM(prevNode: DetailsNode, dom: HTMLElement): boolean {
    const details = dom as HTMLDetailsElement;
    if (prevNode.__open !== this.__open) {
      details.open = this.__open;
    }
    if (prevNode.__summary !== this.__summary) {
      const label = dom.querySelector(`.${detailsClassNames.summaryText}`);
      if (label) {
        label.textContent = this.__summary;
      }
    }
    return false;
  }

  static importJSON(_serializedNode: SerializedLexicalNode & Record<string, unknown>): DetailsNode {
    const serializedNode = _serializedNode as unknown as SerializedDetailsNode;
    return $createDetailsNode(serializedNode.summary, serializedNode.open);
  }

  exportJSON(): SerializedDetailsNode {
    return {
      ...super.exportJSON(),
      type: 'details',
      summary: this.__summary,
      open: this.__open,
      version: 1,
    };
  }

  getSummary(): string {
    return this.getLatest().__summary;
  }

  setSummary(summary: string): void {
    const writable = this.getWritable();
    writable.__summary = summary;
  }

  getOpen(): boolean {
    return this.getLatest().__open;
  }

  setOpen(open: boolean): void {
    const writable = this.getWritable();
    writable.__open = open;
  }

  toggleOpen(): void {
    this.setOpen(!this.getOpen());
  }

  getDOMSlot(element: HTMLElement) {
    const content = element.querySelector(`.${detailsClassNames.content}`) as HTMLElement;
    return super.getDOMSlot(element).withElement(content);
  }

  isInline(): boolean {
    return false;
  }
}

export function $createDetailsNode(summary: string, open = false): DetailsNode {
  return new DetailsNode(summary, open);
}

export function $isDetailsNode(node: LexicalNode | null | undefined): node is DetailsNode {
  return node instanceof DetailsNode;
}
