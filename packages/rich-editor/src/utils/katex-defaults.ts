export const DEFAULT_KATEX_EQUATION = 'x^2 + y^2 = z^2'

export function resolveKaTeXEquation(
  equation: string,
  options?: { autoOpenOnMount?: boolean },
): string {
  if (options?.autoOpenOnMount && !equation.trim()) {
    return DEFAULT_KATEX_EQUATION
  }

  return equation
}
