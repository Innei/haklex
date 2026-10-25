import type { AnatomyRow, ChromeCategory, ComponentMeta, PartRow } from '../components';

const a = (part: string, spec: string, token: string): AnatomyRow => ({ part, spec, token });
const p = (name: string, props: string): PartRow => ({ name, props });

const chrome = (
  id: string,
  label: string,
  category: ChromeCategory,
  packageName: string,
  description: string,
  anatomy: AnatomyRow[],
  parts: PartRow[],
): ComponentMeta<ChromeCategory> => ({
  id,
  label,
  category,
  packageName,
  description,
  anatomy,
  parts,
});

export const chromeData: ComponentMeta<ChromeCategory>[] = [
  chrome(
    'toolbar',
    'Toolbar',
    'bars',
    'rich-plugin-toolbar',
    'The fixed bar above the editor: block type, marks, alignment, insert menu and undo.',
    [
      a('Bar', 'sticky, height 40, full width, 1px bottom line, no shadow', 'bg · borderSubtle'),
      a('Row', 'one row; what does not fit moves into the ⋯ menu', '—'),
      a('Button', '28px, radius 8, gap 2, hover fill', 'fillSecondary · textSecondary'),
      a('Active', 'deeper fill, no accent', 'fill · text'),
      a('Separator', '1px × 16, 6px margin', 'borderSubtle'),
      a('Tooltip', 'inverted, shortcut as Kbd', 'text · bg'),
      a('Dropdown', 'menu popup rules', 'bgElevated · boxShadow.menu'),
    ],
    [
      p('ToolbarPlugin', 'insertItemOrder maxVisibleInsertItems className'),
      p('ToolbarButton · ToolbarDropdown · ToolbarSeparator', 'Building blocks'),
    ],
  ),
  chrome(
    'floating-toolbar',
    'Floating toolbar',
    'bars',
    'rich-plugin-floating-toolbar',
    'The bar that appears above a text selection with marks, link and color.',
    [
      a('Bar', 'radius 8, padding 4', 'bgElevated · boxShadow.menu'),
      a('Button', '28px, radius 4, gap 2', 'fillSecondary · textSecondary'),
      a('Active · pressed', 'deeper fill, no accent', 'fill · text'),
      a('Motion', 'in 120ms scale .97→1', '—'),
    ],
    [p('FloatingToolbarPlugin', 'actions')],
  ),
  chrome(
    'slash-menu',
    'Slash menu',
    'menus',
    'rich-plugin-slash-menu',
    'Type / to insert a block. Built-in items group into BASIC BLOCKS and LISTS; nodes register their own sections.',
    [
      a('Menu', 'width 288, radius 12, padding 4', 'bgElevated · boxShadow.menu'),
      a('Section label', '12/16 · 500, padding 8 8 4', 'textTertiary'),
      a('Section divider', '1px, 4px vertical margin', 'borderSubtle'),
      a('Item', 'min height 32, padding 4 8, radius 8, 28px icon box', 'text'),
      a('Item highlighted', 'translucent fill', 'fillSecondary'),
      a('Title · description', '13/20 · 500, then 12/16', 'text · textTertiary'),
      a('Empty', '"No matching commands", 13/20', 'textTertiary'),
    ],
    [
      p('SlashMenuPlugin', 'items'),
      p('SlashMenuList', 'anchorElement options selectedIndex'),
      p('getBuiltinItems · collectNodeSlashItems', 'Item sources'),
    ],
  ),
  chrome(
    'mention-menu',
    'Mention menu',
    'menus',
    'rich-plugin-mention',
    'Type @ to mention a user on a platform. Phase one picks the platform, phase two confirms the handle.',
    [
      a('Menu', 'radius 12, padding 4', 'bgElevated · boxShadow.menu'),
      a('Item', 'min height 32, padding 4 8, radius 8, platform icon', 'text'),
      a('Item highlighted', 'translucent fill', 'fillSecondary'),
      a('Description', '12px', 'textTertiary'),
    ],
    [
      p('MentionMenuPlugin', 'extraPlatforms'),
      p('builtinPlatforms · getAllPlatforms', 'Platform registry'),
    ],
  ),
  chrome(
    'block-handle',
    'Block handle',
    'in-place',
    'rich-plugin-block-handle',
    'A grip in the 32px gutter left of the hovered block, and a + in the gap between blocks that inserts a paragraph and opens the slash menu.',
    [
      a('Grip', '20 × 24, radius 4, aligned to the first line', 'textQuaternary'),
      a('Grip hover · open', 'fill, icon darkens', 'fillSecondary · fill · textSecondary'),
      a(
        'Gap insert',
        'after 150ms: 1px line and a 20px + (radius 6)',
        'textQuaternary · bgElevated · boxShadow.xs',
      ),
      a('Drop line', '2px', 'accent'),
      a('Keyboard', '⌘⇧↑ / ⌘⇧↓ (Ctrl+Shift elsewhere) moves the block', '—'),
      a('Menu', 'click the grip; menu popup rules', 'bgElevated · boxShadow.menu'),
    ],
    [p('BlockHandlePlugin', '—')],
  ),
  chrome(
    'link-editor',
    'Link editor',
    'in-place',
    'rich-plugin-link-edit',
    'The popover under a link. View shows the URL with Open, Edit, Copy and Unlink; new or empty links open in edit, where Enter or Save stores the URL.',
    [
      a(
        'Popover',
        'width 360, radius 12, one 40px row, stays inside the editor',
        'bgElevated · boxShadow.menu',
      ),
      a('URL', '13/20 sans, middle truncation, inset 12', 'text'),
      a('Action', '28px icon buttons with tooltips', 'fillSecondary · textSecondary'),
      a('Field', 'height 28, radius 8, focus ring', 'boxShadow.xs · accent'),
      a('Save', 'primary ActionButton with an Enter Kbd', 'text · bg'),
    ],
    [p('FloatingLinkEditorPlugin', 'renderExtraActions')],
  ),
  chrome(
    'table-controls',
    'Table controls',
    'in-place',
    'rich-plugin-table',
    'Row and column handles with an action menu, and the column resizer.',
    [
      a('Handle', 'small pill on the row or column edge', 'fill · textTertiary'),
      a('Selected', 'deeper fill', 'fill'),
      a('Resizer', '2px line on hover', 'accent'),
      a('Menu', 'menu popup rules', 'boxShadow.menu'),
    ],
    [p('TableRowColumnHandlesPlugin', '—'), p('TableCellResizerPlugin', '—')],
  ),
  chrome(
    'image-editor',
    'Image editor',
    'in-place',
    'rich-plugin-image-editor',
    'The modal that edits an image: alt text, caption, size and privacy checks.',
    [
      a('Modal', 'dialog rules, radius 12', 'bgElevated · boxShadow.modal'),
      a('Field', 'height 32, radius 8, 1px line', 'border'),
      a('Primary button', 'near-black ground', 'text · bg'),
    ],
    [p('ImageEditModalPlugin', '—'), p('ImageEditModal · ImageInsertSheet', 'Standalone parts')],
  ),
];
