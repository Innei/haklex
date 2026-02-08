import type { EditorThemeClasses } from 'lexical'

export const editorTheme: EditorThemeClasses = {
  text: {
    bold: 'rich-text-bold',
    italic: 'rich-text-italic',
    underline: 'rich-text-underline',
    strikethrough: 'rich-text-strikethrough',
    code: 'rich-text-code',
    highlight: 'rich-text-highlight',
  },
  heading: {
    h1: 'rich-heading-h1',
    h2: 'rich-heading-h2',
    h3: 'rich-heading-h3',
    h4: 'rich-heading-h4',
    h5: 'rich-heading-h5',
    h6: 'rich-heading-h6',
  },
  list: {
    ol: 'rich-list-ol',
    ul: 'rich-list-ul',
    listitem: 'rich-list-item',
    nested: {
      listitem: 'rich-list-nested-item',
    },
  },
  quote: 'rich-quote',
  link: 'rich-link',
  paragraph: 'rich-paragraph',
  code: 'rich-code-block',
  table: 'rich-table',
  tableCell: 'rich-table-cell',
  tableCellHeader: 'rich-table-cell-header',
  horizontalRule: 'rich-hr',
}
