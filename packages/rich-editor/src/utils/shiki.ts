export type CodeToHtmlFn = (
  code: string,
  options: { lang: string; theme: string },
) => Promise<string>

let codeToHtmlFn: CodeToHtmlFn | null = null
let shikiLoadPromise: Promise<CodeToHtmlFn> | null = null

export function loadCodeToHtml(): Promise<CodeToHtmlFn> {
  if (codeToHtmlFn) return Promise.resolve(codeToHtmlFn)
  if (!shikiLoadPromise) {
    shikiLoadPromise = import('shiki/bundle/web')
      .then((mod: { codeToHtml: CodeToHtmlFn }) => {
        codeToHtmlFn = mod.codeToHtml
        return mod.codeToHtml
      })
      .catch((err) => {
        shikiLoadPromise = null
        throw err
      })
  }
  return shikiLoadPromise
}
