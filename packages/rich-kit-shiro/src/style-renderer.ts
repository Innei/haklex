/**
 * Renderer-only styles (subset of style.css, no editor plugins).
 * Imported via JS for proper HMR in dev - workspaceCssPlugin resolves each
 * pkg/style.css to Vanilla Extract source when importer is .ts.
 */
import '@haklex/rich-editor/style.css'
import '@haklex/rich-renderers/style.css'
import '@haklex/rich-renderer-katex/style.css'
import '@haklex/rich-ext-code-snippet/style.css'
import '@haklex/rich-ext-embed/style.css'
import 'katex/dist/katex.min.css'
