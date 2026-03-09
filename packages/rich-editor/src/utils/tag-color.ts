function stringToHue(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = hash % 360
  return hue < 0 ? hue + 360 : hue
}

export function getTagBgColor(text: string): string {
  const hue = stringToHue(text)
  const sat = 70 + (hue % 21) // 70-90
  const light = 40 + (hue % 31) // 40-70
  const bgSat = sat > 30 ? sat - 30 : 0
  const bgLight = light < 80 ? light + 20 : 100
  return `hsla(${hue}, ${bgSat}%, ${bgLight}%, 0.7)`
}
