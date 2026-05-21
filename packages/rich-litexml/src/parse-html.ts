type ParseHTMLFn = (html: string) => Document;

let impl: ParseHTMLFn | null = null;

export function registerParseHTML(fn: ParseHTMLFn): void {
  impl = fn;
}

export function parseHTML(html: string): Document {
  if (!impl) {
    throw new Error(
      '@haklex/rich-litexml: parseHTML implementation not registered. Import from the main entry (@haklex/rich-litexml), not a deep submodule path.',
    );
  }
  return impl(html);
}
