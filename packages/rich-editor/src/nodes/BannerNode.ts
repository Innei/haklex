import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical'
import { ElementNode } from 'lexical'
import { __iconNode as CircleCheck } from 'lucide-react/dist/esm/icons/circle-check'
import { __iconNode as InfoIcon } from 'lucide-react/dist/esm/icons/info'
import { __iconNode as ShieldAlert } from 'lucide-react/dist/esm/icons/shield-alert'
import { __iconNode as TriangleAlert } from 'lucide-react/dist/esm/icons/triangle-alert'

import { createLucideSvg } from '../utils/lucide-dom'

export type BannerType = 'info' | 'success' | 'warning' | 'error'

const BANNER_ICON_DATA: Record<BannerType, any[]> = {
  info: InfoIcon,
  warning: TriangleAlert,
  error: ShieldAlert,
  success: CircleCheck,
}

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

    const icon = document.createElement('span')
    icon.className = `rich-banner-icon rich-banner-icon-${this.__bannerType}`
    const iconData =
      BANNER_ICON_DATA[this.__bannerType] || BANNER_ICON_DATA.info
    icon.append(createLucideSvg(iconData, { width: '1em', height: '1em' }))

    const content = document.createElement('div')
    content.className = 'rich-banner-content'

    div.append(icon, content)
    return div
  }

  updateDOM(prevNode: BannerNode, dom: HTMLElement): boolean {
    if (prevNode.__bannerType !== this.__bannerType) {
      dom.className = `rich-banner rich-banner-${this.__bannerType}`
      const icon = dom.querySelector('.rich-banner-icon')
      if (icon) {
        icon.className = `rich-banner-icon rich-banner-icon-${this.__bannerType}`
        icon.replaceChildren()
        const iconData =
          BANNER_ICON_DATA[this.__bannerType] || BANNER_ICON_DATA.info
        icon.append(createLucideSvg(iconData, { width: '1em', height: '1em' }))
      }
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

  getDOMSlot(element: HTMLElement) {
    const content = element.querySelector('.rich-banner-content') as HTMLElement
    return super.getDOMSlot(element).withElement(content)
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
