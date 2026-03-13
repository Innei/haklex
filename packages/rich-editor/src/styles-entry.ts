// Styles entry point - zero Lexical dependency, no editorTheme
export { getVariantClass } from './components/utils';
export { articleVariant } from './styles/article.css';
export { commentVariant } from './styles/comment.css';
export { noteVariant } from './styles/note.css';
export {
  richContent,
  semanticClassNames,
  type SharedStyleKey,
  sharedStyles,
} from './styles/shared.css';
export { articleTheme, commentTheme, noteTheme, vars } from '@haklex/rich-style-token/styles';
