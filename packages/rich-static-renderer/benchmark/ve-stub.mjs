const noop = () => ''
const contract = (obj) => {
  if (typeof obj !== 'object' || obj === null) return ''
  const result = {}
  for (const [k, v] of Object.entries(obj)) {
    result[k] = typeof v === 'object' && v !== null ? contract(v) : (typeof v === 'string' ? v : '')
  }
  return result
}

export const style = noop
export const styleVariants = () => ({})
export const globalStyle = noop
export const createTheme = () => ['', {}]
export const createThemeContract = contract
export const createGlobalTheme = noop
export const createGlobalThemeContract = contract
export const assignVars = () => ({})
export const createVar = () => ''
export const fallbackVar = () => ''
export const fontFace = noop
export const globalFontFace = noop
export const keyframes = noop
export const globalKeyframes = noop
export const layer = noop
export const globalLayer = noop
export const composeStyles = (...args) => args.join(' ')
