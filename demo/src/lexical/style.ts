/**
 * CSS imports for LexicalEditor + LexicalRenderer.
 *
 * Feature CSS (alert, banner, image, link-card, ruby, video, etc.) is
 * auto-injected by the corresponding `@haklex/rich-compose/modules/*`
 * entries via vanilla-extract sideEffects. Only editor-shell and plugin
 * CSS needs to be imported manually here.
 */
import '@haklex/rich-editor/style.css';
import '@haklex/rich-editor-ui/style.css';
import '@haklex/rich-plugin-block-handle/style.css';
import '@haklex/rich-plugin-floating-toolbar/style.css';
import '@haklex/rich-plugin-link-edit/style.css';
import '@haklex/rich-plugin-mention/style.css';
import '@haklex/rich-plugin-slash-menu/style.css';
import '@haklex/rich-plugin-table/style.css';
import '@haklex/rich-plugin-toolbar/style.css';
import 'katex/dist/katex.min.css';
