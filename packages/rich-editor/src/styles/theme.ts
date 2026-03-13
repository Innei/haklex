import type { EditorThemeClasses } from 'lexical';

import { semanticClassNames, sharedStyles } from './shared.css';

const shared = <K extends keyof typeof sharedStyles>(key: K): string =>
  `${semanticClassNames[key]} ${sharedStyles[key]}`;

export const editorTheme: EditorThemeClasses = {
  text: {
    bold: shared('textBold'),
    italic: shared('textItalic'),
    underline: shared('textUnderline'),
    strikethrough: shared('textStrikethrough'),
    superscript: shared('textSuperscript'),
    subscript: shared('textSubscript'),
    code: shared('textCode'),
    highlight: shared('textHighlight'),
  },
  heading: {
    h1: shared('headingH1'),
    h2: shared('headingH2'),
    h3: shared('headingH3'),
    h4: shared('headingH4'),
    h5: shared('headingH5'),
    h6: shared('headingH6'),
  },
  list: {
    ol: shared('listOl'),
    ul: shared('listUl'),
    listitem: shared('listItem'),
    listitemChecked: shared('listItemChecked'),
    listitemUnchecked: shared('listItemUnchecked'),
    checklist: shared('checklist'),
    nested: {
      listitem: shared('listNestedItem'),
    },
  },
  quote: shared('quote'),
  link: shared('link'),
  paragraph: shared('paragraph'),
  code: 'rich-code-block',
  table: shared('table'),
  tableCell: shared('tableCell'),
  tableCellHeader: shared('tableCellHeader'),
  tableScrollableWrapper: shared('tableScrollableWrapper'),
  /** Used by @lexical/extension HorizontalRuleNode */
  hr: shared('hr'),
};
