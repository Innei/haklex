import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical'
import { ElementNode } from 'lexical'

export type BannerType = 'info' | 'success' | 'warning' | 'error'

export type SerializedBannerNode = Spread<
  {
    bannerType: BannerType
    bgColor?: string
  },
  SerializedElementNode
>

export class BannerNode extends ElementNode {
  __bannerType: BannerType
  __bgColor?: string

  static getType(): string {
    return 'banner'
  }

  static clone(node: BannerNode): BannerNode {
    return new BannerNode(node.__bannerType, node.__bgColor, node.__key)
  }

  constructor(bannerType: BannerType, bgColor?: string, key?: NodeKey) {
    super(key)
    this.__bannerType = bannerType
    this.__bgColor = bgColor
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = `rich-banner rich-banner-${this.__bannerType}`
    div.setAttribute('role', 'alert')
    if (this.__bgColor) {
      div.style.backgroundColor = this.__bgColor
    }
    return div
  }

  updateDOM(prevNode: BannerNode, dom: HTMLElement): boolean {
    if (prevNode.__bannerType !== this.__bannerType) {
      dom.className = `rich-banner rich-banner-${this.__bannerType}`
    }
    if (prevNode.__bgColor !== this.__bgColor) {
      dom.style.backgroundColor = this.__bgColor || ''
    }
    return false
  }

  static importJSON(serializedNode: SerializedBannerNode): BannerNode {
    return $createBannerNode(serializedNode.bannerType, serializedNode.bgColor)
  }

  exportJSON(): SerializedBannerNode {
    return {
      ...super.exportJSON(),
      type: 'banner',
      bannerType: this.__bannerType,
      bgColor: this.__bgColor,
      version: 1,
    }
  }

  getBannerType(): BannerType {
    return this.getLatest().__bannerType
  }

  setBannerType(bannerType: BannerType): void {
    const writable = this.getWritable()
    writable.__bannerType = bannerType
  }

  getBgColor(): string | undefined {
    return this.getLatest().__bgColor
  }

  setBgColor(bgColor: string | undefined): void {
    const writable = this.getWritable()
    writable.__bgColor = bgColor
  }

  isInline(): boolean {
    return false
  }
}

export function $createBannerNode(
  bannerType: BannerType,
  bgColor?: string,
): BannerNode {
  return new BannerNode(bannerType, bgColor)
}

export function $isBannerNode(
  node: LexicalNode | null | undefined,
): node is BannerNode {
  return node instanceof BannerNode
}
