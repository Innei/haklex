import { BlockHandlePlugin } from '@haklex/rich-plugin-block-handle';
import { FloatingToolbarPlugin } from '@haklex/rich-plugin-floating-toolbar';
import { ImageEditModalPlugin } from '@haklex/rich-plugin-image-editor';
import { FloatingLinkEditorPlugin } from '@haklex/rich-plugin-link-edit';
import { MentionMenuPlugin } from '@haklex/rich-plugin-mention';
import { SlashMenuPlugin } from '@haklex/rich-plugin-slash-menu';
import { TableCellResizerPlugin, TableRowColumnHandlesPlugin } from '@haklex/rich-plugin-table';
import { ToolbarPlugin } from '@haklex/rich-plugin-toolbar';

import {
  doc,
  heading,
  image,
  link,
  list,
  listItem,
  paragraph,
  table,
  tableCell,
  tableRow,
  text,
} from '../../../fixtures/helpers';
import type { ComponentDemo } from '../../components/types';
import { ChromeEditor } from './ChromeEditor';
import { SlashStates } from './SlashStates';

const intro = paragraph(
  text('Quiet Ink keeps chrome neutral: '),
  text('fills', 1),
  text(' for state, '),
  text('lines', 2),
  text(' for structure.'),
);

const proseDoc = doc(heading('h2', text('Editor chrome')), intro);
const emptyLineDoc = doc(intro, paragraph());
const linkDoc = doc(
  paragraph(
    text('Read the '),
    link('https://github.com/Innei/haklex', text('haklex repository')),
    text(' for the source.'),
  ),
);
const tableDoc = doc(
  table(
    tableRow(tableCell(1, paragraph(text('Token'))), tableCell(1, paragraph(text('Use')))),
    tableRow(tableCell(0, paragraph(text('fill'))), tableCell(0, paragraph(text('Selected')))),
    tableRow(tableCell(0, paragraph(text('border'))), tableCell(0, paragraph(text('Lines')))),
  ),
);
const blockDoc = doc(
  heading('h2', text('Hover a block')),
  intro,
  list('bullet', listItem(text('First item')), listItem(text('Second item'))),
);
const imageDoc = doc(
  image({
    src: 'https://picsum.photos/1200/720?random=301',
    altText: 'Sample',
    width: 1200,
    height: 720,
  }),
);

const triggerNote = (how: string) =>
  `No frozen snapshot: this part is positioned by the live editor. ${how} in either editor above.`;

export const chromeDemos: Record<string, ComponentDemo> = {
  'toolbar': {
    note: 'Live editors with only the toolbar mounted.',
    statesNote: triggerNote('Click the toolbar buttons and dropdowns'),
    keyboard: [
      ['⌘B / ⌘I / ⌘U', 'Bold, italic, underline'],
      ['⌘Z / ⇧⌘Z', 'Undo, redo'],
    ],
    Preview: ({ theme }) => (
      <ChromeEditor
        header={<ToolbarPlugin />}
        hint="Use the bar above the text."
        initialValue={proseDoc}
        theme={theme}
      />
    ),
  },
  'floating-toolbar': {
    note: 'Live editors with only the floating toolbar mounted.',
    statesNote: triggerNote('Select some text'),
    Preview: ({ theme }) => (
      <ChromeEditor hint="Select text to show the toolbar." initialValue={proseDoc} theme={theme}>
        <FloatingToolbarPlugin />
      </ChromeEditor>
    ),
  },
  'slash-menu': {
    note: 'Live editors with only the slash menu mounted. Only one editor can hold the caret, so the menu opens in one frame at a time.',
    statesNote: 'Frozen with the exported SlashMenuList: no query, filtered, and no results.',
    keyboard: [
      ['/', 'Open the menu on an empty line'],
      ['↑ ↓', 'Move the highlight'],
      ['Enter', 'Insert the highlighted block'],
      ['Esc', 'Close'],
    ],
    Preview: ({ theme }) => (
      <ChromeEditor
        actions={<SlashMenuPlugin />}
        hint="Type / on the empty line."
        initialValue={emptyLineDoc}
        theme={theme}
      />
    ),
    States: SlashStates,
  },
  'mention-menu': {
    note: 'Live editors with only the mention menu mounted.',
    statesNote: triggerNote('Type @ followed by a platform, such as @gh'),
    keyboard: [
      ['@', 'Open the platform list'],
      ['↑ ↓ · Enter', 'Pick a platform, then confirm the handle'],
    ],
    Preview: ({ theme }) => (
      <ChromeEditor
        actions={<MentionMenuPlugin />}
        hint="Type @ on the empty line."
        initialValue={emptyLineDoc}
        theme={theme}
      />
    ),
  },
  'block-handle': {
    note: 'Live editors with the block handle and the slash menu it opens from the + in a gap.',
    statesNote: triggerNote('Hover a block, then drag the handle or open its menu'),
    Preview: ({ theme }) => (
      <ChromeEditor
        gutter
        actions={<SlashMenuPlugin />}
        hint="Hover a block to show the handle."
        initialValue={blockDoc}
        theme={theme}
      >
        <BlockHandlePlugin />
      </ChromeEditor>
    ),
  },
  'link-editor': {
    note: 'Live editors with only the link editor mounted.',
    statesNote: triggerNote('Click the link, then choose edit'),
    Preview: ({ theme }) => (
      <ChromeEditor hint="Click the link." initialValue={linkDoc} theme={theme}>
        <FloatingLinkEditorPlugin />
      </ChromeEditor>
    ),
  },
  'table-controls': {
    note: 'Live editors with only the table handles and resizer mounted.',
    statesNote: triggerNote('Hover a cell, open a row or column handle, or drag a column edge'),
    Preview: ({ theme }) => (
      <ChromeEditor hint="Hover a cell to show the handles." initialValue={tableDoc} theme={theme}>
        <TableRowColumnHandlesPlugin />
        <TableCellResizerPlugin />
      </ChromeEditor>
    ),
  },
  'image-editor': {
    note: 'Live editors with only the image edit modal mounted.',
    statesNote: triggerNote('Click the image and choose edit'),
    Preview: ({ theme }) => (
      <ChromeEditor hint="Click the image, then edit." initialValue={imageDoc} theme={theme}>
        <ImageEditModalPlugin />
      </ChromeEditor>
    ),
  },
};
