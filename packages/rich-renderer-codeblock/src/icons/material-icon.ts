import { getIconData, iconToHTML, iconToSVG } from '@iconify/utils'
import { icons } from '@iconify-json/material-icon-theme'

/** Get SVG markup for a material-icon-theme icon by name. Returns null if not found. */
export function getMaterialIconSvg(iconName: string): string | null {
  const data = getIconData(icons, iconName)
  if (!data) return null
  const svg = iconToSVG(data)
  return iconToHTML(svg.body, svg.attributes)
}
