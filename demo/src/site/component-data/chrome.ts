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
      a('Bar', 'flat, 1px bottom line, no shadow', 'border'),
      a('Button', '32px, radius 8, hover fill', 'fillSecondary · textSecondary'),
      a('Active', 'deeper fill, no accent', 'fill · text'),
      a('Separator', '1px × 16, 4px margin', 'border'),
      a('Dropdown', 'menu popup rules', 'boxShadow.menu'),
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
      a('Bar', 'radius 12, padding 4', 'bg · boxShadow.menu'),
      a('Button', '28px, radius 8 (12 − 4)', 'fillSecondary · textSecondary'),
      a('Active', 'deeper fill, no accent', 'fill · text'),
      a('Motion', 'enter 120ms, no more than 4px travel', '—'),
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
      a('Menu', 'width 288, radius 12, padding 4', 'bg · boxShadow.menu'),
      a('Section label', '11px / 500 uppercase, padding 8 10 4', 'textTertiary'),
      a('Section divider', '1px', 'borderSubtle'),
      a('Item', 'padding 6 8, radius 8, 28px icon box', 'text'),
      a('Item highlighted', 'translucent fill', 'fill'),
      a('Description', '12px', 'textTertiary'),
      a('Empty', '"No matching commands", 13px', 'textTertiary'),
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
      a('Menu', 'radius 12, padding 4', 'bg · boxShadow.menu'),
      a('Item', 'padding 6 8, radius 8, platform icon', 'text'),
      a('Item highlighted', 'translucent fill', 'fill'),
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
    'The drag handle and add button left of the hovered block, with a menu for block actions.',
    [
      a('Handle', '24px, radius 6, icon only', 'textQuaternary'),
      a('Hover', 'fill, icon darkens', 'fillSecondary · textSecondary'),
      a('Drop line', '2px', 'accent'),
      a('Menu', 'menu popup rules', 'boxShadow.menu'),
    ],
    [p('BlockHandlePlugin', '—')],
  ),
  chrome(
    'link-editor',
    'Link editor',
    'in-place',
    'rich-plugin-link-edit',
    'The popover on a link: shows the URL with open, edit and unlink actions, or a field while editing.',
    [
      a('Popover', 'radius 12, padding 4', 'bg · boxShadow.menu'),
      a('URL', '13px, truncated', 'link'),
      a('Action', '28px, radius 8', 'fillSecondary · textSecondary'),
      a('Field', 'height 28, radius 8, focus ring', 'border · accent'),
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
      a('Modal', 'dialog rules, radius 12', 'bg · boxShadow.modal'),
      a('Field', 'height 32, radius 8, 1px line', 'border'),
      a('Primary button', 'near-black ground', 'text · bg'),
    ],
    [p('ImageEditModalPlugin', '—'), p('ImageEditModal · ImageInsertSheet', 'Standalone parts')],
  ),
];
