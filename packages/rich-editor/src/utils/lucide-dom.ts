type IconNode = [string, Record<string, string>][]

const SVG_NS = 'http://www.w3.org/2000/svg'

const DEFAULT_ATTRS: Record<string, string> = {
  xmlns: SVG_NS,
  width: '24',
  height: '24',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
}

export function createLucideSvg(
  iconNode: IconNode,
  attrs: Record<string, string> = {},
): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg')
  const merged = { ...DEFAULT_ATTRS, ...attrs }
  for (const [k, v] of Object.entries(merged)) {
    svg.setAttribute(k, v)
  }
  for (const [tag, elAttrs] of iconNode) {
    const el = document.createElementNS(SVG_NS, tag)
    for (const [k, v] of Object.entries(elAttrs)) {
      if (k === 'key') continue
      el.setAttribute(k, v)
    }
    svg.append(el)
  }
  return svg
}
