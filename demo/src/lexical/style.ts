/**
 * CSS imports for LexicalEditor + LexicalRenderer.
 *
 * `@haklex/rich-compose/style.css` is the all-in-one bundle: prose body
 * + theme tokens + variants + every feature module's CSS (alert, banner,
 * image, link-card, ruby, video, table, etc.). Consumers that override
 * specific renderers can use the per-module subpaths under
 * `@haklex/rich-compose/style/*.css` for finer-grained selection.
 *
 * Editor-shell + plugin CSS still ships from per-plugin packages.
 */
import '@haklex/rich-compose/style.css';
import '@haklex/rich-editor-ui/style.css';
import '@haklex/rich-plugin-block-handle/style.css';
import '@haklex/rich-plugin-floating-toolbar/style.css';
import '@haklex/rich-plugin-link-edit/style.css';
import '@haklex/rich-plugin-mention/style.css';
import '@haklex/rich-plugin-slash-menu/style.css';
import '@haklex/rich-plugin-table/style.css';
import '@haklex/rich-plugin-toolbar/style.css';
import 'katex/dist/katex.min.css';
