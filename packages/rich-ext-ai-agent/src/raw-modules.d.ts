/* eslint-disable no-restricted-syntax -- bundler convention: raw imports use default export */
declare module '*.md?raw' {
  const content: string;
  export default content;
}
