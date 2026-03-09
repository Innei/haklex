import { getTagBgColor } from '../../utils/tag-color'

export interface TagRendererProps {
  text: string
}

export function TagRenderer({ text }: TagRendererProps) {
  return (
    <span className="rich-tag" style={{ backgroundColor: getTagBgColor(text) }}>
      {text}
    </span>
  )
}
export { getTagBgColor } from '../../utils/tag-color'
